"use client"

// _views/resume/model | 이력서 작성 뷰 비즈니스 로직
// 폼 상태, 스토리지 추적, 이미지 업로드, 유효성 검사, 제출 — UI 렌더와 무관하므로 model에 분리
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEditor } from "@tiptap/react"
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
  toWebP,
} from "@/_features/editor"
import { batchUploadImages } from "@/_shared/api"
import {
  USER_ROUTES,
  RESUME_PREVIEW_SIZES_KEY,
  AUTHORING_IMAGE_UPLOAD_LIMIT,
} from "@/_shared/config"
import type { StorageInfo, Visibility } from "@/_shared/model"
import { previewSizesSave, previewSizesRestore } from "@/_shared/lib"
import type { ExternalLink } from "@/_shared/model"
import { useAuthGuard } from "@/_features/auth"
import { useResumeDraftStore } from "@/_features/resume"
import { useStorageInfo } from "@/_entities/user"
import { useMyPortfolios } from "@/_entities/portfolio"


export function useResumeWriteView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("editId")

  const { isLoading: authLoading, user } = useAuthGuard()
  const storageInfo = useStorageInfo()
  const myPortfolios = useMyPortfolios()

  // ── 폼 상태 ──────────────────────────────────────────────────────
  const [visibility,      setVisibility]      = useState<Visibility | null>(null)
  const [title,           setTitle]           = useState("")
  const [memo,            setMemo]            = useState("")
  const [interestFields,  setInterestFields]  = useState<string[]>([])
  const [tags,            setTags]            = useState<string[]>([])
  const [linkedIds,       setLinkedIds]       = useState<string[]>([])
  const [externalLinks,   setExternalLinks]   = useState<ExternalLink[]>([])
  const [errors,          setErrors]          = useState<Partial<Record<string, string>>>({})
  const [uploading,       setUploading]       = useState(false)

  // ── 스토리지 & 업로드 상태 ───────────────────────────────────────
  const sessionBytesRef       = useRef(0)
  const [sessionBytes,        setSessionBytes]   = useState(0)
  const uploadedSizesRef      = useRef<Map<string, number>>(new Map())
  const pendingUploadBytesRef = useRef(0)
  const storageInfoRef        = useRef<StorageInfo | undefined>(storageInfo)
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

  // ── 마운트 시 미리보기 복원 ──────────────────────────────────────
  useEffect(() => {
    const store = useResumeDraftStore.getState()
    if (store.isBackFromPreview) {
      store.setBackFromPreview(false)
      editorRestoreAllowedRef.current = true
      const saved = store.previewData
      if (saved) {
        if (saved.visibility)            setVisibility(saved.visibility)
        if (saved.title)                 setTitle(saved.title)
        if (saved.memo)                  setMemo(saved.memo)
        if (saved.interestFields.length) setInterestFields(saved.interestFields)
        if (saved.tags.length)           setTags(saved.tags)
        if (saved.linkedIds.length)      setLinkedIds(saved.linkedIds)
        if (saved.externalLinks?.length) setExternalLinks(saved.externalLinks)
      }
      const sizes = previewSizesRestore(RESUME_PREVIEW_SIZES_KEY)
      if (sizes) {
        Object.entries(sizes).forEach(([url, size]) => {
          uploadedSizesRef.current.set(url, size)
        })
      }
      return
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 에디터 콘텐츠 복원 (미리보기 → "편집하기" 복귀 전용) ────────
  useEditorContentRestore({
    editor,
    editorRestoreAllowedRef,
    isPending: false,
    getPreviewContent: () => useResumeDraftStore.getState().previewData?.content,
    onRestored: () => editor && calcEditorSessionBytes(editor, uploadedSizesRef, sessionBytesRef, setSessionBytes),
  })

  // ── 이미지 일괄 업로드 후 콘텐츠 반환 ────────────────────────────
  const uploadAndGetContent = useCallback(async () => {
    if (!editor) return null
    const rawContent = editor.getJSON()
    try {
      setUploading(true)
      const { content } = await batchUploadImages({
        content: rawContent,
        domainType: "resume",
        toWebP,
      })
      return content
    } catch (e) {
      alert(e instanceof Error ? e.message : "이미지 업로드에 실패했습니다.")
      return null
    } finally {
      setUploading(false)
    }
  }, [editor])

  // ── 필수값 유효성 검사 (등록 & 임시저장 & 미리보기 공통) ─────────
  const validate = (): typeof errors => {
    const newErrors: typeof errors = {}
    if (!visibility)               newErrors.visibility = "공개 설정을 선택해주세요"
    if (!title.trim())             newErrors.title      = "제목을 입력해주세요"
    if (!editor || editor.isEmpty) newErrors.content    = "내용을 입력해주세요"
    return newErrors
  }

  // ── 제출 유효성 검사 ─────────────────────────────────────────────
  const handleSubmit = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`rw-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    const content = await uploadAndGetContent()
    if (!content) return
    const sizesRecord: Record<string, number> = {}
    uploadedSizesRef.current.forEach((size, url) => { sizesRecord[url] = size })
    previewSizesSave(RESUME_PREVIEW_SIZES_KEY, sizesRecord)
    useResumeDraftStore.getState().setPreviewData({
      visibility: visibility!, title: title.trim(),
      memo, interestFields, tags, linkedIds, externalLinks,
      content,
    })
    router.push(USER_ROUTES.resume.preview)
  }

  // ── 미리보기 이동 ────────────────────────────────────────────────
  const handlePreview = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`rw-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    const content = await uploadAndGetContent()
    if (!content) return
    const sizesRecord: Record<string, number> = {}
    uploadedSizesRef.current.forEach((size, url) => { sizesRecord[url] = size })
    previewSizesSave(RESUME_PREVIEW_SIZES_KEY, sizesRecord)
    useResumeDraftStore.getState().setPreviewData({
      visibility: visibility!, title: title.trim(),
      memo, interestFields, tags, linkedIds, externalLinks,
      content,
    })
    router.push(USER_ROUTES.resume.preview)
  }

  // ── 임시저장 ────────────────────────────────────────────────────
  const handleDraftSave = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`rw-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    const content = await uploadAndGetContent()
    if (!content) return
    // TODO: API 호출 — POST /api/posts/draft
    alert("임시저장되었습니다.")
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
    externalLinks, setExternalLinks,
    errors, setErrors,
    myPortfolios,
    // storage
    storageInfo, sessionBytes, uploadError, uploadErrorKey,
    exceededModal, setExceededModal,
    // editor
    editor, trackedUpload, editorFocused, uploading,
    // bubble menu
    isDraggingRef, getVirtualElement,
    // handlers
    handlePreview, handleSubmit, handleDraftSave,
  }
}
