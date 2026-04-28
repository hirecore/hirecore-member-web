"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EditorContent } from "@tiptap/react"
import { DetailPageLayout } from "@/_shared/ui/detail-page-layout"
import {
  PortfolioMetaCard,
  PortfolioTabBar,
  PortfolioTocSidebar,
  PortfolioLinkedDocsTab,
} from "@/_widgets/portfolio"
import { type ActiveTab } from "@/_features/portfolio/lib"
import { USER_ROUTES } from "@/_shared/config"
import { usePortfolioList } from "@/_entities/portfolio"
import type { LinkedDocEmbed } from "@/_entities/portfolio"
import { useReadOnlyEditor } from "@/_features/editor"
import { useTocTracking } from "@/_features/portfolio"
import type { JSONContent } from "@tiptap/core"
import { usePortfolioReadView } from "../model/use-portfolio-read-view"

import { PageContainer } from "@/_shared/ui/layout"
import { DeleteConfirmModal } from "@/_shared/ui/delete-confirm-modal"
import "@/_features/editor/editor.scss"
import "./portfolio-read-view.scss"


/* ── 연결 문서 에디터 훅 — content 없으면 빈 에디터 ── */
function useLinkedDocEditor(doc: LinkedDocEmbed | null) {
  const editor = useReadOnlyEditor({ content: doc?.content, includeImages: doc?.type === "resume" })
  const { tocHeadings, activeId, scrollToHeading } = useTocTracking({
    editor,
    content: doc?.content as JSONContent | undefined,
    scrollOffset: 160,
  })
  const updatedAt = doc ? new Date(doc.updatedAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "") : ""

  return { editor, tocHeadings, activeId, scrollToHeading, updatedAt }
}

/* ── 다른 포트폴리오 카드 ── */
function OtherPortfoliosSection({ currentId, authorName }: { currentId: string; authorName: string }) {
  const others = usePortfolioList().filter((p) => p.id !== currentId).slice(0, 6)
  if (others.length === 0) return null
  return (
    <section className="pr-others">
      <h2 className="pr-others__head">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        {authorName}님의 다른 포트폴리오
      </h2>
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
                style={p.thumbnailUrl ? undefined : { background: `linear-gradient(135deg, hsl(${hue} 60% 55%), hsl(${hue2} 65% 40%))` }}
              >
                {p.thumbnailUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.thumbnailUrl} alt="" className="pr-other-card__thumb-img" />
                  : <span className="pr-other-card__thumb-letter">{p.title.slice(0, 1)}</span>
                }
              </div>
              <div className="pr-other-card__body">
                <span className="pr-other-card__cat">{p.categoryName}</span>
                <p className="pr-other-card__title">{p.title}</p>
                <div className="pr-other-card__meta">
                  <span className="pr-other-card__date">{dateStr}</span>
                  <span className="pr-other-card__stats">
                    <span className="pr-other-card__stat">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <ellipse cx="6" cy="6" rx="4.5" ry="3" stroke="currentColor" strokeWidth="1.1" />
                        <circle cx="6" cy="6" r="1.2" fill="currentColor" />
                      </svg>
                      {p.viewCount}
                    </span>
                    <span className="pr-other-card__stat">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                        <path d="M5 8.5S1 6 1 3.5a2 2 0 0 1 4-.5A2 2 0 0 1 9 3.5C9 6 5 8.5 5 8.5Z" stroke="currentColor" strokeWidth="1" />
                      </svg>
                      {p.likeCount}
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

const TABS: { id: ActiveTab; label: string }[] = [
  { id: "resume", label: "이력서" },
  { id: "coverletter", label: "자기소개서" },
  { id: "portfolio", label: "포트폴리오" },
]

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
    isOwner,
  } = usePortfolioReadView(id)

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // 연결 문서 에디터 — 항상 호출 (React hooks 규칙 준수)
  const linkedResume = useLinkedDocEditor(data?.linkedResume ?? null)
  const linkedCoverletter = useLinkedDocEditor(data?.linkedCoverletter ?? null)

  if (!data) return null

  const majorLabel = data.majorCategoryName
  const subLabel = data.customCategory ?? data.categoryName
  const updatedAt = new Date(data.updatedAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "")

  return (
    <div className="pr-root">

      {showDeleteModal && (
        <DeleteConfirmModal
          docTypeName="포트폴리오"
          notice="포트폴리오만 삭제되며, 연결된 이력서와 자기소개서는 그대로 유지됩니다."
          onConfirm={() => {
            setShowDeleteModal(false)
            router.push(USER_ROUTES.mypage)
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <PageContainer width="wide">
        <DetailPageLayout
          header={
            <>
              <div className="pr-top-bar">
                <button type="button" className="pr-back-btn" onClick={() => router.back()}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  돌아가기
                </button>
                {isOwner && (
                  <div className="pr-owner-actions">
                    <button type="button" className="pr-edit-btn" onClick={() => router.push(`${USER_ROUTES.portfolio.write}?editId=${data.id}`)}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M11.5 2.5l2 2-7 7H4.5v-2l7-7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        <path d="M9.5 4.5l2 2" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                      편집하기
                    </button>
                    <button type="button" className="pr-delete-btn" onClick={() => setShowDeleteModal(true)}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M5 6h6M5.5 6V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 10.5 5v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M5.5 6l.4 7a1 1 0 0 0 1 1h2.2a1 1 0 0 0 1-1l.4-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      삭제
                    </button>
                  </div>
                )}
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

              {/* sentinel */}
              <div ref={tabsSentinelRef} aria-hidden />

              {/* 탭 */}
              <PortfolioTabBar
                tabs={TABS}
                activeTab={tab}
                isSticky={tabsSticky}
                onTabChange={setTab}
                bare
              />
            </>
          }
          main={
            <>
              {/* 이력서 탭 */}
              {tab === "resume" && (
                <div className="pr-post-area">
                  {data.linkedResume ? (
                    <>
                      <div className="pr-post-meta-bar">
                        <span className="pr-post-meta-bar__updated">마지막 업데이트 : {linkedResume.updatedAt}</span>
                      </div>
                      <EditorContent editor={linkedResume.editor} className="simple-editor-content pr-editor-content" />
                    </>
                  ) : (
                    <PortfolioLinkedDocsTab type="resume" docs={[]} isOwner={isOwner} />
                  )}
                  <OtherPortfoliosSection currentId={id} authorName={data.author.name} />
                </div>
              )}

              {/* 자기소개서 탭 */}
              {tab === "coverletter" && (
                <div className="pr-post-area">
                  {data.linkedCoverletter ? (
                    <>
                      <div className="pr-post-meta-bar">
                        <span className="pr-post-meta-bar__updated">마지막 업데이트 : {linkedCoverletter.updatedAt}</span>
                      </div>
                      <EditorContent editor={linkedCoverletter.editor} className="simple-editor-content pr-editor-content" />
                    </>
                  ) : (
                    <PortfolioLinkedDocsTab type="coverletter" docs={[]} isOwner={isOwner} />
                  )}
                  <OtherPortfoliosSection currentId={id} authorName={data.author.name} />
                </div>
              )}

              {/* 포트폴리오 본문 탭 */}
              {tab === "portfolio" && (
                <div className="pr-post-area">
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
                  <OtherPortfoliosSection currentId={id} authorName={data.author.name} />
                </div>
              )}
            </>
          }
          sideBottom={
            tab === "portfolio" && tocHeadings.length > 0 ? (
              <PortfolioTocSidebar headings={tocHeadings} activeId={activeId} onClickHeading={scrollToHeading} />
            ) : tab === "resume" && linkedResume.tocHeadings.length > 0 ? (
              <PortfolioTocSidebar headings={linkedResume.tocHeadings} activeId={linkedResume.activeId} onClickHeading={linkedResume.scrollToHeading} />
            ) : tab === "coverletter" && linkedCoverletter.tocHeadings.length > 0 ? (
              <PortfolioTocSidebar headings={linkedCoverletter.tocHeadings} activeId={linkedCoverletter.activeId} onClickHeading={linkedCoverletter.scrollToHeading} />
            ) : undefined
          }
        />
      </PageContainer>

    </div>
  )
}
