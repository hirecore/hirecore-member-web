"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useTheme, useBodyLock } from "@/_shared/model"
import { USER_ROUTES } from "@/_shared/config"
import "./main-header.scss"
import { MoonIcon, SunIcon } from "@/_shared/ui/icon"
import { useCurrentUser, useOAuthLogout } from "@/_features/auth"

export function MainHeader() {
  const { data: user, isLoading } = useCurrentUser()
  const { mutate: logout } = useOAuthLogout()
  const { isDark, toggle } = useTheme()

  const [accountOpen, setAccountOpen] = useState(false)
  const closeAccount = useCallback(() => setAccountOpen(false), [])

  // body scroll lock + ESC close — sheet 오픈 시에만 적용
  useBodyLock(accountOpen, closeAccount)

  return (
    <header className="sh-root">
      <div className="sh-container">
        <div className="sh-inner">

          {/* ── 왼쪽: 로고 — 클릭 시 next/link 의 기본 navigation 으로 홈 이동 ── */}
          <div className="sh-left">
            <Link href={USER_ROUTES.home} className="sh-logo">HireCore</Link>
          </div>

          {/* ── 오른쪽: 인증 + 다크모드 ── */}
          <div className="sh-right">
            {!isLoading && (
              user ? (
                <>
                  {/* 데스크톱 (≥ 540px): 계정 액션 직접 노출 */}
                  <div className="sh-user sh-user--desktop">
                    <div className="sh-avatar" aria-hidden>
                      {user.nickname.slice(0, 1)}
                    </div>
                    <span className="sh-username">{user.nickname}</span>
                    <Link href={USER_ROUTES.mypage} className="sh-mypage">마이페이지</Link>
                    <button
                      type="button"
                      className="sh-logout"
                      onClick={() => logout()}
                    >
                      로그아웃
                    </button>
                  </div>

                  {/* 모바일 (< 540px): avatar 클릭 → account sheet */}
                  <button
                    type="button"
                    className="sh-avatar-trigger"
                    onClick={() => setAccountOpen(true)}
                    aria-label="계정 메뉴 열기"
                    aria-expanded={accountOpen}
                    aria-haspopup="dialog"
                  >
                    <div className="sh-avatar" aria-hidden>
                      {user.nickname.slice(0, 1)}
                    </div>
                    <svg className="sh-avatar-trigger__chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              ) : (
                <Link href={USER_ROUTES.auth.login} className="sh-login">로그인</Link>
              )
            )}

            <div className="sh-divider" aria-hidden />

            <button
              type="button"
              className="sh-theme-btn"
              onClick={toggle}
              aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Account Sheet (모바일 전용, 로그인 상태에서만 렌더) ── */}
      {user && accountOpen && (
        <>
          {/* backdrop: outside click → close */}
          <div
            className="sh-account-backdrop"
            onClick={closeAccount}
            aria-hidden
          />

          <div
            className="sh-account-sheet"
            role="dialog"
            aria-label="계정 메뉴"
            aria-modal="true"
          >
            {/* 헤더 */}
            <div className="sh-account-sheet__head">
              <span className="sh-account-sheet__label">계정</span>
              <button
                type="button"
                className="sh-account-sheet__close"
                onClick={closeAccount}
                aria-label="닫기"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* 사용자 정보 */}
            <div className="sh-account-sheet__identity">
              <div className="sh-avatar sh-avatar--lg" aria-hidden>
                {user.nickname.slice(0, 1)}
              </div>
              <span className="sh-account-sheet__name">{user.nickname}</span>
            </div>

            {/* 계정 액션 */}
            <nav className="sh-account-sheet__nav" aria-label="계정 탐색">
              <Link
                href={USER_ROUTES.mypage}
                className="sh-account-sheet__item"
                onClick={closeAccount}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2.5 14c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                마이페이지
              </Link>
              <button
                type="button"
                className="sh-account-sheet__item sh-account-sheet__item--danger"
                onClick={() => { logout(); closeAccount() }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M10.5 11L14 8l-3.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="14" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                로그아웃
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
