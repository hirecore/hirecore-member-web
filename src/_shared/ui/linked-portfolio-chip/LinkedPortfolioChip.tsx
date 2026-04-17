"use client"

import Link from "next/link"
import { USER_ROUTES } from "@/_shared/config"
import type { LinkedPortfolio } from "@/_shared/model"
import "./linked-portfolio-chip.scss"

interface Props {
  portfolio: LinkedPortfolio
}

export function LinkedPortfolioChip({ portfolio: p }: Props) {
  const c0 = p.title.charCodeAt(0) || 65
  const c1 = p.title.charCodeAt(1) || 90
  const hue = (c0 * 47 + c1 * 19) % 360
  const hue2 = (hue + 55) % 360
  return (
    <Link href={USER_ROUTES.portfolio.detail(p.id)} className="lpc-chip">
      <div className="lpc-chip__thumb" style={{ background: `linear-gradient(140deg, hsl(${hue} 68% 52%), hsl(${hue2} 72% 38%))` }} aria-hidden>
        {p.title.slice(0, 1)}
      </div>
      <div className="lpc-chip__info">
        <span className="lpc-chip__title">{p.title}</span>
        <div className="lpc-chip__tags">
          {p.tags.slice(0, 2).map((t) => <span key={t} className="lpc-chip__tag">#{t}</span>)}
        </div>
      </div>
    </Link>
  )
}
