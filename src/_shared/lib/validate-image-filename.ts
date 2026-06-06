// _shared/lib | 이미지 업로드 파일명 검증
// 백엔드 검증과 별개로, 악성/잘못된 파일명을 업로드 진입 시점에 차단해 UX 와 다층 방어를 확보한다.
// (보안 경계는 백엔드가 담당 — 프론트 검증은 우회 가능하므로 1차 방어선으로만 사용한다.)

export type ImageFilenameCheck =
  | { ok: true }
  | { ok: false; reason: string }

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"] as const

// 이중 확장자 위장 차단용 — 최종 확장자 직전에 위치하면 거부.
const DANGEROUS_INNER_EXTENSIONS = [
  ".exe", ".sh", ".bat", ".cmd", ".com", ".vbs",
  ".js", ".mjs", ".jar", ".html", ".htm", ".php", ".dll",
] as const

const MAX_LENGTH = 255

/**
 * 사용자가 업로드한 이미지 파일명을 검증한다.
 *
 * 차단 정책:
 *  - 길이 > 255자
 *  - 제어문자 / null byte / CRLF
 *  - 양방향 제어문자 (RTL override 등 확장자 위장)
 *  - 경로 분리자 / 상위 디렉토리 (`/`, `\`, `..`)
 *  - URL 패턴 (`http://`, `https://`, `data:`)
 *  - 허용 확장자 외 (.png/.jpg/.jpeg/.gif/.webp/.svg)
 *  - 이중 확장자 (.exe.png 등 위험 확장자가 최종 확장자 앞에 위치)
 */
export function validateImageFilename(name: string): ImageFilenameCheck {
  if (!name || name.length === 0) {
    return { ok: false, reason: "파일명이 비어 있습니다." }
  }

  if (name.length > MAX_LENGTH) {
    return { ok: false, reason: `파일명이 ${MAX_LENGTH}자를 초과합니다.` }
  }

  // 제어 문자 (\x00-\x1f, \x7f) — null byte, CR, LF 등 포함
  if (/[\x00-\x1f\x7f]/.test(name)) {
    return { ok: false, reason: "파일명에 허용되지 않는 문자가 포함되어 있습니다." }
  }

  // 유니코드 양방향 제어 — RTL override 로 확장자 위장 방지
  if (/[‪-‮⁦-⁩]/.test(name)) {
    return { ok: false, reason: "파일명에 허용되지 않는 유니코드 제어 문자가 포함되어 있습니다." }
  }

  // 경로 분리자 / 상위 이동
  if (/[\/\\]/.test(name) || name.includes("..")) {
    return { ok: false, reason: "파일명에 경로 문자(/, \\, ..)는 사용할 수 없습니다." }
  }

  // URL 패턴 (피싱 방지)
  if (/https?:\/\//i.test(name) || /^data:/i.test(name)) {
    return { ok: false, reason: "파일명에 URL은 포함할 수 없습니다." }
  }

  // 확장자 검사 — 마지막 확장자만 추출해 화이트리스트와 대조
  const lower = name.toLowerCase()
  const dotIdx = lower.lastIndexOf(".")
  if (dotIdx <= 0 || dotIdx === lower.length - 1) {
    return { ok: false, reason: "이미지 파일만 업로드할 수 있습니다." }
  }
  const ext = lower.slice(dotIdx)
  if (!ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
    return { ok: false, reason: "이미지 파일만 업로드할 수 있습니다." }
  }

  // 이중 확장자 — 최종 확장자 앞부분이 위험 확장자로 끝나면 거부
  // 예: "report.exe.png" → stem="report.exe" → ".exe" 로 끝남 → 거부
  const stem = lower.slice(0, dotIdx)
  for (const danger of DANGEROUS_INNER_EXTENSIONS) {
    if (stem.endsWith(danger)) {
      return { ok: false, reason: "허용되지 않는 확장자가 파일명에 포함되어 있습니다." }
    }
  }

  return { ok: true }
}
