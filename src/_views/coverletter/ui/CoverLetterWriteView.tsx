"use client"

// _views/coverletter/ui | 자기소개서 작성 뷰 — 비즈니스 로직은 model/use-cover-letter-write-view에 위임
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
  ColorHighlightPopover,
  TextColorPopover,
  LinkPopover,
  StorageOptimizationHint,
} from "@/_features/editor"

import { LinkedPortfoliosSection } from "@/_features/document-link"
import { WriteActionBar, ExternalLinksSection, MultiJobCategorySection } from "@/_widgets/portfolio-editor"
import { useCoverLetterWriteView } from "../model/use-cover-letter-write-view"
import { PageContainer } from "@/_shared/ui/layout"
import type { Visibility } from "@/_shared/model"
import "@/_features/editor/editor.scss"
import "./coverletter-write-view.scss"

const VISIBILITY_OPTS = [
  {
    id: "public" as Visibility,
    label: "공개",
    desc: "누구나 자기소개서를 볼 수 있어요",
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

// 이미지 제외 — 자기소개서는 텍스트 전용
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
    </>
  )
}

export function CoverLetterWriteView() {
  const {
    authLoading, user,
    visibility, setVisibility,
    title, setTitle,
    memo, setMemo,
    interestFields, setInterestFields,
    tags, setTags,
    linkedIds, setLinkedIds,
    externalLinks, setExternalLinks,
    errors, setErrors,
    myPortfolios,
    editor, editorFocused,
    isDraggingRef, getVirtualElement,
    handlePreview, handleSubmit, handleDraftSave,
  } = useCoverLetterWriteView()

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

      <div className="clw-root">
        <main className="clw-main">
          <PageContainer width="write">

            {/* 페이지 헤더 */}
            <div className="clw-page-header">
              <div className="clw-page-header__icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M2 9l10 7 10-7" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <h1 className="clw-page-header__title">자기소개서 작성</h1>
            </div>

            {/* 01. 공개 설정 */}
            <section className="clw-section" id="clw-field-visibility">
              <div className="clw-section__head">
                <span className="clw-section__label">공개 설정</span>
                <span className="clw-section__required">필수</span>
              </div>
              <div className="clw-visibility-opts">
                {VISIBILITY_OPTS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`clw-visibility-opt${visibility === opt.id ? " clw-visibility-opt--active" : ""}`}
                    onClick={() => { setVisibility(opt.id); setErrors((e) => ({ ...e, visibility: undefined })) }}
                  >
                    <span className="clw-visibility-opt__icon">{opt.icon}</span>
                    <span className="clw-visibility-opt__text">
                      <span className="clw-visibility-opt__label">{opt.label}</span>
                      <span className="clw-visibility-opt__desc">{opt.desc}</span>
                    </span>
                    {visibility === opt.id && (
                      <span className="clw-visibility-opt__check" aria-hidden>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M2 6.5L5 9.5L11 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {errors.visibility && <p className="clw-error">{errors.visibility}</p>}
            </section>

            {/* 02. 직무 선택 */}
            <MultiJobCategorySection
              value={interestFields}
              maxCount={5}
              onChange={setInterestFields}
              classPrefix="clw"
            />

            {/* 03. 제목 */}
            <section className="clw-section" id="clw-field-title">
              <div className="clw-section__head">
                <span className="clw-section__label">제목</span>
                <span className="clw-section__required">필수</span>
              </div>
              <input
                type="text"
                className="clw-text-input"
                placeholder="자기소개서 제목 (예: 카카오 프론트엔드 개발자 자기소개서)"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((v) => ({ ...v, title: undefined })) }}
                maxLength={80}
              />
              {errors.title && <p className="clw-error">{errors.title}</p>}
            </section>

            {/* 04. 나만 보는 메모 */}
            <section className="clw-section">
              <div className="clw-section__head">
                <span className="clw-section__label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: "0.2rem", verticalAlign: "middle" }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  나만 보는 메모
                </span>
                <span className="clw-section__optional">선택</span>
                <span className="clw-section__hint clw-section__hint--private">나에게만 표시됩니다</span>
              </div>
              <textarea
                className="clw-memo-input"
                placeholder="이 자기소개서에 대한 메모를 자유롭게 적어보세요 (예: 카카오 2026 상반기 공채용)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <div className="clw-memo-count">{memo.length}/200</div>
            </section>

            {/* 05. 본문 */}
            <section className="clw-section" id="clw-field-content">
              <div className="clw-section__head">
                <span className="clw-section__label">자기소개서 내용</span>
                <span className="clw-section__required">필수</span>
              </div>
              <div className={`clw-editor-card${editorFocused ? " clw-editor-card--focused" : ""}`}>
                <div className="clw-editor-card__toolbar">
                  <Toolbar>
                    <EditorToolbar />
                  </Toolbar>
                </div>
                {/* 텍스트 전용 안내 */}
                <div className="clw-storage-hint">
                  <StorageOptimizationHint variant="text-only" />
                </div>
                <div className="clw-editor-area">
                  {editor && (
                    <DragHandle editor={editor} nested={{ edgeDetection: "none" }}>
                      <div className="clw-drag-handle-icon">
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
                    className="simple-editor-content clw-editor-content"
                  />
                </div>
              </div>
              {errors.content && <p className="clw-error">{errors.content}</p>}
            </section>

            {/* 06. 링크 */}
            <ExternalLinksSection
              externalLinks={externalLinks}
              onAdd={(link) => setExternalLinks((prev) => [...prev, link])}
              onRemove={(i) => setExternalLinks((prev) => prev.filter((_, idx) => idx !== i))}
              classPrefix="clw"
            />

            {/* 07. 태그 */}
            <section className="clw-section">
              <div className="clw-section__head">
                <span className="clw-section__label">태그</span>
                <span className="clw-section__optional">선택</span>
              </div>
              <div className="clw-tags-wrap">
                {tags.map((tag) => (
                  <span key={tag} className="clw-tag-chip">
                    #{tag}
                    <button type="button" className="clw-tag-chip__remove" onClick={() => setTags((t) => t.filter((v) => v !== tag))} aria-label={`${tag} 태그 삭제`}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="clw-tag-input"
                  placeholder={tags.length === 0 ? "태그 단어를 입력 후 Enter를 눌러주세요. (최대 10개)" : tags.length < 10 ? "Enter를 눌러 추가하세요." : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={tags.length >= 10}
                />
              </div>
            </section>

            {/* 08. 포트폴리오 연결 */}
            <section className="clw-section">
              <div className="clw-section__head">
                <span className="clw-section__label">포트폴리오 연결</span>
                <span className="clw-section__optional">선택</span>
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
      </div>
    </EditorContext.Provider>
  )
}
