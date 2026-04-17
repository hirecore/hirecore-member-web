"use client"

// _views/portfolio/model | 포트폴리오 작성 뷰 비즈니스 로직
// 폼 상태, 스토리지 추적, 자동저장, 드래프트 복원, 이미지 업로드, 유효성 검사, 제출 — UI 렌더와 무관하므로 model에 분리
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
} from "@/_features/editor"
import type { StorageInfo, Visibility } from "@/_shared/model"
import {
  USER_ROUTES,
  PORTFOLIO_DRAFT_KEY, PORTFOLIO_PREVIEW_SIZES_KEY,
  portfolioEditDraftKey, AUTHORING_IMAGE_UPLOAD_LIMIT, AUTOSAVE_DELAY_MS,
} from "@/_shared/config"
import { draftSave, draftRestore, draftClear, previewSizesSave, previewSizesRestore, sanitizeDraftContent, filterPersistentSizes } from "@/_shared/lib"
import { useAuthGuard } from "@/_features/auth"
import {
  usePortfolioDraftStore,
  getCategoryPathLabel,
  isCustomInputCategory,
  type CategorySelection,
  type ConfirmData,
  type PortfolioLink,
} from "@/_features/portfolio"
import { useStorageInfo } from "@/_entities/user"

type ProjectType = "personal" | "team"

export function usePortfolioWriteView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Bug 2 수정: 수정 모드 진입 시 editId가 존재 → 새 글 드래프트(pw-draft) 복원을 건너뜀
  const editId = searchParams.get("editId")

  const { isLoading: authLoading, user } = useAuthGuard()
  const storageInfo = useStorageInfo()

  // Bug B: 수정 모드는 문서 ID별 독립 드래프트 키, 새 글은 공통 키
  const draftKey = editId ? portfolioEditDraftKey(editId) : PORTFOLIO_DRAFT_KEY

  // ── 폼 상태 ──────────────────────────────────────────────────────
  // 직무 카테고리 — 3-level 통합 (L3 코드 + 옵션 customCategory)
  const [category,      setCategory]      = useState<CategorySelection | null>(null)
  const [projectType,   setProjectType]   = useState<ProjectType | null>(null)
  const [visibility,    setVisibility]    = useState<Visibility | null>(null)
  const [title,         setTitle]         = useState("")
  const [privateMemo,   setPrivateMemo]   = useState("")
  const [tags,          setTags]          = useState<string[]>([])
  const [externalLinks, setExternalLinks] = useState<PortfolioLink[]>([])
  const [errors,        setErrors]        = useState<Partial<Record<string, string>>>({})
  const [confirmData,   setConfirmData]   = useState<ConfirmData | null>(null)
  const [thumbnailUrl,  setThumbnailUrl]  = useState<string | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  // ── 스토리지 & 업로드 상태 ───────────────────────────────────────
  const sessionBytesRef         = useRef(0)
  const [sessionBytes,          setSessionBytes]    = useState(0)
  const uploadedSizesRef        = useRef<Map<string, number>>(new Map())
  const pendingUploadBytesRef   = useRef(0)
  const [emptyModal,            setEmptyModal]      = useState(false)
  const [pendingDraft,          setPendingDraft]    = useState<ConfirmData | null>(null)
  // Bug A: 이미지 포함 내용이 sessionStorage 용량 초과로 저장 불가한 경우 true — DraftRestoreModal 경고 표시용
  const [draftContentTruncated, setDraftContentTruncated] = useState(false)
  // blob: URL 이미지가 자동저장에서 제외된 경우 true — DraftRestoreModal imagesDropped 경고 표시용
  const [draftImagesDropped, setDraftImagesDropped] = useState(false)
  const editorRestoreAllowedRef = useRef(false)
  const storageInfoRef          = useRef<StorageInfo | undefined>(storageInfo)
  const pendingDraftSizesRef    = useRef<Record<string, number>>({})

  // storageInfo는 매 렌더마다 최신 값으로 갱신 (ref를 통해 비동기 콜백 내에서도 최신 값 참조)
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
      attributes: { class: "simple-editor portfolio-editor", spellcheck: "false" },
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
  const formSnapshotRef  = useRef<Omit<ConfirmData, "content">>({
    category: { categoryCode: "" }, projectType: "personal",
    visibility: "public", title: "", thumbnailUrl: null, tags: [], externalLinks: [],
  })
  formSnapshotRef.current = {
    category: category ?? { categoryCode: "" },
    projectType: projectType ?? "personal",
    visibility: visibility as Visibility,
    title, thumbnailUrl, tags, externalLinks,
    privateMemo: privateMemo || undefined,
  }
  const autoSaveDraftRef = useRef(() => {})
  autoSaveDraftRef.current = () => {
    const snap = formSnapshotRef.current
    const editorEmpty = !editor || editor.isEmpty
    if (!snap.title && !category?.categoryCode && editorEmpty) return
    // blob: URL 이미지는 탭 세션 한정 자원 — 자동저장 전 제거하여 복원 시 깨진 이미지 방지
    const rawContent = editor ? editor.getJSON() : { type: "doc", content: [] }
    const { content: safeContent, droppedImageCount } = sanitizeDraftContent(rawContent)
    // blob: URL이 아닌 URL만 sizes에 저장 (ephemeral URL은 복원 불가)
    const sizesRecord = filterPersistentSizes(uploadedSizesRef.current)
    const draft = {
      ...snap,
      content: safeContent,
      _uploadedSizes: sizesRecord,
      ...(droppedImageCount > 0 ? { _ephemeralImagesDropped: true, _droppedImageCount: droppedImageCount } : {}),
    }
    // Bug A: 이미지 포함 JSON이 sessionStorage 용량 초과 시 liteDraft(콘텐츠 제외)로 폴백 — 복원 시 경고 표시
    const liteDraft = { ...snap, content: { type: "doc", content: [] }, _uploadedSizes: {}, _contentTruncated: true }
    draftSave(draftKey, draft, liteDraft)
  }
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => autoSaveDraftRef.current(), AUTOSAVE_DELAY_MS)
  }, [])

  // ── 마운트 시 드래프트/미리보기 복원 ────────────────────────────
  // Bug 2 수정: editId가 있으면 새 글 드래프트 복원 로직을 건너뜀 — 기존 글 수정 시 잘못된 팝업 방지
  useEffect(() => {
    const store = usePortfolioDraftStore.getState()

    // 미리보기 → "편집하기" 복귀 경로
    if (store.isBackFromPreview) {
      store.setBackFromPreview(false)
      editorRestoreAllowedRef.current = true
      const saved = store.previewData
      if (saved) {
        if (saved.category?.categoryCode) setCategory(saved.category)
        if (saved.projectType)             setProjectType(saved.projectType)
        if (saved.visibility)              setVisibility(saved.visibility)
        if (saved.title)                   setTitle(saved.title)
        if (saved.privateMemo)             setPrivateMemo(saved.privateMemo)
        if (saved.thumbnailUrl)            setThumbnailUrl(saved.thumbnailUrl)
        if (saved.tags?.length)            setTags(saved.tags)
        if (saved.externalLinks?.length)   setExternalLinks(saved.externalLinks)
      }
      const sizes = previewSizesRestore(PORTFOLIO_PREVIEW_SIZES_KEY)
      if (sizes) {
        Object.entries(sizes).forEach(([url, size]) => {
          uploadedSizesRef.current.set(url, size)
        })
      }
      return
    }

    // 새 작성 또는 수정 모드 진입 — 이전 미리보기 데이터 정리
    store.clearPreviewData()

    // Bug B: 새 글/수정 모두 각자의 draftKey로 드래프트를 조회
    const saved = draftRestore<ConfirmData & {
      _uploadedSizes?: Record<string, number>
      _contentTruncated?: boolean
      _ephemeralImagesDropped?: boolean
      _droppedImageCount?: number
    }>(draftKey)
    if (!saved) return
    const hasContent =
      saved.title || saved.category?.categoryCode ||
      (saved.content?.content && saved.content.content.length > 0)
    if (hasContent || saved._contentTruncated || saved._ephemeralImagesDropped) {
      if (saved._uploadedSizes) pendingDraftSizesRef.current = saved._uploadedSizes
      // Bug A: 이미지 포함 내용이 저장 불가했음을 기록 — DraftRestoreModal에서 경고 표시
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
    getPreviewContent: () => usePortfolioDraftStore.getState().previewData?.content,
    onRestored: () => editor && calcEditorSessionBytes(editor, uploadedSizesRef, sessionBytesRef, setSessionBytes),
  })

  // ── 에디터 변경 → 자동저장 ───────────────────────────────────────
  useEffect(() => {
    if (!editor) return
    editor.on("update", scheduleAutoSave)
    return () => { editor.off("update", scheduleAutoSave) }
  }, [editor, scheduleAutoSave])

  // ── 폼 변경 → 자동저장 ──────────────────────────────────────────
  useEffect(() => {
    scheduleAutoSave()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, projectType, visibility, title, privateMemo, thumbnailUrl, tags, externalLinks])

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

  // ── 카테고리 핸들러 ───────────────────────────────────────────────
  const handleCategoryChange = (value: CategorySelection | null) => {
    setCategory(value)
    setErrors((e) => ({ ...e, category: undefined }))
  }

  // ── 태그 핸들러 ───────────────────────────────────────────────────
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  // ── 썸네일 핸들러 ────────────────────────────────────────────────
  const handleThumbnailFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === "string") setThumbnailUrl(result)
    }
    reader.readAsDataURL(file)
  }
  const removeThumbnail = () => {
    setThumbnailUrl(null)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
  }

  // ── 드래프트 복원 핸들러 ─────────────────────────────────────────
  const handleRestoreConfirm = () => {
    if (!pendingDraft) return
    if (pendingDraft.category?.categoryCode) setCategory(pendingDraft.category)
    if (pendingDraft.projectType)             setProjectType(pendingDraft.projectType)
    if (pendingDraft.visibility)              setVisibility(pendingDraft.visibility)
    if (pendingDraft.title)                   setTitle(pendingDraft.title)
    if (pendingDraft.privateMemo)             setPrivateMemo(pendingDraft.privateMemo)
    if (pendingDraft.thumbnailUrl)            setThumbnailUrl(pendingDraft.thumbnailUrl)
    if (pendingDraft.tags?.length)            setTags(pendingDraft.tags)
    if (pendingDraft.externalLinks?.length)   setExternalLinks(pendingDraft.externalLinks)
    // Bug 1 수정: setContent 전 clearContent로 기존 상태 초기화 — 캐러셀 이미지 중복 방지
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

  // ── 카테고리 유효성 ──────────────────────────────────────────────
  // - L3 코드가 비어있으면 안됨
  // - "기타(직접입력)" 선택 시 customCategory 필수
  const validateCategory = (cat: CategorySelection | null): string | null => {
    if (!cat?.categoryCode) return "직무 카테고리를 선택해주세요"
    if (isCustomInputCategory(cat.categoryCode) && !cat.customCategory?.trim()) {
      return "직접 입력란에 직무를 입력해주세요"
    }
    return null
  }

  // ── 제출 유효성 검사 ─────────────────────────────────────────────
  const handleSubmit = () => {
    const newErrors: typeof errors = {}
    const categoryError = validateCategory(category)
    if (categoryError)                   newErrors.category    = categoryError
    if (!projectType)                    newErrors.projectType = "프로젝트 유형을 선택해주세요"
    if (!visibility)                     newErrors.visibility  = "공개 설정을 선택해주세요"
    if (!title.trim())                   newErrors.title       = "제목을 입력해주세요"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (!editor || editor.isEmpty) { setEmptyModal(true); return }
    setConfirmData({
      category: category!,
      projectType: projectType!, visibility: visibility!,
      title: title.trim(), privateMemo: privateMemo || undefined, thumbnailUrl, tags, externalLinks,
      content: editor!.getJSON(),
    })
  }

  // ── 등록 확인 → 미리보기 이동 ───────────────────────────────────
  const handleConfirm = () => {
    if (!confirmData) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    draftClear(draftKey)
    const sizesRecord: Record<string, number> = {}
    uploadedSizesRef.current.forEach((size, url) => { sizesRecord[url] = size })
    previewSizesSave(PORTFOLIO_PREVIEW_SIZES_KEY, sizesRecord)
    usePortfolioDraftStore.getState().setPreviewData(confirmData)
    router.push(USER_ROUTES.portfolio.preview)
  }

  // ── 미리보기 이동 ────────────────────────────────────────────────
  const handlePreview = () => {
    if (!editor) return
    const data: ConfirmData = {
      category: category ?? { categoryCode: "" },
      projectType: projectType ?? "personal", visibility: visibility ?? "public",
      title: title || "제목 없음", privateMemo: privateMemo || undefined, thumbnailUrl, tags, externalLinks,
      content: editor.getJSON(),
    }
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    draftClear(draftKey)
    const sizesRecord: Record<string, number> = {}
    uploadedSizesRef.current.forEach((size, url) => { sizesRecord[url] = size })
    previewSizesSave(PORTFOLIO_PREVIEW_SIZES_KEY, sizesRecord)
    usePortfolioDraftStore.getState().setPreviewData(data)
    router.push(USER_ROUTES.portfolio.preview)
  }

  // 카테고리 표시용 라벨 — "기타(직접입력)"은 customCategory 우선
  const categoryLabel = category?.categoryCode
    ? (isCustomInputCategory(category.categoryCode) && category.customCategory
       ? category.customCategory
       : getCategoryPathLabel(category.categoryCode))
    : ""

  return {
    // auth
    authLoading, user,
    // form — 직무 카테고리는 단일 객체
    category, setCategory, handleCategoryChange,
    projectType, setProjectType, visibility, setVisibility,
    title, setTitle, privateMemo, setPrivateMemo,
    tags, setTags, externalLinks, setExternalLinks,
    errors, setErrors,
    thumbnailUrl, setThumbnailUrl, thumbnailInputRef,
    // storage
    storageInfo, sessionBytes, uploadError, uploadErrorKey,
    exceededModal, setExceededModal,
    // modals
    emptyModal, setEmptyModal,
    confirmData, setConfirmData, categoryLabel,
    pendingDraft, draftContentTruncated, draftImagesDropped,
    // editor
    editor, trackedUpload, editorFocused,
    // bubble menu
    isDraggingRef, getVirtualElement,
    // handlers
    handleThumbnailFile, removeThumbnail,
    removeTag, scheduleAutoSave,
    handleSubmit, handleConfirm, handlePreview,
    handleRestoreConfirm, handleRestoreCancel,
  }
}
