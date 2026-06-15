"use client"

import { useState, type RefObject } from "react"
import { ThumbnailCropModal } from "@/_shared/ui/thumbnail-crop-modal"
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
  // 크롭 모달용 임시 상태 — 부모에는 크롭 후 결과 File 만 전달
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropFileName, setCropFileName] = useState<string>("")

  const openCrop = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    setCropFileName(file.name)
  }

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setCropFileName("")
    // 같은 파일을 다시 고를 수 있도록 input 값 리셋
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
  }

  const handleApply = (croppedFile: File) => {
    onFile(croppedFile)
    closeCrop()
  }

  // 드롭된 파일도 크롭 모달로 — 부모 drag UI 상태는 onDrop 호출로 정리
  const handleDrop = (e: React.DragEvent) => {
    onDrop(e)
    const file = e.dataTransfer.files?.[0]
    if (file) openCrop(file)
  }

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
          if (file) openCrop(file)
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
          onDrop={handleDrop}
        >
          <div className="pw-thumb-zone__icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="5" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="9.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 21l6.5-5.5 5 4.5 3.5-3.5 5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>
          <p className="pw-thumb-zone__text">클릭하거나 드래그해서 이미지를 올려주세요</p>
          <p className="pw-thumb-zone__hint">JPG · PNG · WEBP · 최대 5MB · 업로드 후 비율을 선택해 자를 수 있어요</p>
        </div>
      )}

      {cropSrc && (
        <ThumbnailCropModal
          imageSrc={cropSrc}
          fileName={cropFileName}
          onClose={closeCrop}
          onCropComplete={handleApply}
        />
      )}
    </section>
  )
}
