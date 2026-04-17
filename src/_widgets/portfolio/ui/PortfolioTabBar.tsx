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
}

export function PortfolioTabBar({ tabs, activeTab, isSticky, onTabChange }: Props) {
  return (
    <div className={`pr-tabs-wrap${isSticky ? " pr-tabs-wrap--sticky" : ""}`}>
      <PageContainer width="wide">
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
        {/* 탭 구분선 — 전체 폭 border-bottom 대신 전용 요소 사용 (content-col-max 까지만 선 그음) */}
        <div className="pr-tab-separator" aria-hidden />
      </PageContainer>
    </div>
  )
}
