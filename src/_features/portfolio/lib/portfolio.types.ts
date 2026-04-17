import type { JSONContent } from "@tiptap/core"
import type { ExternalLink } from "@/_shared/model"

/**
 * 직무 카테고리 선택 결과.
 * - categoryCode: L3 직무 코드 (assignable=true 인 노드만 선택 가능)
 * - customCategory: "기타(직접입력)" 선택 시 사용자가 입력한 텍스트
 *   (categoryCode가 allowsCustomInput=true 인 코드일 때만 의미를 가짐)
 *
 * 백엔드 전송 시:
 *   - 일반 직무: { categoryCode } 만 전송
 *   - 기타 입력: { categoryCode, customCategory } 둘 다 전송
 */
export interface CategorySelection {
  categoryCode: string
  customCategory?: string
}

export interface ConfirmData {
  /** 직무 카테고리 — 3-level 통합 코드 + 직접입력 텍스트 */
  category: CategorySelection
  projectType: "personal" | "team"
  visibility: "public" | "private"
  title: string
  privateMemo?: string
  thumbnailUrl: string | null
  tags: string[]
  externalLinks: ExternalLink[]
  content: JSONContent
}

export type { ExternalLink as PortfolioLink }

export type ActiveTab = "resume" | "coverletter" | "portfolio"

export interface TocHeading {
  id: string
  level: 1 | 2 | 3
  text: string
}
