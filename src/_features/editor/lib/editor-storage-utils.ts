// _features/editor/lib | 에디터 문서 이미지 URL 합산 → sessionBytes 재계산 순수 헬퍼
// React 생명주기 의존성이 없는 순수 함수이므로 lib/ 에 위치한다.
import type { MutableRefObject } from "react"
import type { Editor } from "@tiptap/react"

/**
 * 에디터 문서를 순회해 uploadedSizesRef에 등록된 image / imageCarousel URL 크기를 합산한다.
 * sessionBytesRef.current 갱신 후 setSessionBytes 를 호출해 UI에 반영한다.
 *
 * 미리보기 복귀 시 previewSizes 주입 직후 호출 — portfolio / resume write model 공통.
 * uploadedSizesRef 가 비어있으면 즉시 반환한다 (불필요한 doc 순회 방지).
 */
export function calcEditorSessionBytes(
  editor: Editor,
  uploadedSizesRef: MutableRefObject<Map<string, number>>,
  sessionBytesRef: MutableRefObject<number>,
  setSessionBytes: (bytes: number) => void,
): void {
  if (uploadedSizesRef.current.size === 0) return
  let total = 0
  editor.state.doc.descendants((node) => {
    if (node.type.name === "image" && node.attrs.src) {
      total += uploadedSizesRef.current.get(node.attrs.src as string) ?? 0
    }
    if (node.type.name === "imageCarousel" && Array.isArray(node.attrs.images)) {
      for (const img of node.attrs.images as { url: string }[]) {
        if (img.url) total += uploadedSizesRef.current.get(img.url) ?? 0
      }
    }
  })
  sessionBytesRef.current = total
  setSessionBytes(total)
}
