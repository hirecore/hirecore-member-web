// _shared/api | 직무 카테고리 트리 조회
import { httpClient } from "@/_shared/config"

export interface JobCategoryNode {
  /** TSID 문자열 — 정밀도 보존 컨벤션 */
  id: string
  depth: number
  sortOrder: number
  /** TSID 문자열. 루트 노드(depth=1)에서는 응답에서 키 자체가 생략됨 */
  parentId?: string
  categoryName: string
  categoryCode: string
  allowsCustomInput: boolean
}

export interface JobCategoriesResponse {
  categories: JobCategoryNode[]
}

export type MaxDepth = 1 | 2 | 3

export async function fetchJobCategories(maxDepth: MaxDepth): Promise<JobCategoryNode[]> {
  const { data } = await httpClient.get<JobCategoriesResponse>("/api/categories", {
    params: { "max-depth": maxDepth },
  })
  return data.categories
}
