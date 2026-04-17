"use client"

// _views/user-mypage/model | 마이페이지 뷰 비즈니스 로직
// URL 탭 파라미터 동기화 + 미인증 리다이렉트 — view에서 분리된 이유: 라우팅·인증 로직은 UI와 무관하므로 model에 속함
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  const { data: user, isLoading } = useCurrentUser()

  const [activeSection, setActiveSection] = useState<UserMypageSection>(
    parseTab(searchParams.get("tab"))
  )

  // tab 파라미터가 없거나 유효하지 않으면 기본값으로 리다이렉트, 있으면 상태 동기화
  useEffect(() => {
    const raw = searchParams.get("tab")
    if (!raw || !["home", "portfolio", "resume", "coverletter"].includes(raw)) {
      router.replace(`${USER_ROUTES.mypage}?tab=portfolio`, { scroll: false })
    } else {
      setActiveSection(raw as UserMypageSection)
    }
  }, [searchParams, router])

  // 미인증 사용자는 로그인 페이지로 강제 이동
  useEffect(() => {
    if (!isLoading && !user) router.replace(USER_ROUTES.auth.login)
  }, [user, isLoading, router])

  const handleSectionChange = (section: UserMypageSection) => {
    setActiveSection(section)
    router.replace(`${USER_ROUTES.mypage}?tab=${section}`, { scroll: false })
  }

  return { activeSection, handleSectionChange, user, isLoading }
}
