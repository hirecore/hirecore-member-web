"use client"

/**
 * PortfolioLinkedDocsTab — 포트폴리오 상세 탭에서 연결된 이력서 / 자기소개서 표시
 * type="resume"   → 이력서 탭
 * type="coverletter" → 자기소개서 탭
 */

import Link from "next/link"
import { USER_ROUTES } from "@/_shared/config"
import "./portfolio-linked-docs-tab.scss"

export interface LinkedDoc {
  id: string
  title: string
  excerpt?: string
  author: { name: string; profileImageUrl: string | null }
  updatedAt: string
  type: "resume" | "coverletter"
}

interface Props {
  type: "resume" | "coverletter"
  docs: LinkedDoc[]
}

function AvatarPlaceholder({ name }: { name: string }) {
  const hue = (name.charCodeAt(0) * 37) % 360
  return (
    <div
      className="pldt-card__avatar"
      style={{ background: `hsl(${hue} 65% 55%)` }}
      aria-hidden
    >
      {name.slice(0, 1)}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  })
}

const CONFIG = {
  resume: {
    typeLabel:   "이력서",
    badgeMod:    "pldt-card__type-badge--resume",
    emptyTitle:  "연결된 이력서가 없어요",
    emptyDesc:   "이 포트폴리오를 이력서에 연결하면 여기에 표시됩니다. 이력서를 작성하고 포트폴리오와 연결해보세요.",
    ctaLabel:    "이력서 작성하기",
    ctaHref:     USER_ROUTES.resume.write,
  },
  coverletter: {
    typeLabel:   "자기소개서",
    badgeMod:    "pldt-card__type-badge--coverletter",
    emptyTitle:  "연결된 자기소개서가 없어요",
    emptyDesc:   "이 포트폴리오를 자기소개서에 연결하면 여기에 표시됩니다. 자기소개서를 작성하고 포트폴리오와 연결해보세요.",
    ctaLabel:    "자기소개서 작성하기",
    ctaHref:     USER_ROUTES.coverletter.write,
  },
} as const

export function PortfolioLinkedDocsTab({ type, docs }: Props) {
  const cfg = CONFIG[type]

  if (docs.length === 0) {
    return (
      <div className="pldt-root">
        <div className="pldt-empty">
          <div className="pldt-empty__icon" aria-hidden>
            {type === "resume" ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 9l10 7 10-7" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </div>
          <p className="pldt-empty__title">{cfg.emptyTitle}</p>
          <p className="pldt-empty__desc">{cfg.emptyDesc}</p>
          <Link href={cfg.ctaHref} className="pldt-empty__cta">
            {cfg.ctaLabel}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2.5 6h7M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pldt-root">
      <div className="pldt-list">
        {docs.map((doc) => (
          <Link key={doc.id} href="#" className="pldt-card">
            <div className="pldt-card__top">
              <span className={`pldt-card__type-badge ${cfg.badgeMod}`}>{cfg.typeLabel}</span>
              <time className="pldt-card__date" dateTime={doc.updatedAt}>{formatDate(doc.updatedAt)}</time>
            </div>
            <p className="pldt-card__title">{doc.title}</p>
            {doc.excerpt && <p className="pldt-card__excerpt">{doc.excerpt}</p>}
            <div className="pldt-card__author">
              {doc.author.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doc.author.profileImageUrl} alt={doc.author.name} className="pldt-card__avatar" style={{ width: "1.25rem", height: "1.25rem", objectFit: "cover" }} />
              ) : (
                <AvatarPlaceholder name={doc.author.name} />
              )}
              <span className="pldt-card__author-name">{doc.author.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
