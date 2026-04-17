// _entities/resume/model | 마이페이지 이력서 관리 탭 데이터
// TODO: API 연결 시 GET /api/resumes/mine 로 교체
import { MOCK_MANAGED_RESUMES_DATA } from "../api/mock-resume-data"
import type { ManagedResume } from "./types"

export function useManagedResumes(): ManagedResume[] {
  return MOCK_MANAGED_RESUMES_DATA
}
