"use client"

import { useCallback, useEffect, useRef } from "react"
import { BubbleMenu } from "@tiptap/react/menus"
import type { Editor } from "@tiptap/core"
import { isTextSelection } from "@tiptap/core"

import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  MarkButton,
  ColorHighlightPopover,
  TextColorPopover,
  LinkPopover,
  TextAlignButton,
} from "@/_features/editor"

interface BubbleToolbarProps {
  editor: Editor
}

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const fixedRectRef = useRef<DOMRect | null>(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    const editorDom = editor.view.dom

    const handleMouseDown = () => {
      isDraggingRef.current = true
    }

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false

      const { from, to } = editor.state.selection
      if (from === to) return

      // 드래그가 끝난 시점의 선택 시작 위치를 고정
      const coords = editor.view.coordsAtPos(from)
      fixedRectRef.current = new DOMRect(
        coords.left,
        coords.top,
        0,
        coords.bottom - coords.top,
      )
    }

    editorDom.addEventListener("mousedown", handleMouseDown)
    // capture: true — ProseMirror의 selectionUpdate보다 먼저 실행되어
    // isDraggingRef.current = false 로 리셋 후 shouldShow가 평가됨
    document.addEventListener("mouseup", handleMouseUp, { capture: true })

    return () => {
      editorDom.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp, { capture: true })
    }
  }, [editor])

  const getVirtualElement = useCallback(
    () =>
      fixedRectRef.current
        ? { getBoundingClientRect: () => fixedRectRef.current! }
        : null,
    [],
  )

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }) => {
        const { selection } = state
        // 텍스트 선택일 때만 표시 (이미지 등 NodeSelection 제외)
        if (!isTextSelection(selection)) return false
        const { from, to } = selection
        return from !== to && !isDraggingRef.current
      }}
      getReferencedVirtualElement={getVirtualElement}
      options={{ placement: "top" }}
    >
      <Toolbar variant="floating">
        <ToolbarGroup>
          <MarkButton type="bold" />
          <MarkButton type="italic" />
          <MarkButton type="underline" />
          <MarkButton type="strike" />
          <MarkButton type="code" />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ColorHighlightPopover />
          <TextColorPopover />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <TextAlignButton align="left" />
          <TextAlignButton align="center" />
          <TextAlignButton align="right" />
          <TextAlignButton align="justify" />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <LinkPopover />
        </ToolbarGroup>
      </Toolbar>
    </BubbleMenu>
  )
}
