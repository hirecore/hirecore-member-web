// _entities/portfolio/model | 공개 포트폴리오 무한 스크롤
// GET /api/portfolios/summaries/public — 비로그인 호출 가능, cursor 기반 페이지네이션.
//
// 응답 items 를 기존 Portfolio 형태로 매핑 (목록 카드 컴포넌트 호환).
// API 미제공 필드 (projectType, customCategory, profileImageUrl) 는 표시 기본값으로 채운다.
"use client"

import { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import {
  fetchPublicPortfolioSummaries,
  type PublicPortfolioSummary,
} from "@/_shared/api"
import type { Portfolio, PortfolioCardLink } from "./types"

const DEFAULT_PAGE_SIZE = 6

function mapToPortfolio(item: PublicPortfolioSummary): Portfolio {
  const sortedCats = [...item.jobCategories].sort((a, b) => a.depth - b.depth)
  const major = sortedCats[0]
  const leaf = sortedCats[sortedCats.length - 1]
  const sortedTags = [...item.tags]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => t.name)

  return {
    id: item.portfolioId,
    categoryCode: leaf?.categoryCode ?? "",
    categoryName: leaf?.name ?? "",
    majorCategoryName: major?.name ?? "",
    projectType: item.collaborationType,
    visibility: "public",
    title: item.title,
    excerpt: item.previewSummary,
    tags: sortedTags,
    externalLinks: item.externalLinks as PortfolioCardLink[] | undefined,
    thumbnailUrl: item.thumbnail?.imageUrl ?? null,
    author: {
      name: item.nickname ?? "알 수 없음",
      profileImageUrl: null,
    },
    viewCount: item.viewCount,
    likeCount: item.interestCount,
    updatedAt: item.updatedAt,
    isOwner: item.isOwner,
    // 서버는 null 이면 키를 생략 → undefined 도 null 로 정규화 (3-상태 유지)
    isInterested: item.isInterested ?? null,
  }
}

export interface PublicPortfolioInfiniteScrollResult {
  /** 누적된 전체 페이지의 Portfolio 매핑 결과 */
  portfolios: Portfolio[]
  /** 다음 페이지 존재 여부 */
  hasNextPage: boolean
  /** 다음 페이지 fetch 중인지 */
  isFetchingNextPage: boolean
  /** 첫 페이지 로딩 중 (응답 미수신) */
  isLoading: boolean
  isError: boolean
  /** 무한 스크롤 트리거에서 호출 */
  fetchNextPage: () => void
}

export function usePublicPortfolioInfiniteScroll(
  options: { size?: number; enabled?: boolean } = {}
): PublicPortfolioInfiniteScrollResult {
  const size = options.size ?? DEFAULT_PAGE_SIZE
  const enabled = options.enabled ?? true

  const {
    data, isPending, isError,
    hasNextPage, isFetchingNextPage, fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["portfolio", "summaries", "public", { size }] as const,
    queryFn: ({ pageParam }) =>
      fetchPublicPortfolioSummaries({ cursor: pageParam, size }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.nextCursor ?? undefined : undefined,
    enabled,
    // 400 (잘못된 size/cursor) 는 재시도 의미 없음
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 400) return false
      return failureCount < 2
    },
  })

  // ⚠️ 매 렌더마다 새 배열을 만들지 않도록 useMemo 로 참조 안정화
  //    (소비자의 useEffect 의존성 등에서 무한 루프를 일으키는 패턴 방지)
  const portfolios = useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page) => page.items.map(mapToPortfolio))
  }, [data])

  return {
    portfolios,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    isLoading: isPending,
    isError,
    fetchNextPage: () => { void fetchNextPage() },
  }
}
