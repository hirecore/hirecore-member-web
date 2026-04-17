"use client"

// _widgets/portfolio-editor | 직무 카테고리 3-level cascading 선택 섹션
// L1(분야) → L2(카테고리) → L3(직무) 순으로 점진적 노출.
// 검색 필드로 L3 직무 직접 진입 가능 (전문가 사용자용).
// "기타(직접입력)" 선택 시 자유 텍스트 입력 노출.

import { useMemo, useState, useEffect, useRef } from "react"
import {
  getCategoryByCode,
  getCategoryPath,
  getLevel1Categories,
  getLevel2Categories,
  getLevel3Categories,
  searchAssignableCategories,
  isCustomInputCategory,
  type CategorySelection,
} from "@/_features/portfolio"
import "./category-section.scss"

interface Props {
  /** 현재 선택된 직무 (없으면 null) */
  value: CategorySelection | null
  /** 에러 메시지 */
  error?: string
  /** 선택 변경 콜백 — null이면 선택 해제 */
  onChange: (value: CategorySelection | null) => void
}

export function JobCategorySection({ value, error, onChange }: Props) {
  // ── 선택 경로 산출 ────────────────────────────────────────
  // value(L3 코드)로부터 L1/L2를 lookup.
  // 사용자가 L1/L2까지만 펼쳐놓은 중간 상태도 표현하기 위해 별도 state로 관리.
  const selectedPath = useMemo(() => getCategoryPath(value?.categoryCode), [value])
  const selectedL3 = selectedPath[2]
  const selectedL2 = selectedPath[1]
  const selectedL1 = selectedPath[0]

  // 펼쳐진 단계 (사용자가 클릭으로 들어간 상태) — 선택과 분리
  const [openL1, setOpenL1] = useState<string | null>(selectedL1?.code ?? null)
  const [openL2, setOpenL2] = useState<string | null>(selectedL2?.code ?? null)

  // value가 외부에서 바뀌면 펼침 상태도 동기화
  useEffect(() => {
    if (selectedL1) setOpenL1(selectedL1.code)
    if (selectedL2) setOpenL2(selectedL2.code)
  }, [selectedL1, selectedL2])

  // ── 검색 ─────────────────────────────────────────────────
  const [query, setQuery] = useState("")
  const searchResults = useMemo(() => searchAssignableCategories(query, 12), [query])
  const showSearchResults = query.trim().length > 0

  // ── 직접입력 텍스트 ──────────────────────────────────────
  const [customInput, setCustomInput] = useState(value?.customCategory ?? "")
  const customInputRef = useRef<HTMLInputElement>(null)
  const requireCustomInput = isCustomInputCategory(value?.categoryCode)

  // 직접입력 카테고리 선택 시 input에 자동 포커스
  useEffect(() => {
    if (requireCustomInput) customInputRef.current?.focus()
  }, [requireCustomInput])

  // value가 바뀌면 customInput 동기화 (외부 복원 등)
  useEffect(() => {
    setCustomInput(value?.customCategory ?? "")
  }, [value?.customCategory])

  // ── 핸들러 ───────────────────────────────────────────────
  const handleL1Click = (code: string) => {
    setOpenL1((prev) => (prev === code ? null : code))
    setOpenL2(null)
  }

  const handleL2Click = (code: string) => {
    setOpenL2((prev) => (prev === code ? null : code))
  }

  const handleL3Click = (code: string) => {
    onChange({ categoryCode: code })
  }

  const handleSearchSelect = (code: string) => {
    onChange({ categoryCode: code })
    setQuery("")
  }

  const handleCustomInputChange = (text: string) => {
    setCustomInput(text)
    if (value?.categoryCode) {
      onChange({ categoryCode: value.categoryCode, customCategory: text })
    }
  }

  const handleClearSelection = () => {
    onChange(null)
    setCustomInput("")
  }

  // ── 렌더 ─────────────────────────────────────────────────
  const l1List = getLevel1Categories()
  const l2List = openL1 ? getLevel2Categories(openL1) : []
  const l3List = openL2 ? getLevel3Categories(openL2) : []

  return (
    <section className="pw-section" id="field-category">
      <div className="pw-section__head">
        <span className="pw-section__label">직무 카테고리</span>
        <span className="pw-section__required">필수</span>
      </div>

      {/* ── 검색 필드 ───────────────────────────────────── */}
      <div className="jcs-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="jcs-search__icon" aria-hidden>
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          className="jcs-search__input"
          placeholder="직무명으로 빠르게 찾기 (예: 백엔드, UI 디자이너)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button type="button" className="jcs-search__clear" onClick={() => setQuery("")} aria-label="검색 초기화">
            ×
          </button>
        )}
      </div>

      {showSearchResults && (
        <div className="jcs-search-results" role="listbox">
          {searchResults.length === 0 ? (
            <div className="jcs-search-results__empty">검색 결과가 없습니다</div>
          ) : (
            searchResults.map((node) => {
              const path = getCategoryPath(node.code)
              const breadcrumb = path.slice(0, -1).map((n) => n.name).join(" › ")
              return (
                <button
                  key={node.code}
                  type="button"
                  role="option"
                  className="jcs-search-result"
                  onClick={() => handleSearchSelect(node.code)}
                >
                  <span className="jcs-search-result__name">{node.name}</span>
                  <span className="jcs-search-result__path">{breadcrumb}</span>
                </button>
              )
            })
          )}
        </div>
      )}

      {/* ── 선택된 경로 (Breadcrumb) ───────────────────── */}
      {selectedL3 && (
        <div className="jcs-selected">
          <span className="jcs-selected__label">선택됨</span>
          <div className="jcs-selected__path">
            {selectedPath.map((node, idx) => (
              <span key={node.code} className="jcs-selected__crumb">
                {idx > 0 && <span className="jcs-selected__sep">›</span>}
                {node.name}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="jcs-selected__clear"
            onClick={handleClearSelection}
            aria-label="선택 해제"
          >
            ×
          </button>
        </div>
      )}

      {/* ── 1단계: 분야 ─────────────────────────────────── */}
      <div className="jcs-step">
        <div className="jcs-step__title">
          <span className="jcs-step__num">1</span>
          <span className="jcs-step__label">분야 선택</span>
        </div>
        <div className="jcs-pill-group" role="tablist">
          {l1List.map((cat) => (
            <button
              key={cat.code}
              type="button"
              role="tab"
              aria-selected={openL1 === cat.code}
              className={`jcs-pill${openL1 === cat.code ? " jcs-pill--active" : ""}${selectedL1?.code === cat.code ? " jcs-pill--selected" : ""}`}
              onClick={() => handleL1Click(cat.code)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2단계: 카테고리 (L1 선택 시) ─────────────── */}
      {openL1 && (
        <div className="jcs-step jcs-step--anim">
          <div className="jcs-step__title">
            <span className="jcs-step__num">2</span>
            <span className="jcs-step__label">카테고리 선택</span>
          </div>
          <div className="jcs-pill-group jcs-pill-group--sub" role="tablist">
            {l2List.map((cat) => (
              <button
                key={cat.code}
                type="button"
                role="tab"
                aria-selected={openL2 === cat.code}
                className={`jcs-pill jcs-pill--sub${openL2 === cat.code ? " jcs-pill--active" : ""}${selectedL2?.code === cat.code ? " jcs-pill--selected" : ""}`}
                onClick={() => handleL2Click(cat.code)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 3단계: 직무 (L2 선택 시) ─────────────────── */}
      {openL2 && (
        <div className="jcs-step jcs-step--anim">
          <div className="jcs-step__title">
            <span className="jcs-step__num">3</span>
            <span className="jcs-step__label">직무 선택</span>
          </div>
          <div className="jcs-chip-group" role="group">
            {l3List.map((cat) => (
              <button
                key={cat.code}
                type="button"
                className={`jcs-chip${value?.categoryCode === cat.code ? " jcs-chip--selected" : ""}${cat.allowsCustomInput ? " jcs-chip--custom" : ""}`}
                onClick={() => handleL3Click(cat.code)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 직접입력 ─────────────────────────────────── */}
      {requireCustomInput && (
        <div className="jcs-custom-input">
          <input
            ref={customInputRef}
            type="text"
            className="jcs-custom-input__field"
            placeholder="직무를 직접 입력해주세요 (예: 블록체인 엔지니어)"
            value={customInput}
            onChange={(e) => handleCustomInputChange(e.target.value)}
            maxLength={30}
          />
          <span className="jcs-custom-input__count">{customInput.length}/30</span>
        </div>
      )}

      {error && <p className="pw-error">{error}</p>}
    </section>
  )
}

// 외부 호환을 위해 헬퍼 재export — _features/portfolio/lib에 있음
export { getCategoryByCode, getCategoryPath, getCategoryName } from "@/_features/portfolio/lib"
