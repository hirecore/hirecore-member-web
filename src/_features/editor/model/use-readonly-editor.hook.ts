"use client"

// _features/editor/model | 읽기 전용 에디터 훅
// 읽기·미리보기 뷰에서 공통으로 사용하는 Tiptap 에디터를 초기화하고 콘텐츠를 주입한다.
// 13줄 import + 12줄 config + 3줄 effect = ~28줄을 1줄 호출로 대체.

import { useEffect } from "react"
import { useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/core"
import { READONLY_EXTENSIONS, READONLY_TEXT_EXTENSIONS } from "../extensions/editor-presets"

interface UseReadOnlyEditorOptions {
  /** 에디터에 주입할 콘텐츠 — 변경 시 자동 업데이트 */
  content?: JSONContent | null
  /** true면 ResizableImage/ImageCarousel 포함 (이력서·포트폴리오), false면 텍스트 전용 (자기소개서) */
  includeImages?: boolean
}

export function useReadOnlyEditor({ content, includeImages = true }: UseReadOnlyEditorOptions = {}) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    content: null,
    extensions: includeImages ? READONLY_EXTENSIONS : READONLY_TEXT_EXTENSIONS,
  })

  // 데이터 로드 완료 후 에디터에 콘텐츠 주입
  useEffect(() => {
    if (editor && content) editor.commands.setContent(content)
  }, [editor, content])

  return editor
}
