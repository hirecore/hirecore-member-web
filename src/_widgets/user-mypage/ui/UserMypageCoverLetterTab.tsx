"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { USER_ROUTES, LOCAL_STORAGE_KEYS } from "@/_shared/config"
import { TabDocHeader } from "@/_shared/ui/tab-doc-header"
import { TabDocCTA } from "@/_shared/ui/tab-doc-cta"
import { useManagedCoverLetters } from "@/_entities/coverletter"
import { CoverLetterList } from "./CoverLetterList"
import { useTabViewMode } from "../model/use-tab-view-mode"
import "./user-mypage-coverletter-tab.scss"

export function UserMypageCoverLetterTab() {
  const router = useRouter()
  const coverLetters = useManagedCoverLetters()
  const [search, setSearch] = useState("")
  const { viewMode, handleViewMode } = useTabViewMode(LOCAL_STORAGE_KEYS.MYPAGE_COVERLETTER_VIEW_MODE)

  const filtered = coverLetters.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (_id: string) => {
    if (window.confirm("자기소개서를 삭제하시겠습니까?")) {
      // TODO: API 호출
    }
  }

  return (
    <div className="umct-root">
      <TabDocHeader title="자기소개서 관리" count={coverLetters.length} />
      <TabDocCTA
        label="새 자기소개서 작성하기"
        sub="지원하는 회사와 직무에 맞는 자기소개서를 작성해보세요"
        onClick={() => router.push(USER_ROUTES.coverletter.write)}
      />
      <CoverLetterList
        coverLetters={filtered}
        search={search}
        viewMode={viewMode}
        onSearchChange={setSearch}
        onViewModeChange={handleViewMode}
        onDelete={handleDelete}
      />
    </div>
  )
}
