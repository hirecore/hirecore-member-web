// _shared/lib | draft 저장 전 editor content sanitizer
// data: URL(base64 인라인)만 sessionStorage 영속 저장에서 제외한다.
// blob: URL은 같은 탭 세션 내에서 유효하므로 드래프트에 보존한다.
// 텍스트/블록/메타데이터는 보존하고, base64 이미지만 제거하여 sessionStorage 과부하를 방지한다.

import type { JSONContent } from "@tiptap/core"

/**
 * sessionStorage에 영속 저장할 수 없는 임시 이미지 URL 여부.
 *
 * - `data:` — base64 인라인, sessionStorage 과부하 → 제거
 * - `blob:` — URL.createObjectURL() 결과, 같은 탭 내 client-side 이동(router.push) 후에도 유효 → 보존
 */
export function isEphemeralImageUrl(src: unknown): boolean {
  if (typeof src !== "string" || src === "") return false
  return src.startsWith("data:")
}

export interface SanitizeResult {
  /** 이미지가 제거된 안전한 JSONContent */
  content: JSONContent
  /** 제거된 이미지 수 (0이면 원본과 동일) */
  droppedImageCount: number
}

/**
 * editor.getJSON() 결과를 sessionStorage 저장용으로 정제한다.
 *
 * - `image` 노드 → src가 data: 이면 해당 노드 자체를 제거 (blob: URL은 보존)
 * - `imageCarousel` 노드 → images 배열에서 data: url 항목 제거, 전체 제거 시 노드 삭제
 * - `imageUploadNode` → 업로드 진행 중 placeholder, 항상 제거
 * - 나머지 블록(텍스트, 헤딩, 목록 등)은 그대로 보존
 */
export function sanitizeDraftContent(content: JSONContent): SanitizeResult {
  let droppedImageCount = 0

  function processNode(node: JSONContent): JSONContent | null {
    // 업로드 진행 중 placeholder — 저장 불필요
    if (node.type === "imageUploadNode") {
      droppedImageCount++
      return null
    }

    // 단일 이미지
    if (node.type === "image") {
      if (isEphemeralImageUrl(node.attrs?.src)) {
        droppedImageCount++
        return null
      }
      return node
    }

    // 이미지 캐러셀 — images 배열 내 임시 항목 필터링
    if (node.type === "imageCarousel") {
      const images = (node.attrs?.images as { url: string; alt?: string }[] | undefined) ?? []
      const safe = images.filter((img) => !isEphemeralImageUrl(img.url))
      droppedImageCount += images.length - safe.length
      if (safe.length === 0) return null  // 모두 임시 → 노드 전체 제거
      if (safe.length === images.length) return node  // 변경 없음
      return { ...node, attrs: { ...node.attrs, images: safe } }
    }

    // 자식 노드 재귀 처리
    if (node.content?.length) {
      const newContent = node.content
        .map((child) => processNode(child))
        .filter((n): n is JSONContent => n !== null)
      if (newContent.length === node.content.length) return node
      return { ...node, content: newContent }
    }

    return node
  }

  const processed = processNode(content)
  return {
    content: processed ?? { type: "doc", content: [] },
    droppedImageCount,
  }
}

/**
 * data: URL을 키로 가진 항목을 제외한 sizes 레코드를 반환한다.
 * blob: URL(같은 탭에서 유효)은 보존하고, base64만 제거한다.
 * autosave의 _uploadedSizes를 sessionStorage에 저장 가능한 형태로 정제한다.
 */
export function filterPersistentSizes(
  sizes: Map<string, number>
): Record<string, number> {
  const result: Record<string, number> = {}
  sizes.forEach((size, url) => {
    if (!isEphemeralImageUrl(url)) result[url] = size
  })
  return result
}
