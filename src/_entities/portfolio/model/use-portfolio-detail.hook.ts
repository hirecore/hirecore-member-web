// _entities/portfolio/model | 포트폴리오 상세 조회
// - usePortfolioDetail(id):     GET /api/portfolios/:id (실 API, React Query)
// - useMockPortfolioDetail(id): /portfolio/temp 페이지 전용 mock 조회
//
// 응답 nested — portfolio / publisher.otherPortfolios / linkedResume / linkedCoverLetter
// 모두 한 번에 받는다. 연결 자원의 content 는 visibility 정책상 null 가능 (자원 자체는 존재).
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { JSONContent } from "@tiptap/core"
import {
  fetchPortfolioDetail,
  type PortfolioDetailResponse,
  type PortfolioDetailContent,
  type PortfolioDetailLinkedDoc,
  type PublisherOtherPortfolioSummary,
} from "@/_shared/api"
import type { ExternalLink } from "@/_shared/model"
import { MOCK_PORTFOLIO_DETAIL_DATA } from "../api/mock-portfolio-data"

export interface LinkedDocEmbed {
  id: string
  type: "resume" | "coverletter"
  title: string
  /** 본문 — 자원이 PRIVATE 이고 viewer 가 자원 소유자가 아니면 null 로 차단 표시. */
  content: object | null
  // 아래 필드는 상세 API 미제공 — mock 데이터에서만 채움.
  visibility?: "public" | "private"
  tags?: string[]
  author?: { name: string; profileImageUrl: string | null }
  updatedAt?: string
  company?: string | null
  position?: string | null
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
  /** = interestCount (마이페이지 mock 호환 키) */
  likeCount: number
  viewCount: number
  updatedAt: string
  visibility: "public" | "private"
}

// ── content.json 파싱 (object | string 모두 허용) ─────────────────
// 백엔드는 object 로 내려주지만, 이전 flat 응답 호환 및 방어 차원에서 문자열도 처리.
function parseContentJson(content: PortfolioDetailContent | null | undefined): JSONContent {
  if (!content) return { type: "doc", content: [] }
  try {
    if (typeof content.json === "string") {
      return JSON.parse(content.json) as JSONContent
    }
    return content.json as JSONContent
  } catch {
    return { type: "doc", content: [] }
  }
}

// ── 연결 자원 매핑 ────────────────────────────────────────────────
// 자원 객체 자체가 null 이면 LinkedDocEmbed 도 null (연결 없음 / 자원 삭제).
// content 만 null 이면 자원은 존재하나 visibility 정책상 본문 가려진 상태 — 빈 doc 으로 렌더.
function mapLinkedDoc(
  raw: PortfolioDetailLinkedDoc | null,
  type: "resume" | "coverletter"
): LinkedDocEmbed | null {
  if (!raw) return null
  return {
    id: raw.id,
    type,
    title: raw.title,
    content: raw.content ? parseContentJson(raw.content) : null,
  }
}

// ── 작성자의 다른 포트폴리오 매핑 ──────────────────────────────────
// 응답은 PUBLIC 만, 본 포트폴리오 제외, updatedAt DESC 정렬되어 옴.
function mapOtherPortfolio(item: PublisherOtherPortfolioSummary): OtherPortfolio {
  const sortedCats = [...item.jobCategories].sort((a, b) => a.depth - b.depth)
  const major = sortedCats[0]
  const leaf = sortedCats[sortedCats.length - 1]
  return {
    id: item.portfolioId,
    categoryCode: leaf?.categoryCode ?? "",
    categoryName: leaf?.name ?? "",
    majorCategoryName: major?.name ?? "",
    title: item.title,
    // 응답 미제공 — 빈 배열 / null fallback
    tags: [],
    thumbnailUrl: null,
    likeCount: item.interestCount,
    viewCount: item.viewCount,
    updatedAt: item.updatedAt,
    // otherPortfolios 는 PUBLIC 만 포함된다고 명세
    visibility: "public",
  }
}

// ── API 응답 → 도메인 모델 변환 ────────────────────────────────────
function mapResponse(id: string, res: PortfolioDetailResponse): PortfolioDetail {
  const body = res.portfolio
  // jobCategories는 백엔드가 루트→리프 순으로 정렬해 내려주지만, 안전하게 depth 기준 재정렬
  const sortedCats = [...body.jobCategories].sort((a, b) => a.depth - b.depth)
  const major = sortedCats[0]
  const leaf = sortedCats[sortedCats.length - 1]
  const sortedTags = [...body.tags]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => t.name)

  return {
    id,
    publisher: res.publisher.nickname,
    isOwner: res.isOwner,
    isInterested: res.isInterested,
    categoryCode: leaf?.categoryCode ?? "",
    categoryName: leaf?.name ?? "",
    majorCategoryName: major?.name ?? "",
    projectType: body.collaborationType,
    visibility: body.visibility,
    title: body.title,
    thumbnailUrl: null,
    tags: sortedTags,
    externalLinks: body.externalLinks ?? [],
    author: { name: res.publisher.nickname, profileImageUrl: null },
    updatedAt: res.updatedAt ?? "",
    viewCount: res.viewCount,
    interestCount: res.interestCount,
    content: parseContentJson(body.content),
    linkedResume:     mapLinkedDoc(res.linkedResume,      "resume"),
    linkedCoverletter: mapLinkedDoc(res.linkedCoverLetter, "coverletter"),
    otherPortfolios:  res.publisher.otherPortfolios.map(mapOtherPortfolio),
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
