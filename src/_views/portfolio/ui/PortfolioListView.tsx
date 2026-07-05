"use client"

/**
 * _views/portfolio — 포트폴리오 목록 뷰
 * 캐논 라우트 (/) 는 실 API (공개 무한 스크롤) 사용, /temp 라우트는 mock prop 으로 mock 화면 유지.
 * 공유 헤더는 (user)/(with-layout)/layout.tsx 의 MainHeader 에서 렌더링.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { USER_ROUTES, LOCAL_STORAGE_KEYS } from "@/_shared/config"
import {
  PortfolioCard,
  PortfolioRowCard,
  usePortfolioList,
  usePublicPortfolioInfiniteScroll,
  usePublicPortfolioInterestToggle,
} from "@/_entities/portfolio"
import type { Portfolio } from "@/_entities/portfolio"
import "./portfolio-list-view.scss"
import { useCurrentUser } from "@/_features/auth"
import { PageContainer } from "@/_shared/ui/layout"
import {
  useJobCategories,
  getCategoryPath,
  getLevel1Categories,
  getLevel2Categories,
} from "@/_features/portfolio/lib"
import { usePortfolioListFilterStore } from "@/_features/portfolio"

type ViewMode = "grid" | "list"

/** 필터 식별자 — "all" 또는 L1/L2 카테고리 코드 */
const ALL_FILTER = "all"

interface PortfolioListViewProps {
  /** true 면 mock 데이터를 노출 — /temp 라우트 전용. 캐논 / 는 실 API 사용. */
  mock?: boolean
}

export default function PortfolioListView({ mock = false }: PortfolioListViewProps = {}) {
  const router = useRouter()
  const { data: user } = useCurrentUser()

  // 필터: L1 코드 (또는 ALL_FILTER), 그리고 그 아래 L2 코드 (옵션)
  const [activeL1, setActiveL1] = useState<string>(ALL_FILTER)
  const [activeL2, setActiveL2] = useState<string>(ALL_FILTER)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const { data: categories = [] } = useJobCategories(2)
  const l1Categories = useMemo(() => getLevel1Categories(categories), [categories])
  const l2Categories = useMemo(
    () => (activeL1 === ALL_FILTER ? [] : getLevel2Categories(categories, activeL1)),
    [categories, activeL1]
  )

  // MainHeader의 HireCore 로고 클릭 시 필터 reset — store의 resetVersion 변경 감지
  const resetVersion = usePortfolioListFilterStore((s) => s.resetVersion)
  useEffect(() => {
    if (resetVersion === 0) return // 초기값 무시
    setActiveL1(ALL_FILTER)
    setActiveL2(ALL_FILTER)
    setSearchQuery("")
  }, [resetVersion])

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PORTFOLIO_LIST_VIEW_MODE)
    if (saved === "grid" || saved === "list") setViewMode(saved)
  }, [])

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(LOCAL_STORAGE_KEYS.PORTFOLIO_LIST_VIEW_MODE, mode)
  }

  // mock 전용 로컬 토글 (/temp) — API 모드에서는 서버 상태(isInterested)를 사용
  const toggleLikeLocal = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const interestToggle = usePublicPortfolioInterestToggle()

  // 카드 관심 버튼 클릭 핸들러
  // - mock: 로컬 Set 토글 유지
  // - 비로그인(isInterested == null): 로그인 페이지로 유도
  //   (소유자도 null 이지만 카드에서 버튼 자체를 미렌더하므로 여기 도달하지 않음)
  // - 로그인: 서버 관심 등록/해제 (무한 스크롤 캐시 옵티미스틱 갱신)
  const handleToggleLike = (item: Portfolio) => {
    if (mock) {
      toggleLikeLocal(item.id)
      return
    }
    if (item.isInterested == null) {
      router.push(USER_ROUTES.auth.login)
      return
    }
    interestToggle.mutate({ portfolioId: item.id, next: !item.isInterested })
  }

  // 카드에 전달할 관심 상태 — mock 은 로컬 Set, API 는 서버 isInterested
  const isLiked = (item: Portfolio) =>
    mock ? likedIds.has(item.id) : Boolean(item.isInterested)

  // L1 변경 시 L2 초기화 + 맨 위로 스크롤
  const handleL1Change = (l1Code: string) => {
    setActiveL1(l1Code)
    setActiveL2(ALL_FILTER)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // L2 변경 — 같은 값 클릭 시 토글로 해제
  const handleL2Change = (l2Code: string) => {
    setActiveL2((prev) => (prev === l2Code ? ALL_FILTER : l2Code))
  }

  // ── 데이터 소스 분기 ─────────────────────────────────────────────
  // mock 모드: 기존 mock 배열. API 모드: 공개 무한 스크롤 응답을 누적 매핑.
  const mockPortfolios = usePortfolioList()
  const infinite = usePublicPortfolioInfiniteScroll({ enabled: !mock })
  const portfolios = mock ? mockPortfolios : infinite.portfolios

  // ── IntersectionObserver — 마지막 아이템 근접 시 다음 페이지 트리거 ──
  // mock 모드에서는 옵저버를 설치하지 않는다.
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (mock) return
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0]?.isIntersecting &&
        infinite.hasNextPage &&
        !infinite.isFetchingNextPage
      ) {
        infinite.fetchNextPage()
      }
    }, { rootMargin: "200px" })
    observer.observe(node)
    return () => observer.disconnect()
  }, [mock, infinite.hasNextPage, infinite.isFetchingNextPage, infinite.fetchNextPage]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = portfolios.filter((p) => {
    // 카테고리 매칭 — 포트폴리오의 L3 코드로부터 L1/L2를 lookup
    let matchCat = true
    if (activeL1 !== ALL_FILTER) {
      const path = getCategoryPath(categories, p.categoryCode)
      const pL1 = path[0]?.code
      const pL2 = path[1]?.code
      matchCat = pL1 === activeL1 && (activeL2 === ALL_FILTER || pL2 === activeL2)
    }
    const q = searchQuery.trim().toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
    return matchCat && matchSearch
  })

  const handleWriteClick = () => {
    if (!user) {
      router.push(USER_ROUTES.auth.login)
    } else {
      router.push(USER_ROUTES.portfolio.write)
    }
  }

  return (
    <div className="pl-root">

      {/* ── 필터 + 검색 (sticky) ── */}
      <div className="pl-filter-bar">
        <PageContainer width="wide">
          <div className="pl-filter-bar__inner">
            {/* L1 필터 — 분야 */}
            <div className="pl-filters" role="tablist" aria-label="분야 필터">
              <button
                type="button"
                role="tab"
                aria-selected={activeL1 === ALL_FILTER}
                className={`pl-filter${activeL1 === ALL_FILTER ? " pl-filter--active" : ""}`}
                onClick={() => handleL1Change(ALL_FILTER)}
              >
                전체
              </button>
              {l1Categories.map((cat) => (
                <button
                  key={cat.code}
                  type="button"
                  role="tab"
                  aria-selected={activeL1 === cat.code}
                  className={`pl-filter${activeL1 === cat.code ? " pl-filter--active" : ""}`}
                  onClick={() => handleL1Change(cat.code)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* L2 sub-filter — L1 선택 시에만 노출 */}
            {l2Categories.length > 0 && (
              <div className="pl-sub-filters" role="tablist" aria-label="카테고리 필터">
                {l2Categories.map((cat) => (
                  <button
                    key={cat.code}
                    type="button"
                    role="tab"
                    aria-selected={activeL2 === cat.code}
                    className={`pl-sub-filter${activeL2 === cat.code ? " pl-sub-filter--active" : ""}`}
                    onClick={() => handleL2Change(cat.code)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
            <div className="pl-search">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="pl-search__icon" aria-hidden>
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                className="pl-search__input"
                placeholder="제목, 태그 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="pl-search__clear" onClick={() => setSearchQuery("")} aria-label="검색 초기화">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </PageContainer>
      </div>

      {/* ── 목록 ── */}
      <main className="pl-main">
        <PageContainer width="wide">
          {/* 섹션 헤더 */}
          <div className="pl-section-header">
            <h2 className="pl-section-header__title">최신 포트폴리오</h2>
            <div className="pl-section-header__actions">
              {/* 보기 방식 토글 */}
              <div className="pl-view-toggle" role="group" aria-label="보기 방식">
                <button
                  type="button"
                  className={`pl-view-toggle__btn${viewMode === "grid" ? " pl-view-toggle__btn--active" : ""}`}
                  onClick={() => handleViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  title="그리드 보기"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className={`pl-view-toggle__btn${viewMode === "list" ? " pl-view-toggle__btn--active" : ""}`}
                  onClick={() => handleViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  title="리스트 보기"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <rect x="1" y="2" width="14" height="3.5" rx="1.2" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="1" y="6.25" width="14" height="3.5" rx="1.2" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="1" y="10.5" width="14" height="3.5" rx="1.2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>

              <button type="button" className="pl-write-btn" onClick={handleWriteClick}>
                등록하기
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                  <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {filtered.length > 0 ? (
            <>
              <div className={`pl-list pl-list--${viewMode}`}>
                {filtered.map((item) =>
                  viewMode === "grid" ? (
                    <PortfolioCard
                      key={item.id}
                      item={item}
                      liked={isLiked(item)}
                      onLike={() => handleToggleLike(item)}
                    />
                  ) : (
                    <PortfolioRowCard
                      key={item.id}
                      item={item}
                      liked={isLiked(item)}
                      onLike={() => handleToggleLike(item)}
                    />
                  )
                )}
              </div>

              {/* 무한 스크롤 sentinel + 상태 표시 — mock 모드에서는 노출 안 함 */}
              {!mock && (
                <>
                  {infinite.hasNextPage && (
                    <div ref={sentinelRef} className="pl-infinite-sentinel" aria-hidden />
                  )}
                  {infinite.isFetchingNextPage && (
                    <p className="pl-infinite-status" role="status">불러오는 중…</p>
                  )}
                  {!infinite.hasNextPage && portfolios.length > 0 && (
                    <p className="pl-infinite-status pl-infinite-status--end" role="status">
                      마지막 포트폴리오입니다
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="pl-empty">
              <div className="pl-empty__icon" aria-hidden>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="14" cy="17" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 30l9-8 7 6 5-5 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
              </div>
              <p className="pl-empty__msg">
                {!mock && infinite.isLoading
                  ? "포트폴리오를 불러오는 중입니다…"
                  : "검색 결과가 없습니다"}
              </p>
              {!(!mock && infinite.isLoading) && (
                <button type="button" className="pl-empty__reset" onClick={() => { setSearchQuery(""); setActiveL1(ALL_FILTER); setActiveL2(ALL_FILTER) }}>
                  필터 초기화
                </button>
              )}
            </div>
          )}
        </PageContainer>
      </main>
    </div>
  )
}
