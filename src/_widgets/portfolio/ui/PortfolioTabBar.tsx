"use client"

import type { ActiveTab } from "@/_features/portfolio/lib"
import { PageContainer } from "@/_shared/ui/layout"
import "./portfolio-tab-bar.scss"

interface Tab {
  id: ActiveTab
  label: string
}

interface Props {
  tabs: Tab[]
  activeTab: ActiveTab
  isSticky: boolean
  onTabChange: (tab: ActiveTab) => void
  /** true이면 PageContainer를 감싸지 않음 (이미 외부에서 감싸고 있을 때) */
  bare?: boolean
}

export function PortfolioTabBar({ tabs, activeTab, isSticky, onTabChange, bare }: Props) {
  const content = (
    <>
      <div className="pr-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={activeTab === t.id}
            className={`pr-tab${activeTab === t.id ? " pr-tab--active" : ""}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pr-tab-separator" aria-hidden />
    </>
  )

  return (
    <div className={`pr-tabs-wrap${isSticky ? " pr-tabs-wrap--sticky" : ""}`}>
      {bare ? content : <PageContainer width="wide">{content}</PageContainer>}
    </div>
  )
}
