"use client"

import "./portfolio-coming-soon.scss"

interface Props {
  label: string
}

export function PortfolioComingSoon({ label }: Props) {
  return (
    <div className="pr-coming-soon">
      <div className="pr-coming-soon__icon" aria-hidden>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect x="5" y="7" width="26" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 14h14M11 19h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="pr-coming-soon__title">{label}</p>
      <p className="pr-coming-soon__desc">{label}가 아직 등록되지 않았어요.</p>
    </div>
  )
}
