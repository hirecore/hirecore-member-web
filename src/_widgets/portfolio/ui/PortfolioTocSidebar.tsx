"use client"

import type { TocHeading } from "@/_features/portfolio/lib"
import "./portfolio-toc-sidebar.scss"

interface Props {
  headings: TocHeading[]
  activeId: string
  onClickHeading: (id: string) => void
}

export function PortfolioTocSidebar({ headings, activeId, onClickHeading }: Props) {
  return (
    <nav className="pr-toc" aria-label="목차">
      <p className="pr-toc__title">목차</p>
      <ol className="pr-toc__list">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              className={`pr-toc__link pr-toc__link--h${h.level}${activeId === h.id ? " pr-toc__link--active" : ""}`}
              onClick={() => onClickHeading(h.id)}
              title={h.text}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
