"use client"

// _widgets/user-mypage/ui | 포트폴리오 연결 가능한 문서 리스트 섹션
// 이력서·자기소개서 리스트의 공통 구조 (검색·뷰 토글·모달·카드 목록·빈 상태)를 통합 제공한다.
// 카드 렌더링은 renderCard prop으로 위임 — Card 컴포넌트별 prop 차이를 흡수하기 위해 render-prop 패턴 사용.

import { useState, type ReactNode } from "react"
import { ViewToggle } from "@/_shared/ui/view-toggle"
import { TabSearchField } from "@/_shared/ui/tab-search-field"
import { SearchIcon } from "@/_shared/ui/icon"
import { LinkPortfolioModal } from "@/_features/user-mypage"
import "./linked-doc-list-section.scss"

interface LinkedDocItem {
  id: string
  linkedPortfolioIds?: string[]
}

interface LinkedDocListSectionProps<T extends LinkedDocItem> {
  items: T[]
  search: string
  viewMode: "grid" | "list"
  sectionTitle: string
  searchPlaceholder: string
  /** ViewToggle active 색상 (예: "#059669" 녹색, "#d97706" 황색) */
  activeColor: string
  onSearchChange: (v: string) => void
  onViewModeChange: (mode: "grid" | "list") => void
  /** 카드 렌더 함수 — modalState로 portfolio 연결 모달 토글 */
  renderCard: (item: T, args: { linkedPortfolioIds: string[]; onPortfolioLinkClick: () => void }) => ReactNode
}

export function LinkedDocListSection<T extends LinkedDocItem>({
  items, search, viewMode, sectionTitle, searchPlaceholder, activeColor,
  onSearchChange, onViewModeChange, renderCard,
}: LinkedDocListSectionProps<T>) {
  const [activeModalId, setActiveModalId] = useState<string | null>(null)
  const [linkedPortfolioMap, setLinkedPortfolioMap] = useState<Record<string, string[]>>(
    Object.fromEntries(items.map((item) => [item.id, item.linkedPortfolioIds ?? []]))
  )

  return (
    <section className="ldls-section">
      {activeModalId && (
        <LinkPortfolioModal
          linkedIds={linkedPortfolioMap[activeModalId] ?? []}
          onClose={() => setActiveModalId(null)}
          onSave={(ids) => {
            setLinkedPortfolioMap((prev) => ({ ...prev, [activeModalId]: ids }))
            setActiveModalId(null)
          }}
        />
      )}

      <div className="ldls-section__head">
        <h3 className="ldls-section__title">{sectionTitle}</h3>
        <ViewToggle viewMode={viewMode} onToggle={onViewModeChange} activeColor={activeColor} />
      </div>

      <div className="ldls-search">
        <TabSearchField icon={<SearchIcon />} placeholder={searchPlaceholder} value={search} onChange={onSearchChange} />
      </div>

      {items.length > 0 ? (
        <ul className={`ldls-list${viewMode === "grid" ? " ldls-list--grid" : ""}`}>
          {items.map((item) => (
            <li key={item.id}>
              {renderCard(item, {
                linkedPortfolioIds: linkedPortfolioMap[item.id] ?? item.linkedPortfolioIds ?? [],
                onPortfolioLinkClick: () => setActiveModalId(item.id),
              })}
            </li>
          ))}
        </ul>
      ) : (
        <div className="ldls-empty"><p>검색 결과가 없습니다.</p></div>
      )}
    </section>
  )
}
