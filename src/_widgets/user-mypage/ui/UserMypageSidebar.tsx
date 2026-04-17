"use client"

import { useEffect } from "react"
import type { CurrentUser } from "@/_features/auth"
import type { UserMypageSection } from "@/_features/user-mypage"
import "./user-mypage-sidebar.scss"

interface UserMypageSidebarProps {
  user: CurrentUser
  activeSection: UserMypageSection
  onSectionChange: (section: UserMypageSection) => void
  /** 모바일 드로어 열림 여부 — 뷰에서 제어 */
  drawerOpen?: boolean
  onDrawerClose?: () => void
}

export function UserMypageSidebar({
  user,
  activeSection,
  onSectionChange,
  drawerOpen = false,
  onDrawerClose,
}: UserMypageSidebarProps) {

  // 드로어 열림 시 body 스크롤 잠금
  useEffect(() => {
    if (!drawerOpen) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [drawerOpen])

  // ESC 키로 드로어 닫기
  useEffect(() => {
    if (!drawerOpen) return
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onDrawerClose?.() }
    window.addEventListener("keydown", handle)
    return () => window.removeEventListener("keydown", handle)
  }, [drawerOpen, onDrawerClose])

  // 섹션 선택 시 드로어 닫기
  const handleSelect = (section: UserMypageSection) => {
    onSectionChange(section)
    onDrawerClose?.()
  }

  return (
    <>
      {/* 드로어 백드롭 — 데스크톱에서는 CSS로 숨김 */}
      <div
        className={`umps-backdrop${drawerOpen ? " umps-backdrop--open" : ""}`}
        onClick={onDrawerClose}
        aria-hidden
      />

      <aside className={`umps-root${drawerOpen ? " umps-root--drawer-open" : ""}`}>

        {/* 드로어 닫기 버튼 — 데스크톱에서는 CSS로 숨김 */}
        <button
          type="button"
          className="umps-drawer-close"
          onClick={onDrawerClose}
          aria-label="메뉴 닫기"
        >
          <CloseIcon />
        </button>

        {/* ── 프로필 카드 ── */}
        <div className="umps-profile">
          <div className="umps-profile__avatar">
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user.nickname} />
            ) : (
              <span>{user.nickname.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div className="umps-profile__info">
            <p className="umps-profile__name">{user.nickname}</p>
            {user.email && <p className="umps-profile__email">{user.email}</p>}
          </div>
        </div>

        {/* ── 내비게이션 ── */}
        <nav className="umps-nav">

          <button
            type="button"
            className={`umps-nav__item umps-nav__item--top ${activeSection === "home" ? "umps-nav__item--active" : ""}`}
            onClick={() => handleSelect("home")}
          >
            <HomeIcon />
            MY 홈
          </button>

          <div className="umps-nav__section">
            <p className="umps-nav__section-label">포트폴리오</p>
            <button
              type="button"
              className={`umps-nav__item ${activeSection === "portfolio" ? "umps-nav__item--active" : ""}`}
              onClick={() => handleSelect("portfolio")}
            >
              <BriefcaseIcon />
              포트폴리오 관리
            </button>
          </div>

          <div className="umps-nav__section">
            <p className="umps-nav__section-label">이력서 / 소개서</p>
            <button
              type="button"
              className={`umps-nav__item ${activeSection === "resume" ? "umps-nav__item--active" : ""}`}
              onClick={() => handleSelect("resume")}
            >
              <FileTextIcon />
              이력서
            </button>
            <button
              type="button"
              className={`umps-nav__item ${activeSection === "coverletter" ? "umps-nav__item--active" : ""}`}
              onClick={() => handleSelect("coverletter")}
            >
              <PenIcon />
              자기소개서
            </button>
          </div>

        </nav>

      </aside>
    </>
  )
}

/* ── 인라인 SVG 아이콘 ── */

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function FileTextIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function PenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 20h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}
