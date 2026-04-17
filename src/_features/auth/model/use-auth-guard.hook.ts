"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { USER_ROUTES } from "@/_shared/config"
import { useCurrentUser } from "./use-current-user.hook"

/**
 * 인증 가드 훅
 * 미인증 사용자를 /login 으로 리다이렉트
 * 인증 확인 중이거나 미인증이면 { isLoading: true, user: null } 반환
 */
export function useAuthGuard() {
  const router = useRouter()
  const { data: user, isLoading } = useCurrentUser()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(USER_ROUTES.auth.login)
    }
  }, [user, isLoading, router])

  return { user: user ?? null, isLoading }
}
