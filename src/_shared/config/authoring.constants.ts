// _shared/config | 작성 흐름 공통 상수
// portfolio / resume / coverletter write·preview 흐름이 공유하는 sessionStorage 키·숫자 상수

// ── Draft sessionStorage 키 ──────────────────────────────────────────────────

/** 새 글 작성 중 자동저장 키 */
export const PORTFOLIO_DRAFT_KEY   = "pw-draft"
export const RESUME_DRAFT_KEY      = "rw-draft"
export const COVERLETTER_DRAFT_KEY = "clw-draft"

/**
 * 기존 글 수정 시 사용하는 문서별 독립 draft 키 팩토리.
 * 새 글 draft 키와 충돌하지 않아 "이어서 작성" 팝업 오작동을 방지한다.
 */
export const portfolioEditDraftKey   = (id: string) => `pw-draft-edit-${id}`
export const resumeEditDraftKey      = (id: string) => `rw-draft-edit-${id}`
export const coverLetterEditDraftKey = (id: string) => `clw-draft-edit-${id}`

// ── Preview sizes sessionStorage 키 ─────────────────────────────────────────

/**
 * 미리보기로 이동할 때 이미지 URL → bytes 맵을 임시 보관하는 키.
 * 미리보기 → "편집하기" 복귀 시 스토리지 카운터를 복원하는 데 사용한다.
 */
export const PORTFOLIO_PREVIEW_SIZES_KEY = "pw-preview-sizes"
export const RESUME_PREVIEW_SIZES_KEY    = "rw-preview-sizes"

// ── 업로드·자동저장 상수 ─────────────────────────────────────────────────────

/** 캐러셀 / 다중 붙여넣기 시 한 번에 허용하는 이미지 최대 개수 */
export const AUTHORING_IMAGE_UPLOAD_LIMIT = 7

/** 자동저장 디바운스 딜레이 (ms) */
export const AUTOSAVE_DELAY_MS = 800
