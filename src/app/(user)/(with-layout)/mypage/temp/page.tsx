// 임시 페이지 — 백엔드 API 설계 참고용으로 현재 mock 데이터 화면을 그대로 유지한다.
// 본 경로(/mypage)가 GET /api/portfolios/summaries/mine 으로 실 API 전환된 이후에도,
// 이 라우트에서는 mock 화면을 계속 노출해 디자인/레이아웃 검토 채널을 유지한다.
// 실제 배포 전 명시적 삭제 요청을 받기 전까지 유지.
import type { Metadata } from "next"
import { Suspense } from "react"
import { UserMypageView } from "@/_views/user-mypage"

export const metadata: Metadata = { title: "마이페이지 (임시)" }

export default function MypageTempPage() {
  return (
    <Suspense fallback={<div className="ump-loading" />}>
      <UserMypageView mock />
    </Suspense>
  )
}
