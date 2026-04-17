"use client"

// _entities/resume/ui | 이력서 관리 카드 — 표현 중심 Entity
// 네비게이션·confirm·라우팅 결정은 onView/onEdit/onDelete prop으로 상위(Widget)에 위임

import { DocumentManageCard, PortfolioLinkButton } from "@/_shared/ui/manage-card"
import type { ManagedResume } from "../model/types"

export type { ManagedResume }

interface Props {
  resume: ManagedResume
  viewMode: "grid" | "list"
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  linkedPortfolioIds?: string[]
  onPortfolioLinkClick?: () => void
}

const DocumentIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export function ResumeManageCard({ resume, viewMode, onView, onEdit, onDelete, linkedPortfolioIds, onPortfolioLinkClick }: Props) {
  const linkedIds = linkedPortfolioIds ?? resume.linkedPortfolioIds ?? []

  return (
    <DocumentManageCard
      id={resume.id}
      title={resume.title}
      updatedAt={resume.updatedAt}
      visibility={resume.visibility}
      privateMemo={resume.privateMemo}
      tags={resume.tags}
      viewMode={viewMode}
      colorScheme="green"
      gridHeader={<div className="mc-icon-header" aria-hidden><DocumentIcon /></div>}
      listAside={<div className="mc-icon-aside" aria-hidden><DocumentIcon /></div>}
      interestFields={resume.interestFields}
      relationsSection={<PortfolioLinkButton linkedIds={linkedIds} onClick={onPortfolioLinkClick} />}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
