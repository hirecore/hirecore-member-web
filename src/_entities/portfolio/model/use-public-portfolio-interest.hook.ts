// _entities/portfolio/model | 공개 목록(무한 스크롤) 카드의 관심 토글 mutation
// POST   /api/portfolios/:id/interest — 관심 등록
// DELETE /api/portfolios/:id/interest — 관심 해제
//
// 상세 페이지용 usePortfolioInterestToggle 와 달리, 여기서는
// ["portfolio","summaries","public", …] 무한 스크롤 캐시의 해당 아이템을
// 옵티미스틱하게 갱신한다 (isInterested + interestCount). onError 에서 롤백.
// 두 엔드포인트 모두 멱등이므로 race condition 안전.
"use client"

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query"
import {
  registerPortfolioInterest,
  cancelPortfolioInterest,
  type PublicPortfolioSummariesResponse,
} from "@/_shared/api"

/** 무한 스크롤 캐시 프리픽스 — size 파라미터와 무관하게 모든 페이지 매칭 */
const PUBLIC_SUMMARIES_KEY = ["portfolio", "summaries", "public"] as const

type PublicInfiniteData = InfiniteData<PublicPortfolioSummariesResponse>

interface ToggleVars {
  portfolioId: string
  /** 토글 후 목표 상태 — true 등록, false 해제 */
  next: boolean
}

interface MutationContext {
  /** 롤백용 [queryKey, 이전 데이터] 스냅샷 목록 */
  snapshots: [QueryKey, PublicInfiniteData | undefined][]
}

export function usePublicPortfolioInterestToggle() {
  const queryClient = useQueryClient()

  return useMutation<ToggleVars, unknown, ToggleVars, MutationContext>({
    mutationFn: async ({ portfolioId, next }) => {
      if (next) await registerPortfolioInterest(portfolioId)
      else await cancelPortfolioInterest(portfolioId)
      return { portfolioId, next }
    },
    onMutate: async ({ portfolioId, next }) => {
      await queryClient.cancelQueries({ queryKey: PUBLIC_SUMMARIES_KEY })

      const snapshots = queryClient.getQueriesData<PublicInfiniteData>({
        queryKey: PUBLIC_SUMMARIES_KEY,
      })

      queryClient.setQueriesData<PublicInfiniteData>(
        { queryKey: PUBLIC_SUMMARIES_KEY },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((it) =>
                it.portfolioId === portfolioId && it.isInterested !== next
                  ? {
                      ...it,
                      isInterested: next,
                      interestCount: Math.max(0, it.interestCount + (next ? 1 : -1)),
                    }
                  : it
              ),
            })),
          }
        }
      )

      return { snapshots }
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
  })
}
