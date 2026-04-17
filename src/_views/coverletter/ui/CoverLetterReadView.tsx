"use client"

// _views/coverletter/ui | 자기소개서 상세 읽기 뷰 — 비즈니스 로직은 model/use-cover-letter-read-view에 위임
// 디자인은 PortfolioReadView·ResumeReadView와 일관 — wide 컨테이너 + 좌측 콘텐츠 + 우측 TOC
import { EditorContent } from "@tiptap/react"
import type { LinkablePortfolio } from "@/_features/document-link"
import Link from "next/link"
import { USER_ROUTES } from "@/_shared/config"
import { useRouter } from "next/navigation"
import { useCoverLetterReadView } from "../model/use-cover-letter-read-view"
import { PageContainer } from "@/_shared/ui/layout"
import { PortfolioPostLayout, PortfolioTocSidebar } from "@/_widgets/portfolio"

import "@/_features/editor/editor.scss"
import "./coverletter-read-view.scss"


function AvatarPlaceholder({ name }: { name: string }) {
  const hue = (name.charCodeAt(0) * 37) % 360
  return (
    <div className="cld-avatar" style={{ background: `hsl(${hue} 65% 55%)` }} aria-hidden>
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
    <Link href={USER_ROUTES.portfolio.detail(p.id)} className="cld-pf-chip">
      <div className="cld-pf-chip__thumb" style={{ background: `linear-gradient(140deg, hsl(${hue} 68% 52%), hsl(${hue2} 72% 38%))` }} aria-hidden>
        {p.title.slice(0, 1)}
      </div>
      <div className="cld-pf-chip__info">
        <span className="cld-pf-chip__title">{p.title}</span>
        <div className="cld-pf-chip__tags">
          {p.tags.slice(0, 2).map((t) => <span key={t} className="cld-pf-chip__tag">#{t}</span>)}
        </div>
      </div>
    </Link>
  )
}

interface Props { id: string }

export function CoverLetterReadView({ id }: Props) {
  const router = useRouter()
  const { data, editor, tocHeadings, scrollToHeading, activeId } = useCoverLetterReadView(id)

  if (!data) return null

  return (
    <div className="cld-root">
      <PageContainer width="wide">

        {/* 뒤로가기 */}
        <div className="cld-top-bar">
          <button type="button" className="cld-back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            돌아가기
          </button>
          <span className={`cld-visibility-badge cld-visibility-badge--${data.visibility}`}>
            {data.visibility === "public" ? "공개" : "비공개"}
          </span>
        </div>

        {/* 헤더 카드 — wide 폭 사용, 내부는 세로형 (작성자가 태그 아래) */}
        <div className="cld-header-card">
          <div className="cld-header-card__type">
            <div className="cld-type-icon" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="cld-type-label">자기소개서</span>
          </div>

          {(data.company || data.position) && (
            <div className="cld-header-card__target">
              {data.company && <span className="cld-target-badge cld-target-badge--company">{data.company}</span>}
              {data.position && <span className="cld-target-badge cld-target-badge--position">{data.position}</span>}
            </div>
          )}

          <h1 className="cld-header-card__title">{data.title}</h1>

          {data.interestFields.length > 0 && (
            <div className="cld-header-card__interests">
              {data.interestFields.map((f) => <span key={f} className="cld-interest-tag">{f}</span>)}
            </div>
          )}

          {data.tags.length > 0 && (
            <div className="cld-header-card__tags">
              {data.tags.map((t) => <span key={t} className="cld-tag">#{t}</span>)}
            </div>
          )}

          <div className="cld-header-card__meta">
            {data.author.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.author.profileImageUrl} alt={data.author.name} className="cld-avatar" />
            ) : (
              <AvatarPlaceholder name={data.author.name} />
            )}
            <span className="cld-author-name">{data.author.name}</span>
            <span className="cld-sep" aria-hidden>·</span>
            <time className="cld-date" dateTime={data.updatedAt}>{formatDate(data.updatedAt)}</time>
          </div>
        </div>

        {/* 본문 + TOC — TOC는 본문 옆에서 sticky로 시작 */}
        <PortfolioPostLayout
          content={
            <div className="cld-content-wrap">
              <EditorContent editor={editor} className="simple-editor-content cld-editor-content" />
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
          <div className="cld-portfolios">
            <h2 className="cld-portfolios__title">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M6 1H1v14h14V10M9 1h6v6M5.5 10.5l8-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              연결된 포트폴리오
            </h2>
            <div className="cld-portfolios__list">
              {data.linkedPortfolios.map((p) => <PortfolioChip key={p.id} p={p} />)}
            </div>
          </div>
        )}

      </PageContainer>
    </div>
  )
}
