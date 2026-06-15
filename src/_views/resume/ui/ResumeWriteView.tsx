"use client"

// _views/resume/ui | 이력서 작성 뷰 — 비즈니스 로직은 model/use-resume-write-view에 위임
import { useState } from "react"
import { isTextSelection } from "@tiptap/core"
import { EditorContent, EditorContext } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { DragHandle } from "@tiptap/extension-drag-handle-react"

import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  HeadingDropdownMenu,
  ListDropdownMenu,
  MarkButton,
  BlockquoteButton,
  CodeBlockButton,
  TextAlignButton,
  UndoRedoButton,
  ImageUploadButton,
  TableButton,
  TableHoverControls,
  EXCLUDE_TABLE_DRAG_HANDLE_RULE,
  ColorHighlightPopover,
  TextColorPopover,
  LinkPopover,
  StorageBar,
  StorageExceededModal,
  StorageOptimizationHint,
} from "@/_features/editor"

import { LinkedPortfoliosSection } from "@/_features/document-link"
import { WriteActionBar, ExternalLinksSection, JobCategorySection, TagsSection } from "@/_widgets/portfolio-editor"
import { useResumeWriteView } from "../model/use-resume-write-view"
import { PageContainer } from "@/_shared/ui/layout"
import { DraftSaveNotReadyModal } from "@/_shared/ui/draft-save-not-ready-modal"
import type { Visibility } from "@/_shared/model"
import "@/_features/editor/editor.scss"
import "./resume-write-view.scss"

const VISIBILITY_OPTS = [
  {
    id: "public" as Visibility,
    label: "공개",
    desc: "누구나 이력서를 볼 수 있어요",
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 10h15" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "private" as Visibility,
    label: "비공개",
    desc: "나만 볼 수 있어요",
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <rect x="5" y="9" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function EditorToolbar() {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <BlockquoteButton />
        <TableButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" /><MarkButton type="italic" /><MarkButton type="strike" />
        <MarkButton type="code" /><MarkButton type="underline" />
        <ColorHighlightPopover /><TextColorPopover /><LinkPopover />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" /><MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" /><TextAlignButton align="center" />
        <TextAlignButton align="right" /><TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>
    </>
  )
}

export function ResumeWriteView() {
  const {
    authLoading, user,
    visibility, setVisibility,
    title, setTitle,
    memo, setMemo,
    category, setCategory,
    previewSummary, setPreviewSummary,
    tags, setTags,
    linkedIds, setLinkedIds,
    externalLinks, setExternalLinks,
    errors, setErrors,
    myPortfolios,
    storageInfo, sessionBytes, uploadError, uploadErrorKey,
    exceededModal, setExceededModal,
    draftNotReadyOpen, setDraftNotReadyOpen,
    editor, editorFocused,
    isDraggingRef, getVirtualElement,
    handlePreview, handleSubmit, handleDraftSave,
  } = useResumeWriteView()

  // 순수 UI 임시 상태
  const [tagInput,      setTagInput]      = useState("")

  // 태그 키다운: view의 tagInput과 model의 tags를 연결
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const trimmed = tagInput.trim().replace(/^#/, "")
      if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
        setTags((prev) => [...prev, trimmed])
      }
      setTagInput("")
    } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  if (authLoading || !user) return null

  return (
    <EditorContext.Provider value={{ editor }}>

      {/* 저장 공간 초과 모달 */}
      {exceededModal && (
        <StorageExceededModal
          info={storageInfo}
          sessionBytes={sessionBytes}
          fileSize={exceededModal.fileSize}
          onClose={() => setExceededModal(null)}
        />
      )}

      {/* 버블 툴바 */}
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ state }) => {
            if (!isTextSelection(state.selection)) return false
            const { from, to } = state.selection
            return from !== to && !isDraggingRef.current
          }}
          getReferencedVirtualElement={getVirtualElement}
          options={{ placement: "top" }}
        >
          <Toolbar variant="floating">
            <ToolbarGroup>
              <MarkButton type="bold" /><MarkButton type="italic" /><MarkButton type="underline" />
              <MarkButton type="strike" /><MarkButton type="code" />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup><ColorHighlightPopover /><TextColorPopover /></ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup>
              <TextAlignButton align="left" /><TextAlignButton align="center" /><TextAlignButton align="right" />
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarGroup><LinkPopover /></ToolbarGroup>
          </Toolbar>
        </BubbleMenu>
      )}

      {/* 표 노션 스타일 hover 컨트롤 */}
      {editor && <TableHoverControls editor={editor} />}

      <div className="rw-root">
        <main className="rw-main">
          <PageContainer width="write">

            {/* 페이지 헤더 */}
            <div className="rw-page-header">
              <div className="rw-page-header__icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="rw-page-header__title">이력서 작성</h1>
            </div>

            {/* 01. 공개 설정 */}
            <section className="rw-section" id="rw-field-visibility">
              <div className="rw-section__head">
                <span className="rw-section__label">공개 설정</span>
                <span className="rw-section__required">필수</span>
              </div>
              <div className="rw-visibility-opts">
                {VISIBILITY_OPTS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`rw-visibility-opt${visibility === opt.id ? " rw-visibility-opt--active" : ""}`}
                    onClick={() => { setVisibility(opt.id); setErrors((e) => ({ ...e, visibility: undefined })) }}
                  >
                    <span className="rw-visibility-opt__icon">{opt.icon}</span>
                    <span className="rw-visibility-opt__text">
                      <span className="rw-visibility-opt__label">{opt.label}</span>
                      <span className="rw-visibility-opt__desc">{opt.desc}</span>
                    </span>
                    {visibility === opt.id && (
                      <span className="rw-visibility-opt__check" aria-hidden>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M2 6.5L5 9.5L11 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {errors.visibility && <p className="rw-error">{errors.visibility}</p>}
            </section>

            {/* 02. 직무 선택 — 포트폴리오와 동일한 JobCategorySection (단일 선택, 필수) */}
            <JobCategorySection
              value={category}
              error={errors.category}
              onChange={(v) => { setCategory(v); setErrors((e) => ({ ...e, category: undefined })) }}
              classPrefix="rw"
              label="직무 선택"
              sectionId="rw-field-category"
            />

            {/* 03. 제목 */}
            <section className="rw-section" id="rw-field-title">
              <div className="rw-section__head">
                <span className="rw-section__label">이력서 제목</span>
                <span className="rw-section__required">필수</span>
              </div>
              <input
                type="text"
                className="rw-title-input"
                placeholder="이력서 제목을 입력해주세요 (예: 3년차 프론트엔드 개발자 이력서)"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((v) => ({ ...v, title: undefined })) }}
                maxLength={80}
              />
              {errors.title && <p className="rw-error">{errors.title}</p>}
            </section>

            {/* 04. 나만 보는 메모 */}
            <section className="rw-section">
              <div className="rw-section__head">
                <span className="rw-section__label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: "0.2rem", verticalAlign: "middle" }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  나만 보는 메모
                </span>
                <span className="rw-section__optional">선택</span>
                <span className="rw-section__hint rw-section__hint--private">나에게만 표시됩니다</span>
              </div>
              <textarea
                className="rw-memo-input"
                placeholder="이 이력서에 대한 메모를 자유롭게 적어보세요 (예: A사 지원용, 2026년 상반기 버전)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <div className="rw-memo-count">{memo.length}/200</div>
            </section>

            {/* 05. 이력서 한 줄 소개 */}
            <section className="rw-section" id="rw-field-previewSummary">
              <div className="rw-section__head">
                <span className="rw-section__label">이력서 한 줄 소개</span>
                <span className="rw-section__required">필수</span>
                <span className="rw-section__hint">이력서 카드의 내용 요약 정보로 노출됩니다</span>
              </div>
              <textarea
                className="rw-summary-input"
                placeholder="이력서의 핵심을 한 줄로 소개해주세요 (예: React/Next.js 3년차, 사용자 인터랙션 최적화에 강점)"
                value={previewSummary}
                onChange={(e) => {
                  setPreviewSummary(e.target.value)
                  setErrors((prev) => ({ ...prev, previewSummary: undefined }))
                }}
                rows={2}
                maxLength={100}
              />
              <div className="rw-summary-count">{previewSummary.length}/100</div>
              {errors.previewSummary && <p className="rw-error">{errors.previewSummary}</p>}
            </section>

            {/* 06. 본문 */}
            <section className="rw-section" id="rw-field-content">
              <div className="rw-section__head">
                <span className="rw-section__label">이력서 내용</span>
                <span className="rw-section__required">필수</span>
              </div>
              <div className={`rw-editor-card${editorFocused ? " rw-editor-card--focused" : ""}`}>
                <div className="rw-editor-card__toolbar">
                  <Toolbar>
                    <EditorToolbar />
                  </Toolbar>
                </div>
                {/* StorageBar: editor-card 내부 배치 — resume-write-view.scss에서 position:static override */}
                <StorageBar
                  info={storageInfo}
                  sessionBytes={sessionBytes}
                  error={uploadError}
                  errorKey={uploadErrorKey}
                />
                <div className="rw-storage-hint">
                  <StorageOptimizationHint variant="webp" />
                </div>
                <div className="rw-editor-area">
                  {editor && (
                    <DragHandle
                      editor={editor}
                      nested={{ edgeDetection: "none", rules: [EXCLUDE_TABLE_DRAG_HANDLE_RULE] }}
                      onNodeChange={({ node }) => {
                        const el = document.querySelector(".drag-handle") as HTMLElement | null
                        if (!el) return
                        if (node?.type.name === "table") el.dataset.targetTable = "1"
                        else delete el.dataset.targetTable
                      }}
                    >
                      <div
                        className="rw-drag-handle-icon"
                        onClick={() => {
                          const el = document.querySelector(".drag-handle") as HTMLElement | null
                          if (el?.dataset.targetTable === "1") {
                            if (window.confirm("이 표를 삭제하시겠습니까?")) {
                              editor.chain().focus().deleteTable().run()
                            }
                          }
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="5.5" cy="4" r="1.2" /><circle cx="10.5" cy="4" r="1.2" />
                          <circle cx="5.5" cy="8" r="1.2" /><circle cx="10.5" cy="8" r="1.2" />
                          <circle cx="5.5" cy="12" r="1.2" /><circle cx="10.5" cy="12" r="1.2" />
                        </svg>
                      </div>
                    </DragHandle>
                  )}
                  <EditorContent
                    editor={editor}
                    role="presentation"
                    className="simple-editor-content rw-editor-content"
                  />
                </div>
              </div>
              {errors.content && <p className="rw-error">{errors.content}</p>}
            </section>

            {/* 06. 링크 */}
            <ExternalLinksSection
              externalLinks={externalLinks}
              onAdd={(link) => setExternalLinks((prev) => [...prev, link])}
              onRemove={(i) => setExternalLinks((prev) => prev.filter((_, idx) => idx !== i))}
              onReorder={(next) => setExternalLinks(next)}
              onUpdate={(i, link) => setExternalLinks((prev) => prev.map((v, idx) => idx === i ? link : v))}
              classPrefix="rw"
            />

            {/* 07. 태그 */}
            <TagsSection
              tags={tags}
              tagInput={tagInput}
              onInputChange={setTagInput}
              onKeyDown={handleTagKeyDown}
              onRemove={(tag) => setTags((t) => t.filter((v) => v !== tag))}
              onReorder={(next) => setTags(next)}
              classPrefix="rw"
              emptyPlaceholder="태그 단어를 입력 후 Enter를 눌러주세요. (최대 10개)"
              partialPlaceholder="Enter를 눌러 추가하세요."
            />

            {/* 08. 포트폴리오 연결 */}
            <section className="rw-section">
              <div className="rw-section__head">
                <span className="rw-section__label">포트폴리오 연결</span>
                <span className="rw-section__optional">선택</span>
              </div>
              <LinkedPortfoliosSection
                portfolios={myPortfolios}
                linkedIds={linkedIds}
                onChange={setLinkedIds}
              />
            </section>

          </PageContainer>
        </main>

        {/* 하단 액션 바 */}
        <WriteActionBar onPreview={handlePreview} onSubmit={handleSubmit} onDraftSave={handleDraftSave} />

        {/* 임시저장 API 미구현 안내 */}
        {draftNotReadyOpen && <DraftSaveNotReadyModal onClose={() => setDraftNotReadyOpen(false)} />}
      </div>
    </EditorContext.Provider>
  )
}
