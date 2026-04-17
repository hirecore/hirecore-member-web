"use client"

// _views/portfolio/ui | 포트폴리오 작성 뷰 — 비즈니스 로직은 model/use-portfolio-write-view에 위임
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
  ColorHighlightPopover,
  TextColorPopover,
  LinkPopover,
  StorageBar,
  StorageExceededModal,
  EmptyContentModal,
  StorageOptimizationHint,
} from "@/_features/editor"

import {
  ConfirmPanel,
  DraftRestoreModal,
  JobCategorySection,
  ProjectTypeSection,
  VisibilitySection,
  ThumbnailSection,
  TitleSection,
  TagsSection,
  ExternalLinksSection,
  WriteActionBar,
} from "@/_widgets/portfolio-editor"

import { usePortfolioWriteView } from "../model/use-portfolio-write-view"
import { PageContainer } from "@/_shared/ui/layout"
import "@/_features/editor/editor.scss"
import "./portfolio-write-view.scss"

// ── 에디터 툴바 내용 ──────────────────────────────────────────────
function EditorToolbarContent() {
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
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
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

// ── 메인 뷰 ────────────────────────────────────────────────────────
export default function PortfolioWriteView() {
  const {
    authLoading, user,
    category, handleCategoryChange,
    projectType, setProjectType, visibility, setVisibility,
    title, setTitle, privateMemo, setPrivateMemo,
    tags, setTags, externalLinks, setExternalLinks,
    errors, setErrors,
    thumbnailUrl, thumbnailInputRef,
    storageInfo, sessionBytes, uploadError, uploadErrorKey,
    exceededModal, setExceededModal,
    emptyModal, setEmptyModal,
    confirmData, setConfirmData, categoryLabel,
    pendingDraft, draftContentTruncated, draftImagesDropped,
    editor, editorFocused,
    isDraggingRef, getVirtualElement,
    handleThumbnailFile, removeThumbnail,
    removeTag,
    handleSubmit, handleConfirm, handlePreview,
    handleRestoreConfirm, handleRestoreCancel,
  } = usePortfolioWriteView()

  // 썸네일 드래그 오버 — 순수 UI 상태
  const [isDragOver, setIsDragOver] = useState(false)
  // 태그 입력 필드 임시값 — 순수 UI 상태
  const [tagInput, setTagInput] = useState("")

  // 썸네일 드래그&드롭 핸들러 — 인라인 시 onDrop이 길어져 별도 함수로 추출
  const handleThumbnailDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }
  const handleThumbnailDragLeave = () => setIsDragOver(false)
  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleThumbnailFile(file)
  }

  // 태그 키다운: view의 tagInput과 model의 tags/setTags를 연결하는 입력 핸들러
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

      {/* ── 모달 ── */}
      {pendingDraft && (
        <DraftRestoreModal
          docTypeName="포트폴리오"
          draftTitle={pendingDraft.title || undefined}
          contentTruncated={draftContentTruncated}
          imagesDropped={draftImagesDropped}
          onConfirm={handleRestoreConfirm}
          onCancel={handleRestoreCancel}
        />
      )}
      {emptyModal    && <EmptyContentModal onClose={() => setEmptyModal(false)} />}
      {exceededModal && (
        <StorageExceededModal
          info={storageInfo}
          sessionBytes={sessionBytes}
          fileSize={exceededModal.fileSize}
          onClose={() => setExceededModal(null)}
        />
      )}

      <div className="pw-root">

        {/* ── 버블 툴바 ── */}
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

        {/* ── 본문 ── */}
        <main className="pw-main">
          <PageContainer width="write">

            {/* 페이지 헤더 */}
            <div className="pw-page-header">
              <div className="pw-page-header__icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M2 12h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="pw-page-header__title">포트폴리오 등록</h1>
            </div>

            <JobCategorySection
              value={category}
              error={errors.category}
              onChange={handleCategoryChange}
            />

            <ProjectTypeSection
              value={projectType}
              error={errors.projectType}
              onChange={(v) => { setProjectType(v); setErrors((e) => ({ ...e, projectType: undefined })) }}
            />

            <VisibilitySection
              value={visibility}
              error={errors.visibility}
              onChange={(v) => { setVisibility(v); setErrors((e) => ({ ...e, visibility: undefined })) }}
            />

            <ThumbnailSection
              thumbnailUrl={thumbnailUrl}
              isDragOver={isDragOver}
              thumbnailInputRef={thumbnailInputRef}
              onFile={handleThumbnailFile}
              onRemove={removeThumbnail}
              onDragOver={handleThumbnailDragOver}
              onDragLeave={handleThumbnailDragLeave}
              onDrop={handleThumbnailDrop}
            />

            <TitleSection
              value={title}
              error={errors.title}
              onChange={(v) => { setTitle(v); setErrors((e) => ({ ...e, title: undefined })) }}
            />

            {/* 나만 보는 메모 */}
            <section className="pw-section">
              <div className="pw-section__head">
                <span className="pw-section__label">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginRight: "0.2rem", verticalAlign: "middle" }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  나만 보는 메모
                </span>
                <span className="pw-section__optional">선택</span>
                <span className="pw-section__hint pw-section__hint--private">나에게만 표시됩니다</span>
              </div>
              <textarea
                className="pw-memo-input"
                placeholder="이 포트폴리오에 대한 메모를 자유롭게 적어보세요 (예: A사 지원용, 추가 수정 필요)"
                value={privateMemo}
                onChange={(e) => setPrivateMemo(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <div className="pw-memo-count">{privateMemo.length}/200</div>
            </section>

            {/* 포스팅 내용 */}
            <section className="pw-section" id="field-content">
              <div className="pw-section__head">
                <span className="pw-section__label">포스팅 내용</span>
                <span className="pw-section__required">필수</span>
              </div>
              <div className={`pw-editor-card${editorFocused ? " pw-editor-card--focused" : ""}`}>
                <div className="pw-editor-card__toolbar">
                  <Toolbar>
                    <EditorToolbarContent />
                  </Toolbar>
                </div>
                {/* StorageBar: editor-card 내부 배치 — portfolio-write-view.scss에서 position:static override */}
                <StorageBar
                  info={storageInfo}
                  sessionBytes={sessionBytes}
                  error={uploadError}
                  errorKey={uploadErrorKey}
                />
                <div className="pw-storage-hint">
                  <StorageOptimizationHint variant="webp" />
                </div>
                <div className="pw-editor-area">
                  {editor && (
                    <DragHandle editor={editor} nested={{ edgeDetection: "none" }}>
                      <div className="pw-drag-handle-icon">
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
                    className="simple-editor-content pw-editor-content"
                  />
                </div>
              </div>
            </section>

          </PageContainer>

          {/* 링크 */}
          <PageContainer width="write">
            <ExternalLinksSection
              externalLinks={externalLinks}
              onAdd={(link) => setExternalLinks((prev) => [...prev, link])}
              onRemove={(i) => setExternalLinks((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </PageContainer>

          {/* 태그 */}
          <PageContainer width="write">
            <TagsSection
              tags={tags}
              tagInput={tagInput}
              onInputChange={setTagInput}
              onKeyDown={handleTagKeyDown}
              onRemove={removeTag}
            />
          </PageContainer>
        </main>

        {/* 하단 액션 바 */}
        <WriteActionBar onPreview={handlePreview} onSubmit={handleSubmit} />

        {/* 등록 확인 오버레이 */}
        {confirmData && (
          <ConfirmPanel
            data={confirmData}
            categoryLabel={categoryLabel}
            onBack={() => setConfirmData(null)}
            onConfirm={handleConfirm}
          />
        )}

      </div>
    </EditorContext.Provider>
  )
}
