"use client"

import { useRouter } from "next/navigation"
import { USER_ROUTES } from "@/_shared/config"
import { ResumeManageCard, type ManagedResume } from "@/_entities/resume"
import { LinkedDocListSection } from "./LinkedDocListSection"

interface ResumeListProps {
  resumes: ManagedResume[]
  search: string
  viewMode: "grid" | "list"
  onSearchChange: (v: string) => void
  onViewModeChange: (mode: "grid" | "list") => void
  onDelete: (id: string) => void
}

export function ResumeList({ resumes, search, viewMode, onSearchChange, onViewModeChange, onDelete }: ResumeListProps) {
  const router = useRouter()

  // 카드 액션 — Widget이 라우팅 결정
  const handleView = (id: string) => router.push(USER_ROUTES.resume.detail(id))
  const handleEdit = (_id: string) => router.push(USER_ROUTES.resume.write)

  return (
    <LinkedDocListSection
      items={resumes}
      search={search}
      viewMode={viewMode}
      sectionTitle="나의 이력서"
      searchPlaceholder="이력서 제목 검색"
      activeColor="#059669"
      onSearchChange={onSearchChange}
      onViewModeChange={onViewModeChange}
      renderCard={(r, modal) => (
        <ResumeManageCard
          resume={r}
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
