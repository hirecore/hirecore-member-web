"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { USER_ROUTES, LOCAL_STORAGE_KEYS } from "@/_shared/config"
import { TabDocHeader } from "@/_shared/ui/tab-doc-header"
import { TabDocCTA } from "@/_shared/ui/tab-doc-cta"
import { useManagedResumes } from "@/_entities/resume"
import { ResumeList } from "./ResumeList"
import { useTabViewMode } from "../model/use-tab-view-mode"
import "./user-mypage-resume-tab.scss"

export function UserMypageResumeTab() {
  const router = useRouter()
  const resumes = useManagedResumes()
  const [search, setSearch] = useState("")
  const { viewMode, handleViewMode } = useTabViewMode(LOCAL_STORAGE_KEYS.MYPAGE_RESUME_VIEW_MODE)

  const filtered = resumes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (_id: string) => {
    if (window.confirm("이력서를 삭제하시겠습니까?")) {
      // TODO: API 호출
    }
  }

  return (
    <div className="umrt-root">
      <TabDocHeader title="이력서 관리" count={resumes.length} />
      <TabDocCTA
        label="새 이력서 작성하기"
        sub="나의 경력과 역량을 이력서로 정리해보세요"
        onClick={() => router.push(USER_ROUTES.resume.write)}
      />
      <ResumeList
        resumes={filtered}
        search={search}
        viewMode={viewMode}
        onSearchChange={setSearch}
        onViewModeChange={handleViewMode}
        onDelete={handleDelete}
      />
    </div>
  )
}
