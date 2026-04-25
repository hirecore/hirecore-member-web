"use client"

// _views/coverletter/model | 자기소개서 작성 뷰 비즈니스 로직
// 폼 상태, 유효성 검사, 제출 — 이미지 없음(텍스트 전용), UI 렌더와 무관하므로 model에 분리
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEditor } from "@tiptap/react"
import {
  WRITE_TEXT_EXTENSIONS,
  useEditorFocusState,
  useBubbleMenuAnchor,
  useEditorContentRestore,
  toWebP,
} from "@/_features/editor"
import { batchUploadImages } from "@/_shared/api"
import { USER_ROUTES } from "@/_shared/config"
import type { Visibility } from "@/_shared/model"
import type { ExternalLink } from "@/_shared/model"
import { useAuthGuard } from "@/_features/auth"
import { useCoverLetterDraftStore } from "@/_features/coverletter"
import { useMyPortfolios } from "@/_entities/portfolio"


export function useCoverLetterWriteView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("editId")

  const { isLoading: authLoading, user } = useAuthGuard()
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

  // 미리보기 복귀 후 editor가 준비되면 콘텐츠 복원을 허용하는 플래그
  const editorRestoreAllowedRef = useRef(false)

  // 이미지 관련 확장 제외 — 자기소개서는 텍스트 전용
  const editor = useEditor({
    immediatelyRender: false,
    content: undefined,
    editorProps: {
      attributes: { class: "simple-editor clw-editor", spellcheck: "false" },
    },
    extensions: WRITE_TEXT_EXTENSIONS,
  })

  // ── 에디터 포커스 상태 (카드 테두리 하이라이트용) ──────────────
  const editorFocused = useEditorFocusState(editor)

  // ── 버블 툴바 drag-selection 좌표 고정 앵커 ─────────────────────
  const { isDraggingRef, getVirtualElement } = useBubbleMenuAnchor(editor)

  // ── 마운트 시 미리보기 복원 ──────────────────────────────────────
  useEffect(() => {
    const store = useCoverLetterDraftStore.getState()
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
      return
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 에디터 콘텐츠 복원 (미리보기 → "편집하기" 복귀 전용) ────────
  useEditorContentRestore({
    editor,
    editorRestoreAllowedRef,
    isPending: false,
    getPreviewContent: () => useCoverLetterDraftStore.getState().previewData?.content,
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
ㅗ      editor.commands.setContent(content)
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
      document.getElementById(`clw-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    const content = await uploadAndGetContent()
    if (!content) return
    useCoverLetterDraftStore.getState().setPreviewData({
      visibility: visibility!, title: title.trim(),
      memo, interestFields, tags, linkedIds, externalLinks,
      content,
    })
    router.push(USER_ROUTES.coverletter.preview)
  }

  // ── 미리보기 이동 ────────────────────────────────────────────────
  const handlePreview = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`clw-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    const content = await uploadAndGetContent()
    if (!content) return
    useCoverLetterDraftStore.getState().setPreviewData({
      visibility: visibility!, title: title.trim(),
      memo, interestFields, tags, linkedIds, externalLinks,
      content,
    })
    router.push(USER_ROUTES.coverletter.preview)
  }

  // ── 임시저장 ────────────────────────────────────────────────────
  const handleDraftSave = async () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`clw-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
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
    // editor
    editor, editorFocused, uploading,
    // bubble menu
    isDraggingRef, getVirtualElement,
    // handlers
    handlePreview, handleSubmit, handleDraftSave,
  }
}
