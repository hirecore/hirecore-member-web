"use client"

import "./portfolio-page-actions.scss"

interface Props {
  onEdit: () => void
}

export function PortfolioPageActions({ onEdit }: Props) {
  return (
    <div className="pr-page-actions">
      <span className="pr-page-actions__badge">임시</span>
      <button type="button" className="pr-page-actions__edit" onClick={onEdit}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
          <path d="M9.5 1.5l2 2-7 7H2.5v-2l7-7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
        편집하기
      </button>
    </div>
  )
}
