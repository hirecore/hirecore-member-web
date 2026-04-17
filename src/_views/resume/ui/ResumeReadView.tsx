"use client"

import { useState } from "react"
import { EditorContent } from "@tiptap/react"
import { USER_ROUTES } from "@/_shared/config"
import { useRouter } from "next/navigation"
import { useResumeReadView } from "../model/use-resume-read-view"
import { PageContainer } from "@/_shared/ui/layout"
import { DetailPageLayout } from "@/_shared/ui/detail-page-layout"
import { DeleteConfirmModal } from "@/_shared/ui/delete-confirm-modal"
import { PortfolioTocSidebar } from "@/_widgets/portfolio"
import { AvatarPlaceholder } from "@/_shared/ui/avatar-placeholder"
import { LinkedPortfolioChip } from "@/_shared/ui/linked-portfolio-chip"
import { formatDate } from "@/_shared/lib"

import "@/_features/editor/editor.scss"
import "./resume-read-view.scss"

interface Props { id: string }

export function ResumeReadView({ id }: Props) {
  const router = useRouter()
  const { data, editor, tocHeadings, scrollToHeading, activeId, isOwner } = useResumeReadView(id)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  if (!data) return null

  return (
    <div className="rd-root">
      <PageContainer width="wide">

        {showDeleteModal && (
          <DeleteConfirmModal
            docTypeName="이력서"
            notice="이력서가 삭제되면 연결된 포트폴리오와의 연결이 해제됩니다. 포트폴리오는 삭제되지 않습니다."
            onConfirm={() => {
              setShowDeleteModal(false)
              router.push(USER_ROUTES.mypage)
            }}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        <DetailPageLayout
          header={
            <>
              {/* 돌아가기 + 소유자 액션 */}
              <div className="rd-top-bar">
                <button type="button" className="rd-back-btn" onClick={() => router.back()}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  돌아가기
                </button>
                {isOwner && (
                  <div className="rd-owner-actions">
                    <button type="button" className="rd-edit-btn" onClick={() => router.push(`${USER_ROUTES.resume.write}?editId=${data.id}`)}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M11.5 2.5l2 2-7 7H4.5v-2l7-7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        <path d="M9.5 4.5l2 2" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                      편집하기
                    </button>
                    <button type="button" className="rd-delete-btn" onClick={() => setShowDeleteModal(true)}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M5 6h6M5.5 6V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 10.5 5v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M5.5 6l.4 7a1 1 0 0 0 1 1h2.2a1 1 0 0 0 1-1l.4-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      삭제
                    </button>
                  </div>
                )}
              </div>

              {/* 헤더 카드 */}
              <div className="rd-header-card">
                <div className="rd-header-card__top-row">
                  <div className="rd-header-card__type">
                    <div className="rd-type-icon" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="rd-type-label">이력서</span>
                  </div>
                  <span className={`rd-vis-badge rd-vis-badge--${data.visibility}`}>
                    {data.visibility === "public" ? "공개" : "비공개"}
                  </span>
                </div>
                <h1 className="rd-header-card__title">{data.title}</h1>
                {data.interestFields.length > 0 && (
                  <div className="rd-header-card__interests">
                    {data.interestFields.map((f) => <span key={f} className="rd-interest-tag">{f}</span>)}
                  </div>
                )}
                {data.tags.length > 0 && (
                  <div className="rd-header-card__tags">
                    {data.tags.map((t) => <span key={t} className="rd-tag">#{t}</span>)}
                  </div>
                )}
                <div className="rd-header-card__divider" aria-hidden />
                <div className="rd-header-card__author">
                  {data.author.profileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.author.profileImageUrl} alt={data.author.name} className="rd-avatar rd-avatar--lg" />
                  ) : (
                    <AvatarPlaceholder name={data.author.name} size={40} />
                  )}
                  <div className="rd-author-block">
                    <div className="rd-author-block__top">
                      <span className="rd-author-name">{data.author.name}</span>
                    </div>
                    {data.externalLinks.length > 0 && (
                      <div className="rd-author-block__links">
                        {data.externalLinks.map((link) => (
                          <span key={link.label} className="rd-meta-link">
                            <span className="rd-meta-link__label">{link.label}</span>
                            <a href={link.url} className="rd-meta-link__val" target="_blank" rel="noopener noreferrer">{link.url}</a>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          }
          main={
            <>
              {/* 본문 */}
              <div className="rd-content-wrap">
                <div className="rd-post-meta-bar">
                  <span className="rd-post-meta-bar__updated">마지막 업데이트 : {formatDate(data.updatedAt)}</span>
                </div>
                <EditorContent editor={editor} className="simple-editor-content rd-editor-content" />
              </div>

              {/* 연결 포트폴리오 */}
              {data.linkedPortfolios.length > 0 && (
                <div className="rd-portfolios">
                  <h2 className="rd-portfolios__title">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M6 1H1v14h14V10M9 1h6v6M5.5 10.5l8-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    연결된 포트폴리오
                  </h2>
                  <div className="rd-portfolios__list">
                    {data.linkedPortfolios.map((p) => <LinkedPortfolioChip key={p.id} portfolio={p} />)}
                  </div>
                </div>
              )}
            </>
          }
          sideBottom={
            tocHeadings.length > 0 ? (
              <PortfolioTocSidebar
                headings={tocHeadings}
                activeId={activeId}
                onClickHeading={scrollToHeading}
              />
            ) : undefined
          }
        />

      </PageContainer>
    </div>
  )
}
