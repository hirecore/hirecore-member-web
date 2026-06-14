// _features/editor/model | 이미지 붙여넣기 핸들러 훅
// clipboard 이미지를 에디터에 삽입하는 paste 이벤트를 editor DOM에 연결한다.
// 1장 → image 노드, 여러 장 → imageCarousel 노드. limit 초과분은 잘라낸다.
// base64 HTML quota 검사, imageCarousel 중복 삽입 방지도 포함한다.
import { useEffect } from "react"
import type { Editor } from "@tiptap/react"
import type { StorageInfo } from "@/_shared/model"
import { toWebP } from "../lib"

interface ImagePasteHandlerOptions {
  /** WebP 변환 + quota 검사가 내장된 업로드 함수 ref — 호출 시점에 최신 버전 참조 */
  uploadRef: React.MutableRefObject<(file: File) => Promise<string>>
  /** 현재 사용자 스토리지 정보 ref — quota 계산에 사용 */
  storageInfoRef: React.MutableRefObject<StorageInfo | undefined>
  /** 현재 세션 사용 bytes ref */
  sessionBytesRef: React.MutableRefObject<number>
  /** 업로드 진행 중 bytes ref — multi-image quota 선검사에 사용 */
  pendingUploadBytesRef: React.MutableRefObject<number>
  /** 스토리지 초과 시 호출 — ExceededModal 표시 */
  setExceededModal: (v: { fileSize: number } | null) => void
  /** 업로드 에러 메시지 표시 함수 ref — 호출 시점에 최신 버전 참조 */
  showUploadErrorRef: React.MutableRefObject<(msg: string) => void>
  /** 1회 붙여넣기당 허용 최대 이미지 수 */
  limit: number
}

/**
 * editor DOM의 paste 이벤트에 이미지 삽입 핸들러를 연결한다.
 *
 * 삽입 정책:
 * - imageCarousel HTML이 포함된 붙여넣기 → 차단 (중복 삽입 방지)
 * - base64 인라인 이미지 HTML → quota 초과 시 차단
 * - 바이너리 이미지 파일 1장 → image 노드
 * - 바이너리 이미지 파일 여러 장 → WebP 변환 후 quota 검사 → imageCarousel 노드
 */
export function useEditorImagePasteHandler(
  editor: Editor | null,
  {
    uploadRef,
    storageInfoRef,
    sessionBytesRef,
    pendingUploadBytesRef,
    setExceededModal,
    showUploadErrorRef,
    limit,
  }: ImagePasteHandlerOptions
): void {
  useEffect(() => {
    if (!editor) return

    const onPaste = (event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items ?? [])
      const hasHtml = items.some((i) => i.type === "text/html")
      const binaryImages = items.filter((i) => i.kind === "file" && i.type.startsWith("image/"))

      if (hasHtml) {
        const html = event.clipboardData?.getData("text/html") ?? ""
        // imageCarousel이 포함된 HTML → 중복 삽입 방지를 위해 차단
        if (/imageCarousel/i.test(html)) {
          event.preventDefault()
          event.stopImmediatePropagation()
          return
        }
        // base64 인라인 이미지 → quota 초과 시 차단
        if (html.includes(";base64,")) {
          const estimatedBytes = Math.ceil(html.length * 0.75)
          const info = storageInfoRef.current
          if (info && info.used + sessionBytesRef.current + estimatedBytes > info.quota) {
            setExceededModal({ fileSize: estimatedBytes })
            event.preventDefault()
            event.stopImmediatePropagation()
          }
        }
        return
      }

      if (binaryImages.length === 0) return

      event.preventDefault()
      event.stopImmediatePropagation()

      const imageFiles = binaryImages
        .map((i) => i.getAsFile())
        .filter((f): f is File => f !== null)

      if (imageFiles.length === 0) return

      const limited = imageFiles.slice(0, limit)
      const insertPos = editor.state.selection.from

      if (limited.length === 1) {
        // 단일 이미지 → image 노드로 직접 삽입
        uploadRef.current(limited[0])
          .then((url) => {
            const node = editor.state.schema.nodes.image.create({
              src: url,
              alt: limited[0].name.replace(/\.[^/.]+$/, "") || "image",
              title: limited[0].name.replace(/\.[^/.]+$/, "") || "image",
            })
            editor.view.dispatch(editor.state.tr.insert(insertPos, node))
          })
          .catch((err: unknown) => {
            if (err instanceof Error && err.message !== "__QUOTA_EXCEEDED__") {
              showUploadErrorRef.current(err.message || "이미지 업로드에 실패했습니다.")
            }
          })
      } else {
        // 다중 이미지 → WebP 변환 후 quota 선검사 → imageCarousel 노드로 삽입
        Promise.all(limited.map((f) => toWebP(f))).then((webpFiles) => {
          const quotaInfo = storageInfoRef.current
          const totalNewBytes = webpFiles.reduce((sum, f) => sum + f.size, 0)
          if (quotaInfo) {
            const projected = quotaInfo.used + sessionBytesRef.current + pendingUploadBytesRef.current + totalNewBytes
            if (projected > quotaInfo.quota) {
              setExceededModal({ fileSize: totalNewBytes })
              return
            }
          }
          Promise.all(
            webpFiles.map((f) =>
              uploadRef.current(f).then((url) => ({
                url,
                alt: f.name.replace(/\.[^/.]+$/, "") || "image",
              }))
            )
          )
            .then((images) => {
              if (images.length === 1) {
                const node = editor.state.schema.nodes.image.create({
                  src: images[0].url,
                  alt: images[0].alt,
                  title: images[0].alt,
                })
                editor.view.dispatch(editor.state.tr.insert(insertPos, node))
              } else {
                const node = editor.state.schema.nodes.imageCarousel.create({ images })
                editor.view.dispatch(editor.state.tr.insert(insertPos, node))
              }
            })
            .catch(console.error)
        }).catch(console.error)
      }
    }

    const el = editor.view.dom
    el.addEventListener("paste", onPaste, { capture: true })
    return () => el.removeEventListener("paste", onPaste, { capture: true })
  }, [editor]) // eslint-disable-line react-hooks/exhaustive-deps
  // uploadRef, storageInfoRef, sessionBytesRef, pendingUploadBytesRef,
  // showUploadErrorRef, setExceededModal, limit — ref/stable이므로 의존성 제외
}
