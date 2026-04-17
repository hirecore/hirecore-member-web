"use client"

// _shared/model | 브라우저 UI 부수효과 훅 (스크롤 잠금, ESC 닫기)
// lib/가 아닌 model/에 위치하는 이유: 상태·이벤트 구독을 동반하는 훅이므로 FSD §5 기준 model 세그먼트에 속함
import { useEffect } from "react"

/**
 * 모달 오픈 시 body 스크롤 잠금 + ESC 키 닫기 처리
 * @param isOpen  true이면 body scroll lock 활성화
 * @param onEscape ESC 키 입력 시 호출할 콜백 (생략 가능)
 */
export function useBodyLock(isOpen: boolean, onEscape?: () => void): void {
  useEffect(() => {
    if (!isOpen) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape?.()
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handler)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handler)
    }
  }, [isOpen, onEscape])
}
