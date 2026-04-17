"use client"

// _views/coverletter/model | 자기소개서 작성 뷰 비즈니스 로직
// 폼 상태, 자동저장, 드래프트 복원, 유효성 검사, 제출 — 이미지 없음(텍스트 전용), UI 렌더와 무관하므로 model에 분리
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/core"
import {
  WRITE_TEXT_EXTENSIONS,
  useEditorFocusState,
  useBubbleMenuAnchor,
  useEditorContentRestore,
} from "@/_features/editor"
import {
  USER_ROUTES,
  COVERLETTER_DRAFT_KEY, coverLetterEditDraftKey, AUTOSAVE_DELAY_MS,
} from "@/_shared/config"
import type { Visibility } from "@/_shared/model"
import { draftSave, draftRestore, draftClear } from "@/_shared/lib"
import { useAuthGuard } from "@/_features/auth"
import { useCoverLetterDraftStore } from "@/_features/coverletter"
import { useMyPortfolios } from "@/_entities/portfolio"

interface CoverLetterDraft {
  visibility: Visibility | null
  title: string
  memo: string
  interestFields: string[]
  tags: string[]
  linkedIds: string[]
  content?: JSONContent
}


export function useCoverLetterWriteView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Bug 2 수정: 수정 모드 진입 시 editId가 존재 → 새 글 드래프트(clw-draft) 복원을 건너뜀
  const editId = searchParams.get("editId")

  const { isLoading: authLoading, user } = useAuthGuard()
  const myPortfolios = useMyPortfolios()

  // Bug B: 수정 모드는 문서 ID별 독립 드래프트 키, 새 글은 공통 키
  const draftKey = editId ? coverLetterEditDraftKey(editId) : COVERLETTER_DRAFT_KEY

  // ── 폼 상태 ──────────────────────────────────────────────────────
  const [visibility,      setVisibility]      = useState<Visibility | null>(null)
  const [title,           setTitle]           = useState("")
  const [memo,            setMemo]            = useState("")
  const [interestFields,  setInterestFields]  = useState<string[]>([])
  const [tags,            setTags]            = useState<string[]>([])
  const [linkedIds,       setLinkedIds]       = useState<string[]>([])
  const [errors,          setErrors]          = useState<Partial<Record<string, string>>>({})

  // ── 드래프트 복원 ────────────────────────────────────────────────
  const [pendingDraft, setPendingDraft] = useState<CoverLetterDraft | null>(null)

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  // ── 자동저장 ──────────────────────────────────────────────────────
  const autoSaveRef = useRef<() => void>(() => {})
  autoSaveRef.current = () => {
    if (!title && !visibility) return
    const draft: CoverLetterDraft = {
      visibility, title, memo, interestFields, tags, linkedIds,
      content: editor?.getJSON(),
    }
    draftSave(draftKey, draft)
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

  // ── 마운트 시 드래프트/미리보기 복원 ────────────────────────────
  // Bug 2 수정: editId가 있으면 새 글 드래프트 복원 로직을 건너뜀
  useEffect(() => {
    const store = useCoverLetterDraftStore.getState()
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
      return
    }

    // Bug B: 새 글/수정 모두 각자의 draftKey로 드래프트를 조회
    const saved = draftRestore<CoverLetterDraft>(draftKey)
    if (!saved) return
    if (saved.title || saved.visibility) setPendingDraft(saved)
    else draftClear(draftKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 에디터 콘텐츠 복원 (미리보기 → "편집하기" 복귀 전용) ────────
  useEditorContentRestore({
    editor,
    editorRestoreAllowedRef,
    isPending: !!pendingDraft,
    getPreviewContent: () => useCoverLetterDraftStore.getState().previewData?.content,
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
    // Bug 1 수정: clearContent 후 setContent — 잠재적 중복 방지
    if (editor && pendingDraft.content) {
      editor.commands.clearContent()
      editor.commands.setContent(pendingDraft.content)
    }
    draftClear(draftKey)
    setPendingDraft(null)
  }

  const handleRestoreCancel = () => {
    draftClear(draftKey)
    setPendingDraft(null)
  }

  // ── 미리보기 이동 ────────────────────────────────────────────────
  const handlePreview = () => {
    if (!editor) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    draftClear(draftKey)
    useCoverLetterDraftStore.getState().setPreviewData({
      visibility: visibility ?? "public",
      title: title || "제목 없음",
      memo, interestFields, tags, linkedIds,
      content: editor.getJSON(),
    })
    router.push(USER_ROUTES.coverletter.preview)
  }

  // ── 제출 유효성 검사 ─────────────────────────────────────────────
  const handleSubmit = () => {
    const newErrors: typeof errors = {}
    if (!visibility)               newErrors.visibility = "공개 설정을 선택해주세요"
    if (!title.trim())             newErrors.title      = "제목을 입력해주세요"
    if (!editor || editor.isEmpty) newErrors.content    = "내용을 입력해주세요"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(`clw-field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    draftClear(draftKey)
    useCoverLetterDraftStore.getState().setPreviewData({
      visibility: visibility!, title: title.trim(),
      memo, interestFields, tags, linkedIds,
      content: editor!.getJSON(),
    })
    router.push(USER_ROUTES.coverletter.preview)
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
    // draft
    pendingDraft,
    // editor
    editor, editorFocused,
    // bubble menu
    isDraggingRef, getVirtualElement,
    // handlers
    handleRestoreConfirm, handleRestoreCancel,
    handlePreview, handleSubmit,
  }
}
