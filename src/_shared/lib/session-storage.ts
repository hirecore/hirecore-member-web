// _shared/lib | sessionStorage 안전 접근 유틸
// SSR 환경(window 미존재)과 quota 초과(SecurityError)를 모두 흡수한다.

const isBrowser = typeof window !== "undefined"

export function safeSessionGet(key: string): string | null {
  if (!isBrowser) return null
  try { return sessionStorage.getItem(key) } catch { return null }
}

export function safeSessionSet(key: string, value: string): boolean {
  if (!isBrowser) return false
  try { sessionStorage.setItem(key, value); return true } catch { return false }
}

export function safeSessionRemove(key: string): void {
  if (!isBrowser) return
  try { sessionStorage.removeItem(key) } catch { /* ignore */ }
}

/** JSON.parse 실패 시 null 반환 */
export function safeSessionGetJSON<T>(key: string): T | null {
  const raw = safeSessionGet(key)
  if (!raw) return null
  try { return JSON.parse(raw) as T } catch { return null }
}

/** JSON.stringify + set. quota 초과 시 false 반환 */
export function safeSessionSetJSON<T>(key: string, value: T): boolean {
  try { return safeSessionSet(key, JSON.stringify(value)) } catch { return false }
}
