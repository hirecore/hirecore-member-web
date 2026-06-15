"use client"

import { forwardRef, useCallback } from "react"
import type { Editor } from "@tiptap/react"

import { useTiptapEditor } from "@/_features/editor/model/use-tiptap-editor.hook"
import { TableIcon } from "@/_features/editor/ui/icons/table-icon"
import type { ButtonProps } from "@/_features/editor/ui/primitives/button"
import { Button } from "@/_features/editor/ui/primitives/button"

export interface TableButtonProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null
  /** 기본 행 수 (헤더 포함). 기본 3 */
  rows?: number
  /** 기본 열 수. 기본 3 */
  cols?: number
  /** 헤더 행 포함 여부. 기본 false — 사용자가 셀 안에서 토글 */
  withHeaderRow?: boolean
  text?: string
}

/**
 * 표 삽입 버튼 — 기본 3×3 (헤더 행 포함) 표를 삽입.
 * 행/열 추가·삭제는 셀 안에서 뜨는 BubbleMenu 에서 처리.
 */
export const TableButton = forwardRef<HTMLButtonElement, TableButtonProps>(
  (
    {
      editor: providedEditor,
      rows = 3,
      cols = 3,
      withHeaderRow = false,
      text,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor)

    const canInsert =
      !!editor && editor.isEditable && editor.can().insertTable({ rows, cols, withHeaderRow })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        if (!editor) return
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run()
      },
      [editor, rows, cols, withHeaderRow, onClick],
    )

    if (!editor) return null

    return (
      <Button
        type="button"
        variant="ghost"
        role="button"
        tabIndex={-1}
        disabled={!canInsert}
        data-disabled={!canInsert}
        aria-label="표 삽입"
        tooltip="표"
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <TableIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  },
)

TableButton.displayName = "TableButton"
