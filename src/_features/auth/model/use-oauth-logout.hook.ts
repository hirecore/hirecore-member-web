"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { httpClient, SESSION_STORAGE_KEYS } from "@/_shared/config"

export const useOAuthLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => httpClient.post<void>("/api/auth/logout"),
    onSettled: () => {
      // 성공/실패 무관하게 클라이언트 캐시 초기화
      queryClient.setQueryData(["auth", "currentUser"], null)
      sessionStorage.setItem(SESSION_STORAGE_KEYS.KAKAO_FORCE_LOGIN, "1")
    },
  })
}
