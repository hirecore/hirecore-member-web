"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import type { SuggestionProps } from "@tiptap/suggestion"
import type { SlashCommandItem } from "./slash-command-extension"
import "./slash-command-menu.scss"

interface SlashCommandMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export const SlashCommandMenu = forwardRef<
  SlashCommandMenuHandle,
  SuggestionProps<SlashCommandItem>
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedRef = useRef<HTMLButtonElement>(null)
  const items = props.items

  useEffect(() => setSelectedIndex(0), [items])

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((i) => (i - 1 + items.length) % items.length)
        return true
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((i) => (i + 1) % items.length)
        return true
      }
      if (event.key === "Enter") {
        const item = items[selectedIndex]
        if (item) props.command(item)
        return true
      }
      return false
    },
  }))

  if (!items.length) {
    return (
      <div className="scm-wrap">
        <p className="scm-empty">일치하는 항목이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="scm-wrap" role="listbox" aria-label="블록 유형 선택">
      <p className="scm-section-label">블록 유형</p>
      {items.map((item, index) => {
        const isSelected = index === selectedIndex
        return (
          <button
            key={item.title}
            ref={isSelected ? selectedRef : null}
            role="option"
            aria-selected={isSelected}
            className={`scm-item${isSelected ? " scm-item--selected" : ""}`}
            onClick={() => props.command(item)}
            onMouseEnter={() => setSelectedIndex(index)}
            type="button"
          >
            <span className="scm-icon">{item.icon}</span>
            <div className="scm-text">
              <span className="scm-title">{item.title}</span>
              <span className="scm-desc">{item.description}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
})

SlashCommandMenu.displayName = "SlashCommandMenu"
