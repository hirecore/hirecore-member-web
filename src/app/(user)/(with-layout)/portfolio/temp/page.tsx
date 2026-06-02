// 임시 페이지 — 백엔드 API 설계 참고용으로 mock 데이터를 그대로 렌더링한다.
// mock prop으로 useMockPortfolioDetail 경로를 강제 — 실 API를 호출하지 않는다.
// 연결 문서 / 작성자의 다른 포트폴리오 등이 mock으로 모두 채워져 있어 레이아웃 점검에 사용한다.
// 운영 API가 해당 필드까지 모두 제공하게 되면 이 페이지는 삭제.
import type { Metadata } from "next"
import { PortfolioReadView } from "@/_views/portfolio"

export const metadata: Metadata = {
  title: "포트폴리오 상세 (임시)",
}

export default function PortfolioTempPage() {
  return <PortfolioReadView id="1" mock />
}
