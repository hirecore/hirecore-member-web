"use client"

import { useRouter } from "next/navigation"
import { USER_ROUTES } from "@/_shared/config"
import { CoverLetterManageCard, type ManagedCoverLetter } from "@/_entities/coverletter"
import { LinkedDocListSection } from "./LinkedDocListSection"

interface CoverLetterListProps {
  coverLetters: ManagedCoverLetter[]
  search: string
  viewMode: "grid" | "list"
  onSearchChange: (v: string) => void
  onViewModeChange: (mode: "grid" | "list") => void
  onDelete: (id: string) => void
}

export function CoverLetterList({ coverLetters, search, viewMode, onSearchChange, onViewModeChange, onDelete }: CoverLetterListProps) {
  const router = useRouter()

  // 카드 액션 — Widget이 라우팅 결정
  const handleView = (id: string) => router.push(USER_ROUTES.coverletter.detail(id))
  const handleEdit = (_id: string) => router.push(USER_ROUTES.coverletter.write)

  return (
    <LinkedDocListSection
      items={coverLetters}
      search={search}
      viewMode={viewMode}
      sectionTitle="나의 자기소개서"
      searchPlaceholder="제목 또는 회사명 검색"
      activeColor="#d97706"
      onSearchChange={onSearchChange}
      onViewModeChange={onViewModeChange}
      renderCard={(c, modal) => (
        <CoverLetterManageCard
          coverLetter={c}
          viewMode={viewMode}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={onDelete}
          linkedPortfolioIds={modal.linkedPortfolioIds}
          onPortfolioLinkClick={modal.onPortfolioLinkClick}
        />
      )}
    />
  )
}
