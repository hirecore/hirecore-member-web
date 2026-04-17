"use client"

import "./view-toggle.scss"

interface ViewToggleProps {
  viewMode: "grid" | "list"
  onToggle: (mode: "grid" | "list") => void
  /** active 버튼 색상 (기본: #374151) */
  activeColor?: string
  className?: string
}

export function ViewToggle({
  viewMode,
  onToggle,
  activeColor = "#374151",
  className,
}: ViewToggleProps) {
  return (
    <div
      className={["view-toggle", className].filter(Boolean).join(" ")}
      role="group"
      aria-label="보기 방식"
      style={{ "--vt-active": activeColor } as React.CSSProperties}
    >
      <button
        type="button"
        className={`view-toggle__btn${viewMode === "list" ? " view-toggle__btn--active" : ""}`}
        onClick={() => onToggle("list")}
        title="리스트 보기"
        aria-pressed={viewMode === "list"}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="1" y="2" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          <rect x="1" y="6.5" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          <rect x="1" y="11" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        </svg>
      </button>
      <button
        type="button"
        className={`view-toggle__btn${viewMode === "grid" ? " view-toggle__btn--active" : ""}`}
        onClick={() => onToggle("grid")}
        title="그리드 보기"
        aria-pressed={viewMode === "grid"}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        </svg>
      </button>
    </div>
  )
}
