// _entities/portfolio/model | 내 포트폴리오 요약 목록
// GET /api/portfolios/summaries/mine — 작성자 본인 전용, updatedAt 내림차순, 페이징 없음.
//
// 응답을 마이페이지 포트폴리오 탭이 그대로 쓸 수 있도록 기존 ManagedPortfolio 형태로 매핑한다.
// 응답에 없는 필드 (availableResumes/availableCoverletters, linkedDoc 의 visibility/updatedAt/tags)
// 는 이력서·자기소개서 전용 API 가 갖춰진 뒤 별도 보강 예정 — 현재는 비워 둔다.
"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  fetchMyPortfolioSummaries,
  type MyPortfolioSummary,
} from "@/_shared/api"
import type { LinkedDoc, ManagedPortfolio } from "./types"

const QUERY_KEY = ["portfolio", "summaries", "mine"] as const

function mapLinkedDoc(
  raw: MyPortfolioSummary["linkedResume"] | MyPortfolioSummary["linkedCoverLetter"]
): LinkedDoc | null {
  if (!raw) return null
  return { id: raw.id, title: raw.title }
}

function mapToManagedPortfolio(item: MyPortfolioSummary): ManagedPortfolio {
  const sortedCats = [...item.jobCategories].sort((a, b) => a.depth - b.depth)
  const major = sortedCats[0]
  const leaf = sortedCats[sortedCats.length - 1]
  const sortedTags = [...item.tags]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => t.name)

  return {
    id: item.portfolioId,
    title: item.title,
    privateMemo: item.privateMemo ?? undefined,
    updatedAt: item.updatedAt,
    visibility: item.visibility,
    likeCount: item.interestCount,
    projectType: item.collaborationType,
    categoryCode: leaf?.categoryCode ?? "",
    categoryName: leaf?.name ?? "",
    majorCategoryName: major?.name ?? "",
    thumbnailUrl: item.thumbnailImageUrl,
    tags: sortedTags,
    linkedResume: mapLinkedDoc(item.linkedResume),
    linkedCoverletter: mapLinkedDoc(item.linkedCoverLetter),
  }
}

export interface MyPortfolioSummariesResult {
  portfolios: ManagedPortfolio[]
  isLoading: boolean
  isError: boolean
}

export function useMyPortfolioSummaries(): MyPortfolioSummariesResult {
  const { data, isPending, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchMyPortfolioSummaries,
    // 401 은 axios 응답 인터셉터가 로그인 페이지로 라우팅 — 재시도 의미 없음
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 401) return false
      return failureCount < 2
    },
  })

  // ⚠️ data.items.map(...) 은 매 호출마다 새 배열을 만든다.
  //    참조 안정성이 깨지면 소비자(useEffect 의존성 등)에서 무한 루프를 일으키므로
  //    react-query 의 data 가 바뀔 때만 재계산되도록 useMemo 로 안정화한다.
  const portfolios = useMemo(
    () => data?.items.map(mapToManagedPortfolio) ?? [],
    [data]
  )

  return {
    portfolios,
    isLoading: isPending,
    isError,
  }
}
