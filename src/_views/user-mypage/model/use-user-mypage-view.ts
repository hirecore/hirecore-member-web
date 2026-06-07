"use client"

// _views/user-mypage/model | 마이페이지 뷰 비즈니스 로직
// URL 탭 파라미터 동기화 + 미인증 리다이렉트 — view에서 분리된 이유: 라우팅·인증 로직은 UI와 무관하므로 model에 속함
import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCurrentUser } from "@/_features/auth"
import { USER_ROUTES } from "@/_shared/config"
import type { UserMypageSection } from "@/_features/user-mypage"

function parseTab(raw: string | null): UserMypageSection {
  if (raw === "home" || raw === "portfolio" || raw === "resume" || raw === "coverletter") return raw
  return "portfolio"
}

export function useUserMypageView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // 현재 경로 보존용 — /mypage 와 /mypage/temp 가 동일 view 를 공유하므로
  // tab 정규화 / 섹션 변경 시 하드코딩 대신 현재 pathname 으로 리다이렉트한다.
  const pathname = usePathname()
  const { data: user, isLoading } = useCurrentUser()

  const [activeSection, setActiveSection] = useState<UserMypageSection>(
    parseTab(searchParams.get("tab"))
  )

  // tab 파라미터가 없거나 유효하지 않으면 기본값으로 리다이렉트, 있으면 상태 동기화.
  // ⚠️ pathname 가드 — 마이페이지 라우트가 아닐 때는 즉시 skip.
  // 예: 로고 클릭으로 router.push("/") 되는 찰나에 pathname 이 "/" 로 잠시 바뀌면서
  // 이 effect 가 발화해 /?tab=portfolio 로 강제 replace → 홈 이동을 막던 버그 방지.
  useEffect(() => {
    if (!pathname.startsWith("/mypage")) return
    const raw = searchParams.get("tab")
    if (!raw || !["home", "portfolio", "resume", "coverletter"].includes(raw)) {
      router.replace(`${pathname}?tab=portfolio`, { scroll: false })
    } else {
      setActiveSection(raw as UserMypageSection)
    }
  }, [searchParams, router, pathname])

  // 미인증 사용자는 로그인 페이지로 강제 이동
  useEffect(() => {
    if (!isLoading && !user) router.replace(USER_ROUTES.auth.login)
  }, [user, isLoading, router])

  const handleSectionChange = (section: UserMypageSection) => {
    setActiveSection(section)
    router.replace(`${pathname}?tab=${section}`, { scroll: false })
  }

  return { activeSection, handleSectionChange, user, isLoading }
}
