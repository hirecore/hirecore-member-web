"use client"

import Link from "next/link"
import { Tags2Row } from "@/_shared/ui/tags-row"
import { USER_ROUTES } from "@/_shared/config"
import { getCategoryPath, isCustomInputCategory } from "@/_features/portfolio/lib"
import type { Portfolio, PortfolioCardLink } from "../model/types"

export type { Portfolio, PortfolioCardLink }

/** 3-level 카테고리 코드 → { l1, l2, l3 } 라벨로 변환.
 *  "기타(직접입력)"이면 l3 자리에 customCategory 표시.
 */
function resolveCategoryLabels(categoryCode: string, customCategory?: string) {
  const path = getCategoryPath(categoryCode)
  const l1 = path[0]?.name ?? ""
  const l2 = path[1]?.name ?? ""
  if (isCustomInputCategory(categoryCode) && customCategory) {
    return { l1, l2, l3: customCategory }
  }
  const l3 = path[2]?.name ?? ""
  return { l1, l2, l3 }
}

/** 카테고리 표시 — L1(분야) 배지 + L3(직무) 강조 배지.
 *  L2는 카드에서 생략 (상세 페이지에서 전체 경로 노출).
 *  L3는 brand color로 prominent하게 표시되어 직무가 한눈에 들어오도록 한다.
 */
function CategoryLine({ l1, l3 }: { l1: string; l3: string }) {
  if (!l1 && !l3) return null
  return (
    <div className="pl-cat-line">
      {l1 && <span className="pl-cat-line__field">{l1}</span>}
      {l3 && <span className="pl-cat-line__job">{l3}</span>}
    </div>
  )
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function formatUpdatedAt(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  })
}

function DefaultThumbnail({ title }: { title: string }) {
  const c0 = title.charCodeAt(0) || 65
  const c1 = title.charCodeAt(1) || 90
  const hue = (c0 * 47 + c1 * 19) % 360
  const hue2 = (hue + 55) % 360
  return (
    <div
      className="pl-card__thumb-default"
      style={{ background: `linear-gradient(140deg, hsl(${hue} 68% 52%), hsl(${hue2} 72% 38%))` }}
      aria-hidden
    >
      <span className="pl-card__thumb-letter">{title.slice(0, 1)}</span>
    </div>
  )
}

function AvatarPlaceholder({ name }: { name: string }) {
  const hue = (name.charCodeAt(0) * 37) % 360
  return (
    <div
      className="pl-avatar-placeholder"
      style={{ background: `hsl(${hue} 65% 55%)` }}
      aria-hidden
    >
      {name.slice(0, 1)}
    </div>
  )
}

interface PortfolioCardProps {
  item: Portfolio
  liked: boolean
  onLike: () => void
}

/* ── 리스트 뷰 카드 (가로형) ── */
export function PortfolioRowCard({ item, liked, onLike }: PortfolioCardProps) {
  const { l1, l3 } = resolveCategoryLabels(item.categoryCode, item.customCategory)
  return (
    <article className="pl-row-card">

      {/* 썸네일 */}
      <Link href={`/portfolio/${item.id}`} className="pl-row-card__thumb-link" tabIndex={-1} aria-hidden>
        <div className="pl-row-card__thumb">
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.thumbnailUrl} alt={item.title} className="pl-row-card__thumb-img" />
          ) : (
            <DefaultThumbnail title={item.title} />
          )}
        </div>
      </Link>

      {/* 본문 */}
      <div className="pl-row-card__body">
        <div className="pl-row-card__top">

          {/* 카테고리 + 유형 배지 */}
          <div className="pl-row-card__badges">
            <CategoryLine l1={l1} l3={l3} />
            <span className={`pl-badge pl-badge--type${item.projectType === "team" ? " pl-badge--team" : ""}`}>
              {item.projectType === "personal" ? "개인" : "팀"}
            </span>
          </div>

          {/* 통계 + 관심 */}
          <div className="pl-row-card__right">
            <span className="pl-stat">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <ellipse cx="6" cy="6" rx="4.5" ry="3" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="6" cy="6" r="1.3" fill="currentColor" />
              </svg>
              {formatCount(item.viewCount)}
            </span>
            {/* 관심 수 */}
            <span className={`pl-stat pl-stat--like${liked ? " pl-stat--like-active" : ""}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} aria-hidden>
                <path d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14 14 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              {formatCount(item.likeCount + (liked ? 1 : 0))}
            </span>
            <button
              type="button"
              className={`pl-like-btn${liked ? " pl-like-btn--active" : ""}`}
              onClick={(e) => { e.preventDefault(); onLike() }}
              aria-label={liked ? "관심 취소" : "관심 포트폴리오 등록"}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill={liked ? "currentColor" : "none"}>
                <path d="M6 10.5S1 7.5 1 4.5a2.5 2.5 0 0 1 5 0A2.5 2.5 0 0 1 11 4.5c0 3-5 6-5 6Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
              </svg>
              관심
            </button>
          </div>
        </div>

        {/* 제목 */}
        <Link href={`/portfolio/${item.id}`} className="pl-row-card__title-link">
          <h2 className="pl-row-card__title">{item.title}</h2>
        </Link>

        {/* 본문 미리보기 */}
        {item.excerpt && <p className="pl-row-card__excerpt">{item.excerpt}</p>}

        {/* 태그 */}
        {item.tags.length > 0 && (
          <Tags2Row
            tags={item.tags}
            containerClass="pl-row-card__tags"
            tagClass="pl-tag"
            moreClass="pl-tag pl-tag--more"
          />
        )}

        {/* 링크 */}
        {item.externalLinks && item.externalLinks.length > 0 && (
          <div className="pl-row-card__links">
            {item.externalLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pl-link-chip"
                onClick={(e) => e.stopPropagation()}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* 구분선 + 작성자 + 날짜 */}
        <div className="pl-row-card__footer">
          <div className="pl-card__author">
            {item.author.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.author.profileImageUrl} alt={item.author.name} className="pl-avatar" />
            ) : (
              <AvatarPlaceholder name={item.author.name} />
            )}
            <span className="pl-card__author-name">{item.author.name}</span>
          </div>
          <time className="pl-stat" dateTime={item.updatedAt}>
            {formatUpdatedAt(item.updatedAt)}
          </time>
        </div>
      </div>

    </article>
  )
}

export function PortfolioCard({ item, liked, onLike }: PortfolioCardProps) {
  const { l1, l3 } = resolveCategoryLabels(item.categoryCode, item.customCategory)
  return (
    <article className="pl-card">

      {/* 썸네일 — 카드 상단 전체 폭 + 오버레이 배지 */}
      <div className="pl-card__thumb-wrap">
        <Link href={USER_ROUTES.portfolio.detail(item.id)} className="pl-card__thumb-link" tabIndex={-1} aria-hidden>
          <div className="pl-card__thumb">
            {item.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.thumbnailUrl} alt={item.title} className="pl-card__thumb-img" />
            ) : (
              <DefaultThumbnail title={item.title} />
            )}
          </div>
        </Link>

        {/* 썸네일 위 오버레이: 유형 배지(좌) + 관심 버튼(우) */}
        <div className="pl-card__thumb-overlay">
          <span className={`pl-badge pl-badge--type${item.projectType === "team" ? " pl-badge--team" : ""} pl-badge--overlay`}>
            {item.projectType === "personal" ? "개인" : "팀"}
          </span>
          <button
            type="button"
            className={`pl-like-btn pl-like-btn--overlay${liked ? " pl-like-btn--active" : ""}`}
            onClick={(e) => { e.preventDefault(); onLike() }}
            aria-label={liked ? "관심 취소" : "관심 포트폴리오 등록"}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill={liked ? "currentColor" : "none"}>
              <path d="M6 10.5S1 7.5 1 4.5a2.5 2.5 0 0 1 5 0A2.5 2.5 0 0 1 11 4.5c0 3-5 6-5 6Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
            </svg>
            관심
          </button>
        </div>
      </div>

      {/* 카드 본문 */}
      <div className="pl-card__body">

        {/* 카테고리 배지 */}
        <div className="pl-card__meta">
          <div className="pl-card__cats">
            <CategoryLine l1={l1} l3={l3} />
          </div>
        </div>

        {/* 제목 */}
        <Link href={USER_ROUTES.portfolio.detail(item.id)} className="pl-card__title-link">
          <h2 className="pl-card__title">{item.title}</h2>
        </Link>

        {/* 본문 미리보기 */}
        {item.excerpt && (
          <p className="pl-card__excerpt">{item.excerpt}</p>
        )}

        {/* 태그 */}
        {item.tags.length > 0 && (
          <Tags2Row
            tags={item.tags}
            containerClass="pl-card__tags"
            tagClass="pl-tag"
            moreClass="pl-tag pl-tag--more"
          />
        )}

        {/* 링크 */}
        {item.externalLinks && item.externalLinks.length > 0 && (
          <div className="pl-card__links">
            {item.externalLinks.slice(0, 3).map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pl-link-chip"
                onClick={(e) => e.stopPropagation()}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* 구분선 */}
        <div className="pl-card__divider" aria-hidden />

        {/* 푸터: 작성자 + 통계 */}
        <div className="pl-card__footer">
          <div className="pl-card__author">
            {item.author.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.author.profileImageUrl} alt={item.author.name} className="pl-avatar" />
            ) : (
              <AvatarPlaceholder name={item.author.name} />
            )}
            <span className="pl-card__author-name">{item.author.name}</span>
          </div>
          <div className="pl-card__stats">
            <span className="pl-stat">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <ellipse cx="6" cy="6" rx="4.5" ry="3" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="6" cy="6" r="1.3" fill="currentColor" />
              </svg>
              {formatCount(item.viewCount)}
            </span>
            {/* 관심 수 — liked 상태에서는 즉시 +1 피드백 */}
            <span className={`pl-stat pl-stat--like${liked ? " pl-stat--like-active" : ""}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} aria-hidden>
                <path d="M12 21S3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14 14 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              {formatCount(item.likeCount + (liked ? 1 : 0))}
            </span>
            <time className="pl-stat" dateTime={item.updatedAt}>
              {formatUpdatedAt(item.updatedAt)}
            </time>
          </div>
        </div>

      </div>
    </article>
  )
}
