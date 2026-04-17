// _entities/coverletter/model | 마이페이지 자기소개서 임시저장 데이터
// TODO: API 연결 시 GET /api/coverletters/drafts 로 교체

import type { DraftItem } from "@/_shared/ui/draft-section"

const MOCK_DRAFT_COVERLETTERS: DraftItem[] = [
  { id: "draft-c1", title: "카카오 프론트엔드 자기소개서", updatedAt: "2026.04.14" },
]

export function useDraftCoverLetters(): DraftItem[] {
  return MOCK_DRAFT_COVERLETTERS
}
