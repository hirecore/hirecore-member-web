"use client"

import { Button } from "@/_shared/ui/button"
import "./write-action-bar.scss"

interface WriteActionBarProps {
  onPreview: () => void
  onSubmit: () => void
  submitLabel?: string
}

export function WriteActionBar({ onPreview, onSubmit, submitLabel = "등록하기" }: WriteActionBarProps) {
  return (
    <div className="write-action-bar">
      <div className="write-action-bar__inner">
        <Button variant="ghost" size="md" onClick={onPreview}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="7" cy="7" r="1.75" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          미리보기
        </Button>
        <Button variant="primary" size="md" onClick={onSubmit}>
          {submitLabel}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
