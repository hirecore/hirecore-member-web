"use client"

// _features/editor/model | 미리보기 복귀 시 에디터 콘텐츠 복원 훅
// write 뷰에서 미리보기 → "편집하기"로 복귀할 때 draft store의 previewData.content를 에디터에 주입.
// resume·coverletter·portfolio write 뷰가 동일한 12줄 effect를 반복하는 것을 단일 훅으로 통합.

import { useEffect, type RefObject } from "react"
import type { Editor } from "@tiptap/core"
import type { JSONContent } from "@tiptap/core"

interface UseEditorContentRestoreOptions {
  editor: Editor | null
  /** 미리보기에서 돌아온 경우 true로 설정되는 ref */
  editorRestoreAllowedRef: RefObject<boolean>
  /** pendingDraft가 있을 때는 복원 건너뜀 (드래프트 복원 모달이 우선) */
  isPending: boolean
  /** draft store의 previewData.content를 반환 */
  getPreviewContent: () => JSONContent | undefined
  /** 콘텐츠 주입 후 호출 (예: calcEditorSessionBytes) */
  onRestored?: () => void
}

export function useEditorContentRestore({
  editor, editorRestoreAllowedRef, isPending, getPreviewContent, onRestored,
}: UseEditorContentRestoreOptions) {
  useEffect(() => {
    if (!editor) return
    if (!editorRestoreAllowedRef.current) return
    if (isPending) return
    const content = getPreviewContent()
    if (content) {
      editor.commands.setContent(content)
      onRestored?.()
    }
  // mount 시점 editor가 null이므로 editor 변경 시점에만 실행 — 다른 의존성 추가 시 매번 재복원 위험
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])
}
