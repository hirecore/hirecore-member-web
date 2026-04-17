"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ViewToggle } from "@/_shared/ui/view-toggle"
import { TabSearchField } from "@/_shared/ui/tab-search-field"
import { SearchIcon, TagIcon } from "@/_shared/ui/icon"
import { USER_ROUTES } from "@/_shared/config"
import {
  PortfolioManageCard,
  type ManagedPortfolio,
  type AvailableDoc,
  type DocType,
  type LinkedDoc,
} from "@/_entities/portfolio"
import { DocLinkModal } from "@/_features/document-link"

interface PortfolioListProps {
  portfolios: ManagedPortfolio[]
  search: string
  tagSearch: string
  viewMode: "grid" | "list"
  availableResumes: AvailableDoc[]
  availableCoverletters: AvailableDoc[]
  onSearchChange: (v: string) => void
  onTagSearchChange: (v: string) => void
  onViewModeChange: (mode: "grid" | "list") => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onLinkDoc: (portfolioId: string, docType: DocType, docId: string | null) => void
}

export function PortfolioList({
  portfolios,
  search,
  tagSearch,
  viewMode,
  availableResumes,
  availableCoverletters,
  onSearchChange,
  onTagSearchChange,
  onViewModeChange,
  onEdit,
  onDelete,
  onLinkDoc,
}: PortfolioListProps) {
  const router = useRouter()

  // DocLinkModal 상태 — PortfolioManageCard에서 리프팅
  const [docLinkState, setDocLinkState] = useState<{
    portfolioId: string
    docType: DocType
    doc: LinkedDoc | null
  } | null>(null)

  const handleView = (id: string) => router.push(USER_ROUTES.portfolio.detail(id))

  // 문서 연결 모달 내 "새로 작성하기" 클릭 — Widget이 라우팅 결정
  const handleNavigateToWrite = (docType: DocType) => {
    router.push(docType === "resume" ? USER_ROUTES.resume.write : USER_ROUTES.coverletter.write)
  }

  return (
    <section className="umpt-list-section">
      {/* DocLinkModal — 목록 밖에서 렌더, 상태는 Widget이 관리 */}
      {docLinkState && (
        <DocLinkModal
          docType={docLinkState.docType}
          doc={docLinkState.doc}
          availableDocs={
            docLinkState.docType === "resume" ? availableResumes : availableCoverletters
          }
          onClose={() => setDocLinkState(null)}
          onLink={(docId) => {
            onLinkDoc(docLinkState.portfolioId, docLinkState.docType, docId)
            setDocLinkState(null)
          }}
          onNavigateToWrite={() => {
            setDocLinkState(null)
            handleNavigateToWrite(docLinkState.docType)
          }}
        />
      )}

      <div className="umpt-list-section__head">
        <h3 className="umpt-list-section__title">나의 포트폴리오</h3>
        <ViewToggle viewMode={viewMode} onToggle={onViewModeChange} activeColor="#3b82f6" />
      </div>

      <div className="umpt-search">
        <TabSearchField
          icon={<SearchIcon />}
          placeholder="포트폴리오명 검색"
          value={search}
          onChange={onSearchChange}
        />
        <TabSearchField
          icon={<TagIcon />}
          placeholder="태그 검색"
          value={tagSearch}
          onChange={onTagSearchChange}
        />
      </div>

      {portfolios.length > 0 ? (
        <ul className={`umpt-list${viewMode === "grid" ? " umpt-list--grid" : ""}`}>
          {portfolios.map((p) => (
            <li key={p.id}>
              <PortfolioManageCard
                portfolio={p}
                viewMode={viewMode}
                onView={handleView}
                onEdit={onEdit}
                onDelete={onDelete}
                onDocLinkClick={(docType) =>
                  setDocLinkState({
                    portfolioId: p.id,
                    docType,
                    doc: docType === "resume" ? p.linkedResume : p.linkedCoverletter,
                  })
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="umpt-empty"><p>검색 결과가 없습니다.</p></div>
      )}
    </section>
  )
}

