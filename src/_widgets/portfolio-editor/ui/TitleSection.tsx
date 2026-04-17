"use client"

import "./title-section.scss"

interface Props {
  value: string
  error?: string
  onChange: (value: string) => void
}

export function TitleSection({ value, error, onChange }: Props) {
  return (
    <section className="pw-section" id="field-title">
      <div className="pw-section__head">
        <span className="pw-section__label">포스팅 제목</span>
        <span className="pw-section__required">필수</span>
      </div>
      <input
        type="text"
        className="pw-post-title__input"
        placeholder="포트폴리오 제목을 입력하세요"
        value={value}
        maxLength={80}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="pw-post-title__meta">
        {error && <p className="pw-error" style={{ margin: 0 }}>{error}</p>}
        <span className="pw-char-count">{value.length}/80</span>
      </div>
    </section>
  )
}
