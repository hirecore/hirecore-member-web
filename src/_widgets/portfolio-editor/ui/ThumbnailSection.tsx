"use client"

import type { RefObject } from "react"
import "./thumbnail-section.scss"

interface Props {
  thumbnailUrl: string | null
  isDragOver: boolean
  thumbnailInputRef: RefObject<HTMLInputElement | null>
  onFile: (file: File) => void
  onRemove: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}

export function ThumbnailSection({
  thumbnailUrl, isDragOver, thumbnailInputRef,
  onFile, onRemove, onDragOver, onDragLeave, onDrop,
}: Props) {
  return (
    <section className="pw-section">
      <div className="pw-section__head">
        <span className="pw-section__label">썸네일</span>
        <span className="pw-section__optional">선택</span>
      </div>

      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        className="pw-thumb-input"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />

      {thumbnailUrl ? (
        <div className="pw-thumb-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt="썸네일 미리보기" className="pw-thumb-preview__img" />
          <button
            type="button"
            className="pw-thumb-preview__remove"
            onClick={onRemove}
            aria-label="썸네일 삭제"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          className={`pw-thumb-zone${isDragOver ? " pw-thumb-zone--dragover" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="썸네일 이미지 업로드"
          onClick={() => thumbnailInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") thumbnailInputRef.current?.click() }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="pw-thumb-zone__icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="5" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="9.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 21l6.5-5.5 5 4.5 3.5-3.5 5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <p className="pw-thumb-zone__text">클릭하거나 드래그해서 이미지를 올려주세요</p>
          <p className="pw-thumb-zone__hint">JPG · PNG · WEBP · 최대 5MB</p>
        </div>
      )}
    </section>
  )
}
