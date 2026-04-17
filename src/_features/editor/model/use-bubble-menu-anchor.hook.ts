// _features/editor/model | 버블 메뉴 가상 앵커 / drag 감지 훅
// 텍스트 드래그 선택 중 버블 툴바 위치 좌표를 안정화한다.
// mouseup 시점의 selection 좌표를 고정(fixedRect)해 툴바 위치 flicker를 방지한다.
import { useCallback, useEffect, useRef } from "react"
import type { Editor } from "@tiptap/react"

/** virtual element — Floating UI / Popper의 reference 역할을 하는 최소 인터페이스 */
interface VirtualElement {
  getBoundingClientRect: () => DOMRect
}

export interface BubbleMenuAnchor {
  /** drag 진행 중 여부 ref — BubbleMenu shouldShow 조건에서 드래그 중 숨김에 사용 */
  isDraggingRef: React.MutableRefObject<boolean>
  /** selection 좌표가 고정된 virtual element — null이면 표시 안 함 */
  getVirtualElement: () => VirtualElement | null
}

/**
 * TipTap editor에서 drag-selection 완료 시점의 좌표를 고정해 버블 툴바 앵커로 제공한다.
 */
export function useBubbleMenuAnchor(editor: Editor | null): BubbleMenuAnchor {
  const fixedRectRef  = useRef<DOMRect | null>(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!editor) return
    const dom = editor.view.dom
    const onMouseDown = () => { isDraggingRef.current = true }
    const onMouseUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      const { from, to } = editor.state.selection
      if (from === to) return
      const coords = editor.view.coordsAtPos(from)
      fixedRectRef.current = new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top)
    }
    dom.addEventListener("mousedown", onMouseDown)
    document.addEventListener("mouseup", onMouseUp, { capture: true })
    return () => {
      dom.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup", onMouseUp, { capture: true })
    }
  }, [editor])

  const getVirtualElement = useCallback(
    () => fixedRectRef.current ? { getBoundingClientRect: () => fixedRectRef.current! } : null,
    []
  )

  return { isDraggingRef, getVirtualElement }
}
