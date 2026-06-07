"use client"

// _views/user-mypage/model | 마이페이지 뷰 비즈니스 로직
// URL 탭 파라미터 동기화 + 미인증 리다이렉트 — view에서 분리된 이유: 라우팅·인증 로직은 UI와 무관하므로 model에 속함
import { useEffect, useRef, useState } from "react"
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

  // URL tab → 활성 탭 상태 동기화.
  // - mount 1회 한정으로 누락된 tab 을 ?tab=portfolio 로 정규화 (ref 가드)
  //   → 매번 발화하지 않으므로 외부 navigation(예: 로고 → /) 과 경쟁하지 않는다.
  // - 이후 URL 변경(사이드바 클릭·뒤로가기 등)은 setActiveSection 만 수행.
  const hasNormalizedRef = useRef(false)
  useEffect(() => {
    if (!pathname.startsWith("/mypage")) return
    const raw = searchParams.get("tab")
    if (!hasNormalizedRef.current) {
      hasNormalizedRef.current = true
      if (!raw || !["home", "portfolio", "resume", "coverletter"].includes(raw)) {
        router.replace(`${pathname}?tab=portfolio`, { scroll: false })
        return
      }
    }
    setActiveSection(parseTab(raw))
  }, [searchParams, pathname, router])

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
