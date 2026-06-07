"use client"

// _entities/portfolio/ui | 포트폴리오 관리 카드 — 표현 중심 Entity
// 문서 연결 모달/플로우는 _features/document-link/DocLinkModal 에서 관리
// 카드는 onDocLinkClick 콜백으로 클릭 이벤트를 상위(Widget)에 위임한다

import { DocumentManageCard, CategoryHeader } from "@/_shared/ui/manage-card"
import type { LinkedDoc, DocType, ManagedPortfolio } from "../model/types"
import "./portfolio-manage-card.scss"

interface PortfolioManageCardProps {
  portfolio: ManagedPortfolio
  viewMode?: "grid" | "list"
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDocLinkClick: (docType: DocType) => void
}

const ThumbPlaceholder = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)

export function PortfolioManageCard({
  portfolio, viewMode = "list", onView, onEdit, onDelete, onDocLinkClick,
}: PortfolioManageCardProps) {
  const { thumbnailUrl, title, likeCount, projectType, linkedResume, linkedCoverletter, majorCategoryName, categoryName, customCategory } = portfolio

  const gridHeader = (
    <div className="mc-thumb-header">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnailUrl} alt={title} />
      ) : (
        <div className="mc-thumb-header__default" aria-hidden><ThumbPlaceholder /></div>
      )}
    </div>
  )

  const listAside = (
    <div className="mc-thumb-aside">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnailUrl} alt={title} />
      ) : (
        <div className="mc-thumb-aside__placeholder" aria-hidden><ThumbPlaceholder size={24} /></div>
      )}
    </div>
  )

  const extraMeta = (
    <>
      <span className="mc-badge mc-badge--type">{projectType === "team" ? "팀" : "개인"}</span>
      <span className="mc-meta__like">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        {likeCount}
      </span>
    </>
  )

  const relationsSection = (
    <div className="pmc-links">
      <DocLinkChip label="이력서" doc={linkedResume} onClick={() => onDocLinkClick("resume")} />
      <DocLinkChip label="자기소개서" doc={linkedCoverletter} onClick={() => onDocLinkClick("coverletter")} />
    </div>
  )

  return (
    <DocumentManageCard
      id={portfolio.id}
      title={portfolio.title}
      updatedAt={portfolio.updatedAt}
      visibility={portfolio.visibility}
      privateMemo={portfolio.privateMemo}
      tags={portfolio.tags}
      viewMode={viewMode}
      colorScheme="blue"
      gridHeader={gridHeader}
      listAside={listAside}
      extraMeta={extraMeta}
      categoryHeader={<CategoryHeader majorCategoryName={majorCategoryName} categoryName={categoryName} customCategory={customCategory} />}
      relationsSection={relationsSection}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}

function DocLinkChip({ label, doc, onClick }: { label: string; doc: LinkedDoc | null; onClick: () => void }) {
  if (!doc) {
    return (
      <button type="button" className="pmc-link-chip pmc-link-chip--off" onClick={onClick} title={`${label} 연결하기`}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
        </svg>
        {label}
      </button>
    )
  }
  return (
    <button type="button" className="pmc-link-chip pmc-link-chip--on" onClick={onClick} title={doc.title}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="pmc-link-chip__label">{label}</span>
      <span className="pmc-link-chip__sep" aria-hidden>·</span>
      <span className="pmc-link-chip__title">{doc.title}</span>
    </button>
  )
}
