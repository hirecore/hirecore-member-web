"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { USER_ROUTES, LOCAL_STORAGE_KEYS } from "@/_shared/config"
import { TabDocHeader } from "@/_shared/ui/tab-doc-header"
import { TabDocCTA } from "@/_shared/ui/tab-doc-cta"
import {
  useManagedPortfolios,
  useDraftPortfolios,
  useMyPortfolioSummaries,
  type AvailableDoc,
  type DocType,
  type ManagedPortfolio,
} from "@/_entities/portfolio"
import { DraftSection } from "@/_shared/ui/draft-section"
import { PortfolioList } from "./PortfolioList"
import { useTabViewMode } from "../model/use-tab-view-mode"
import "./user-mypage-portfolio-tab.scss"

interface UserMypagePortfolioTabProps {
  /** true 면 mock 데이터 (`useManagedPortfolios`), false 면 실 API (`useMyPortfolioSummaries`). */
  mock?: boolean
}

export function UserMypagePortfolioTab({ mock = false }: UserMypagePortfolioTabProps = {}) {
  const router = useRouter()
  // 데이터 소스: mock 모드는 기존 mock hook, 그 외에는 GET /api/portfolios/summaries/mine
  // (mock 모드에서도 availableResumes/Coverletters 가 함께 노출되어 link 모달이 동작한다.
  //  실 API 모드는 이력서·자기소개서 API 가 갖춰지기 전까지 link 후보 목록을 빈 배열로 둔다.)
  const mockData = useManagedPortfolios()
  const apiData = useMyPortfolioSummaries()
  const sourcePortfolios = mock ? mockData.portfolios : apiData.portfolios
  const availableResumes = mock ? mockData.availableResumes : ([] as AvailableDoc[])
  const availableCoverletters = mock ? mockData.availableCoverletters : ([] as AvailableDoc[])

  const draftPortfolios = useDraftPortfolios()
  // 로컬 mutation (delete/link) 을 위해 useState 로 복사 + source 변경 시 동기화.
  // TODO: 실 API 모드의 delete/link 는 서버 호출 + 캐시 무효화로 교체 예정.
  const [portfolios, setPortfolios] = useState<ManagedPortfolio[]>(sourcePortfolios)
  useEffect(() => { setPortfolios(sourcePortfolios) }, [sourcePortfolios])
  const [search,    setSearch]    = useState("")
  const [tagSearch, setTagSearch] = useState("")
  const { viewMode, handleViewMode } = useTabViewMode(LOCAL_STORAGE_KEYS.MYPAGE_PORTFOLIO_VIEW_MODE)

  const filtered = portfolios.filter((p) => {
    const titleMatch = p.title.toLowerCase().includes(search.toLowerCase())
    const tagMatch   = tagSearch === "" || p.tags.some((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))
    return titleMatch && tagMatch
  })

  // Bug 2 수정: editId를 쿼리 파라미터로 전달 — write view에서 새 글 드래프트 복원 팝업을 건너뜀
  const handleEdit = (id: string) => router.push(`${USER_ROUTES.portfolio.write}?editId=${id}`)
  const handleDelete = (id: string) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setPortfolios((prev) => prev.filter((p) => p.id !== id))
    }
  }
  const handleLinkDoc = (portfolioId: string, docType: DocType, docId: string | null) => {
    setPortfolios((prev) =>
      prev.map((p) => {
        if (p.id !== portfolioId) return p
        if (docType === "resume") {
          const found = docId ? availableResumes.find((r: AvailableDoc) => r.id === docId) : null
          return { ...p, linkedResume: found ? { id: found.id, title: found.title, visibility: found.visibility ?? "public", updatedAt: found.updatedAt, tags: found.tags ?? [] } : null }
        } else {
          const found = docId ? availableCoverletters.find((c: AvailableDoc) => c.id === docId) : null
          return { ...p, linkedCoverletter: found ? { id: found.id, title: found.title, visibility: found.visibility ?? "public", updatedAt: found.updatedAt, tags: found.tags ?? [] } : null }
        }
      })
    )
  }

  return (
    <div className="umpt-root">
      <TabDocHeader title="포트폴리오 관리" count={portfolios.length} />
      <TabDocCTA
        label="새 포트폴리오 만들기"
        sub="지금까지의 경험과 작업물을 기록해보세요"
        onClick={() => router.push(USER_ROUTES.portfolio.write)}
      />
      <DraftSection
        items={draftPortfolios}
        onEdit={(id) => router.push(`${USER_ROUTES.portfolio.write}?editId=${id}`)}
        onDelete={(id) => { if (window.confirm("임시저장을 삭제하시겠습니까?")) { /* TODO: API 호출 */ } }}
      />
      <PortfolioList
        portfolios={filtered}
        search={search}
        tagSearch={tagSearch}
        viewMode={viewMode}
        availableResumes={availableResumes.filter((r: AvailableDoc) => r.visibility !== "private")}
        availableCoverletters={availableCoverletters.filter((c: AvailableDoc) => c.visibility !== "private")}
        onSearchChange={setSearch}
        onTagSearchChange={setTagSearch}
        onViewModeChange={handleViewMode}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLinkDoc={handleLinkDoc}
      />
    </div>
  )
}
