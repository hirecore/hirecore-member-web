// _shared/lib | 직무 카테고리 — API 응답 정규화 + 트리 헬퍼 + React Query 훅
"use client"

import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import {
  fetchJobCategories,
  type JobCategoryNode as ApiJobCategoryNode,
  type MaxDepth,
} from "@/_shared/api"

export interface JobCategoryNode {
  /** 백엔드 categoryCode (영어 대문자 + 언더스코어) */
  code: string
  /** 화면 표시용 이름 */
  name: string
  /** 1: 분야, 2: 카테고리, 3: 직무 */
  depth: 1 | 2 | 3
  /** 상위 카테고리 코드 (L1은 null) */
  parentCode: string | null
  /** "기타(직접입력)" 자유 텍스트 입력 허용 여부 */
  allowsCustomInput: boolean
  /** 동일 부모 내 정렬 순서 */
  sortOrder: number
  /** 사용자가 직접 선택 가능한가 (depth=3 리프) */
  isAssignable: boolean
}

// ── React Query 훅 ─────────────────────────────────────────────
const STALE_TIME = 1000 * 60 * 30 // 30분

export function useJobCategories(maxDepth: MaxDepth = 3): UseQueryResult<JobCategoryNode[]> {
  return useQuery({
    queryKey: ["jobCategories", maxDepth],
    queryFn: () => fetchJobCategories(maxDepth),
    select: normalizeNodes,
    staleTime: STALE_TIME,
  })
}

function normalizeNodes(apiNodes: ApiJobCategoryNode[]): JobCategoryNode[] {
  const idToCode = new Map(apiNodes.map((n) => [n.id, n.categoryCode]))
  return apiNodes.map((n) => ({
    code: n.categoryCode,
    name: n.categoryName,
    depth: n.depth as 1 | 2 | 3,
    parentCode: n.parentId !== undefined ? (idToCode.get(n.parentId) ?? null) : null,
    allowsCustomInput: n.allowsCustomInput,
    sortOrder: n.sortOrder,
    isAssignable: n.depth === 3,
  }))
}

// ── 단일 lookup ──────────────────────────────────────────────
export function getCategoryByCode(
  categories: JobCategoryNode[],
  code: string | null | undefined
): JobCategoryNode | undefined {
  if (!code) return undefined
  return categories.find((n) => n.code === code)
}

export function getCategoryName(
  categories: JobCategoryNode[],
  code: string | null | undefined
): string {
  return getCategoryByCode(categories, code)?.name ?? ""
}

// ── 트리 탐색 ────────────────────────────────────────────────
export function getChildren(
  categories: JobCategoryNode[],
  parentCode: string | null
): JobCategoryNode[] {
  return categories
    .filter((n) => n.parentCode === parentCode)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getLevel1Categories(categories: JobCategoryNode[]): JobCategoryNode[] {
  return getChildren(categories, null)
}

export function getLevel2Categories(
  categories: JobCategoryNode[],
  level1Code: string
): JobCategoryNode[] {
  return getChildren(categories, level1Code)
}

export function getLevel3Categories(
  categories: JobCategoryNode[],
  level2Code: string
): JobCategoryNode[] {
  return getChildren(categories, level2Code)
}

export function getCategoryPath(
  categories: JobCategoryNode[],
  code: string | null | undefined
): JobCategoryNode[] {
  const node = getCategoryByCode(categories, code)
  if (!node) return []
  const path: JobCategoryNode[] = [node]
  let cursor: JobCategoryNode | undefined = node
  while (cursor && cursor.parentCode) {
    const parent = getCategoryByCode(categories, cursor.parentCode)
    if (!parent) break
    path.unshift(parent)
    cursor = parent
  }
  return path
}

export function getCategoryPathLabel(
  categories: JobCategoryNode[],
  code: string | null | undefined,
  separator = " › "
): string {
  return getCategoryPath(categories, code)
    .map((n) => n.name)
    .join(separator)
}

// ── 검색·필터 ────────────────────────────────────────────────
export function getAssignableCategories(categories: JobCategoryNode[]): JobCategoryNode[] {
  return categories.filter((n) => n.isAssignable)
}

export function searchAssignableCategories(
  categories: JobCategoryNode[],
  query: string,
  limit = 30
): JobCategoryNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const candidates = getAssignableCategories(categories)
  return candidates
    .map((node) => {
      const lowerName = node.name.toLowerCase()
      let score = 0
      if (lowerName.startsWith(q)) score = 100 - lowerName.length
      else if (lowerName.includes(q)) score = 50 - lowerName.length
      else {
        const pathLabel = getCategoryPathLabel(categories, node.code).toLowerCase()
        if (pathLabel.includes(q)) score = 10
      }
      return { node, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.node)
}

export function isCustomInputCategory(
  categories: JobCategoryNode[],
  code: string | null | undefined
): boolean {
  return getCategoryByCode(categories, code)?.allowsCustomInput ?? false
}
