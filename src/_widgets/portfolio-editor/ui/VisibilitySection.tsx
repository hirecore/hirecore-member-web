"use client"

import { type Visibility } from "@/_shared/model"
import "./visibility-section.scss"

export type { Visibility }

interface Props {
  value: Visibility | null
  error?: string
  onChange: (value: Visibility) => void
}

const VISIBILITY_OPTS = [
  {
    id: "public" as Visibility,
    label: "공개",
    desc: "누구나 포트폴리오를 볼 수 있어요",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 10h15" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "private" as Visibility,
    label: "비공개",
    desc: "나만 볼 수 있어요",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="5" y="9" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function VisibilitySection({ value, error, onChange }: Props) {
  return (
    <section className="pw-section" id="field-visibility">
      <div className="pw-section__head">
        <span className="pw-section__label">공개 설정</span>
        <span className="pw-section__required">필수</span>
      </div>
      <div className="pw-visibility-opts">
        {VISIBILITY_OPTS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`pw-visibility-opt${value === opt.id ? " pw-visibility-opt--active" : ""}`}
            onClick={() => onChange(opt.id)}
          >
            <span className="pw-visibility-opt__icon">{opt.icon}</span>
            <span className="pw-visibility-opt__label">{opt.label}</span>
            <span className="pw-visibility-opt__desc">{opt.desc}</span>
            {value === opt.id && (
              <span className="pw-visibility-opt__check" aria-hidden>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2 6.5L5 9.5L11 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
      {error && <p className="pw-error">{error}</p>}
    </section>
  )
}
