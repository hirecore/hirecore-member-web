"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { USER_ROUTES } from "@/_shared/config"
import { useCurrentUser } from "./use-current-user.hook"

/**
 * 게스트 가드 훅
 * 이미 로그인된 사용자를 홈으로 리다이렉트 (로그인 페이지에서 사용).
 * 인증 확인 중이면 { isLoading: true, user: null } 반환.
 */
export function useGuestGuard() {
  const router = useRouter()
  const { data: user, isLoading } = useCurrentUser()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(USER_ROUTES.home)
    }
  }, [user, isLoading, router])

  return { user: user ?? null, isLoading }
}
