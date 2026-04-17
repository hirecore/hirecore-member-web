// _features/editor/model | 에디터 이미지 스토리지 추적 훅
// editor 문서 내 이미지 URL 등장 횟수를 세어 sessionBytes를 실시간 재계산한다.
// blob: URL이 문서에서 제거되면 URL.revokeObjectURL로 브라우저 메모리를 즉시 해제한다.
// 책임 한계: "이미지 URL 추적 + byte 계산 + blob cleanup"까지만, 업로드/저장 정책은 모른다.
import { useEffect } from "react"
import type { Editor } from "@tiptap/react"

interface ImageStorageTrackerOptions {
  /** 업로드 완료된 URL → 파일 크기(bytes) 매핑 — mutable ref */
  uploadedSizesRef: React.MutableRefObject<Map<string, number>>
  /** 현재 session에서 사용된 bytes — mutable ref (setSessionBytes와 동기화 유지) */
  sessionBytesRef: React.MutableRefObject<number>
  /** 현재 업로드 진행 중 bytes (pending) — 화면 표시용 합산에 포함 */
  pendingUploadBytesRef: React.MutableRefObject<number>
  /** sessionBytes state setter — StorageBar 등 UI에 반영 */
  setSessionBytes: (bytes: number) => void
}

/**
 * editor 문서 변경 시마다 이미지 URL 카운트를 재계산해 sessionBytes를 갱신한다.
 *
 * 계산 규칙:
 * - `image` 노드의 src, `imageCarousel` 노드의 images[].url 모두 집계
 * - 동일 URL이 문서에 N번 등장하면 size × N 으로 합산
 * - uploadedSizesRef에 등록된 URL이 문서에서 완전히 제거되면:
 *   - blob: URL인 경우에만 URL.revokeObjectURL 호출 후 map에서 삭제
 *   - non-blob URL(서버 URL 등)은 revoke 금지
 */
export function useEditorImageStorageTracker(
  editor: Editor | null,
  { uploadedSizesRef, sessionBytesRef, pendingUploadBytesRef, setSessionBytes }: ImageStorageTrackerOptions
): void {
  useEffect(() => {
    if (!editor) return
    const handleUpdate = () => {
      if (uploadedSizesRef.current.size === 0) return
      // 문서 내 이미지 URL 등장 횟수 집계
      const urlCounts = new Map<string, number>()
      editor.state.doc.descendants((node) => {
        if (node.type.name === "image" && node.attrs.src) {
          const url = node.attrs.src as string
          urlCounts.set(url, (urlCounts.get(url) ?? 0) + 1)
        }
        if (node.type.name === "imageCarousel" && Array.isArray(node.attrs.images)) {
          for (const img of node.attrs.images as { url: string }[]) {
            if (img.url) urlCounts.set(img.url, (urlCounts.get(img.url) ?? 0) + 1)
          }
        }
      })
      // sessionBytes 재계산 + blob URL 정리
      let newBytes = 0
      for (const [url, size] of uploadedSizesRef.current.entries()) {
        const count = urlCounts.get(url) ?? 0
        newBytes += size * count
        // blob: URL은 에디터에서 완전히 제거된 시점에 브라우저 메모리 해제
        if (count === 0 && url.startsWith("blob:")) {
          URL.revokeObjectURL(url)
          uploadedSizesRef.current.delete(url)
        }
      }
      if (newBytes !== sessionBytesRef.current) {
        sessionBytesRef.current = newBytes
        setSessionBytes(newBytes + pendingUploadBytesRef.current)
      }
    }
    editor.on("update", handleUpdate)
    return () => { editor.off("update", handleUpdate) }
  }, [editor]) // eslint-disable-line react-hooks/exhaustive-deps
  // uploadedSizesRef, sessionBytesRef, pendingUploadBytesRef, setSessionBytes는 ref/stable이므로 의존성 제외
}
