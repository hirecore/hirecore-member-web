"use client"

// _views/portfolio/model | 포트폴리오 상세 읽기 뷰 비즈니스 로직
// 탭·관심·sticky 감지·TOC 스크롤·에디터·리다이렉트 — UI와 무관하므로 model에 분리
//
// mock=true (예: /portfolio/temp) 인 경우 실 API 호출 없이 mock 데이터를 사용한다.
// 실 API 경로에서는 React Query 상태를 통해 로딩/에러 처리를 한다.
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useReadOnlyEditor } from "@/_features/editor"
import { USER_ROUTES } from "@/_shared/config"
import {
  usePortfolioDetail,
  useMockPortfolioDetail,
  usePortfolioInterestToggle,
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
  const queryError = mock ? null : query.error

  const [tab, setTab] = useState<ActiveTab>("portfolio")

  // 작성자 / 관심 상태는 API 응답값을 그대로 사용
  const isOwner = data?.isOwner ?? false
  // isInterested: true → 채움, false/null → 비움 (null 은 비로그인 또는 본인 케이스)
  const interested = data?.isInterested === true
  const interestCount = data?.interestCount ?? 0

  // 관심 토글 — 옵티미스틱으로 캐시된 detail 데이터를 즉시 갱신
  const interestToggle = usePortfolioInterestToggle(id)

  const handleInterestToggle = () => {
    if (mock || !data) return
    // 비로그인 사용자(isInterested == null && isOwner == false) → 로그인 유도
    if (data.isInterested === null && !data.isOwner) {
      router.push(USER_ROUTES.auth.login)
      return
    }
    // 본인 포트폴리오 — 버튼 자체가 숨겨져 있어야 하지만 방어적으로 차단
    if (data.isOwner) return
    interestToggle.mutate(!interested)
  }

  const editor = useReadOnlyEditor({ content: data?.content, includeImages: true })

  const { tocHeadings, tabsSticky, activeId, tabsSentinelRef, scrollToHeading } =
    useTocTracking({ editor, content: data?.content })

  // 에러 발생 시 도메인 errorCode 에 맞는 안내 후 목록으로 리다이렉트.
  // (401 AUTHENTICATION_FAILED 는 axios 응답 인터셉터가 로그인 페이지로 자동 라우팅 — 여기 도달하지 않음)
  const errorHandledRef = useRef(false)
  useEffect(() => {
    if (!isError) return
    if (errorHandledRef.current) return
    errorHandledRef.current = true

    const err = queryError as
      | { response?: { status?: number; data?: { errorCode?: string; message?: string } } }
      | null
      | undefined
    const status = err?.response?.status
    const errorCode = err?.response?.data?.errorCode
    const backendMessage = err?.response?.data?.message

    let userMessage: string
    if (status === 403) {
      userMessage = backendMessage ?? "요청한 포트폴리오가 비공개이거나 접근할 권한이 없습니다."
    } else if (status === 404) {
      switch (errorCode) {
        case "PORTFOLIO_NOT_FOUND":
          userMessage = backendMessage ?? "요청한 포트폴리오가 존재하지 않습니다."
          break
        case "PORTFOLIO_NICKNAME_NOT_FOUND":
          userMessage = backendMessage ?? "포트폴리오 작성자의 닉네임을 불러올 수 없습니다. 관리자에게 문의해주세요."
          break
        case "JOB_CATEGORY_NOT_FOUND":
          userMessage = backendMessage ?? "포트폴리오에 해당하는 직무 카테고리를 찾을 수 없습니다. 관리자에게 문의해주세요."
          break
        default:
          userMessage = backendMessage ?? "요청한 포트폴리오를 불러올 수 없습니다."
      }
    } else {
      userMessage = backendMessage ?? "포트폴리오를 불러오는 중 오류가 발생했습니다."
    }

    alert(userMessage)
    router.replace(USER_ROUTES.portfolio.list)
  }, [isError, queryError, router])

  return {
    data, editor, tocHeadings, tabsSentinelRef,
    tab, setTab,
    interested, interestCount,
    handleInterestToggle,
    tabsSticky,
    activeId,
    scrollToHeading,
    isOwner,
    isLoading,
  }
}
