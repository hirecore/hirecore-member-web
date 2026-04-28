"use client"

// _views/portfolio/ui | 포트폴리오 미리보기 뷰 — 비즈니스 로직은 model/use-portfolio-preview-view에 위임

import { EditorContent } from "@tiptap/react"
import {
  PortfolioPageActions,
  PortfolioMetaCard,
  PortfolioTabBar,
  PortfolioTocSidebar,
  PortfolioPostLayout,
  PortfolioLinkedDocsTab,
} from "@/_widgets/portfolio"
import { useJobCategories, getCategoryPath, isCustomInputCategory, type ActiveTab } from "@/_features/portfolio/lib"
import { usePortfolioPreviewView } from "../model/use-portfolio-preview-view"

import { PageContainer } from "@/_shared/ui/layout"
import "@/_features/editor/editor.scss"
import "./portfolio-read-view.scss"

const TABS = [
  { id: "resume"      as ActiveTab, label: "이력서" },
  { id: "coverletter" as ActiveTab, label: "자기소개서" },
  { id: "portfolio"   as ActiveTab, label: "포트폴리오 소개" },
]

export default function PortfolioPreviewView() {
  const {
    data, editor, tocHeadings, tabsSentinelRef,
    tab, setTab,
    liked, setLiked,
    tabsSticky,
    activeId,
    scrollToHeading,
    handleEdit,
  } = usePortfolioPreviewView()
  const { data: categories = [] } = useJobCategories(3)

  if (!data) return null

  // 3-level 카테고리 → L1 라벨 / L2-L3 경로
  // "기타(직접입력)" 직무는 L3 이름 대신 사용자가 입력한 customCategory 표시
  const path = getCategoryPath(categories, data.category.categoryCode)
  const majorLabel = path[0]?.name ?? ""
  const useCustom = isCustomInputCategory(categories, data.category.categoryCode) && data.category.customCategory
  const subLabel = useCustom
    ? data.category.customCategory!
    : path.slice(1).map((n) => n.name).join(" › ")
  const updatedAt  = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).replace(/\. /g, ".").replace(/\.$/, "")

  return (
    <div className="pr-root">

      {/* ── 페이지 액션 바 ── */}
      <PageContainer width="wide">
        <PortfolioPageActions onEdit={handleEdit} />
      </PageContainer>

      {/* ── 포트폴리오 메타 카드 ── */}
      <PageContainer width="wide">
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
          likeCount={liked ? 1 : 0}
          onLikeToggle={() => setLiked((v) => !v)}
        />
      </PageContainer>

      {/* sentinel: 이 지점이 헤더 뒤로 사라지면 탭 sticky */}
      <div ref={tabsSentinelRef} aria-hidden />

      {/* ── 탭 (sticky) ── */}
      <PortfolioTabBar
        tabs={TABS}
        activeTab={tab}
        isSticky={tabsSticky}
        onTabChange={setTab}
      />

      {/* ── 이력서 / 자기소개서 연결 탭 ── */}
      {(tab === "resume" || tab === "coverletter") && (
        <PageContainer width="wide">
          <PortfolioLinkedDocsTab type={tab} docs={[]} isOwner />
        </PageContainer>
      )}

      {/* ── 포트폴리오 본문 ── */}
      {tab === "portfolio" && (
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
      )}

    </div>
  )
}
