// _entities/portfolio/model | 포트폴리오 관심 토글 mutation
// POST   /api/portfolios/:id/interest — 관심 등록
// DELETE /api/portfolios/:id/interest — 관심 해제
//
// 옵티미스틱 업데이트 패턴: onMutate 에서 ["portfolio","detail",id] 캐시를 즉시 갱신하고
// onError 에서 이전 스냅샷으로 롤백. 두 엔드포인트 모두 멱등이므로 race condition 안전.
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  registerPortfolioInterest,
  cancelPortfolioInterest,
} from "@/_shared/api"
import type { PortfolioDetail } from "./use-portfolio-detail.hook"

interface MutationContext {
  previous: PortfolioDetail | undefined
}

export function usePortfolioInterestToggle(portfolioId: string) {
  const queryClient = useQueryClient()
  const queryKey = ["portfolio", "detail", portfolioId] as const

  return useMutation<boolean, unknown, boolean, MutationContext>({
    mutationFn: async (next) => {
      if (next) await registerPortfolioInterest(portfolioId)
      else await cancelPortfolioInterest(portfolioId)
      return next
    },
    onMutate: async (next) => {
      // 진행 중인 refetch 가 옵티미스틱 업데이트를 덮어쓰지 못하도록 취소
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<PortfolioDetail>(queryKey)
      queryClient.setQueryData<PortfolioDetail>(queryKey, (old) => {
        if (!old) return old
        const delta = next ? 1 : -1
        return {
          ...old,
          isInterested: next,
          interestCount: Math.max(0, old.interestCount + delta),
        }
      })
      return { previous }
    },
    onError: (_err, _next, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
  })
}
