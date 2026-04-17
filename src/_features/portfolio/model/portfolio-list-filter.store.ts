// _features/portfolio/model | 포트폴리오 목록 필터 reset 트리거
// MainHeader의 HireCore 로고 클릭 → 홈 목록 페이지의 필터/검색 상태를 초기화하기 위한 신호.
// 전역 이벤트나 prop drilling 없이, view에서 useEffect로 resetVersion 변경을 감지해 state 리셋한다.

import { create } from "zustand"

interface PortfolioListFilterState {
  /** reset 신호 카운터 — 변경되면 view가 필터/검색을 초기화 */
  resetVersion: number
  triggerReset: () => void
}

export const usePortfolioListFilterStore = create<PortfolioListFilterState>((set) => ({
  resetVersion: 0,
  triggerReset: () => set((s) => ({ resetVersion: s.resetVersion + 1 })),
}))
