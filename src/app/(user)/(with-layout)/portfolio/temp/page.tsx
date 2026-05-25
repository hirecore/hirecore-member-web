// 임시 페이지 — 백엔드 API 설계 참고용으로 mock 데이터를 그대로 렌더링한다.
// usePortfolioDetail 이 MOCK_PORTFOLIO_DETAIL_DATA["1"] 을 반환하므로 자기소개서/이력서/포트폴리오 3개 탭 모두 채워진다.
// 운영 API 가 모든 필드(연결 문서 포함) 를 채워줄 수 있게 되면 이 페이지는 삭제.
import type { Metadata } from "next"
import { PortfolioReadView } from "@/_views/portfolio"

export const metadata: Metadata = {
  title: "포트폴리오 상세 (임시)",
}

export default function PortfolioTempPage() {
  return <PortfolioReadView id="1" />
}
