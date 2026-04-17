"use client"

import Link from "next/link"
import { USER_ROUTES } from "@/_shared/config"
import "./portfolio-empty.scss"

export function PortfolioEmpty() {
  return (
    <div className="pr-empty">
      <div className="pr-empty__icon" aria-hidden>📭</div>
      <p className="pr-empty__msg">등록 데이터가 없습니다.</p>
      <Link href={USER_ROUTES.home} className="pr-empty__link">← 홈 화면으로</Link>
    </div>
  )
}
