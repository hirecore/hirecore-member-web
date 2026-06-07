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
import { usePortfolioList, usePortfolioDelete } from "@/_entities/portfolio"
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
// 본문 가시성 차단 케이스(API 응답 content === null)에서는 빈 에디터를 그대로 보여준다.
// updatedAt 은 상세 API 미제공 — mock 에서만 채워지며, 없으면 빈 문자열을 반환해 메타 표시를 가린다.
function useLinkedDocEditor(doc: LinkedDocEmbed | null) {
  const docContent = doc?.content ?? undefined
  const editor = useReadOnlyEditor({ content: docContent, includeImages: doc?.type === "resume" })
  const { tocHeadings, activeId, scrollToHeading } = useTocTracking({
    editor,
    content: docContent as JSONContent | undefined,
    scrollOffset: 160,
  })
  const updatedAt = doc?.updatedAt
    ? new Date(doc.updatedAt).toLocaleDateString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit",
      }).replace(/\. /g, ".").replace(/\.$/, "")
    : ""

  return { editor, tocHeadings, activeId, scrollToHeading, updatedAt, contentBlocked: doc != null && doc.content == null }
}

/* ── 다른 포트폴리오 카드 — 카드 1개를 그리는 데 필요한 최소 필드 형상 ── */
interface OtherPortfolioCardItem {
  id: string
  title: string
  thumbnailUrl: string | null
  categoryName: string
  updatedAt: string
  viewCount: number
  likeCount: number
}

/* ── 다른 포트폴리오 카드 ──
 * API 모드: 상세 응답의 publisher.otherPortfolios 를 매핑해 prop 으로 전달받음
 * mock 모드: 기존 usePortfolioList() 로부터 동일 형상을 만들어 전달
 * 두 경로 모두 동일 prop shape 으로 통일.
 */
function OtherPortfoliosSection({ authorName, portfolios }: { authorName: string; portfolios: OtherPortfolioCardItem[] }) {
  const others = portfolios.slice(0, 6)
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

interface Props {
  id: string
  /** /portfolio/temp 등 시각 검토용으로 실 API 대신 mock 데이터를 쓸 때 true */
  mock?: boolean
}

export function PortfolioReadView({ id, mock }: Props) {
  const router = useRouter()
  const {
    data, editor, tocHeadings, tabsSentinelRef,
    tab, setTab,
    interested, interestCount, handleInterestToggle,
    tabsSticky,
    activeId,
    scrollToHeading,
    isOwner,
  } = usePortfolioReadView(id, { mock })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  // 영구 삭제 mutation — 비멱등이므로 isPending 으로 중복 호출/모달 dismiss 가드
  const deleteMutation = usePortfolioDelete(id)

  // 연결 문서 에디터 — 항상 호출 (React hooks 규칙 준수)
  const linkedResume = useLinkedDocEditor(data?.linkedResume ?? null)
  const linkedCoverletter = useLinkedDocEditor(data?.linkedCoverletter ?? null)

  // 작성자의 다른 포트폴리오 카드 데이터
  // - API 모드(mock=false): 응답의 otherPortfolios 를 그대로 사용. 빈 배열도 의도된 결과 → mock 폴백 금지.
  // - mock 모드(/portfolio/temp): API 미호출이므로 PortfolioList mock 으로 채워 시각 검토 유지.
  const mockListItems = usePortfolioList()
  const otherPortfolioCards: OtherPortfolioCardItem[] = mock
    ? mockListItems
        .filter((p) => p.id !== id)
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          title: p.title,
          thumbnailUrl: p.thumbnailUrl,
          categoryName: p.categoryName,
          updatedAt: p.updatedAt,
          viewCount: p.viewCount,
          likeCount: p.likeCount,
        }))
    : (data?.otherPortfolios ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        thumbnailUrl: p.thumbnailUrl,
        categoryName: p.categoryName,
        updatedAt: p.updatedAt,
        viewCount: p.viewCount,
        likeCount: p.likeCount,
      }))

  const handleDeleteConfirm = () => {
    if (deleteMutation.isPending) return
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteModal(false)
        // 삭제된 상세 페이지에 머무르면 새로고침 시 404 — 홈으로 즉시 이동
        router.replace(USER_ROUTES.home)
      },
      onError: (err) => {
        const status = (err as { response?: { status?: number } })?.response?.status
        setShowDeleteModal(false)
        if (status === 403) {
          alert("본인이 작성한 포트폴리오만 삭제할 수 있습니다.")
        } else if (status === 404) {
          // 이미 삭제됨 — 사용자 안내 후 목록으로 이동
          alert("이미 삭제된 포트폴리오입니다.")
          router.replace(USER_ROUTES.home)
        } else {
          // 401 은 axios 인터셉터가 로그인 페이지로 자동 라우팅 — 여기까지 거의 도달하지 않음
          alert("포트폴리오 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.")
        }
      },
    })
  }

  if (!data) return null

  const majorLabel = data.majorCategoryName
  const subLabel = data.customCategory ?? data.categoryName
  // updatedAt 은 정상 흐름에서 항상 ISO 문자열이지만, API 응답상 null 가능 — 빈 문자열로 안전 처리
  const updatedAt = data.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString("ko-KR", {
        year: "numeric", month: "2-digit", day: "2-digit",
      }).replace(/\. /g, ".").replace(/\.$/, "")
    : ""

  return (
    <div className="pr-root">

      {showDeleteModal && (
        <DeleteConfirmModal
          docTypeName="포트폴리오"
          notice="포트폴리오에 첨부된 이미지도 함께 삭제되며, 연결된 이력서와 자기소개서는 그대로 유지됩니다."
          isPending={deleteMutation.isPending}
          onConfirm={handleDeleteConfirm}
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
                viewCount={data.viewCount}
                liked={interested}
                likeCount={interestCount}
                onLikeToggle={handleInterestToggle}
                publisher={data.publisher}
                showLikeButton={!isOwner}
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
                      {linkedResume.updatedAt && (
                        <div className="pr-post-meta-bar">
                          <span className="pr-post-meta-bar__updated">마지막 업데이트 : {linkedResume.updatedAt}</span>
                        </div>
                      )}
                      {linkedResume.contentBlocked ? (
                        <p className="pr-blocked-notice">비공개로 설정된 이력서입니다. 본문은 작성자만 볼 수 있어요.</p>
                      ) : (
                        <EditorContent editor={linkedResume.editor} className="simple-editor-content pr-editor-content" />
                      )}
                    </>
                  ) : (
                    <PortfolioLinkedDocsTab type="resume" docs={[]} isOwner={isOwner} />
                  )}
                  <OtherPortfoliosSection authorName={data.author.name} portfolios={otherPortfolioCards} />
                </div>
              )}

              {/* 자기소개서 탭 */}
              {tab === "coverletter" && (
                <div className="pr-post-area">
                  {data.linkedCoverletter ? (
                    <>
                      {linkedCoverletter.updatedAt && (
                        <div className="pr-post-meta-bar">
                          <span className="pr-post-meta-bar__updated">마지막 업데이트 : {linkedCoverletter.updatedAt}</span>
                        </div>
                      )}
                      {linkedCoverletter.contentBlocked ? (
                        <p className="pr-blocked-notice">비공개로 설정된 자기소개서입니다. 본문은 작성자만 볼 수 있어요.</p>
                      ) : (
                        <EditorContent editor={linkedCoverletter.editor} className="simple-editor-content pr-editor-content" />
                      )}
                    </>
                  ) : (
                    <PortfolioLinkedDocsTab type="coverletter" docs={[]} isOwner={isOwner} />
                  )}
                  <OtherPortfoliosSection authorName={data.author.name} portfolios={otherPortfolioCards} />
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
                  <OtherPortfoliosSection authorName={data.author.name} portfolios={otherPortfolioCards} />
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
