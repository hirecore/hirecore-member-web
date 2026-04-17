"use client"

import { useState } from "react"
import "./storage-optimization-hint.scss"

type HintVariant = "webp" | "text-only"

interface StorageOptimizationHintProps {
  variant?: HintVariant
}

export function StorageOptimizationHint({ variant = "webp" }: StorageOptimizationHintProps) {
  // 페이지 진입(마운트)마다 항상 표시 — X를 누를 때만 현재 방문 중 숨김
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  if (variant === "webp") {
    return (
      <div className="soh soh--webp" role="note" aria-label="이미지 최적화 안내">
        <div className="soh__icon-wrap" aria-hidden>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M7.5 1L8.8 4.6H12.5L9.6 6.8L10.7 10.5L7.5 8.4L4.3 10.5L5.4 6.8L2.5 4.6H6.2L7.5 1Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="soh__body">
          <span className="soh__title">이미지 자동 최적화 적용 중</span>
          <span className="soh__desc">
            업로드한 이미지는 <strong>WebP</strong> 형식으로 자동 변환됩니다.
            원본 파일보다 저장 용량이 <strong>적게 차감</strong>되는 것은 정상입니다.
          </span>
        </div>

        <div className="soh__right">
          <span className="soh__badge">WebP</span>
          <button
            type="button"
            className="soh__close"
            onClick={() => setHidden(true)}
            aria-label="안내 닫기"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M2 2l7 7M9 2l-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  /* ── text-only 변형 (자기소개서 등 이미지 비허용 에디터) ─────────── */
  return (
    <div className="soh soh--text" role="note" aria-label="텍스트 전용 에디터 안내">
      <div className="soh__icon-wrap" aria-hidden>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M2 3h11M2 7h7M2 11h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="soh__body">
        <span className="soh__title">이미지 저장 공간 미사용</span>
        <span className="soh__desc">
          자기소개서는 이미지를 첨부할 수 없어{" "}
          <strong>이미지 저장 공간에 영향을 주지 않습니다.</strong>
        </span>
      </div>

      <div className="soh__right">
        <span className="soh__badge soh__badge--text">텍스트 전용</span>
        <button
          type="button"
          className="soh__close"
          onClick={() => setHidden(true)}
          aria-label="안내 닫기"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path
              d="M2 2l7 7M9 2l-7 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
