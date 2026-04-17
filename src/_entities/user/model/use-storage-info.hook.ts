import type { StorageInfo } from "@/_shared/model"

// TODO: API 연결 시 실제 사용량 fetch로 교체
const MOCK_STORAGE: StorageInfo = {
  used: 18_874_368,
  quota: 40_000_000,
  tier: "gold",
}

export function useStorageInfo(): StorageInfo {
  return MOCK_STORAGE
}
