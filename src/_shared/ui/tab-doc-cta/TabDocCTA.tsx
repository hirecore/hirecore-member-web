"use client"

import "./doc-tab-cta.scss"

interface TabDocCTAProps {
  label: string
  sub: string
  onClick: () => void
}

export function TabDocCTA({ label, sub, onClick }: TabDocCTAProps) {
  return (
    <button type="button" className="doc-tab-cta" onClick={onClick}>
      <span className="doc-tab-cta__icon" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="doc-tab-cta__label">{label}</span>
      <span className="doc-tab-cta__sub">{sub}</span>
    </button>
  )
}
