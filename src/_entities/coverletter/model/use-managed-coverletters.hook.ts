// _entities/coverletter/model | 마이페이지 자기소개서 관리 탭 데이터
// TODO: API 연결 시 GET /api/coverletters/mine 로 교체
import { MOCK_MANAGED_COVERLETTERS_DATA } from "../api/mock-coverletter-data"
import type { ManagedCoverLetter } from "./types"

export function useManagedCoverLetters(): ManagedCoverLetter[] {
  return MOCK_MANAGED_COVERLETTERS_DATA
}
