"use client"

import type { ReactNode } from "react"
import "./portfolio-post-layout.scss"

interface Props {
  content: ReactNode
  toc?: ReactNode
}

export function PortfolioPostLayout({ content, toc }: Props) {
  return (
    <div className="pr-post-layout">
      <div className="pr-post-layout__content">{content}</div>
      {toc && <div className="pr-post-layout__toc">{toc}</div>}
    </div>
  )
}
