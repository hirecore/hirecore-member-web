"use client"

// _shared/ui/draft-save-not-ready-modal | 임시저장 API 미구현 안내 모달
// 포트폴리오/이력서/자기소개서 등록 화면에서 "임시저장" 클릭 시 표시한다.
import { createPortal } from "react-dom"
import "./draft-save-not-ready-modal.scss"

interface DraftSaveNotReadyModalProps {
  onClose: () => void
}

export function DraftSaveNotReadyModal({ onClose }: DraftSaveNotReadyModalProps) {
  return createPortal(
    <div
      className="dsnr-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="dsnr-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dsnr-title"
      >
        <button
          className="dsnr-modal__close"
          type="button"
          onClick={onClose}
          aria-label="닫기"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        <div className="dsnr-modal__icon-wrap" aria-hidden>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13 8.5v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 id="dsnr-title" className="dsnr-modal__title">
          준비 중인 기능입니다
        </h2>

        <p className="dsnr-modal__desc">
          임시저장 기능은 현재 준비 중입니다.
          <br />
          더 나은 서비스로 찾아뵐 수 있도록 노력하겠습니다.
        </p>

        <button type="button" className="dsnr-modal__confirm" onClick={onClose}>
          확인
        </button>
      </div>
    </div>,
    document.body
  )
}
