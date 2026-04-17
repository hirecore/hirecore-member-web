"use client"

import { useState } from "react"
import type { PortfolioLink } from "@/_features/portfolio/lib"
import "./links-section.scss"

// 빠른 입력용 프리셋 레이블
const PRESET_LABELS = ["GitHub", "Figma", "Blog", "Notion", "YouTube", "Demo"]

interface Props {
  externalLinks: PortfolioLink[]
  onAdd: (link: PortfolioLink) => void
  onRemove: (index: number) => void
}

export function ExternalLinksSection({ externalLinks, onAdd, onRemove }: Props) {
  const [label, setLabel] = useState("")
  const [url,   setUrl]   = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const trimLabel = label.trim()
    const trimUrl   = url.trim()

    if (!trimLabel) { setError("레이블을 입력해주세요"); return }
    if (!trimUrl)   { setError("URL을 입력해주세요"); return }

    // 간단한 URL 형식 보정
    const finalUrl = /^https?:\/\//i.test(trimUrl) ? trimUrl : `https://${trimUrl}`

    if (externalLinks.length >= 6) { setError("링크는 최대 6개까지 추가할 수 있습니다"); return }

    onAdd({ label: trimLabel, url: finalUrl })
    setLabel("")
    setUrl("")
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd() }
  }

  return (
    <section className="pw-section pw-section--links">
      <div className="pw-section__head">
        <span className="pw-section__label">링크</span>
        <span className="pw-section__optional">선택</span>
        <span className="pw-section__hint">{externalLinks.length}/6</span>
      </div>

      {/* 프리셋 */}
      <div className="pls-presets">
        {PRESET_LABELS.map((p) => (
          <button
            key={p}
            type="button"
            className="pls-preset-btn"
            onClick={() => setLabel(p)}
            aria-label={`${p} 레이블 선택`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 입력 행 */}
      <div className="pls-input-row">
        <div className="pls-input-wrap pls-input-wrap--label">
          <input
            type="text"
            className="pls-input"
            placeholder="레이블 (예: GitHub)"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
            maxLength={20}
          />
        </div>
        <div className="pls-input-wrap pls-input-wrap--url">
          <input
            type="url"
            className="pls-input"
            placeholder="URL (예: https://github.com/...)"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          type="button"
          className="pls-add-btn"
          onClick={handleAdd}
          disabled={externalLinks.length >= 6}
          aria-label="링크 추가"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          추가
        </button>
      </div>

      {error && <p className="pls-error" role="alert">{error}</p>}

      {/* 추가된 링크 목록 */}
      {externalLinks.length > 0 && (
        <ul className="pls-list">
          {externalLinks.map((link, i) => (
            <li key={i} className="pls-item">
              <span className="pls-item__label">{link.label}</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pls-item__url"
              >
                {link.url}
              </a>
              <button
                type="button"
                className="pls-item__remove"
                onClick={() => onRemove(i)}
                aria-label={`${link.label} 링크 삭제`}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
