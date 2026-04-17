"use client"

// _views/resume/ui | 이력서 미리보기 뷰 — 비즈니스 로직은 model/use-resume-preview-view에 위임

import { EditorContent } from "@tiptap/react"
import { PageContainer } from "@/_shared/ui/layout"
import { PreviewActionBar } from "@/_shared/ui/preview-action-bar"
import { useResumePreviewView } from "../model/use-resume-preview-view"

import "@/_features/editor/editor.scss"
import "./resume-read-view.scss"

export function ResumePreviewView() {
  const { previewData, editor, handleEdit, handleSubmit } = useResumePreviewView()

  if (!previewData) return null

  return (
    <div className="rd-root rd-root--preview">

      {/* ── 액션 바 (공용 컴포넌트) ── */}
      <PageContainer width="content">
        <PreviewActionBar
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          accentColor="green"
        />
      </PageContainer>

      {/* ── 헤더 카드 + 본문 ── */}
      <PageContainer width="content">

        <div className="rd-header-card">
          <div className="rd-header-card__type">
            <div className="rd-type-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span className="rd-type-label">이력서</span>
          </div>

          <h1 className="rd-header-card__title">{previewData.title || "제목 없음"}</h1>

          {previewData.interestFields.length > 0 && (
            <div className="rd-header-card__interests">
              {previewData.interestFields.map((f) => (
                <span key={f} className="rd-interest-tag">{f}</span>
              ))}
            </div>
          )}

          {previewData.tags.length > 0 && (
            <div className="rd-header-card__tags">
              {previewData.tags.map((t) => (
                <span key={t} className="rd-tag">#{t}</span>
              ))}
            </div>
          )}

          <div className="rd-header-card__meta">
            <span className={`rd-visibility-badge rd-visibility-badge--${previewData.visibility}`}>
              {previewData.visibility === "public" ? "공개" : "비공개"}
            </span>
          </div>
        </div>

        <div className="rd-content-wrap">
          <EditorContent editor={editor} className="simple-editor-content rd-editor-content" />
        </div>

      </PageContainer>
    </div>
  )
}
