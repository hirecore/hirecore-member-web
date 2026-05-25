// _shared/api | 포트폴리오 등록 API
// POST /api/portfolios — 사전조건: presigned URL → S3 업로드 후 imageFileMetaId 확보
import type { JSONContent } from "@tiptap/core"
import type { ExternalLink, Visibility } from "@/_shared/model"
import { httpClient } from "@/_shared/config"

export interface PortfolioTagInput {
  userInputTag: string
  sortOrder: number
}

export interface CreatePortfolioRequest {
  categoryCode: string
  customCategory?: string
  collaborationType: "team" | "personal"
  visibility: Visibility
  title: string
  privateMemo?: string
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
