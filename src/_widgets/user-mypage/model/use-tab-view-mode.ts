// _widgets/user-mypage/model | 탭별 뷰 모드(grid/list) localStorage 저장·복원
// Portfolio·Resume·CoverLetter 3개 탭에 동일한 5줄 패턴이 중복되므로 단일 hook으로 분리
import { useState, useEffect } from "react"

type ViewMode = "grid" | "list"

export function useTabViewMode(storageKey: string) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved === "grid" || saved === "list") setViewMode(saved)
  }, [storageKey])

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    localStorage.setItem(storageKey, mode)
  }

  return { viewMode, handleViewMode }
}
