"use client"

// _views/portfolio/ui | 포트폴리오 상세 읽기 뷰 — 비즈니스 로직은 model/use-portfolio-read-view에 위임
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EditorContent } from "@tiptap/react"
import {
  PortfolioMetaCard,
  PortfolioTabBar,
  PortfolioTocSidebar,
  PortfolioPostLayout,
  PortfolioLinkedDocsTab,
} from "@/_widgets/portfolio"
import {
  getCategoryPath,
  getCategoryName,
  isCustomInputCategory,
  type ActiveTab,
} from "@/_features/portfolio/lib"
import { USER_ROUTES } from "@/_shared/config"
import { usePortfolioList } from "@/_entities/portfolio"
import type { LinkedDocEmbed } from "@/_entities/portfolio"
import { useReadOnlyEditor } from "@/_features/editor"
import { useTocTracking } from "@/_features/portfolio"
import type { JSONContent } from "@tiptap/core"
import { usePortfolioReadView } from "../model/use-portfolio-read-view"

import { PageContainer } from "@/_shared/ui/layout"
import "@/_features/editor/editor.scss"
import "./portfolio-read-view.scss"

// ── 탭 ────────────────────────────────────────────────────────────
const TABS = [
  { id: "resume"      as ActiveTab, label: "이력서" },
  { id: "coverletter" as ActiveTab, label: "자기소개서" },
  { id: "portfolio"   as ActiveTab, label: "포트폴리오 소개" },
]

// ── 연결 문서 패널 (본문 + 자체 TOC) ──────────────────────────────
// 이력서/자기소개서 탭에서 LinkedDocReader를 wrap해 PostLayout + TOC를 자체적으로 처리.
// 각 패널은 자기 문서의 헤딩으로부터 TOC를 동적으로 만들어 우측 사이드바로 표시.
// 헤더(타입/제목/메타)는 표시하지 않음 — 사용자는 탭 상태로 어떤 문서인지 인지.
function LinkedDocPanel({ doc }: { doc: LinkedDocEmbed }) {
  const editor = useReadOnlyEditor({ content: doc.content, includeImages: true })
  const { tocHeadings, scrollToHeading, activeId } = useTocTracking({
    editor,
    content: doc.content as JSONContent | undefined,
  })

  return (
    <PortfolioPostLayout
      content={
        <div className="pr-linked-doc">
          <div className="pr-linked-doc__content">
            <EditorContent editor={editor} className="simple-editor-content" />
          </div>
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
  )
}


// ── 다른 포트폴리오 섹션 ───────────────────────────────────────────
function OtherPortfoliosSection({ currentId, authorName }: { currentId: string; authorName: string }) {
  const allPortfolios = usePortfolioList()
  const others = allPortfolios.filter((p) => p.id !== currentId)
  if (!others.length) return null

  return (
    <section className="pr-others">
      <div className="pr-others__head">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span>{authorName}님의 다른 포트폴리오</span>
      </div>

      <div className="pr-others__grid">
        {others.map((p) => {
          const c0 = p.title.charCodeAt(0) || 65
          const c1 = p.title.charCodeAt(1) || 90
          const hue  = (c0 * 47 + c1 * 19) % 360
          const hue2 = (hue + 55) % 360
          const dateStr = new Date(p.updatedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "short" })

          return (
            <Link key={p.id} href={USER_ROUTES.portfolio.detail(p.id)} className="pr-other-card">
              <div
                className="pr-other-card__thumb"
                style={{ background: `linear-gradient(140deg, hsl(${hue} 68% 52%), hsl(${hue2} 72% 38%))` }}
                aria-hidden
              >
                {p.title.slice(0, 1)}
              </div>
              <div className="pr-other-card__body">
                <div className="pr-other-card__cat-row">
                  <span className="pr-other-card__cat">{getCategoryName(p.categoryCode) || p.customCategory || ""}</span>
                  {p.visibility === "private" && (
                    <span className="pr-other-card__private">비공개</span>
                  )}
                </div>
                <p className="pr-other-card__title">{p.title}</p>
                {p.tags.length > 0 && (
                  <div className="pr-other-card__tags">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="pr-other-card__tag">#{t}</span>
                    ))}
                  </div>
                )}
                <div className="pr-other-card__meta">
                  <span className="pr-other-card__like">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 21C12 21 3 14 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14 14 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                    {p.likeCount.toLocaleString()}
                  </span>
                  <span className="pr-other-card__date">{dateStr}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

// ── Props ─────────────────────────────────────────────────────────
interface Props { id: string }

export function PortfolioReadView({ id }: Props) {
  const router = useRouter()
  const {
    data, editor, tocHeadings, tabsSentinelRef,
    tab, setTab,
    liked, setLiked,
    tabsSticky,
    activeId,
    scrollToHeading,
  } = usePortfolioReadView(id)

  if (!data) return null

  // 3-level 카테고리 → L1 라벨 / L2-L3 경로 (또는 customCategory)
  const path = getCategoryPath(data.categoryCode)
  const majorLabel = path[0]?.name ?? ""
  const useCustom = isCustomInputCategory(data.categoryCode) && data.customCategory
  const subLabel = useCustom
    ? data.customCategory!
    : path.slice(1).map((n) => n.name).join(" › ")
  const updatedAt  = new Date(data.updatedAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "")

  return (
    <div className="pr-root">

      {/* ── 포트폴리오 메타 카드 ── */}
      <PageContainer width="wide">
        <div className="pr-top-bar">
          <button type="button" className="pr-back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            돌아가기
          </button>
        </div>
        <PortfolioMetaCard
          majorLabel={majorLabel}
          subCategory={subLabel}
          projectType={data.projectType}
          visibility={data.visibility}
          title={data.title}
          thumbnailUrl={data.thumbnailUrl}
          tags={data.tags}
          externalLinks={data.externalLinks}
          liked={liked}
          likeCount={data.likeCount + (liked ? 1 : 0)}
          onLikeToggle={() => setLiked((v) => !v)}
        />
      </PageContainer>

      {/* sentinel */}
      <div ref={tabsSentinelRef} aria-hidden />

      {/* ── 탭 ── */}
      <PortfolioTabBar
        tabs={TABS}
        activeTab={tab}
        isSticky={tabsSticky}
        onTabChange={setTab}
      />

      {/* ── 이력서 탭 — 본문 + TOC + "다른 포트폴리오" (모든 탭 일관) ── */}
      {tab === "resume" && (
        <>
          <div className="pr-post-area">
            <PageContainer width="wide">
              {data.linkedResume
                ? <LinkedDocPanel doc={data.linkedResume} />
                : (
                  <PortfolioPostLayout
                    content={<PortfolioLinkedDocsTab type="resume" docs={[]} />}
                  />
                )
              }
            </PageContainer>
          </div>

          <div className="pr-others-wrap">
            <PageContainer width="wide">
              <OtherPortfoliosSection currentId={id} authorName={data.author.name} />
            </PageContainer>
          </div>
        </>
      )}

      {/* ── 자기소개서 탭 — 본문 + TOC + "다른 포트폴리오" (모든 탭 일관) ── */}
      {tab === "coverletter" && (
        <>
          <div className="pr-post-area">
            <PageContainer width="wide">
              {data.linkedCoverletter
                ? <LinkedDocPanel doc={data.linkedCoverletter} />
                : (
                  <PortfolioPostLayout
                    content={<PortfolioLinkedDocsTab type="coverletter" docs={[]} />}
                  />
                )
              }
            </PageContainer>
          </div>

          <div className="pr-others-wrap">
            <PageContainer width="wide">
              <OtherPortfoliosSection currentId={id} authorName={data.author.name} />
            </PageContainer>
          </div>
        </>
      )}

      {/* ── 포트폴리오 본문 탭 ── */}
      {tab === "portfolio" && (
        <>
          <div className="pr-post-area">
            <PageContainer width="wide">
              <PortfolioPostLayout
                content={
                  <div className="pr-post-content">
                    <div className="pr-post-meta-bar">
                      <span className="pr-post-meta-bar__updated">
                        마지막 업데이트 : {updatedAt}
                      </span>
                    </div>
                    <EditorContent
                      editor={editor}
                      className="simple-editor-content pr-editor-content"
                    />
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
            </PageContainer>
          </div>

          {/* ── 다른 포트폴리오 ── */}
          <div className="pr-others-wrap">
            <PageContainer width="wide">
              <OtherPortfoliosSection currentId={id} authorName={data.author.name} />
            </PageContainer>
          </div>
        </>
      )}

    </div>
  )
}
