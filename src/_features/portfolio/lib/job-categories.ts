// _features/portfolio/lib | 직무 카테고리 헬퍼 함수
// JOB_CATEGORIES (flat) 위에서 lookup·검색·트리 탐색을 제공한다.

import { JOB_CATEGORIES, type JobCategoryNode } from "./job-categories.data"

// ── 인덱스 (모듈 로드 시 1회 구성) ───────────────────────────
const BY_CODE = new Map<string, JobCategoryNode>(
  JOB_CATEGORIES.map((node) => [node.code, node])
)

const CHILDREN_OF = JOB_CATEGORIES.reduce<Map<string | null, JobCategoryNode[]>>((acc, node) => {
  const list = acc.get(node.parentCode) ?? []
  list.push(node)
  acc.set(node.parentCode, list)
  return acc
}, new Map())

// 자식 정렬 (sortOrder 오름차순)
CHILDREN_OF.forEach((list) => list.sort((a, b) => a.sortOrder - b.sortOrder))

// ── 단일 lookup ──────────────────────────────────────────────
/** 코드로 카테고리 노드 조회 */
export function getCategoryByCode(code: string | null | undefined): JobCategoryNode | undefined {
  if (!code) return undefined
  return BY_CODE.get(code)
}

/** 카테고리 이름만 조회 (없으면 빈 문자열) */
export function getCategoryName(code: string | null | undefined): string {
  return getCategoryByCode(code)?.name ?? ""
}

// ── 트리 탐색 ────────────────────────────────────────────────
/** 같은 부모 아래의 자식 카테고리들 (sortOrder 정렬) */
export function getChildren(parentCode: string | null): JobCategoryNode[] {
  return CHILDREN_OF.get(parentCode) ?? []
}

/** 모든 L1 (분야) — sortOrder 정렬 */
export function getLevel1Categories(): JobCategoryNode[] {
  return getChildren(null)
}

/** L1 코드로부터 그 아래 L2 카테고리들 */
export function getLevel2Categories(level1Code: string): JobCategoryNode[] {
  return getChildren(level1Code)
}

/** L2 코드로부터 그 아래 L3 직무들 */
export function getLevel3Categories(level2Code: string): JobCategoryNode[] {
  return getChildren(level2Code)
}

/** 임의 코드 → 루트(L1)까지 경로 [L1, L2, L3] (또는 [L1, L2] / [L1] / []) */
export function getCategoryPath(code: string | null | undefined): JobCategoryNode[] {
  const node = getCategoryByCode(code)
  if (!node) return []
  const path: JobCategoryNode[] = [node]
  let cursor: JobCategoryNode | undefined = node
  while (cursor && cursor.parentCode) {
    const parent = BY_CODE.get(cursor.parentCode)
    if (!parent) break
    path.unshift(parent)
    cursor = parent
  }
  return path
}

/** 경로를 ' › ' 구분자로 합친 라벨 (예: "개발·데이터 › SW개발 › 백엔드 개발") */
export function getCategoryPathLabel(code: string | null | undefined, separator = " › "): string {
  return getCategoryPath(code).map((n) => n.name).join(separator)
}

// ── 검색·필터 ────────────────────────────────────────────────
/** 사용자가 직접 선택 가능한 직무 (L3 + isAssignable=true) 전체 */
export function getAssignableCategories(): JobCategoryNode[] {
  return JOB_CATEGORIES.filter((n) => n.isAssignable)
}

/** 검색어로 assignable 직무를 필터링.
 *  매칭 우선순위: L3 이름 prefix > L3 이름 contains > L1/L2 경로 contains
 *  반환은 최대 limit개 (기본 30)
 */
export function searchAssignableCategories(query: string, limit = 30): JobCategoryNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const candidates = getAssignableCategories()
  const scored = candidates
    .map((node) => {
      const lowerName = node.name.toLowerCase()
      let score = 0
      if (lowerName.startsWith(q)) score = 100 - lowerName.length // prefix 우선
      else if (lowerName.includes(q)) score = 50 - lowerName.length
      else {
        const pathLabel = getCategoryPathLabel(node.code).toLowerCase()
        if (pathLabel.includes(q)) score = 10 // 부모 카테고리에 매칭
      }
      return { node, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.node)

  return scored
}

/** "기타(직접입력)" 여부 — L3 코드 기반 */
export function isCustomInputCategory(code: string | null | undefined): boolean {
  return getCategoryByCode(code)?.allowsCustomInput ?? false
}
