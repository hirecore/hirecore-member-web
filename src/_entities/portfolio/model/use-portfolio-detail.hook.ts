// _entities/portfolio/model | 포트폴리오 상세 조회
// - usePortfolioDetail(id):     GET /api/portfolios/:id (실 API, React Query)
// - useMockPortfolioDetail(id): /portfolio/temp 페이지 전용 mock 조회
//
// 응답에는 linkedResume / linkedCoverletter / 작성자의 다른 포트폴리오가 포함되지 않는다.
// 해당 섹션은 별도 API로 제공 예정이며, 현재는 null / mock 데이터로 처리한다.
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { JSONContent } from "@tiptap/core"
import {
  fetchPortfolioDetail,
  type PortfolioDetailResponse,
} from "@/_shared/api"
import type { ExternalLink } from "@/_shared/model"
import { MOCK_PORTFOLIO_DETAIL_DATA } from "../api/mock-portfolio-data"

export interface InterestField {
  code: string
  name: string
}

export interface LinkedDocEmbed {
  id: string
  type: "resume" | "coverletter"
  title: string
  visibility: "public" | "private"
  interestFields: InterestField[]
  tags: string[]
  author: { name: string; profileImageUrl: string | null }
  updatedAt: string
  company?: string | null
  position?: string | null
  content: object
}

export interface PortfolioDetail {
  id: string
  /** 작성자 닉네임 — API 응답의 publisher */
  publisher: string
  /** 요청자가 작성자인지 — API 응답값을 그대로 사용 */
  isOwner: boolean
  /**
   * 요청자가 관심 등록한 상태인지.
   * - 비로그인 / 본인 포트폴리오 → null (UI 에서 하트 비활성/숨김)
   * - 그 외 로그인 사용자 → true/false
   */
  isInterested: boolean | null
  /** L3 직무 코드 (루트→리프 계층 중 가장 깊은 노드) */
  categoryCode: string
  /** L3 직무명 (또는 customCategory) — 표시용 */
  categoryName: string
  /** L1 분야명 — 표시용 */
  majorCategoryName: string
  /** "기타(직접입력)" 텍스트 — API 응답에는 없고 mock 전용 */
  customCategory?: string
  projectType: "personal" | "team"
  visibility: "public" | "private"
  title: string
  /** 상세 API 응답에는 없음 — 향후 확장 또는 mock에서 사용 */
  thumbnailUrl: string | null
  tags: string[]
  externalLinks: ExternalLink[]
  /** 작성자 표시용 — publisher 닉네임을 채워준다 */
  author: { name: string; profileImageUrl: string | null }
  updatedAt: string
  viewCount: number
  interestCount: number
  content: JSONContent
  /** 별도 API 예정 — 현재는 mock 또는 null */
  linkedResume: LinkedDocEmbed | null
  /** 별도 API 예정 — 현재는 mock 또는 null */
  linkedCoverletter: LinkedDocEmbed | null
  /** 별도 API 예정 — 현재는 OtherPortfoliosSection이 PortfolioList mock에서 읽는다 */
  otherPortfolios?: OtherPortfolio[]
}

export interface OtherPortfolio {
  id: string
  categoryCode: string
  categoryName: string
  majorCategoryName: string
  customCategory?: string
  title: string
  tags: string[]
  thumbnailUrl: string | null
  likeCount: number
  updatedAt: string
  visibility: "public" | "private"
}

// ── API 응답 → 도메인 모델 변환 ────────────────────────────────────
function mapResponse(id: string, res: PortfolioDetailResponse): PortfolioDetail {
  // jobCategories는 백엔드가 루트→리프 순으로 정렬해 내려주지만, 안전하게 depth 기준 재정렬
  const sortedCats = [...res.jobCategories].sort((a, b) => a.depth - b.depth)
  const major = sortedCats[0]
  const leaf = sortedCats[sortedCats.length - 1]
  const sortedTags = [...res.tags]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => t.name)

  // content.json은 직렬화된 문자열 — TipTap에 주입하기 전 파싱
  let parsedContent: JSONContent
  try {
    parsedContent = JSON.parse(res.content.json) as JSONContent
  } catch {
    parsedContent = { type: "doc", content: [] }
  }

  return {
    id,
    publisher: res.publisher,
    isOwner: res.isOwner,
    isInterested: res.isInterested,
    categoryCode: leaf?.categoryCode ?? "",
    categoryName: leaf?.name ?? "",
    majorCategoryName: major?.name ?? "",
    projectType: res.collaborationType,
    visibility: res.visibility,
    title: res.title,
    thumbnailUrl: null,
    tags: sortedTags,
    externalLinks: res.externalLinks ?? [],
    author: { name: res.publisher, profileImageUrl: null },
    updatedAt: res.updatedAt,
    viewCount: res.viewCount,
    interestCount: res.interestCount,
    content: parsedContent,
    linkedResume: null,
    linkedCoverletter: null,
  }
}

// ── 실 API 훅 ─────────────────────────────────────────────────────
export function usePortfolioDetail(
  id: string,
  options?: { enabled?: boolean }
): UseQueryResult<PortfolioDetail> {
  return useQuery<PortfolioDetail>({
    queryKey: ["portfolio", "detail", id],
    queryFn: async () => mapResponse(id, await fetchPortfolioDetail(id)),
    enabled: options?.enabled ?? Boolean(id),
    staleTime: 60_000,
    retry: false,
  })
}

// ── /portfolio/temp 전용 mock 훅 ──────────────────────────────────
// PortfolioReadView를 시각적으로 점검하기 위한 임시 페이지에서 사용한다.
// 운영 API가 linked* / other 등 모든 필드를 채워주게 되면 temp 페이지와 함께 제거.
export function useMockPortfolioDetail(id: string): PortfolioDetail | null {
  return MOCK_PORTFOLIO_DETAIL_DATA[id] ?? null
}
