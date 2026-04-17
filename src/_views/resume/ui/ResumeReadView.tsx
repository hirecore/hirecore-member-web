"use client"

// _views/resume/ui | 이력서 상세 읽기 뷰 — 비즈니스 로직은 model/use-resume-read-view에 위임
// 디자인은 PortfolioReadView와 일관 — wide 컨테이너 + 좌측 콘텐츠 + 우측 TOC + 흰 배경
import { EditorContent } from "@tiptap/react"
import type { LinkablePortfolio } from "@/_features/document-link"
import Link from "next/link"
import { USER_ROUTES } from "@/_shared/config"
import { useRouter } from "next/navigation"
import { useResumeReadView } from "../model/use-resume-read-view"
import { PageContainer } from "@/_shared/ui/layout"
import { PortfolioPostLayout, PortfolioTocSidebar } from "@/_widgets/portfolio"

import "@/_features/editor/editor.scss"
import "./resume-read-view.scss"


function AvatarPlaceholder({ name }: { name: string }) {
  const hue = (name.charCodeAt(0) * 37) % 360
  return (
    <div className="rd-avatar" style={{ background: `hsl(${hue} 65% 55%)` }} aria-hidden>
      {name.slice(0, 1)}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "2-digit" })
}

function PortfolioChip({ p }: { p: LinkablePortfolio }) {
  const c0 = p.title.charCodeAt(0) || 65
  const c1 = p.title.charCodeAt(1) || 90
  const hue = (c0 * 47 + c1 * 19) % 360
  const hue2 = (hue + 55) % 360
  return (
    <Link href={USER_ROUTES.portfolio.detail(p.id)} className="rd-pf-chip">
      <div className="rd-pf-chip__thumb" style={{ background: `linear-gradient(140deg, hsl(${hue} 68% 52%), hsl(${hue2} 72% 38%))` }} aria-hidden>
        {p.title.slice(0, 1)}
      </div>
      <div className="rd-pf-chip__info">
        <span className="rd-pf-chip__title">{p.title}</span>
        <div className="rd-pf-chip__tags">
          {p.tags.slice(0, 2).map((t) => <span key={t} className="rd-pf-chip__tag">#{t}</span>)}
        </div>
      </div>
    </Link>
  )
}

interface Props { id: string }

export function ResumeReadView({ id }: Props) {
  const router = useRouter()
  const { data, editor, tocHeadings, scrollToHeading, activeId } = useResumeReadView(id)

  if (!data) return null

  return (
    <div className="rd-root">
      <PageContainer width="wide">

        {/* 뒤로가기 */}
        <div className="rd-top-bar">
          <button type="button" className="rd-back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            돌아가기
          </button>
          <span className={`rd-visibility-badge rd-visibility-badge--${data.visibility}`}>
            {data.visibility === "public" ? "공개" : "비공개"}
          </span>
        </div>

        {/* 헤더 카드 — wide 폭 사용, 내부는 세로형 (작성자가 태그 아래) */}
        <div className="rd-header-card">
          <div className="rd-header-card__type">
            <div className="rd-type-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span className="rd-type-label">이력서</span>
          </div>

          <h1 className="rd-header-card__title">{data.title}</h1>

          {data.interestFields.length > 0 && (
            <div className="rd-header-card__interests">
              {data.interestFields.map((f) => <span key={f} className="rd-interest-tag">{f}</span>)}
            </div>
          )}

          {data.tags.length > 0 && (
            <div className="rd-header-card__tags">
              {data.tags.map((t) => <span key={t} className="rd-tag">#{t}</span>)}
            </div>
          )}

          <div className="rd-header-card__meta">
            {data.author.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.author.profileImageUrl} alt={data.author.name} className="rd-avatar" />
            ) : (
              <AvatarPlaceholder name={data.author.name} />
            )}
            <span className="rd-author-name">{data.author.name}</span>
            <span className="rd-sep" aria-hidden>·</span>
            <time className="rd-date" dateTime={data.updatedAt}>{formatDate(data.updatedAt)}</time>
          </div>
        </div>

        {/* 본문 + TOC — TOC는 본문 옆에서 sticky로 시작 */}
        <PortfolioPostLayout
          content={
            <div className="rd-content-wrap">
              <EditorContent editor={editor} className="simple-editor-content rd-editor-content" />
            </div>
          }
          toc={
            tocHeadings.length > 0 ? (
              <PortfolioTocSidebar
                headings={tocHeadings}
                activeId={activeId}
                onClickHeading={scrollToHeading}
              />
            ) : undefined
          }
        />

        {/* 연결 포트폴리오 */}
        {data.linkedPortfolios.length > 0 && (
          <div className="rd-portfolios">
            <h2 className="rd-portfolios__title">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M6 1H1v14h14V10M9 1h6v6M5.5 10.5l8-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              연결된 포트폴리오
            </h2>
            <div className="rd-portfolios__list">
              {data.linkedPortfolios.map((p) => <PortfolioChip key={p.id} p={p} />)}
            </div>
          </div>
        )}

      </PageContainer>
    </div>
  )
}
