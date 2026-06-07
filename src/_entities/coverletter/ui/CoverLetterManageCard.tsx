"use client"

// _entities/coverletter/ui | 자기소개서 관리 카드 — 표현 중심 Entity
// 네비게이션·confirm·라우팅 결정은 onView/onEdit/onDelete prop으로 상위(Widget)에 위임

import { DocumentManageCard, PortfolioLinkButton, CategoryHeader } from "@/_shared/ui/manage-card"
import { CoverLetterIcon } from "@/_shared/ui/icon"
import type { ManagedCoverLetter } from "../model/types"

export type { ManagedCoverLetter }

interface Props {
  coverLetter: ManagedCoverLetter
  viewMode: "grid" | "list"
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  linkedPortfolioIds?: string[]
  onPortfolioLinkClick?: () => void
}

export function CoverLetterManageCard({ coverLetter, viewMode, onView, onEdit, onDelete, linkedPortfolioIds, onPortfolioLinkClick }: Props) {
  const linkedIds = linkedPortfolioIds ?? coverLetter.linkedPortfolioIds ?? []

  return (
    <DocumentManageCard
      id={coverLetter.id}
      title={coverLetter.title}
      updatedAt={coverLetter.updatedAt}
      visibility={coverLetter.visibility}
      privateMemo={coverLetter.privateMemo}
      tags={coverLetter.tags}
      viewMode={viewMode}
      colorScheme="amber"
      gridHeader={<div className="mc-icon-header" aria-hidden><CoverLetterIcon /></div>}
      listAside={<div className="mc-icon-aside" aria-hidden><CoverLetterIcon /></div>}
      categoryHeader={
        <CategoryHeader
          majorCategoryName={coverLetter.majorCategoryName}
          categoryName={coverLetter.categoryName}
          customCategory={coverLetter.customCategory}
        />
      }
      relationsSection={<PortfolioLinkButton linkedIds={linkedIds} onClick={onPortfolioLinkClick} />}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
