// _shared/config | 작성 흐름 공통 상수
// portfolio / resume / coverletter write·preview 흐름이 공유하는 sessionStorage 키·숫자 상수

// ── Preview sizes sessionStorage 키 ─────────────────────────────────────────

/**
 * 미리보기로 이동할 때 이미지 URL → bytes 맵을 임시 보관하는 키.
 * 미리보기 → "편집하기" 복귀 시 스토리지 카운터를 복원하는 데 사용한다.
 */
export const PORTFOLIO_PREVIEW_SIZES_KEY = "pw-preview-sizes"
export const RESUME_PREVIEW_SIZES_KEY    = "rw-preview-sizes"

// ── 업로드 상수 ─────────────────────────────────────────────────────────────

/** 캐러셀 / 다중 붙여넣기 시 한 번에 허용하는 이미지 최대 개수 */
export const AUTHORING_IMAGE_UPLOAD_LIMIT = 7
