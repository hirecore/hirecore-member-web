"use client"

import { useMemo, useRef, useState } from "react"
import { type Editor } from "@tiptap/react"

import { useMenuNavigation } from "@/_features/editor/model/use-menu-navigation.hook"
import { useIsBreakpoint } from "@/_features/editor/model/use-is-breakpoint.hook"
import { useTiptapEditor } from "@/_features/editor/model/use-tiptap-editor.hook"

import { BanIcon } from "@/_features/editor/ui/icons/ban-icon"
import { TextColorIcon } from "@/_features/editor/ui/icons/text-color-icon"

import type { ButtonProps } from "@/_features/editor/ui/primitives/button"
import { Button, ButtonGroup } from "@/_features/editor/ui/primitives/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/_features/editor/ui/primitives/popover"
import { Separator } from "@/_features/editor/ui/primitives/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/_features/editor/ui/primitives/card"

import "./text-color-popover.scss"

// ── 팔레트 색상 정의 ────────────────────────────────────────────────────
export const TEXT_COLORS = [
  { label: "빨강",   value: "#ef4444" },
  { label: "주황",   value: "#f97316" },
  { label: "노랑",   value: "#eab308" },
  { label: "초록",   value: "#22c55e" },
  { label: "파랑",   value: "#3b82f6" },
  { label: "보라",   value: "#a855f7" },
  { label: "회색",   value: "#6b7280" },
] as const

export type TextColor = (typeof TEXT_COLORS)[number]

// ── 현재 에디터 selection에 적용된 글씨 색상 가져오기 ──────────────────
function getActiveTextColor(editor: Editor | null): string | null {
  if (!editor) return null
  const color = editor.getAttributes("textStyle").color as string | undefined
  return color ?? null
}

// ── TextColorPopoverContent ─────────────────────────────────────────────
export function TextColorPopoverContent({
  editor: providedEditor,
}: {
  editor?: Editor | null
}) {
  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsBreakpoint()
  const containerRef = useRef<HTMLDivElement>(null)

  const menuItems = useMemo(
    () => [...TEXT_COLORS, { label: "색상 제거", value: "none" }],
    []
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlighted = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement
      if (highlighted) highlighted.click()
      if (item.value === "none") {
        editor?.chain().focus().unsetColor().run()
      }
      return true
    },
    autoSelectFirstItem: false,
  })

  const activeColor = getActiveTextColor(editor ?? null)

  const handleApply = (color: string) => {
    editor?.chain().focus().setColor(color).run()
  }

  const handleRemove = () => {
    editor?.chain().focus().unsetColor().run()
  }

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup orientation="horizontal">
            {TEXT_COLORS.map((color, index) => (
              <Button
                key={color.value}
                type="button"
                variant="ghost"
                role="button"
                tabIndex={index === selectedIndex ? 0 : -1}
                data-highlighted={selectedIndex === index}
                data-active-state={activeColor === color.value ? "on" : "off"}
                aria-label={`${color.label} 글씨 색상`}
                aria-pressed={activeColor === color.value}
                tooltip={color.label}
                onClick={() => handleApply(color.value)}
                style={{ "--text-color": color.value } as React.CSSProperties}
                className="tiptap-text-color-btn"
              >
                <span
                  className="tiptap-text-color-swatch"
                  style={{ background: color.value }}
                />
              </Button>
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation="horizontal">
            <Button
              onClick={handleRemove}
              aria-label="색상 제거"
              tooltip="색상 제거"
              tabIndex={selectedIndex === TEXT_COLORS.length ? 0 : -1}
              type="button"
              role="menuitem"
              variant="ghost"
              data-highlighted={selectedIndex === TEXT_COLORS.length}
            >
              <BanIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

// ── TextColorPopover (trigger + content) ───────────────────────────────
export function TextColorPopover({
  editor: providedEditor,
  ...props
}: Omit<ButtonProps, "type"> & { editor?: Editor | null }) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = useState(false)

  const activeColor = getActiveTextColor(editor ?? null)
  const canApply = !!editor?.isEditable && !editor.isActive("code")

  if (!editor?.isEditable) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          data-appearance="default"
          role="button"
          tabIndex={-1}
          disabled={!canApply}
          data-active-state={activeColor ? "on" : "off"}
          aria-pressed={!!activeColor}
          aria-label="글씨 색상"
          tooltip="글씨 색상"
          style={
            {
              "--text-color-indicator": activeColor ?? "currentColor",
            } as React.CSSProperties
          }
          {...props}
        >
          <TextColorIcon className="tiptap-button-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent aria-label="텍스트 색상">
        <TextColorPopoverContent editor={editor} />
      </PopoverContent>
    </Popover>
  )
}

export default TextColorPopover
