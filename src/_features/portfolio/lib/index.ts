export * from "./portfolio.types"
export * from "./portfolio-content"
// 직무 카테고리 — _shared/lib로 이동, 하위 호환용 re-export
export type { JobCategoryNode } from "@/_shared/lib"
export { JOB_CATEGORIES } from "@/_shared/lib"
export {
  getCategoryByCode, getCategoryName, getCategoryPath, getCategoryPathLabel,
  getChildren, getLevel1Categories, getLevel2Categories, getLevel3Categories,
  getAssignableCategories, searchAssignableCategories, isCustomInputCategory,
} from "@/_shared/lib"
