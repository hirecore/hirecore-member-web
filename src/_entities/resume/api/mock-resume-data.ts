// _entities/resume/api | 이력서 도메인 목업 데이터
// TODO: API 연결 시 실제 서버 호출로 교체 (GET /api/resumes/*)
import { MOCK_DEFAULT_AUTHOR, mockDoc, mockHeading, mockParagraph, mockBulletList } from "@/_shared/lib"
import type { ResumeDetail } from "../model/use-resume-detail.hook"
import type { ManagedResume } from "../model/types"

// ── 이력서 본문 콘텐츠 ───────────────────────────────────────────────
export const MOCK_RESUME_CONTENT = mockDoc(
  mockHeading(2, "자기 소개"),
  mockParagraph("안녕하세요. 3년간 React와 Next.js를 중심으로 프론트엔드 개발을 해온 개발자입니다. 사용자 경험을 최우선으로 생각하며, 성능 최적화와 접근성 개선에 깊은 관심을 가지고 있습니다."),
  mockHeading(2, "기술 스택"),
  mockBulletList([
    "Language: TypeScript, JavaScript (ES2022+)",
    "Framework: Next.js 16, React 19, TailwindCSS",
    "State: Zustand, React Query, Jotai",
    "Infra: AWS S3, Vercel, Docker, GitHub Actions",
  ]),
  mockHeading(2, "경력"),
  mockHeading(3, "(주)테크스타트 — 프론트엔드 개발자 (2023.03 ~ 현재)"),
  mockBulletList([
    "TipTap v3 기반 실시간 협업 문서 에디터 0→1 개발 (MAU 1.2만)",
    "Next.js 16 App Router 마이그레이션으로 LCP 42% 개선",
  ]),
  mockHeading(2, "학력"),
  mockParagraph("한국대학교 컴퓨터공학과 졸업 (2021.02)"),
)

// ── 이력서 상세 ─────────────────────────────────────────────────────
export const MOCK_RESUME_DETAIL_DATA: Record<string, ResumeDetail> = {
  "1": {
    id: "1",
    authorId: "u_mock_1",
    title: "3년차 프론트엔드 개발자 이력서",
    visibility: "public",
    interestFields: ["웹개발", "프론트엔드"],
    tags: ["React", "Next.js", "TypeScript", "TailwindCSS", "GraphQL"],
    externalLinks: [
      { label: "GitHub", url: "https://github.com/example" },
      { label: "Blog", url: "https://blog.example.com" },
    ],
    author: MOCK_DEFAULT_AUTHOR,
    updatedAt: "2026-03-10",
    linkedPortfolios: [
      { id: "1", title: "Next.js 기반 실시간 협업 문서 에디터", thumbnailUrl: null, tags: ["Next.js", "TipTap"] },
      { id: "2", title: "B2B SaaS 대시보드 UX 리디자인", thumbnailUrl: null, tags: ["Figma"] },
    ],
    content: MOCK_RESUME_CONTENT,
  },
  "2": {
    id: "2",
    authorId: "u_mock_1",
    title: "풀스택 개발자 이력서 (스타트업 지원용)",
    visibility: "private",
    interestFields: ["풀스택", "백엔드"],
    tags: ["Node.js", "PostgreSQL", "Docker", "AWS"],
    externalLinks: [],
    author: MOCK_DEFAULT_AUTHOR,
    updatedAt: "2026-02-28",
    linkedPortfolios: [],
    content: MOCK_RESUME_CONTENT,
  },
}

// ── 마이페이지 이력서 관리 탭 ────────────────────────────────────────
export const MOCK_MANAGED_RESUMES_DATA: ManagedResume[] = [
  { id: "1", title: "3년차 프론트엔드 개발자 이력서", privateMemo: "네이버/카카오 공채 지원용", updatedAt: "2026-03-10", visibility: "public", tags: ["React", "Next.js", "TypeScript"], interestFields: ["웹 프론트엔드", "UI 개발"], linkedPortfolioCount: 2, linkedPortfolioIds: ["1", "2"] },
  { id: "2", title: "풀스택 개발자 이력서 (스타트업 지원용)", updatedAt: "2026-02-28", visibility: "private", tags: ["Node.js", "PostgreSQL", "Docker"], interestFields: ["풀스택 개발", "백엔드", "DevOps"], linkedPortfolioCount: 1, linkedPortfolioIds: ["2"] },
]
