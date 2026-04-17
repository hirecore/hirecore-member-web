"use client"

// _views/user-mypage/ui | 마이페이지 레이아웃 조립 — 비즈니스 로직은 model/use-user-mypage-view에 위임

import { useState } from "react"
import {
  UserMypageSidebar,
  UserMypagePortfolioTab,
  UserMypageResumeTab,
  UserMypageCoverLetterTab,
  UserMypageComingSoon,
} from "@/_widgets/user-mypage"
import { useUserMypageView } from "../model/use-user-mypage-view"
import { PageContainer } from "@/_shared/ui/layout"
import "./user-mypage-view.scss"

const SECTION_LABELS: Record<string, string> = {
  home:        "MY 홈",
  portfolio:   "포트폴리오 관리",
  resume:      "이력서",
  coverletter: "자기소개서",
}

export function UserMypageView() {
  const { activeSection, handleSectionChange, user, isLoading } = useUserMypageView()
  const [drawerOpen, setDrawerOpen] = useState(false)

  if (isLoading || !user) return null

  return (
    <div className="ump-root">

      {/* ── 모바일 상단 바 — 현재 섹션명 + 메뉴 버튼 (700px 이하에서만 표시) ── */}
      <div className="ump-mobile-bar" aria-hidden={undefined}>
        <PageContainer width="wide">
          <div className="ump-mobile-bar__inner">
            <span className="ump-mobile-bar__title">
              {SECTION_LABELS[activeSection] ?? activeSection}
            </span>
            <button
              type="button"
              className="ump-mobile-bar__menu-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="메뉴 열기"
            >
              <MenuIcon />
            </button>
          </div>
        </PageContainer>
      </div>

      <PageContainer width="wide">
        <div className="ump-layout">

          <UserMypageSidebar
            user={user}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            drawerOpen={drawerOpen}
            onDrawerClose={() => setDrawerOpen(false)}
          />

          <main className="ump-content">
            {activeSection === "home" && (
              <UserMypageComingSoon
                title="MY 홈"
                description="나의 활동 요약과 통계를 한눈에 확인할 수 있어요."
              />
            )}
            {activeSection === "portfolio" && <UserMypagePortfolioTab />}
            {activeSection === "resume" && <UserMypageResumeTab />}
            {activeSection === "coverletter" && <UserMypageCoverLetterTab />}
          </main>

        </div>
      </PageContainer>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
