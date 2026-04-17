// _entities/resume/model | 마이페이지 이력서 임시저장 데이터
// TODO: API 연결 시 GET /api/resumes/drafts 로 교체

import type { DraftItem } from "@/_shared/ui/draft-section"

const MOCK_DRAFT_RESUMES: DraftItem[] = [
  { id: "draft-r1", title: "2026 상반기 프론트엔드 이력서", updatedAt: "2026.04.16" },
]

export function useDraftResumes(): DraftItem[] {
  return MOCK_DRAFT_RESUMES
}
