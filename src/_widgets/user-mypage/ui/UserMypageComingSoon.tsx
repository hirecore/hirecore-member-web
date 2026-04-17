import Link from "next/link"
import "./user-mypage-coming-soon.scss"

interface UserMypageComingSoonProps {
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

export function UserMypageComingSoon({ title, description, ctaLabel, ctaHref }: UserMypageComingSoonProps) {
  return (
    <div className="umpcs-root">
      <div className="umpcs-inner">
        <div className="umpcs-icon" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="umpcs-title">{title}</p>
        <p className="umpcs-desc">{description}</p>
        {ctaLabel && ctaHref ? (
          <Link href={ctaHref} className="umpcs-cta">
            {ctaLabel}
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2.5 6h7M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : (
          <span className="umpcs-badge">준비 중</span>
        )}
      </div>
    </div>
  )
}
