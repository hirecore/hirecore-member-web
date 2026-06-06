// _entities/portfolio/model | 포트폴리오 영구 삭제 mutation
// DELETE /api/portfolios/{portfolioId} — hard delete, 204 No Content.
// 비멱등 — 재호출 시 404 PORTFOLIO_NOT_FOUND 가 떨어지므로 View 단에서 in-flight 중복 호출 가드 필요.
//
// 성공 시 ["portfolio","detail",id] / ["portfolio","edit",id] 캐시를 제거해
// stale 한 데이터가 다른 화면에서 노출되지 않도록 한다.
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deletePortfolio } from "@/_shared/api"

export function usePortfolioDelete(portfolioId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, unknown, void>({
    mutationFn: () => deletePortfolio(portfolioId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["portfolio", "detail", portfolioId] })
      queryClient.removeQueries({ queryKey: ["portfolio", "edit", portfolioId] })
    },
  })
}
