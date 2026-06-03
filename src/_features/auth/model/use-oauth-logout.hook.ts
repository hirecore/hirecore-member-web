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
      // 현재 페이지 전체 리로드 — isOwner 등 사용자 컨텍스트 기반 UI(편집/삭제 버튼 등)가
      // 즉시 비로그인 상태로 갱신되도록 함. SSR 안전성을 위해 window 체크 후 호출.
      if (typeof window !== "undefined") {
        window.location.reload()
      }
    },
  })
}
