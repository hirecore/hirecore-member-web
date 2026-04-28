"use client"

// 다중 직무 카테고리 선택 섹션 — 이력서·자기소개서 등록용
// L1(분야) → L2(카테고리) → L3(직무) 3-level 선택, 최대 maxCount개 다중 선택

import { useMemo, useState } from "react"
import {
  useJobCategories,
  getCategoryPath,
  getLevel1Categories,
  getLevel2Categories,
  getLevel3Categories,
  searchAssignableCategories,
} from "@/_shared/lib"
import "./multi-job-category-section.scss"

interface Props {
  /** 선택된 L3 직무 코드 목록 */
  value: string[]
  /** 최대 선택 가능 수 */
  maxCount?: number
  /** 에러 메시지 */
  error?: string
  /** 선택 변경 콜백 */
  onChange: (value: string[]) => void
  /** 섹션 클래스 접두어 (기본: "rw") */
  classPrefix?: string
}

export function MultiJobCategorySection({
  value, maxCount = 5, error, onChange, classPrefix = "rw",
}: Props) {
  const [openL1, setOpenL1] = useState<string | null>(null)
  const [openL2, setOpenL2] = useState<string | null>(null)
  const [query, setQuery]   = useState("")

  const { data: categories = [] } = useJobCategories(3)
  const searchResults = useMemo(
    () => searchAssignableCategories(categories, query, 12),
    [categories, query]
  )
  const showSearchResults = query.trim().length > 0
  const isFull = value.length >= maxCount

  const handleSelect = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code))
    } else if (!isFull) {
      onChange([...value, code])
    }
  }

  const handleSearchSelect = (code: string) => {
    handleSelect(code)
    setQuery("")
  }

  const handleRemove = (code: string) => {
    onChange(value.filter((c) => c !== code))
  }

  const l1List = getLevel1Categories(categories)
  const l2List = openL1 ? getLevel2Categories(categories, openL1) : []
  const l3List = openL2 ? getLevel3Categories(categories, openL2) : []

  return (
    <section className={`${classPrefix}-section`}>
      <div className={`${classPrefix}-section__head`}>
        <span className={`${classPrefix}-section__label`}>직무 선택</span>
        <span className={`${classPrefix}-section__optional`}>선택</span>
        <span className={`${classPrefix}-section__hint`}>채용담당자가 한눈에 파악할 수 있어요 ({value.length}/{maxCount})</span>
      </div>

      {/* ── 선택된 직무 칩 목록 ── */}
      {value.length > 0 && (
        <div className="mjcs-selected-list">
          {value.map((code) => {
            const path = getCategoryPath(categories, code)
            const jobName = path[path.length - 1]?.name ?? code
            const fieldName = path[0]?.name ?? ""
            return (
              <span key={code} className="mjcs-selected-chip">
                <span className="mjcs-selected-chip__field">{fieldName}</span>
                <span className="mjcs-selected-chip__sep" aria-hidden>›</span>
                <span className="mjcs-selected-chip__job">{jobName}</span>
                <button
                  type="button"
                  className="mjcs-selected-chip__remove"
                  onClick={() => handleRemove(code)}
                  aria-label={`${jobName} 삭제`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* ── 검색 필드 ── */}
      <div className="mjcs-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mjcs-search__icon" aria-hidden>
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          className="mjcs-search__input"
          placeholder={isFull ? `최대 ${maxCount}개까지 선택할 수 있습니다` : "직무명으로 빠르게 찾기 (예: 백엔드, UI 디자이너)"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isFull}
        />
        {query && (
          <button type="button" className="mjcs-search__clear" onClick={() => setQuery("")} aria-label="검색 초기화">
            ×
          </button>
        )}
      </div>

      {showSearchResults && (
        <div className="mjcs-search-results" role="listbox">
          {searchResults.length === 0 ? (
            <div className="mjcs-search-results__empty">검색 결과가 없습니다</div>
          ) : (
            searchResults.map((node) => {
              const path = getCategoryPath(categories, node.code)
              const breadcrumb = path.slice(0, -1).map((n) => n.name).join(" › ")
              const isSelected = value.includes(node.code)
              return (
                <button
                  key={node.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`mjcs-search-result${isSelected ? " mjcs-search-result--selected" : ""}`}
                  onClick={() => handleSearchSelect(node.code)}
                  disabled={isFull && !isSelected}
                >
                  <span className="mjcs-search-result__name">{node.name}</span>
                  <span className="mjcs-search-result__path">{breadcrumb}</span>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="mjcs-search-result__check" aria-hidden>
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}

      {/* ── 1단계: 분야 ── */}
      {!isFull && (
        <>
          <div className="mjcs-step">
            <div className="mjcs-step__title">
              <span className="mjcs-step__num">1</span>
              <span className="mjcs-step__label">분야 선택</span>
            </div>
            <div className="mjcs-pill-group" role="tablist">
              {l1List.map((cat) => (
                <button
                  key={cat.code}
                  type="button"
                  role="tab"
                  aria-selected={openL1 === cat.code}
                  className={`mjcs-pill${openL1 === cat.code ? " mjcs-pill--active" : ""}`}
                  onClick={() => { setOpenL1((prev) => (prev === cat.code ? null : cat.code)); setOpenL2(null) }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── 2단계: 카테고리 ── */}
          {openL1 && (
            <div className="mjcs-step mjcs-step--anim">
              <div className="mjcs-step__title">
                <span className="mjcs-step__num">2</span>
                <span className="mjcs-step__label">카테고리 선택</span>
              </div>
              <div className="mjcs-pill-group mjcs-pill-group--sub" role="tablist">
                {l2List.map((cat) => (
                  <button
                    key={cat.code}
                    type="button"
                    role="tab"
                    aria-selected={openL2 === cat.code}
                    className={`mjcs-pill mjcs-pill--sub${openL2 === cat.code ? " mjcs-pill--active" : ""}`}
                    onClick={() => setOpenL2((prev) => (prev === cat.code ? null : cat.code))}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 3단계: 직무 ── */}
          {openL2 && (
            <div className="mjcs-step mjcs-step--anim">
              <div className="mjcs-step__title">
                <span className="mjcs-step__num">3</span>
                <span className="mjcs-step__label">직무 선택</span>
              </div>
              <div className="mjcs-chip-group" role="group">
                {l3List.filter((c) => c.isAssignable && !c.allowsCustomInput).map((cat) => {
                  const isSelected = value.includes(cat.code)
                  return (
                    <button
                      key={cat.code}
                      type="button"
                      className={`mjcs-chip${isSelected ? " mjcs-chip--selected" : ""}`}
                      onClick={() => handleSelect(cat.code)}
                      disabled={isFull && !isSelected}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {error && <p className={`${classPrefix}-error`}>{error}</p>}
    </section>
  )
}
