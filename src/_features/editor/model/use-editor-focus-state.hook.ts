// _features/editor/model | 에디터 포커스 상태 추적 훅
// 카드 테두리 하이라이트 등 에디터 연동 UI에 필요한 focus/blur 상태를 관리한다.
// blur 지연(200ms)으로 포커스가 에디터 내 도구로 이동할 때 깜빡임을 방지한다.
import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/react"

/** blur → focused=false 사이의 대기 시간 — 툴바 클릭 시 깜빡임 방지 */
const BLUR_DEBOUNCE_MS = 200

/**
 * TipTap editor instance의 focus/blur 상태를 추적한다.
 * @returns editorFocused — true이면 에디터가 현재 포커스 상태
 */
export function useEditorFocusState(editor: Editor | null): boolean {
  const [editorFocused, setEditorFocused] = useState(false)
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!editor) return
    const onFocus = () => {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
      setEditorFocused(true)
    }
    const onBlur = () => {
      blurTimerRef.current = setTimeout(() => setEditorFocused(false), BLUR_DEBOUNCE_MS)
    }
    editor.on("focus", onFocus)
    editor.on("blur",  onBlur)
    return () => {
      editor.off("focus", onFocus)
      editor.off("blur",  onBlur)
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
    }
  }, [editor])

  return editorFocused
}
