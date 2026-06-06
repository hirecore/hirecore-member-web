import type { JSONContent } from "@tiptap/core"
import { createDraftStore } from "@/_shared/lib"
import type { ExternalLink } from "@/_shared/model"
import type { CategorySelection } from "@/_features/portfolio"

export interface CoverLetterDraftData {
  visibility: "public" | "private"
  title: string
  memo: string
  /** 단일 직무 카테고리 — 포트폴리오와 동일한 선택 모델 */
  category: CategorySelection | null
  /** 카드/검색 결과에 노출되는 한 줄 소개 (필수, ≤ 100자) */
  previewSummary: string
  tags: string[]
  linkedIds: string[]
  externalLinks: ExternalLink[]
  content: JSONContent
}

export const useCoverLetterDraftStore = createDraftStore<CoverLetterDraftData>()
