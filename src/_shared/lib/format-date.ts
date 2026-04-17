/** ISO 날짜 문자열을 한국어 로케일로 포맷 (예: "2026년 3월 10일") */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "2-digit" })
}

/** 간략 날짜 포맷 (예: "2026. 3.") */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "short" })
}
