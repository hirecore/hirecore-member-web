"use client"

import { createPortal } from "react-dom"
import "./empty-content-modal.scss"

interface EmptyContentModalProps {
  onClose: () => void
}

/**
 * EmptyContentModal — 빈 내용으로 등록 시도 시 표시되는 알림 모달.
 * 에디터에 텍스트가 없을 때 "등록하기" 버튼을 누르면 표시된다.
 */
export function EmptyContentModal({ onClose }: EmptyContentModalProps) {
  return createPortal(
    <div
      className="ec-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="ec-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ec-title"
      >
        {/* 닫기 버튼 */}
        <button
          className="ec-modal__close"
          type="button"
          onClick={onClose}
          aria-label="닫기"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        {/* 아이콘 */}
        <div className="ec-modal__icon-wrap" aria-hidden>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
              d="M6 20V8.5L13 5l7 3.5V20H6z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M10 20v-5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 제목 */}
        <h2 id="ec-title" className="ec-modal__title">
          내용을 입력해주세요
        </h2>

        {/* 설명 */}
        <p className="ec-modal__desc">
          내용이 없는 글은 등록할 수 없습니다.
          <br />
          글을 작성한 후 다시 시도해주세요.
        </p>

        {/* 확인 버튼 */}
        <button type="button" className="ec-modal__confirm" onClick={onClose}>
          확인
        </button>
      </div>
    </div>,
    document.body
  )
}
