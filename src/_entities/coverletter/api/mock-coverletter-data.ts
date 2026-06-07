// _entities/coverletter/api | 자기소개서 도메인 목업 데이터
// TODO: API 연결 시 실제 서버 호출로 교체 (GET /api/coverletters/*)
import { MOCK_DEFAULT_AUTHOR, mockDoc, mockHeading, mockParagraph, mockBulletList } from "@/_shared/lib"
import type { CoverLetterDetail } from "../model/use-coverletter-detail.hook"
import type { ManagedCoverLetter } from "../model/types"

// ── 자기소개서 본문 콘텐츠 ───────────────────────────────────────────
export const MOCK_CL_CONTENT = mockDoc(
  mockHeading(2, "지원 동기"),
  mockParagraph("카카오의 사용자 중심 철학과 기술 혁신에 깊이 공감하여 지원하게 되었습니다. 특히 카카오톡이 단순한 메신저를 넘어 생활 플랫폼으로 진화해 온 과정에서, 프론트엔드 개발자로서 사용자 경험에 직접적인 영향을 미치는 역할을 수행하고 싶다는 열망을 갖게 되었습니다."),
  mockHeading(2, "성장 과정 및 역량"),
  mockBulletList([
    "TipTap 기반 실시간 협업 에디터 개발 — MAU 1.2만 달성",
    "Next.js App Router 마이그레이션으로 LCP 42% 개선",
  ]),
  mockHeading(2, "입사 후 포부"),
  mockParagraph("카카오 프론트엔드 팀에 합류하여 수억 명의 사용자가 매일 사용하는 서비스의 품질을 높이는 데 기여하고 싶습니다."),
)

// ── 자기소개서 상세 ─────────────────────────────────────────────────
export const MOCK_COVERLETTER_DETAIL_DATA: Record<string, CoverLetterDetail> = {
  "1": {
    id: "1",
    authorId: "u_mock_1",
    title: "카카오 프론트엔드 개발자 자기소개서",
    company: "카카오",
    position: "프론트엔드 개발자",
    visibility: "public",
    tags: ["React", "성장동기", "협업"],
    externalLinks: [
      { label: "GitHub", url: "https://github.com/example" },
    ],
    author: MOCK_DEFAULT_AUTHOR,
    updatedAt: "2026-03-08",
    linkedPortfolios: [
      { id: "1", title: "Next.js 기반 실시간 협업 문서 에디터", thumbnailUrl: null, tags: ["Next.js", "TipTap"] },
    ],
    content: MOCK_CL_CONTENT,
  },
  "2": {
    id: "2",
    authorId: "u_mock_1",
    title: "라인 플러스 백엔드 자기소개서",
    company: "라인 플러스",
    position: "백엔드 개발자",
    visibility: "private",
    tags: ["Java", "Spring Boot", "MSA"],
    externalLinks: [],
    author: MOCK_DEFAULT_AUTHOR,
    updatedAt: "2026-02-20",
    linkedPortfolios: [],
    content: MOCK_CL_CONTENT,
  },
  "3": {
    id: "3",
    authorId: "u_mock_1",
    title: "토스 서버 개발자 자기소개서",
    company: "토스",
    position: "서버 개발자",
    visibility: "private",
    tags: ["Kotlin", "MSA", "결제시스템"],
    externalLinks: [],
    author: MOCK_DEFAULT_AUTHOR,
    updatedAt: "2026-01-15",
    linkedPortfolios: [],
    content: MOCK_CL_CONTENT,
  },
}

// ── 마이페이지 자기소개서 관리 탭 ────────────────────────────────────
export const MOCK_MANAGED_COVERLETTERS_DATA: ManagedCoverLetter[] = [
  {
    id: "1", title: "카카오 프론트엔드 개발자 자기소개서", privateMemo: "2026 상반기 공채",
    updatedAt: "2026-03-08", visibility: "public", tags: ["React", "성장동기", "협업"],
    majorCategoryName: "개발", categoryName: "프론트엔드",
    linkedPortfolioCount: 2, linkedPortfolioIds: ["1", "2"],
  },
  {
    id: "2", title: "라인 플러스 백엔드 자기소개서", privateMemo: "1차 서류 통과 후 보완 예정",
    updatedAt: "2026-02-20", visibility: "private", tags: ["Java", "Spring Boot", "MSA"],
    majorCategoryName: "개발", categoryName: "백엔드",
    linkedPortfolioCount: 1, linkedPortfolioIds: ["2"],
  },
  {
    id: "3", title: "토스 서버 개발자 자기소개서", privateMemo: "초안 — 추가 수정 필요",
    updatedAt: "2026-01-15", visibility: "private", tags: ["Kotlin", "MSA", "결제시스템"],
    majorCategoryName: "개발", categoryName: "서버",
    linkedPortfolioCount: 0, linkedPortfolioIds: [],
  },
]
