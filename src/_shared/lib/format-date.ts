/** ISO 날짜 문자열을 한국어 로케일로 포맷 (예: "2026년 3월 10일") */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "2-digit" })
}

/** 간략 날짜 포맷 (예: "2026. 3.") */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "short" })
}

/**
 * 분 단위까지 보이는 날짜·시간 포맷 (예: "2026-06-05 14:00").
 * 빈 문자열 / 파싱 실패 시 원본을 그대로 반환해 호출부에서 추가 분기 없이 안전하게 노출.
 */
export function formatDateTimeMinute(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}
