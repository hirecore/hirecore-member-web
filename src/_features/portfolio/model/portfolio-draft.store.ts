import { createDraftStore } from "@/_shared/lib"
import type { ConfirmData } from "@/_features/portfolio/lib"

/**
 * 포트폴리오 드래프트 전역 상태
 *
 * previewData      — 작성 페이지 → 미리보기 페이지 데이터 전달 (pw-confirm-data 대체)
 * isBackFromPreview — 미리보기에서 "편집하기" 복귀 신호 (pw-back-from-preview 대체)
 *
 * pw-draft (sessionStorage) 는 새로고침 복원 전용으로 별도 유지
 */

export const usePortfolioDraftStore = createDraftStore<ConfirmData>()
