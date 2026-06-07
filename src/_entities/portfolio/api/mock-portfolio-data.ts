// _entities/portfolio/api | 포트폴리오 도메인 목업 데이터
// TODO: API 연결 시 실제 서버 호출로 교체 (GET /api/portfolios/*)
import { MOCK_DEFAULT_AUTHOR, mockDoc, mockHeading, mockParagraph, mockBulletList } from "@/_shared/lib"
import type { PortfolioDetail } from "../model/use-portfolio-detail.hook"
import type { Portfolio } from "../model/types"
import type { LinkablePortfolio } from "../model/use-my-portfolios.hook"
import type { ManagedPortfolio, AvailableDoc } from "../model/types"
import type { SelectablePortfolio } from "../model/use-selectable-portfolios.hook"

// 목업 전용 카테고리 코드→라벨 매핑.
// 실제 API 연결 시 서버가 categoryName/majorCategoryName을 직접 응답에 포함하여 내려준다.
const MOCK_LABELS: Record<string, { name: string; major: string }> = {
  FRONTEND_ENGINEER:         { name: "프론트엔드 개발",      major: "개발·데이터" },
  BACKEND_ENGINEER:          { name: "백엔드 개발",          major: "개발·데이터" },
  FULLSTACK_ENGINEER:        { name: "풀스택 개발",          major: "개발·데이터" },
  WEB_DEVELOPER:             { name: "웹 개발자",            major: "개발·데이터" },
  SERVER_DEVELOPER:          { name: "서버 개발자",          major: "개발·데이터" },
  SYSTEM_ARCHITECT:          { name: "시스템 아키텍트",      major: "개발·데이터" },
  DEVOPS_ENGINEER:           { name: "데브옵스 엔지니어",    major: "개발·데이터" },
  MACHINE_LEARNING_ENGINEER: { name: "머신러닝 엔지니어",    major: "개발·데이터" },
  PRODUCT_DESIGNER:          { name: "프로덕트 디자이너",    major: "디자인" },
  UI_UX_DESIGNER:            { name: "UI·UX 디자이너",       major: "디자인" },
  PRODUCT_MANAGER:           { name: "프로덕트 매니저",      major: "기획·전략" },
  SERVICE_PLANNER:           { name: "서비스 기획자",        major: "기획·전략" },
  PERFORMANCE_MARKETER:      { name: "퍼포먼스 마케터",      major: "마케팅·광고" },
}
function label(code: string, customCategory?: string) {
  const m = MOCK_LABELS[code]
  return {
    categoryName: customCategory || m?.name || code,
    majorCategoryName: m?.major || "",
  }
}

// ── 공유 본문 콘텐츠 ────────────────────────────────────────────────
export const MOCK_PORTFOLIO_CONTENT = mockDoc(
  mockHeading(2, "프로젝트 개요"),
  mockParagraph("Next.js 15와 TipTap v3 기반의 실시간 협업 문서 에디터입니다. 블록 단위 편집, 드래그 앤 드롭, 슬래시 커맨드, 이미지 리사이즈 등 Notion 수준의 에디팅 경험을 제공합니다."),
  mockHeading(2, "기술 스택"),
  mockBulletList([
    "Frontend: Next.js 15, React 19, TypeScript, TailwindCSS",
    "Editor: TipTap v3, ProseMirror",
    "State: Zustand, TanStack Query",
    "Infra: AWS S3, Vercel, GitHub Actions",
  ]),
  mockHeading(2, "성과"),
  mockBulletList([
    "MAU 1.2만 달성 (론칭 3개월)",
    "Lighthouse Performance 72 → 94 개선",
  ]),
)

const MOCK_LINKED_RESUME_CONTENT = mockDoc(
  mockHeading(2, "자기 소개"),
  mockParagraph("3년간 React와 Next.js를 중심으로 프론트엔드 개발을 해온 개발자입니다."),
)

const MOCK_LINKED_CL_CONTENT = mockDoc(
  mockHeading(2, "지원 동기"),
  mockParagraph("카카오의 사용자 중심 철학과 기술 혁신에 깊이 공감하여 지원하게 되었습니다."),
)

// ── 포트폴리오 상세 ─────────────────────────────────────────────────
export const MOCK_PORTFOLIO_DETAIL_DATA: Record<string, PortfolioDetail> = {
  "1": {
    id: "1",
    publisher: MOCK_DEFAULT_AUTHOR.name,
    isOwner: true,
    isInterested: null,
    categoryCode: "FRONTEND_ENGINEER",
    ...label("FRONTEND_ENGINEER"),
    projectType: "team",
    visibility: "public",
    title: "차세대 취업 사이트 개발 프로젝트",
    thumbnailUrl: null,
    tags: ["풀스택", "팀 프로젝트", "Spring Boot"],
    externalLinks: [{ label: "GitHub", url: "https://github.com" }, { label: "배포 링크", url: "https://example.com" }],
    author: MOCK_DEFAULT_AUTHOR,
    updatedAt: "2025-12-23",
    viewCount: 1245,
    interestCount: 120,
    content: MOCK_PORTFOLIO_CONTENT,
    linkedResume: {
      id: "r1", type: "resume", title: "프론트엔드 개발자 이력서 (2025)",
      visibility: "public",
      tags: ["React", "Next.js", "TypeScript", "TailwindCSS"],
      author: MOCK_DEFAULT_AUTHOR, updatedAt: "2025-12-20",
      content: MOCK_LINKED_RESUME_CONTENT,
    },
    linkedCoverletter: {
      id: "cl1", type: "coverletter", title: "네이버 공채 자기소개서",
      visibility: "public",
      tags: ["React", "성장동기", "협업"],
      author: MOCK_DEFAULT_AUTHOR, updatedAt: "2025-12-15",
      content: MOCK_LINKED_CL_CONTENT,
    },
  },
  "2": {
    id: "2", publisher: MOCK_DEFAULT_AUTHOR.name, isOwner: true, isInterested: null,
    categoryCode: "BACKEND_ENGINEER", ...label("BACKEND_ENGINEER"), projectType: "personal",
    visibility: "public", title: "AI 기반 코드 리뷰 자동화 도구", thumbnailUrl: null,
    tags: ["Python", "FastAPI", "OpenAI"],
    externalLinks: [{ label: "GitHub", url: "https://github.com" }],
    author: MOCK_DEFAULT_AUTHOR, updatedAt: "2025-11-14",
    viewCount: 540, interestCount: 87,
    content: MOCK_PORTFOLIO_CONTENT, linkedResume: null, linkedCoverletter: null,
  },
  "3": {
    id: "3", publisher: MOCK_DEFAULT_AUTHOR.name, isOwner: true, isInterested: null,
    categoryCode: "FRONTEND_ENGINEER", ...label("FRONTEND_ENGINEER"), projectType: "personal",
    visibility: "private", title: "사내 인사 관리 시스템 리뉴얼", thumbnailUrl: null,
    tags: ["React", "TypeScript", "PostgreSQL"], externalLinks: [],
    author: MOCK_DEFAULT_AUTHOR, updatedAt: "2025-10-02",
    viewCount: 12, interestCount: 0,
    content: MOCK_PORTFOLIO_CONTENT, linkedResume: null, linkedCoverletter: null,
  },
}

// ── 포트폴리오 목록 ─────────────────────────────────────────────────
export const MOCK_PORTFOLIO_LIST_DATA: Portfolio[] = [
  {
    id: "1",
    categoryCode: "FULLSTACK_ENGINEER",
    ...label("FULLSTACK_ENGINEER"),
    projectType: "personal",
    title: "Next.js 15 기반 실시간 협업 문서 에디터 구현기",
    excerpt: "TipTap v3와 WebSocket을 결합해 Notion과 유사한 블록 기반 협업 에디터를 구현했습니다.",
    tags: ["Next.js", "TipTap", "WebSocket", "TypeScript"],
    thumbnailUrl: null,
    author: MOCK_DEFAULT_AUTHOR,
    externalLinks: [{ label: "Blog", url: "https://euncheol-dev.vercel.app" }],
    viewCount: 1240,
    likeCount: 87,
    updatedAt: "2026-03-10",
  },
  {
    id: "2",
    categoryCode: "PRODUCT_DESIGNER",
    ...label("PRODUCT_DESIGNER"),
    projectType: "team",
    title: "B2B SaaS 대시보드 UX 리디자인 — 전환율 34% 향상",
    excerpt: "사용자 인터뷰 12건과 히트맵 분석을 바탕으로 정보 구조를 전면 개편했습니다.",
    tags: ["Figma", "Design System", "Prototype", "A/B테스트"],
    thumbnailUrl: null,
    author: { name: "이지수", profileImageUrl: null },
    externalLinks: [{ label: "Figma", url: "https://figma.com" }],
    viewCount: 3820,
    likeCount: 254,
    updatedAt: "2026-03-08",
  },
  {
    id: "3",
    categoryCode: "PRODUCT_MANAGER",
    ...label("PRODUCT_MANAGER"),
    projectType: "team",
    title: "MAU 10만 앱의 온보딩 리뉴얼 프로젝트 — 이탈율 21% 감소",
    excerpt: "신규 가입자의 72%가 온보딩 3단계에서 이탈하는 문제를 발견하고, 단계별 가치 제안을 재설계했습니다.",
    tags: ["Product", "온보딩", "데이터분석", "AB테스트"],
    thumbnailUrl: null,
    author: { name: "박서준", profileImageUrl: null },
    externalLinks: [],
    viewCount: 2150,
    likeCount: 142,
    updatedAt: "2026-03-06",
  },
  {
    id: "4",
    categoryCode: "MACHINE_LEARNING_ENGINEER",
    ...label("MACHINE_LEARNING_ENGINEER"),
    projectType: "personal",
    title: "LLM 기반 채용 공고 자동 분류 시스템 구축",
    excerpt: "LangChain과 GPT-4를 활용해 일 3,000건의 채용 공고를 자동 분류하는 파이프라인을 구축했습니다.",
    tags: ["Python", "LangChain", "RAG", "FastAPI"],
    thumbnailUrl: null,
    author: { name: "최민준", profileImageUrl: null },
    externalLinks: [],
    viewCount: 890,
    likeCount: 63,
    updatedAt: "2026-03-04",
  },
  {
    id: "5",
    categoryCode: "PERFORMANCE_MARKETER",
    ...label("PERFORMANCE_MARKETER"),
    projectType: "personal",
    title: "ROAS 420% 달성한 메타 광고 최적화 케이스 스터디",
    excerpt: "패션 이커머스 브랜드의 메타 광고 계정을 인수해 3개월 만에 ROAS를 120%에서 420%로 끌어올렸습니다.",
    tags: ["Meta Ads", "퍼포먼스", "데이터분석", "리타겟팅"],
    thumbnailUrl: null,
    author: { name: "한예진", profileImageUrl: null },
    externalLinks: [],
    viewCount: 4710,
    likeCount: 318,
    updatedAt: "2026-03-01",
  },
]

// ── 연결용 내 포트폴리오 (작성 폼 링크 섹션) ────────────────────────
export const MOCK_MY_PORTFOLIOS_DATA: LinkablePortfolio[] = [
  { id: "1", title: "Next.js 15 기반 실시간 협업 문서 에디터 구현기", thumbnailUrl: null, tags: ["Next.js", "TipTap", "WebSocket"] },
  { id: "2", title: "B2B SaaS 대시보드 UX 리디자인 — 전환율 34% 향상", thumbnailUrl: null, tags: ["Figma", "Design System"] },
  { id: "3", title: "LLM 기반 채용 공고 자동 분류 시스템 구축", thumbnailUrl: null, tags: ["Python", "LangChain", "RAG"] },
]

// ── 선택 가능 포트폴리오 (LinkPortfolioModal) ────────────────────────
export const MOCK_SELECTABLE_PORTFOLIOS_DATA: SelectablePortfolio[] = [
  { id: "1", title: "Next.js 기반 실시간 협업 문서 에디터", categoryCode: "FULLSTACK_ENGINEER", ...label("FULLSTACK_ENGINEER"), thumbnailUrl: null, tags: ["Next.js", "TipTap", "WebSocket"] },
  { id: "2", title: "B2B SaaS 대시보드 UX 리디자인", categoryCode: "PRODUCT_DESIGNER", ...label("PRODUCT_DESIGNER"), thumbnailUrl: null, tags: ["Figma", "Design System"] },
  { id: "3", title: "MAU 10만 앱 온보딩 리뉴얼", categoryCode: "PRODUCT_MANAGER", ...label("PRODUCT_MANAGER"), thumbnailUrl: null, tags: ["Product", "AB테스트"] },
]

// ── 마이페이지 포트폴리오 관리 탭 ────────────────────────────────────
export const MOCK_MANAGED_PORTFOLIOS_DATA: ManagedPortfolio[] = [
  {
    id: "1", title: "차세대 취업 사이트 개발 프로젝트", privateMemo: "면접 준비용",
    updatedAt: "2025-12-23", visibility: "public", likeCount: 120, projectType: "team",
    categoryCode: "FULLSTACK_ENGINEER",
    ...label("FULLSTACK_ENGINEER"),
    thumbnailUrl: null, tags: ["풀스택", "팀 프로젝트", "Spring Boot"],
    linkedResume: { id: "1", title: "3년차 프론트엔드 개발자 이력서", visibility: "public", updatedAt: "2025-12-20", tags: [] },
    linkedCoverletter: { id: "1", title: "카카오 자기소개서", visibility: "public", updatedAt: "2025-12-10", tags: [] },
  },
  {
    id: "2", title: "AI 기반 코드 리뷰 자동화 도구", privateMemo: "오픈소스 링크 추가 예정",
    updatedAt: "2025-11-14", visibility: "public", likeCount: 87, projectType: "personal",
    categoryCode: "MACHINE_LEARNING_ENGINEER",
    ...label("MACHINE_LEARNING_ENGINEER"),
    thumbnailUrl: null, tags: ["Python", "FastAPI", "OpenAI"],
    linkedResume: { id: "1", title: "3년차 프론트엔드 개발자 이력서", visibility: "public", updatedAt: "2025-12-20", tags: [] },
    linkedCoverletter: null,
  },
  {
    id: "3", title: "사내 인사 관리 시스템 리뉴얼",
    updatedAt: "2025-10-02", visibility: "private", likeCount: 0, projectType: "personal",
    categoryCode: "FRONTEND_ENGINEER",
    ...label("FRONTEND_ENGINEER"),
    thumbnailUrl: null, tags: ["React", "TypeScript", "PostgreSQL"],
    linkedResume: null, linkedCoverletter: null,
  },
]

// ── 포트폴리오 탭에서 연결 가능한 이력서/자기소개서 목록 ──────────────
export const MOCK_AVAILABLE_RESUMES_DATA: AvailableDoc[] = [
  { id: "1", title: "3년차 프론트엔드 개발자 이력서", updatedAt: "2025-12-20", visibility: "public", tags: ["React", "TypeScript", "Next.js"] },
  { id: "2", title: "신입 백엔드 개발자 이력서", updatedAt: "2025-11-05", visibility: "private", tags: ["Java", "Spring Boot", "MySQL"] },
]

export const MOCK_AVAILABLE_COVERLETTERS_DATA: AvailableDoc[] = [
  { id: "1", title: "카카오 프론트엔드 개발자 자기소개서", updatedAt: "2025-12-10", visibility: "public", tags: ["카카오", "프론트엔드", "성장"] },
  { id: "2", title: "네이버 신입 공채 자기소개서", updatedAt: "2025-10-15", visibility: "private", tags: ["네이버", "신입", "서버"] },
]
