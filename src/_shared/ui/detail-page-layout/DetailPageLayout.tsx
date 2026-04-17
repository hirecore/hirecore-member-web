"use client"

import type { ReactNode } from "react"
import "./detail-page-layout.scss"

interface DetailPageLayoutProps {
  /** 좌측 상단 — 돌아가기 + 헤더 카드 */
  header?: ReactNode
  /** 좌측 하단 — 본문 + 연결 문서 등 */
  main: ReactNode
  /** 우측 상단 — 추후 활용 슬롯 (header와 같은 행) */
  sideTop?: ReactNode
  /** 우측 하단 — TOC 등 sticky (main과 같은 행) */
  sideBottom?: ReactNode
}

export function DetailPageLayout({ header, main, sideTop, sideBottom }: DetailPageLayoutProps) {
  const hasSide = sideTop || sideBottom || header

  if (!hasSide) {
    return (
      <div className="detail-layout detail-layout--single">
        {header && <div className="detail-layout__header">{header}</div>}
        <div className="detail-layout__main">{main}</div>
      </div>
    )
  }

  return (
    <div className="detail-layout">
      {header && <div className="detail-layout__header">{header}</div>}
      {header && <div className="detail-layout__side-top">{sideTop}</div>}
      <div className="detail-layout__main">{main}</div>
      <div className="detail-layout__side-bottom">{sideBottom}</div>
    </div>
  )
}
