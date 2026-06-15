"use client"

import { useCallback, useState } from "react"
import { createPortal } from "react-dom"
import Cropper, { type Area } from "react-easy-crop"
import { getCroppedImg } from "./getCroppedImg"
import "./thumbnail-crop-modal.scss"

interface Props {
  /** 원본 이미지의 blob/object URL 또는 data URL */
  imageSrc: string
  /** 결과 파일명 베이스 (확장자 제외 후 .png 부여) */
  fileName: string
  onClose: () => void
  onCropComplete: (file: File) => void
}

const ASPECT_OPTIONS = [
  { key: "1:1",  value: 1,        label: "1:1" },
  { key: "16:9", value: 16 / 9,   label: "16:9" },
  { key: "4:3",  value: 4 / 3,    label: "4:3" },
] as const

type AspectKey = (typeof ASPECT_OPTIONS)[number]["key"]

export function ThumbnailCropModal({
  imageSrc, fileName, onClose, onCropComplete,
}: Props) {
  const [aspectKey, setAspectKey] = useState<AspectKey>("1:1")
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pixels, setPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  const aspect = ASPECT_OPTIONS.find((o) => o.key === aspectKey)?.value ?? 1
  const handleCropPixels = useCallback((_: Area, p: Area) => setPixels(p), [])

  const handleAspectChange = (key: AspectKey) => {
    if (busy) return
    setAspectKey(key)
    // 비율 변경 시 crop/zoom 초기화 — 잔존 좌표가 새 비율에 안 맞아 잘리는 현상 방지
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const handleApply = async () => {
    if (!pixels || busy) return
    try {
      setBusy(true)
      const file = await getCroppedImg(imageSrc, pixels, fileName)
      onCropComplete(file)
    } catch (err) {
      console.error(err)
      alert("이미지 자르기에 실패했습니다.")
      setBusy(false)
    }
  }

  return createPortal(
    <div className="tcm-overlay" onClick={busy ? undefined : onClose} role="presentation">
      <div
        className="tcm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tcm-title"
      >
        <header className="tcm-modal__head">
          <h2 id="tcm-title" className="tcm-modal__title">썸네일 자르기</h2>
          <button
            type="button"
            className="tcm-modal__close"
            onClick={onClose}
            disabled={busy}
            aria-label="닫기"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
              <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="tcm-modal__aspects" role="radiogroup" aria-label="비율 선택">
          {ASPECT_OPTIONS.map((opt) => {
            const selected = opt.key === aspectKey
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`tcm-modal__aspect${selected ? " tcm-modal__aspect--selected" : ""}`}
                onClick={() => handleAspectChange(opt.key)}
                disabled={busy}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div className="tcm-modal__crop-area">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropPixels}
          />
        </div>

        <div className="tcm-modal__controls">
          <span className="tcm-modal__zoom-label" aria-hidden>줌</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="tcm-modal__zoom-slider"
            aria-label="줌"
            disabled={busy}
          />
        </div>

        <p className="tcm-modal__hint">
          비율을 고른 뒤 드래그·줌으로 영역을 조정하세요. 점선 안 영역이 썸네일로 저장됩니다.
        </p>

        <div className="tcm-modal__actions">
          <button
            type="button"
            className="tcm-modal__btn tcm-modal__btn--cancel"
            onClick={onClose}
            disabled={busy}
          >
            취소
          </button>
          <button
            type="button"
            className="tcm-modal__btn tcm-modal__btn--apply"
            onClick={handleApply}
            disabled={busy || !pixels}
          >
            {busy ? "처리 중..." : "적용"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
