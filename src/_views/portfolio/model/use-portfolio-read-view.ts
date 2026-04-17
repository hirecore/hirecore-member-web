"use client"

// _views/portfolio/model | 포트폴리오 상세 읽기 뷰 비즈니스 로직
// 탭·좋아요·sticky 감지·TOC 스크롤·에디터·리다이렉트 — UI와 무관하므로 model에 분리
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useReadOnlyEditor } from "@/_features/editor"
import { USER_ROUTES } from "@/_shared/config"
import { usePortfolioDetail } from "@/_entities/portfolio"
import { useTocTracking } from "@/_features/portfolio"
import type { ActiveTab } from "@/_features/portfolio/lib"

export function usePortfolioReadView(id: string) {
  const router = useRouter()
  const data = usePortfolioDetail(id)

  const [tab, setTab]     = useState<ActiveTab>("portfolio")
  const [liked, setLiked] = useState(false)

  const editor = useReadOnlyEditor({ content: data?.content, includeImages: true })

  const { tocHeadings, tabsSticky, activeId, tabsSentinelRef, scrollToHeading } =
    useTocTracking({ editor, content: data?.content })

  // 존재하지 않는 포트폴리오 ID → 목록 페이지로 리다이렉트
  useEffect(() => {
    if (!data) router.replace(USER_ROUTES.portfolio.list)
  }, [data, router])

  return {
    data, editor, tocHeadings, tabsSentinelRef,
    tab, setTab,
    liked, setLiked,
    tabsSticky,
    activeId,
    scrollToHeading,
  }
}
