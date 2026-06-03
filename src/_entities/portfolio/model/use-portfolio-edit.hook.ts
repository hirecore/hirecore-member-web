// _entities/portfolio/model | 포트폴리오 편집 폼 초기화 조회
// GET /api/portfolios/:id/edit — 작성자 본인만 200.
// 표시용 상세 조회(usePortfolioDetail)와 달리 privateMemo / previewSummary 가 포함되고
// 통계·메타 필드(viewCount, interestCount, updatedAt 등)는 빠진다.
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import type { JSONContent } from "@tiptap/core"
import {
  fetchPortfolioForEdit,
  type PortfolioEditResponse,
  type PortfolioEditContentImage,
} from "@/_shared/api"
import type { ExternalLink, Visibility } from "@/_shared/model"

export interface PortfolioEditData {
  privateMemo: string | null
  previewSummary: string
  /** 썸네일 ImageFileMeta ID. PUT 수정 요청에 그대로 동봉해 동일 썸네일 유지를 전달한다. */
  thumbnailImageId: string | null
  /**
   * 썸네일 이미지의 전체 URL (서버가 환경별 CDN base URL 을 결합해 내려줌).
   * null 이면 등록 시 썸네일 미지정 — 편집 화면에서 드롭존을 노출한다.
   */
  thumbnailImageUrl: string | null
  /**
   * 본문 image 노드 src ↔ ImageFileMeta ID 매핑. 편집 진입 직후 클라이언트가 룩업 테이블에
   * 적재해 PUT 수정 시 contentImageIds 산출에 사용한다.
   */
  contentImages: PortfolioEditContentImage[]
  /** L3(리프) 직무 코드 */
  categoryCode: string
  /**
   * L3(리프) 직무명. allowsCustomInput=true 인 직무라면 사용자가 입력한 customCategory
   * 텍스트로 간주된다 (백엔드가 동일한 name 필드를 사용해 내려준다).
   * 커스텀 여부 판단은 useJobCategories + isCustomInputCategory 로 view 단에서 수행.
   */
  categoryLeafName: string
  collaborationType: "team" | "personal"
  visibility: Visibility
  title: string
  tags: string[]
  externalLinks: ExternalLink[]
  content: JSONContent
}

function mapResponse(res: PortfolioEditResponse): PortfolioEditData {
  // 백엔드가 루트→리프 순으로 정렬해 내려주지만 depth 기준 재정렬로 방어
  const sortedCats = [...res.jobCategories].sort((a, b) => a.depth - b.depth)
  const leaf = sortedCats[sortedCats.length - 1]
  const sortedTags = [...res.tags]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((t) => t.userInputTag)

  // content.json 은 직렬화 문자열 — 에디터에 주입하기 전 파싱
  let parsedContent: JSONContent
  try {
    parsedContent = JSON.parse(res.content.json) as JSONContent
  } catch {
    parsedContent = { type: "doc", content: [] }
  }

  return {
    privateMemo: res.privateMemo,
    previewSummary: res.previewSummary,
    thumbnailImageId: res.thumbnailImageId,
    thumbnailImageUrl: res.thumbnailImageUrl,
    contentImages: res.contentImages ?? [],
    categoryCode: leaf?.categoryCode ?? "",
    categoryLeafName: leaf?.name ?? "",
    collaborationType: res.collaborationType,
    visibility: res.visibility,
    title: res.title,
    tags: sortedTags,
    externalLinks: res.externalLinks ?? [],
    content: parsedContent,
  }
}

export function usePortfolioEdit(
  id: string | null,
  options?: { enabled?: boolean }
): UseQueryResult<PortfolioEditData> {
  return useQuery<PortfolioEditData>({
    queryKey: ["portfolio", "edit", id],
    queryFn: async () => mapResponse(await fetchPortfolioForEdit(id!)),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 60_000,
    retry: false,
  })
}
