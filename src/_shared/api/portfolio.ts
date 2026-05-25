// _shared/api | 포트폴리오 등록 API
// POST /api/portfolios — 사전조건: presigned URL → S3 업로드 후 imageFileMetaId 확보
import type { JSONContent } from "@tiptap/core"
import type { ExternalLink, Visibility } from "@/_shared/model"
import { httpClient } from "@/_shared/config"

export interface PortfolioTagInput {
  userInputTag: string
  sortOrder: number
}

/**
 * 직무 분류 선택.
 * - code: L3 직무 코드 (assignable=true 인 노드)
 * - userInput: code 가 가리키는 노드가 allowsCustomInput=true 일 때, 사용자가 입력한 직무명
 */
export interface JobCategoryInput {
  code: string
  userInput?: string
}

export interface CreatePortfolioRequest {
  jobCategory: JobCategoryInput
  collaborationType: "team" | "personal"
  visibility: Visibility
  title: string
  privateMemo?: string
  /** 포트폴리오 카드/검색 결과에 노출되는 사용자 입력 요약 (필수, ≤ 100자) */
  previewSummary: string
  /** TSID 문자열 — 정밀도 보존 컨벤션 (tsid-id-json-convention.md) */
  thumbnailImageId?: string
  contentImageIds?: string[]
  tags?: PortfolioTagInput[]
  externalLinks?: ExternalLink[]
  content: {
    json: JSONContent
    html: string
  }
  linkedResumeId?: string
  linkedCoverLetterId?: string
}

export interface CreatePortfolioResponse {
  /** TSID 문자열 */
  portfolioId: string
}

export async function createPortfolio(
  body: CreatePortfolioRequest
): Promise<CreatePortfolioResponse> {
  const { data } = await httpClient.post<CreatePortfolioResponse>("/api/portfolios", body)
  return data
}
