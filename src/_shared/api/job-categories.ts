// _shared/api | 직무 카테고리 트리 조회
import { httpClient } from "@/_shared/config"

export interface JobCategoryNode {
  id: number
  depth: number
  sortOrder: number
  parentId?: number
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
