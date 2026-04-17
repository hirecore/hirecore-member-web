"use client"

import { useState, useEffect, useRef } from "react"

interface Tags2RowProps {
  tags: string[]
  containerClass: string
  tagClass: string
  moreClass?: string
}

/**
 * ResizeObserver 기반 2행 제한 태그 렌더러.
 * 2행을 초과하는 태그는 "+N" 으로 대체.
 *
 * 오실레이션 방지:
 *   visibleCount 변화 → 컨테이너 height만 변경 → ResizeObserver 재트리거 → 루프
 *   → 측정 시 컨테이너 폭이 이전과 동일하면 생략하여 루프를 차단한다.
 *   (컨테이너 폭은 그리드 레이아웃이 결정하므로 태그 수와 무관하게 안정적이다.)
 */
export function Tags2Row({ tags, containerClass, tagClass, moreClass }: Tags2RowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(tags.length)
  const lastWidthRef = useRef<number>(-1)

  useEffect(() => {
    const container = containerRef.current
    if (!container || tags.length === 0) return

    // tags 변경 시 폭 캐시 초기화 → 강제 재측정
    lastWidthRef.current = -1

    const measure = () => {
      const currentWidth = container.offsetWidth
      // 폭이 변하지 않으면 생략 — 높이 변화에 의한 ResizeObserver 루프 방지
      if (currentWidth === lastWidthRef.current) return
      lastWidthRef.current = currentWidth

      const children = Array.from(container.children) as HTMLElement[]
      if (children.length === 0) return
      const firstTop = children[0].offsetTop
      const rowHeight = children[0].offsetHeight
      const maxBottom = firstTop + rowHeight * 2 + 4
      let last = 0
      for (let i = 0; i < children.length; i++) {
        if (children[i].offsetTop <= maxBottom) last = i + 1
        else break
      }
      setVisibleCount(last)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [tags])

  const hidden = tags.length - visibleCount
  const resolvedMoreClass = moreClass ?? `${tagClass}--more`

  return (
    <div className={containerClass} ref={containerRef}>
      {tags.slice(0, visibleCount).map((tag) => (
        <span key={tag} className={tagClass}>#{tag}</span>
      ))}
      {hidden > 0 && <span className={resolvedMoreClass}>+{hidden}</span>}
    </div>
  )
}
