"use client"

// _views/coverletter/ui | 자기소개서 미리보기 뷰 — 비즈니스 로직은 model/use-cover-letter-preview-view에 위임

import { EditorContent } from "@tiptap/react"
import { PageContainer } from "@/_shared/ui/layout"
import { PreviewActionBar } from "@/_shared/ui/preview-action-bar"
import { useCoverLetterPreviewView } from "../model/use-cover-letter-preview-view"

import "@/_features/editor/editor.scss"
import "./coverletter-read-view.scss"

export function CoverLetterPreviewView() {
  const { previewData, editor, handleEdit, handleSubmit } = useCoverLetterPreviewView()

  if (!previewData) return null

  return (
    <div className="cld-root cld-root--preview">

      {/* ── 액션 바 (공용 컴포넌트) ── */}
      <PageContainer width="content">
        <PreviewActionBar
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          accentColor="amber"
        />
      </PageContainer>

      {/* ── 헤더 카드 + 본문 ── */}
      <PageContainer width="content">

        <div className="cld-header-card">
          <div className="cld-header-card__type">
            <div className="cld-type-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="cld-type-label">자기소개서</span>
          </div>

          <h1 className="cld-header-card__title">{previewData.title || "제목 없음"}</h1>

          {previewData.interestFields.length > 0 && (
            <div className="cld-header-card__interests">
              {previewData.interestFields.map((f) => (
                <span key={f} className="cld-interest-tag">{f}</span>
              ))}
            </div>
          )}

          {previewData.tags.length > 0 && (
            <div className="cld-header-card__tags">
              {previewData.tags.map((t) => (
                <span key={t} className="cld-tag">#{t}</span>
              ))}
            </div>
          )}

          <div className="cld-header-card__meta">
            <span className={`cld-visibility-badge cld-visibility-badge--${previewData.visibility}`}>
              {previewData.visibility === "public" ? "공개" : "비공개"}
            </span>
          </div>
        </div>

        <div className="cld-content-wrap">
          <EditorContent editor={editor} className="simple-editor-content cld-editor-content" />
        </div>

      </PageContainer>
    </div>
  )
}
