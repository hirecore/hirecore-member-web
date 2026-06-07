// _shared/ui/manage-card | 관리 카드 카테고리 헤더
// 포트폴리오/이력서/자기소개서 관리 카드에 동일한 L1(분야) · L3(직무) 단일 라인을 노출한다.
// "기타(직접입력)" 선택 시 customCategory 가 L3 자리를 대체.

interface CategoryHeaderProps {
  majorCategoryName?: string
  categoryName?: string
  customCategory?: string
}

export function CategoryHeader({ majorCategoryName, categoryName, customCategory }: CategoryHeaderProps) {
  const l1 = majorCategoryName
  const l3 = customCategory || categoryName
  if (!l1 && !l3) return null
  return (
    <>
      {l1 && <span className="mc-cat-line__field">{l1}</span>}
      {l1 && l3 && <span className="mc-cat-line__sep" aria-hidden>·</span>}
      {l3 && <span className="mc-cat-line__job">{l3}</span>}
    </>
  )
}
