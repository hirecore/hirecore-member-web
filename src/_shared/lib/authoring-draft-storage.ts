// _shared/lib | 작성 흐름 preview 보조 sessionStorage helper
// portfolio / resume write 흐름이 공유하는 preview-sizes persist 패턴을 모은다.

import { safeSessionGetJSON, safeSessionSetJSON, safeSessionRemove } from "./session-storage"

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
