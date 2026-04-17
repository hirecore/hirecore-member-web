"use client"

// _shared/ui/preview-action-bar | 문서 미리보기 액션 바 (이력서 · 자기소개서 · 포트폴리오 공용)
// 비즈니스 로직 없음 — 표현만 담당
import "./preview-action-bar.scss"

export interface PreviewActionBarProps {
  /** 등록하기 콜백. 없으면 버튼 미노출 */
  onSubmit?: () => void
  onEdit: () => void
  /** 등록 버튼 레이블 (기본 "등록하기") */
  submitLabel?: string
  /** 등록 버튼 강조색 — 이력서: green, 자기소개서: amber */
  accentColor?: "green" | "amber"
}

export function PreviewActionBar({
  onEdit,
  onSubmit,
  submitLabel = "등록하기",
  accentColor = "green",
}: PreviewActionBarProps) {
  return (
    <div className="preview-ab">
      <span className="preview-ab__badge">임시</span>
      <div className="preview-ab__actions">
        <button type="button" className="preview-ab__edit" onClick={onEdit}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path
              d="M9.5 1.5l2 2-7 7H2.5v-2l7-7Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          편집하기
        </button>

        {onSubmit && (
          <button
            type="button"
            className={`preview-ab__submit preview-ab__submit--${accentColor}`}
            onClick={onSubmit}
          >
            {submitLabel}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path
                d="M3 6.5h7M7 3l3.5 3.5L7 10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
