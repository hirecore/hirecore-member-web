// 임시 페이지 — 백엔드 API 설계 참고용으로 현재 mock 데이터 화면을 그대로 유지한다.
// 캐논 / 는 GET /api/portfolios/summaries/public 으로 무한 스크롤 연동되어 있으며,
// 이 라우트는 mock 화면을 계속 노출해 디자인/레이아웃 검토 채널을 유지한다.
// 실제 배포 전 명시적 삭제 요청을 받기 전까지 유지.
import type { Metadata } from "next"
import { PortfolioListView } from "@/_views/portfolio"

export const metadata: Metadata = { title: "포트폴리오 탐색 (임시)" }

export default function TempPage() {
  return <PortfolioListView mock />
}
