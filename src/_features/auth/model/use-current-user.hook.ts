"use client"

import { useQuery } from "@tanstack/react-query"

export interface CurrentUser {
  id: string
  nickname: string
  email?: string
  profileImageUrl?: string | null
}

/**
 * 현재 로그인 유저 조회
 * - axios interceptor를 우회하기 위해 native fetch 사용
 *   (401이어도 /login 리다이렉트 없이 null 반환)
 */
export const useCurrentUser = () => {
  return useQuery<CurrentUser | null>({
    queryKey: ["auth", "currentUser"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/summary`, {
          credentials: "include",
          cache: "no-store",
        })
        if (!res.ok) return null
        return res.json() as Promise<CurrentUser>
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}
