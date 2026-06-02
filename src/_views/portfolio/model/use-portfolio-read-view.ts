"use client"

// _views/portfolio/model | 포트폴리오 상세 읽기 뷰 비즈니스 로직
// 탭·좋아요·sticky 감지·TOC 스크롤·에디터·리다이렉트 — UI와 무관하므로 model에 분리
//
// mock=true (예: /portfolio/temp) 인 경우 실 API 대신 mock 데이터를 사용한다.
// 실 API 경로에서는 React Query 상태를 통해 로딩/에러 처리를 한다.
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useReadOnlyEditor } from "@/_features/editor"
import { USER_ROUTES } from "@/_shared/config"
import {
  usePortfolioDetail,
  useMockPortfolioDetail,
} from "@/_entities/portfolio"
import { useTocTracking } from "@/_features/portfolio"
import type { ActiveTab } from "@/_features/portfolio/lib"

interface Options {
  /** /portfolio/temp 전용 — true 시 실 API 호출 없이 mock 데이터를 사용한다 */
  mock?: boolean
}

export function usePortfolioReadView(id: string, { mock = false }: Options = {}) {
  const router = useRouter()

  // 실 API: mock 모드에선 fetch 건너뜀
  const query = usePortfolioDetail(id, { enabled: !mock })
  const mockData = useMockPortfolioDetail(id)
  const data = mock ? mockData : (query.data ?? null)
  const isLoading = mock ? false : query.isPending
  const isError = mock ? false : query.isError

  const [tab, setTab]     = useState<ActiveTab>("portfolio")
  const [liked, setLiked] = useState(false)

  // 작성자 여부는 API 응답값을 그대로 사용 — 비로그인이면 false
  const isOwner = data?.isOwner ?? false

  const editor = useReadOnlyEditor({ content: data?.content, includeImages: true })

  const { tocHeadings, tabsSticky, activeId, tabsSentinelRef, scrollToHeading } =
    useTocTracking({ editor, content: data?.content })

  // 에러(404/403 등) 발생 시 목록으로 리다이렉트.
  // 로딩 중에는 데이터가 비어있어도 리다이렉트하지 않는다.
  useEffect(() => {
    if (isError) router.replace(USER_ROUTES.portfolio.list)
  }, [isError, router])

  return {
    data, editor, tocHeadings, tabsSentinelRef,
    tab, setTab,
    liked, setLiked,
    tabsSticky,
    activeId,
    scrollToHeading,
    isOwner,
    isLoading,
  }
}
