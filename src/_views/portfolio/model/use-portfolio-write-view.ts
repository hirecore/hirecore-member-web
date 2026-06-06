"use client"

// _views/portfolio/model | 포트폴리오 작성 뷰 비즈니스 로직
// 폼 상태, 스토리지 추적, 이미지 업로드, 유효성 검사, 제출 — UI 렌더와 무관하므로 model에 분리
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
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
  PORTFOLIO_PREVIEW_SIZES_KEY,
  AUTHORING_IMAGE_UPLOAD_LIMIT,
} from "@/_shared/config"
import { previewSizesSave, previewSizesRestore } from "@/_shared/lib"
import {
  batchUploadImages, requestPresignedUrls, uploadToS3, getImageDimensions,
  collectImageUrls, createPortfolio, updatePortfolio,
} from "@/_shared/api"
import { toWebP } from "@/_features/editor"
import { useAuthGuard } from "@/_features/auth"
import {
  usePortfolioDraftStore,
  useJobCategories,
  getCategoryPathLabel,
  isCustomInputCategory,
  type CategorySelection,
  type ConfirmData,
  type PortfolioLink,
} from "@/_features/portfolio"
import { usePortfolioEdit } from "@/_entities/portfolio"
import { useStorageInfo } from "@/_entities/user"

type ProjectType = "personal" | "team"

export function usePortfolioWriteView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("editId")
  const queryClient = useQueryClient()

  const { isLoading: authLoading, user } = useAuthGuard()
  const storageInfo = useStorageInfo()
  const { data: categories = [] } = useJobCategories(3)

  // ── 폼 상태 ──────────────────────────────────────────────────────
  // 직무 카테고리 — 3-level 통합 (L3 코드 + 옵션 customCategory)
  const [category,      setCategory]      = useState<CategorySelection | null>(null)
  const [projectType,   setProjectType]   = useState<ProjectType | null>(null)
  const [visibility,    setVisibility]    = useState<Visibility | null>(null)
  const [title,          setTitle]          = useState("")
  const [privateMemo,    setPrivateMemo]    = useState("")
  const [previewSummary, setPreviewSummary] = useState("")
  const [tags,           setTags]           = useState<string[]>([])
  const [externalLinks, setExternalLinks] = useState<PortfolioLink[]>([])
  const [errors,        setErrors]        = useState<Partial<Record<string, string>>>({})
  const [confirmData,   setConfirmData]   = useState<ConfirmData | null>(null)
  const [thumbnailUrl,  setThumbnailUrl]  = useState<string | null>(null)
  const thumbnailFileRef = useRef<File | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  // publicUrl → imageFileMetaId(TSID 문자열). handleConfirm 재시도 / 신규 추가가 섞여도 ID를 잃지 않도록 누적 추적
  const imageIdMapRef = useRef<Map<string, string>>(new Map())
  const thumbnailImageIdRef = useRef<string | null>(null)

  // ── 스토리지 & 업로드 상태 ───────────────────────────────────────
  const sessionBytesRef         = useRef(0)
  const [sessionBytes,          setSessionBytes]    = useState(0)
  const uploadedSizesRef        = useRef<Map<string, number>>(new Map())
  const pendingUploadBytesRef   = useRef(0)
  const [emptyModal,            setEmptyModal]      = useState(false)
  const [uploading,             setUploading]       = useState(false)
  const editorRestoreAllowedRef = useRef(false)
  const storageInfoRef          = useRef<StorageInfo | undefined>(storageInfo)

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

  // ── 마운트 시 미리보기 복원 ──────────────────────────────────────
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
        if (saved.previewSummary)          setPreviewSummary(saved.previewSummary)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 에디터 콘텐츠 복원 (미리보기 → "편집하기" 복귀 전용) ────────
  useEditorContentRestore({
    editor,
    editorRestoreAllowedRef,
    isPending: false,
    getPreviewContent: () => usePortfolioDraftStore.getState().previewData?.content,
    onRestored: () => editor && calcEditorSessionBytes(editor, uploadedSizesRef, sessionBytesRef, setSessionBytes),
  })

  // ── 편집 모드 초기화 — GET /api/portfolios/:id/edit ──────────────
  // editId 가 URL 에 있으면 본인 포트폴리오 데이터를 불러와 폼/에디터를 1회 채운다.
  // categories(useJobCategories) 가 함께 로드돼야 allowsCustomInput 분기를 정확히 적용 가능.
  // 미리보기 → "편집하기" 복귀 흐름(editorRestoreAllowedRef.current=true)에서는
  // 직전 사용자 편집을 보존해야 하므로 폼/에디터 본문 재주입은 건너뛰지만,
  // PUT 수정 시 contentImageIds 산출에 필요한 thumbnailImageIdRef / imageIdMapRef 는
  // 매 경우 반드시 채워둔다 (누락 시 서버가 기존 이미지를 전부 회수 처리).
  const isEditMode = !!editId
  const editQuery = usePortfolioEdit(editId, { enabled: isEditMode })
  const editPrefillDoneRef = useRef(false)
  const editImageMapInitDoneRef = useRef(false)

  useEffect(() => {
    if (!isEditMode) return
    const data = editQuery.data
    if (!data) return

    // 이미지 ID 매핑 — 미리보기 복귀 흐름에서도 PUT 송신에 필요하므로 항상 초기화
    if (!editImageMapInitDoneRef.current) {
      thumbnailImageIdRef.current = data.thumbnailImageId ?? null
      for (const img of data.contentImages) {
        imageIdMapRef.current.set(img.url, img.imageId)
      }
      editImageMapInitDoneRef.current = true
    }

    if (editPrefillDoneRef.current) return
    if (editorRestoreAllowedRef.current) {
      // 미리보기 복귀 — preview store 가 더 최신이므로 폼/에디터 본문 재주입은 건너뜀
      editPrefillDoneRef.current = true
      return
    }
    if (!editor) return
    if (categories.length === 0) return // allowsCustomInput 판단을 위해 카테고리 로드 대기

    const allowsCustom = isCustomInputCategory(categories, data.categoryCode)
    setCategory({
      categoryCode: data.categoryCode,
      ...(allowsCustom && data.categoryLeafName
        ? { customCategory: data.categoryLeafName }
        : {}),
    })
    setProjectType(data.collaborationType)
    setVisibility(data.visibility)
    setTitle(data.title)
    setPrivateMemo(data.privateMemo ?? "")
    setPreviewSummary(data.previewSummary)
    setTags(data.tags)
    setExternalLinks(data.externalLinks)
    // 서버가 환경별 CDN base URL 까지 결합한 완성 URL 이 내려온다.
    // null 인 경우 신규 등록 화면과 동일한 빈 드롭존이 노출된다.
    setThumbnailUrl(data.thumbnailImageUrl)

    editor.commands.setContent(data.content)
    calcEditorSessionBytes(editor, uploadedSizesRef, sessionBytesRef, setSessionBytes)

    editPrefillDoneRef.current = true
  }, [isEditMode, editor, editQuery.data, categories])

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
    thumbnailFileRef.current = file
    const url = URL.createObjectURL(file)
    setThumbnailUrl(url)
  }
  const removeThumbnail = () => {
    if (thumbnailUrl?.startsWith("blob:")) URL.revokeObjectURL(thumbnailUrl)
    thumbnailFileRef.current = null
    // 편집 모드에서 기존 썸네일을 제거한 경우 PUT 본문에 thumbnailImageId 가 남으면
    // 서버가 동일 썸네일 유지로 해석하므로 ref 도 같이 비운다 (등록 모드도 동일하게 정리).
    thumbnailImageIdRef.current = null
    setThumbnailUrl(null)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
  }

  // ── 카테고리 유효성 ──────────────────────────────────────────────
  // - L3 코드가 비어있으면 안됨
  // - "기타(직접입력)" 선택 시 customCategory 필수
  const validateCategory = (cat: CategorySelection | null): string | null => {
    if (!cat?.categoryCode) return "직무 카테고리를 선택해주세요"
    if (isCustomInputCategory(categories, cat.categoryCode) && !cat.customCategory?.trim()) {
      return "직접 입력란에 직무를 입력해주세요"
    }
    return null
  }

  // ── 필수값 유효성 검사 (등록 & 임시저장 공통) ────────────────────
  const validate = (): typeof errors => {
    const newErrors: typeof errors = {}
    const categoryError = validateCategory(category)
    if (categoryError)                   newErrors.category       = categoryError
    if (!projectType)                    newErrors.projectType    = "프로젝트 유형을 선택해주세요"
    if (!visibility)                     newErrors.visibility     = "공개 설정을 선택해주세요"
    if (!title.trim())                   newErrors.title          = "제목을 입력해주세요"
    if (!previewSummary.trim())          newErrors.previewSummary = "한 줄 소개를 입력해주세요"
    else if (previewSummary.length > 100) newErrors.previewSummary = "100자 이내로 입력해주세요"
    return newErrors
  }

  // ── 썸네일 S3 업로드 ─────────────────────────────────────────────
  // 파일 변경이 없으면 기존 URL 유지 (이전 업로드의 imageFileMetaId도 ref에 그대로 보존)
  const uploadThumbnail = useCallback(async (): Promise<string | null> => {
    const file = thumbnailFileRef.current
    if (!file) return thumbnailUrl
    const webpFile = await toWebP(file)
    const { width, height } = await getImageDimensions(webpFile)
    const { files } = await requestPresignedUrls([{
      purpose: "thumbnailImage",
      mimeType: "image/webp",
      originalFileName: file.name,
      width, height,
      fileExtension: "webp",
      domainType: "portfolio",
      clientFileId: 0,
      fileSizeBytes: webpFile.size,
    }])
    await uploadToS3(files[0].presignedUrl, webpFile)
    thumbnailFileRef.current = null
    thumbnailImageIdRef.current = files[0].imageFileMetaId
    return files[0].publicUrl
  }, [thumbnailUrl])

  // ── 이미지 일괄 업로드 (등록/임시저장 공통) ──────────────────────
  const uploadAndGetContent = useCallback(async () => {
    if (!editor) return null
    const rawContent = editor.getJSON()
    try {
      setUploading(true)
      const [batchResult, uploadedThumbnailUrl] = await Promise.all([
        batchUploadImages({ content: rawContent, domainType: "portfolio", toWebP }),
        uploadThumbnail(),
      ])
      // 신규 업로드 분 imageFileMetaId 누적 (재시도/추가 업로드 시 기존 매핑 보존)
      batchResult.imageIdMap.forEach((id, url) => imageIdMapRef.current.set(url, id))
      editor.commands.setContent(batchResult.content)
      if (uploadedThumbnailUrl) setThumbnailUrl(uploadedThumbnailUrl)
      return { content: batchResult.content, thumbnailUrl: uploadedThumbnailUrl }
    } catch (e) {
      alert(e instanceof Error ? e.message : "이미지 업로드에 실패했습니다.")
      return null
    } finally {
      setUploading(false)
    }
  }, [editor, uploadThumbnail])

  // ── 제출 유효성 검사 → 확인 팝업 표시 (S3 업로드 없음) ──────────
  const handleSubmit = () => {
    const newErrors = validate()
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
      title: title.trim(), privateMemo: privateMemo || undefined,
      previewSummary: previewSummary.trim(),
      thumbnailUrl, tags, externalLinks,
      content: editor.getJSON(),
    })
  }

  // ── 임시저장 ────────────────────────────────────────────────────
  // 백엔드 임시저장 endpoint 미구현 — 검증/업로드 사전 수행 없이 안내 모달만 노출.
  // API 구축 후 validate → uploadAndGetContent → POST /api/portfolios/drafts 로 복구.
  const [draftNotReadyOpen, setDraftNotReadyOpen] = useState(false)
  const handleDraftSave = () => setDraftNotReadyOpen(true)

  // ── 등록 확인 → S3 업로드 → 등록 API 호출 → 상세 페이지 이동 ────
  const handleConfirm = async () => {
    if (!confirmData || !editor) return

    const result = await uploadAndGetContent()
    if (!result) return

    // 본문에 박힌 모든 이미지 publicUrl → imageFileMetaId 매핑 (단일 + 캐러셀)
    const urls = collectImageUrls(result.content)
    const contentImageIds = Array.from(
      new Set(
        urls
          .map((url) => imageIdMapRef.current.get(url))
          .filter((id): id is string => typeof id === "string")
      )
    )

    // 외부 링크: label / url 한쪽만 채워진 항목은 백엔드에서 거부 → 사전 필터링
    const cleanedExternalLinks = confirmData.externalLinks.filter(
      (l) => l.label?.trim() && l.url?.trim()
    )

    // 공통 body builder — 등록/수정이 동일 shape 을 공유한다.
    // PUT(수정)은 전체 교체 시맨틱이므로:
    //  - tags / externalLinks 등 컬렉션은 빈 배열도 그대로 송신해 클리어 의도를 전달
    //  - thumbnailImageId 는 null 도 명시 전송해 "썸네일 제거" 의도를 전달
    // POST(등록)은 빈 컬렉션/null 을 굳이 보낼 필요가 없어 조건부 스프레드를 유지한다.
    const buildBody = (forUpdate: boolean) => ({
      jobCategory: {
        code: confirmData.category.categoryCode,
        ...(confirmData.category.customCategory?.trim()
          ? { userInput: confirmData.category.customCategory.trim() }
          : {}),
      },
      collaborationType: confirmData.projectType,
      visibility:        confirmData.visibility,
      title:             confirmData.title,
      ...(confirmData.privateMemo ? { privateMemo: confirmData.privateMemo } : {}),
      previewSummary:    confirmData.previewSummary,
      ...(forUpdate
        ? { thumbnailImageId: thumbnailImageIdRef.current }
        : thumbnailImageIdRef.current != null
          ? { thumbnailImageId: thumbnailImageIdRef.current }
          : {}),
      ...(forUpdate || contentImageIds.length > 0 ? { contentImageIds } : {}),
      ...(forUpdate || confirmData.tags.length > 0
        ? {
            tags: confirmData.tags.map((tag, index) => ({
              userInputTag: tag,
              sortOrder: index,
            })),
          }
        : {}),
      ...(forUpdate || cleanedExternalLinks.length > 0
        ? { externalLinks: cleanedExternalLinks }
        : {}),
      content: {
        json: result.content,
        html: editor.getHTML(),
      },
    })

    try {
      setUploading(true)
      const { portfolioId } = isEditMode && editId
        ? await updatePortfolio(editId, buildBody(true))
        : await createPortfolio(buildBody(false))
      // 다음 진입 시 잔여 미리보기 데이터 청소
      usePortfolioDraftStore.getState().clearPreviewData()
      setConfirmData(null)
      // 캐시 무효화 — staleTime(60s) 내 재진입 시 옛 데이터가 노출되지 않도록
      // 상세 / 편집 양쪽 쿼리를 모두 비운다. 수정 모드일 때만 무효화가 의미 있지만
      // 등록 모드에서도 동일 ID로 미리 들어가 있을 가능성은 없어 안전.
      if (isEditMode && editId) {
        queryClient.invalidateQueries({ queryKey: ["portfolio", "edit", editId] })
        queryClient.invalidateQueries({ queryKey: ["portfolio", "detail", editId] })
      }
      router.push(USER_ROUTES.portfolio.detail(portfolioId))
    } catch (e) {
      const fallback = isEditMode ? "포트폴리오 수정에 실패했습니다." : "포트폴리오 등록에 실패했습니다."
      const message = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? fallback
      alert(message)
    } finally {
      setUploading(false)
    }
  }

  // ── 미리보기 이동 ────────────────────────────────────────────────
  const handlePreview = () => {
    const newErrors = validate()
    if (!editor || editor.isEmpty) newErrors.content = "내용을 입력해주세요"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    const data: ConfirmData = {
      category: category!,
      projectType: projectType!, visibility: visibility!,
      title: title.trim(), privateMemo: privateMemo || undefined,
      previewSummary: previewSummary.trim(),
      thumbnailUrl, tags, externalLinks,
      content: editor!.getJSON(),
    }
    const sizesRecord: Record<string, number> = {}
    uploadedSizesRef.current.forEach((size, url) => { sizesRecord[url] = size })
    previewSizesSave(PORTFOLIO_PREVIEW_SIZES_KEY, sizesRecord)
    usePortfolioDraftStore.getState().setPreviewData(data)
    router.push(USER_ROUTES.portfolio.preview)
  }

  // 카테고리 표시용 라벨 — "기타(직접입력)"은 customCategory 우선
  const categoryLabel = category?.categoryCode
    ? (isCustomInputCategory(categories, category.categoryCode) && category.customCategory
       ? category.customCategory
       : getCategoryPathLabel(categories, category.categoryCode))
    : ""

  // 편집 모드 진입 직후 데이터 로딩 — 폼이 빈 채로 깜빡이지 않도록 view 단에서 게이팅한다
  const editPrefillLoading = isEditMode && !editPrefillDoneRef.current

  return {
    // auth
    authLoading, user,
    // edit mode
    isEditMode, editPrefillLoading,
    // form — 직무 카테고리는 단일 객체
    category, setCategory, handleCategoryChange,
    projectType, setProjectType, visibility, setVisibility,
    title, setTitle, privateMemo, setPrivateMemo,
    previewSummary, setPreviewSummary,
    tags, setTags, externalLinks, setExternalLinks,
    errors, setErrors,
    thumbnailUrl, setThumbnailUrl, thumbnailInputRef,
    // storage
    storageInfo, sessionBytes, uploadError, uploadErrorKey,
    exceededModal, setExceededModal,
    // modals & state
    emptyModal, setEmptyModal, uploading,
    draftNotReadyOpen, setDraftNotReadyOpen,
    confirmData, setConfirmData, categoryLabel,
    // editor
    editor, trackedUpload, editorFocused,
    // bubble menu
    isDraggingRef, getVirtualElement,
    // handlers
    handleThumbnailFile, removeThumbnail,
    removeTag,
    handleSubmit, handleConfirm, handlePreview, handleDraftSave,
  }
}
