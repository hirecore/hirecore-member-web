"use client"

import type { PortfolioLink } from "@/_features/portfolio/lib"
import { AvatarPlaceholder } from "@/_shared/ui/avatar-placeholder"
import "./portfolio-meta-card.scss"

interface Props {
  majorLabel: string
  subCategory: string
  projectType: "personal" | "team"
  visibility: "public" | "private"
  title: string
  thumbnailUrl: string | null
  tags: string[]
  liked: boolean
  likeCount: number
  onLikeToggle: () => void
  externalLinks?: PortfolioLink[]
  /** 통계: 조회수 (미전달 시 0) */
  viewCount?: number
  /** 작성자 닉네임 — 미전달 시 "작성자" 노출 */
  publisher?: string
  /**
   * 하트(관심) 버튼 렌더 여부. 기본 true.
   * 본인 포트폴리오(isOwner=true) 인 경우 호출자가 false 로 지정해 DOM 에서 제거한다.
   * (관심 등록 정책상 본인 포트폴리오에는 등록 불가 — 비활성보다 제거가 의도 명확.)
   */
  showLikeButton?: boolean
}

export function PortfolioMetaCard({
  majorLabel, subCategory, projectType, visibility, title,
  thumbnailUrl, tags, liked, likeCount, onLikeToggle, externalLinks = [],
  viewCount = 0, publisher, showLikeButton = true,
}: Props) {
  const authorName = publisher || "작성자"
  return (
    <div className="pr-meta-card">

      {thumbnailUrl && (
        <div className="pr-meta-card__thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt="썸네일" className="pr-meta-card__thumb-img" />
        </div>
      )}

      <div className="pr-meta-card__type">
        <div className="pr-type-icon" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M2 12h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="pr-type-label">포트폴리오</span>
      </div>

      <div className="pr-meta-card__top">
        <div className="pr-meta-card__cats">
          <span className="pr-badge pr-badge--major">{majorLabel}</span>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path d="M3.5 2L7.5 5.5 3.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="pr-badge pr-badge--sub">{subCategory}</span>
        </div>
        <div className="pr-meta-card__right">
          <span className={`pr-badge pr-badge--type${projectType === "team" ? " pr-badge--team" : ""}`}>
            {projectType === "personal" ? "개인 프로젝트" : "팀 프로젝트"}
          </span>
          <span className={`pr-badge pr-badge--vis${visibility === "private" ? " pr-badge--private" : ""}`}>
            {visibility === "public" ? "공개" : "비공개"}
          </span>
          {showLikeButton && (
            <button
              type="button"
              className={`pr-like-btn${liked ? " pr-like-btn--active" : ""}`}
              onClick={onLikeToggle}
              aria-label={liked ? "관심 취소" : "관심 포트폴리오 등록"}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill={liked ? "currentColor" : "none"}>
                <path
                  d="M7 11.5S1.5 8 1.5 4.5a2.5 2.5 0 0 1 5.5-0.5A2.5 2.5 0 0 1 12.5 4.5C12.5 8 7 11.5 7 11.5Z"
                  stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"
                />
              </svg>
              관심
            </button>
          )}
        </div>
      </div>

      <h1 className="pr-meta-card__title">{title}</h1>

      {tags.length > 0 && (
        <div className="pr-meta-card__tags">
          {tags.map((t) => <span key={t} className="pr-tag">#{t}</span>)}
        </div>
      )}

      <div className="pr-meta-card__divider" aria-hidden />

      <div className="pr-meta-card__author">
        <AvatarPlaceholder name={authorName} size={44} />
        <div className="pr-meta-card__author-info">
          <span className="pr-meta-card__author-name">{authorName}</span>
          {externalLinks.length > 0 && (
            <div className="pr-meta-card__links">
              {externalLinks.map((link) => (
                <span key={link.label} className="pr-meta-link">
                  <span className="pr-meta-link__label">{link.label}</span>
                  <a
                    href={link.url}
                    className="pr-meta-link__val"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.url}
                  </a>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pr-meta-card__stats">
        <span className="pr-stat">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <ellipse cx="6.5" cy="6.5" rx="5" ry="3.5" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" />
          </svg>
          view · {viewCount}
        </span>
        <span className="pr-stat">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M6.5 10.5S1.5 7.5 1.5 4.5a2.5 2.5 0 0 1 5-0.5A2.5 2.5 0 0 1 11.5 4.5c0 3-5 6-5 6Z" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          관심 · {likeCount}
        </span>
      </div>

    </div>
  )
}
