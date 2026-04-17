"use client"

import { useState, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"

export const ResizableImageView: React.FC<NodeViewProps> = ({
  node,
  selected,
  updateAttributes,
  editor,
}) => {
  const containerRef = useCallback((el: HTMLDivElement | null) => {
    containerElRef.current = el
  }, [])
  const containerElRef = { current: null as HTMLDivElement | null }

  /** 읽기 모드(게시 후 뷰어)에서 이미지 클릭 시 전체화면 라이트박스 표시 */
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const isEditable = editor?.isEditable ?? true

  /** 라이트박스 열려 있을 때 Escape 로 닫기 */
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [lightboxOpen])

  const startResize = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startWidth = containerElRef.current?.offsetWidth ?? 300

      const onMouseMove = (event: MouseEvent) => {
        const newWidth = Math.max(100, startWidth + (event.clientX - startX))
        updateAttributes({ width: Math.round(newWidth) })
      }

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", onMouseUp)
      }

      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    },
    [updateAttributes]
  )

  const { src, alt, title, width } = node.attrs

  return (
    <>
      <NodeViewWrapper className="ri-wrapper">
        <div
          ref={containerRef}
          className={`ri-container${selected && isEditable ? " ri-container--selected" : ""}`}
          style={{ width: width ? `${width}px` : undefined }}
        >
          <img
            src={src}
            alt={alt || ""}
            title={title || ""}
            draggable={false}
            className={[
              "ri-img",
              selected && isEditable ? "ri-img--selected" : "",
              !isEditable ? "ri-img--zoomable" : "",
            ].filter(Boolean).join(" ")}
            onClick={!isEditable ? () => setLightboxOpen(true) : undefined}
          />

          {/* 리사이즈 핸들 — 편집 모드 + 선택 시에만 표시 */}
          {selected && isEditable && (
            <div className="ri-handle" onMouseDown={startResize} />
          )}
        </div>
      </NodeViewWrapper>

      {/* ── 라이트박스 포털 ─────────────────────────────────────────────
          읽기 모드에서 이미지 클릭 시 전체화면 확대.
          createPortal: 에디터 DOM 쌓임 맥락을 탈출해 z-index: 9999 로 표시.
      ──────────────────────────────────────────────────────────────── */}
      {lightboxOpen && createPortal(
        <div
          className="image-lightbox"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="이미지 확대 보기"
        >
          {/* 닫기 버튼 */}
          <button
            className="image-lightbox__close"
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false) }}
            aria-label="닫기"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 이미지 래퍼 — 클릭해도 배경 닫기 이벤트 차단 */}
          <div className="image-lightbox__img-wrap" onClick={(e) => e.stopPropagation()}>
            <img src={src} alt={alt || ""} draggable={false} />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
