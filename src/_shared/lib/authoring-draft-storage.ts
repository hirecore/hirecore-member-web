// _shared/lib | 작성 흐름 draft/sessionStorage 공통 helper
// portfolio / resume / coverletter write 흐름이 공유하는 persist 패턴을 모은다.
// safeSession* 유틸 위에 얇은 도메인 언어를 추가할 뿐이며, 흐름 제어(모달·상태·에디터)는 각 model에 유지한다.

import { safeSessionGetJSON, safeSessionSetJSON, safeSessionRemove } from "./session-storage"

// ── Draft 저장/복원/삭제 ─────────────────────────────────────────────────────

/**
 * Draft를 JSON으로 직렬화하여 sessionStorage에 저장한다.
 * 용량 초과(QuotaExceededError)로 저장 실패 시 liteDraft가 있으면 liteDraft로 재시도한다.
 *
 * @returns 저장 성공 여부 (main 또는 fallback 중 하나라도 성공하면 true)
 */
export function draftSave<T, L = T>(key: string, draft: T, liteDraft?: L): boolean {
  const saved = safeSessionSetJSON(key, draft)
  if (!saved && liteDraft !== undefined) {
    return safeSessionSetJSON(key, liteDraft)
  }
  return saved
}

/**
 * sessionStorage에서 draft를 복원한다.
 * 키 부재·JSON 파싱 실패·SSR 환경 모두 null 반환.
 */
export function draftRestore<T>(key: string): T | null {
  return safeSessionGetJSON<T>(key)
}

/** sessionStorage에서 draft 키를 제거한다. */
export function draftClear(key: string): void {
  safeSessionRemove(key)
}

// ── Preview-sizes 보조 데이터 ────────────────────────────────────────────────

/**
 * 이미지 URL → 파일크기 맵을 미리보기 이동 전에 임시 저장한다.
 * sizes가 비어 있으면 저장하지 않는다 (불필요한 쓰기 방지).
 */
export function previewSizesSave(key: string, sizes: Record<string, number>): void {
  if (Object.keys(sizes).length > 0) safeSessionSetJSON(key, sizes)
}

/**
 * preview-sizes를 복원하고 해당 키를 삭제한다 (1회성 소비 패턴).
 * 없거나 파싱 실패 시 null 반환.
 */
export function previewSizesRestore(key: string): Record<string, number> | null {
  const sizes = safeSessionGetJSON<Record<string, number>>(key)
  if (sizes) safeSessionRemove(key)
  return sizes
}
