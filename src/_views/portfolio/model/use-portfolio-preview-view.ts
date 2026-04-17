"use client"

// _views/portfolio/model | 포트폴리오 미리보기 뷰 비즈니스 로직
// draft store 읽기·에디터·TOC·sticky·스크롤·리다이렉트를 View에서 분리
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useReadOnlyEditor } from "@/_features/editor"
import { usePortfolioDraftStore, useTocTracking } from "@/_features/portfolio"
import type { ActiveTab } from "@/_features/portfolio/lib"
import { USER_ROUTES } from "@/_shared/config"

export function usePortfolioPreviewView() {
  const router = useRouter()
  const data = usePortfolioDraftStore((s) => s.previewData)

  const [tab, setTab]     = useState<ActiveTab>("portfolio")
  const [liked, setLiked] = useState(false)

  const editor = useReadOnlyEditor({ content: data?.content, includeImages: true })

  const { tocHeadings, tabsSticky, activeId, tabsSentinelRef, scrollToHeading } =
    useTocTracking({ editor, content: data?.content })

  // previewData 없으면 목록으로 리다이렉트 (직접 URL 접근 방어)
  useEffect(() => {
    if (!data) router.replace(USER_ROUTES.portfolio.list)
  }, [data, router])

  // 편집으로 돌아가기 — backFromPreview 플래그 설정 후 write 뷰로 복귀
  const handleEdit = () => {
    usePortfolioDraftStore.getState().setBackFromPreview(true)
    router.back()
  }

  return {
    data, editor, tocHeadings, tabsSentinelRef,
    tab, setTab,
    liked, setLiked,
    tabsSticky,
    activeId,
    scrollToHeading,
    handleEdit,
  }
}
