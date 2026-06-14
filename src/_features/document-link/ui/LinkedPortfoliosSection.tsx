"use client"

/**
 * LinkedPortfoliosSection — 이력서/자기소개서 작성 시 포트폴리오 연결 선택 UI
 * 사용자의 포트폴리오 목록을 카드 형태로 보여주고, 연결할 항목을 토글 선택.
 */

import Link from "next/link"
import { USER_ROUTES } from "@/_shared/config"
import "./linked-portfolios-section.scss"

export interface LinkablePortfolio {
  id: string
  title: string
  thumbnailUrl: string | null
  tags: string[]
}

interface Props {
  portfolios: LinkablePortfolio[]
  linkedIds: string[]
  onChange: (ids: string[]) => void
}

function DefaultThumb({ title }: { title: string }) {
  const c0 = title.charCodeAt(0) || 65
  const c1 = title.charCodeAt(1) || 90
  const hue = (c0 * 47 + c1 * 19) % 360
  const hue2 = (hue + 55) % 360
  return (
    <div
      className="lps-card__thumb-default"
      style={{ background: `linear-gradient(140deg, hsl(${hue} 68% 52%), hsl(${hue2} 72% 38%))` }}
      aria-hidden
    >
      {title.slice(0, 1)}
    </div>
  )
}

export function LinkedPortfoliosSection({ portfolios, linkedIds, onChange }: Props) {
  const toggle = (id: string) => {
    if (linkedIds.includes(id)) {
      onChange(linkedIds.filter((v) => v !== id))
    } else {
      onChange([...linkedIds, id])
    }
  }

  return (
    <div className="lps-root">
      <p className="lps-hint">
        이 문서와 연결할 포트폴리오를 선택하세요.
        {linkedIds.length > 0 && (
          <span className="lps-count"> · {linkedIds.length}개 선택됨</span>
        )}
      </p>

      {portfolios.length === 0 ? (
        <div className="lps-empty">
          <div className="lps-empty__icon" aria-hidden>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="3" y="6" width="26" height="20" rx="3" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3 12h26" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="11" cy="20" r="2.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M3 28l7-6 5 4 4-4 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <p className="lps-empty__msg">아직 등록된 포트폴리오가 없어요.</p>
          <Link href={USER_ROUTES.portfolio.write} className="lps-empty__link">
            포트폴리오 작성하기 →
          </Link>
        </div>
      ) : (
        <div className="lps-grid">
          {portfolios.map((p) => {
            const selected = linkedIds.includes(p.id)
            return (
              <button
                key={p.id}
                type="button"
                className={`lps-card${selected ? " lps-card--selected" : ""}`}
                onClick={() => toggle(p.id)}
                aria-pressed={selected}
                title={p.title}
              >
                {selected && (
                  <span className="lps-card__check" aria-hidden>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5L3.8 7.5L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                <div className="lps-card__thumb">
                  {p.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnailUrl} alt={p.title} />
                  ) : (
                    <DefaultThumb title={p.title} />
                  )}
                </div>
                <div className="lps-card__info">
                  <span className="lps-card__title">{p.title}</span>
                  {p.tags.length > 0 && (
                    <div className="lps-card__tags">
                      {p.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="lps-card__tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
