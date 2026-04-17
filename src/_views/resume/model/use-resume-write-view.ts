"use client"

// _views/resume/model | 이력서 작성 뷰 비즈니스 로직
// 폼 상태, 스토리지 추적, 자동저장, 드래프트 복원, 이미지 업로드, 유효성 검사, 제출 — UI 렌더와 무관하므로 model에 분리
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/core"
import {
  ImageUploadNode,
  WRITE_IMAGE_EXTENSIONS,
  MAX_FILE_SIZE,
  useEditorContentRestore,
  useEditorFocusState,
  useBubbleMenuAnchor,
  useEditorImageStorageTracker,
  useEditorImagePasteHandler,
  useStableImageUpload,
  useEditorUploadFeedback,
  calcEditorSessionBytes,
} from "@/_features/editor"
import {
  USER_ROUTES,
  RESUME_DRAFT_KEY, RESUME_PREVIEW_SIZES_KEY,
  resumeEditDraftKey, AUTHORING_IMAGE_UPLOAD_LIMIT, AUTOSAVE_DELAY_MS,
} from "@/_shared/config"
import type { StorageInfo, Visibility } from "@/_shared/model"
import { draftSave, draftRestore, draftClear, previewSizesSave, previewSizesRestore, sanitizeDraftContent, filterPersistentSizes } from "@/_shared/lib"
import { useAuthGuard } from "@/_features/auth"
import { useResumeDraftStore } from "@/_features/resume"
import { useStorageInfo } from "@/_entities/user"
import { useMyPortfolios } from "@/_entities/portfolio"

interface ResumeDraft {
  visibility: Visibility | null
  title: string
  memo: string
  interestFields: string[]
  tags: string[]
  linkedIds: string[]
  content?: JSONContent
  _uploadedSizes?: Record<string, number>
}


export function useResumeWriteView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Bug 2 수정: 수정 모드 진입 시 editId가 존재 → 새 글 드래프트(rw-draft) 복원을 건너뜀
  const editId = searchParams.get("editId")

  const { isLoading: authLoading, user } = useAuthGuard()
  const storageInfo = useStorageInfo()
  const myPortfolios = useMyPortfolios()

  // Bug B: 수정 모드는 문서 ID별 독립 드래프트 키, 새 글은 공통 키
  const draftKey = editId ? resumeEditDraftKey(editId) : RESUME_DRAFT_KEY

  // ── 폼 상태 ──────────────────────────────────────────────────────
  const [visibility,      setVisibility]      = useState<Visibility | null>(null)
  const [title,           setTitle]           = useState("")
  const [memo,            setMemo]            = useState("")
  const [interestFields,  setInterestFields]  = useState<string[]>([])
  const [tags,            setTags]            = useState<string[]>([])
  const [linkedIds,       setLinkedIds]       = useState<string[]>([])
  const [errors,          setErrors]          = useState<Partial<Record<string, string>>>({})

  // ── 드래프트 복원 ────────────────────────────────────────────────
  const [pendingDraft, setPendingDraft] = useState<ResumeDraft | null>(null)
  // Bug A: 이미지 포함 내용이 sessionStorage 용량 초과로 저장 불가한 경우 true
  const [draftContentTruncated, setDraftContentTruncated] = useState(false)
  // blob: URL 이미지가 자동저장에서 제외된 경우 true — DraftRestoreModal imagesDropped 경고 표시용
  const [draftImagesDropped, setDraftImagesDropped] = useState(false)

  // ── 스토리지 & 업로드 상태 ───────────────────────────────────────
  const sessionBytesRef       = useRef(0)
  const [sessionBytes,        setSessionBytes]   = useState(0)
  const uploadedSizesRef      = useRef<Map<string, number>>(new Map())
  const pendingUploadBytesRef = useRef(0)
  const storageInfoRef        = useRef<StorageInfo | undefined>(storageInfo)
  const pendingDraftSizesRef  = useRef<Record<string, number>>({})
  // 미리보기 복귀 후 editor가 준비되면 콘텐츠 복원을 허용하는 플래그
  const editorRestoreAllowedRef = useRef(false)

  storageInfoRef.current = storageInfo

  // ── 업로드 피드백 상태 (에러 토스트 + 스토리지 초과 모달) ─────────
  const { uploadError, uploadErrorKey, showUploadErrorRef, exceededModal, setExceededModal } = useEditorUploadFeedback()

  // ── 이미지 업로드 (WebP 변환 + quota 검사) ───────────────────────
  const { stableUploadRef, trackedUpload } = useStableImageUpload({
    storageInfoRef, sessionBytesRef, pendingUploadBytesRef,
    uploadedSizesRef, setExceededModal, setSessionBytes,
  })

  // ── 에디터 ───────────────────────────────────────────────────────
  const editor = useEditor({
    immediatelyRender: false,
    content: undefined,
    editorProps: {
      attributes: { class: "simple-editor rw-editor", spellcheck: "false" },
    },
    extensions: [
      ...WRITE_IMAGE_EXTENSIONS,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: AUTHORING_IMAGE_UPLOAD_LIMIT,
        upload: trackedUpload,
        onError: (error) => {
          if (error instanceof Error && error.message === "__QUOTA_EXCEEDED__") return
          showUploadErrorRef.current(error instanceof Error ? error.message : "업로드에 실패했습니다.")
        },
      }),
    ],
  })

  // ── 에디터 포커스 상태 (카드 테두리 하이라이트용) ──────────────
  const editorFocused = useEditorFocusState(editor)

  // ── 버블 툴바 drag-selection 좌표 고정 앵커 ─────────────────────
  const { isDraggingRef, getVirtualElement } = useBubbleMenuAnchor(editor)

  // ── 자동저장 ──────────────────────────────────────────────────────
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSaveRef = useRef<() => void>(() => {})
  autoSaveRef.current = () => {
    if (!title && !visibility) return
    // blob: URL 이미지는 탭 세션 한정 자원 — 자동저장 전 제거하여 복원 시 깨진 이미지 방지
    const rawContent = editor?.getJSON() ?? { type: "doc", content: [] }
    const { content: safeContent, droppedImageCount } = sanitizeDraftContent(rawContent)
    // blob: URL이 아닌 URL만 sizes에 저장 (ephemeral URL은 복원 불가)
    const sizesRecord = filterPersistentSizes(uploadedSizesRef.current)
    const draft: ResumeDraft & { _ephemeralImagesDropped?: boolean; _droppedImageCount?: number } = {
      visibility, title, memo, interestFields, tags, linkedIds,
      content: safeContent,
      _uploadedSizes: sizesRecord,
      ...(droppedImageCount > 0 ? { _ephemeralImagesDropped: true, _droppedImageCount: droppedImageCount } : {}),
    }
    // Bug A: 이미지 포함 JSON이 sessionStorage 용량 초과 시 liteDraft(콘텐츠 제외)로 폴백 — 복원 시 경고 표시
    const liteDraft: ResumeDraft & { _contentTruncated: boolean } = {
      visibility, title, memo, interestFields, tags, linkedIds,
      content: { type: "doc", content: [] }, _uploadedSizes: {}, _contentTruncated: true,
    }
    draftSave(draftKey, draft, liteDraft)
  }

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => autoSaveRef.current(), AUTOSAVE_DELAY_MS)
  }, [])

  useEffect(() => { scheduleAutoSave() }, [visibility, title, memo, interestFields, tags, linkedIds, scheduleAutoSave])

  useEffect(() => {
    if (!editor) return
    editor.on("update", scheduleAutoSave)
    return () => { editor.off("update", scheduleAutoSave) }
  }, [editor, scheduleAutoSave])

  // ── 이미지 삭제 감지 → StorageBar 실시간 반영 ───────────────────
  useEditorImageStorageTracker(editor, { uploadedSizesRef, sessionBytesRef, pendingUploadBytesRef, setSessionBytes })

  // ── 이미지 붙여넣기 — 다중 파일 → 캐러셀 ────────────────────────
  useEditorImagePasteHandler(editor, {
    uploadRef: stableUploadRef,
    storageInfoRef,
    sessionBytesRef,
    pendingUploadBytesRef,
    setExceededModal,
    showUploadErrorRef,
    limit: AUTHORING_IMAGE_UPLOAD_LIMIT,
  })

  // ── 마운트 시 드래프트/미리보기 복원 ────────────────────────────
  // Bug 2 수정: editId가 있으면 새 글 드래프트 복원 로직을 건너뜀
  useEffect(() => {
    const store = useResumeDraftStore.getState()
    if (store.isBackFromPreview) {
      store.setBackFromPreview(false)
      // immediatelyRender: false → mount 시 editor가 null이므로 콘텐츠 복원은 editor-dependent effect에 위임
      editorRestoreAllowedRef.current = true
      const saved = store.previewData
      if (saved) {
        if (saved.visibility)            setVisibility(saved.visibility)
        if (saved.title)                 setTitle(saved.title)
        if (saved.memo)                  setMemo(saved.memo)
        if (saved.interestFields.length) setInterestFields(saved.interestFields)
        if (saved.tags.length)           setTags(saved.tags)
        if (saved.linkedIds.length)      setLinkedIds(saved.linkedIds)
      }
      const sizes = previewSizesRestore(RESUME_PREVIEW_SIZES_KEY)
      if (sizes) {
        Object.entries(sizes).forEach(([url, size]) => {
          uploadedSizesRef.current.set(url, size)
        })
      }
      return
    }

    // Bug B: 새 글/수정 모두 각자의 draftKey로 드래프트를 조회
    const saved = draftRestore<ResumeDraft & {
      _contentTruncated?: boolean
      _ephemeralImagesDropped?: boolean
      _droppedImageCount?: number
    }>(draftKey)
    if (!saved) return
    if (saved.title || saved.visibility || saved._contentTruncated || saved._ephemeralImagesDropped) {
      if (saved._uploadedSizes) pendingDraftSizesRef.current = saved._uploadedSizes
      // Bug A: 이미지 포함 내용이 저장 불가했음을 기록
      if (saved._contentTruncated) setDraftContentTruncated(true)
      // blob: URL 이미지가 자동저장에서 제외된 경우 — imagesDropped 경고 표시
      if (saved._ephemeralImagesDropped) setDraftImagesDropped(true)
      setPendingDraft(saved)
    } else draftClear(draftKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 에디터 콘텐츠 복원 (미리보기 → "편집하기" 복귀 전용) ────────
  useEditorContentRestore({
    editor,
    editorRestoreAllowedRef,
    isPending: !!pendingDraft,
    getPreviewContent: () => useResumeDraftStore.getState().previewData?.content,
    onRestored: () => editor && calcEditorSessionBytes(editor, uploadedSizesRef, sessionBytesRef, setSessionBytes),
  })

  // ── 드래프트 복원 처리 ──────────────────────────────────────────
  const handleRestoreConfirm = () => {
    if (!pendingDraft) return
    if (pendingDraft.visibility) setVisibility(pendingDraft.visibility)
    if (pendingDraft.title) setTitle(pendingDraft.title)
    if (pendingDraft.memo) setMemo(pendingDraft.memo)
    if (pendingDraft.interestFields?.length) setInterestFields(pendingDraft.interestFields)
    if (pendingDraft.tags?.length) setTags(pendingDraft.tags)
    if (pendingDraft.linkedIds?.length) setLinkedIds(pendingDraft.linkedIds)
    // Bug 1 수정: clearContent 후 setContent — 캐러셀 이미지 중복 방지
    if (editor && pendingDraft.content) {
      editor.commands.clearContent()
      editor.commands.setContent(pendingDraft.content)
    }
    const sizes = pendingDraftSizesRef.current
    if (Object.keys(sizes).length > 0) {
      Object.entries(sizes).forEach(([url, size]) => {
        uploadedSizesRef.current.set(url, size)
      })
      if (editor) calcEditorSessionBytes(editor, uploadedSizesRef, sessionBytesRef, setSessionBytes)
      pendingDraftSizesRef.current = {}
    }
    draftClear(draftKey)
    setPendingDraft(null)
    setDraftContentTruncated(false)
    setDraftImagesDropped(false)
  }

  const handleRestoreCancel = () => {
    draftClear(draftKey)
    setPendingDraft(null)
    setDraftContentTruncated(false)
    setDraftImagesDropped(false)
  }

  // ── 미리보기 이동 ────────────────────────────────────────────────
  const handlePreview = () => {
    if (!editor) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    draftClear(draftKey)
    const sizesRecord: Record<string, number> = {}
    uploadedSizesRef.current.forEach((size, url) => { sizesRecord[url] = size })
    previewSizesSave(RESUME_PREVIEW_SIZES_KEY, sizesRecord)
    useResumeDraftStore.getState().setPreviewData({
      visibility: visibility ?? "public",
      title: title || "제목 없음",
      memo, interestFields, tags, linkedIds,
      content: editor.getJSON(),
    })
    router.push(USER_ROUTES.resume.preview)
  }

  // ── 제출 유효성 검사 ─────────────────────────────────────────────
  const handleSubmit = () => {
    const newErrors: typeof errors = {}
    if (!visibility)              newErrors.visibility = "공개 설정을 선택해주세요"
    if (!title.trim())            newErrors.title      = "제목을 입력해주세요"
    if (!editor || editor.isEmpty) newErrors.content   = "내용을 입력해주세요"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`rw-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    draftClear(draftKey)
    const sizesRecord: Record<string, number> = {}
    uploadedSizesRef.current.forEach((size, url) => { sizesRecord[url] = size })
    previewSizesSave(RESUME_PREVIEW_SIZES_KEY, sizesRecord)
    useResumeDraftStore.getState().setPreviewData({
      visibility: visibility!, title: title.trim(),
      memo, interestFields, tags, linkedIds,
      content: editor!.getJSON(),
    })
    router.push(USER_ROUTES.resume.preview)
  }

  return {
    // auth
    authLoading, user,
    // form
    visibility, setVisibility,
    title, setTitle,
    memo, setMemo,
    interestFields, setInterestFields,
    tags, setTags,
    linkedIds, setLinkedIds,
    errors, setErrors,
    myPortfolios,
    // storage
    storageInfo, sessionBytes, uploadError, uploadErrorKey,
    exceededModal, setExceededModal,
    // draft
    pendingDraft, draftContentTruncated, draftImagesDropped,
    // editor
    editor, trackedUpload, editorFocused,
    // bubble menu
    isDraggingRef, getVirtualElement,
    // handlers
    handleRestoreConfirm, handleRestoreCancel,
    handlePreview, handleSubmit,
  }
}
