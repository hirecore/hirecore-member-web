"use client"

import { createPortal } from "react-dom"
import "./delete-confirm-modal.scss"

interface DeleteConfirmModalProps {
  /** "포트폴리오" | "이력서" | "자기소개서" */
  docTypeName: string
  /** 삭제 시 부가 안내 문구 (연결 해제 등) */
  notice?: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmModal({ docTypeName, notice, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return createPortal(
    <div className="dcm-overlay" onClick={onCancel} role="presentation">
      <div
        className="dcm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dcm-title"
      >
        <button className="dcm-modal__close" type="button" onClick={onCancel} aria-label="닫기">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        <div className="dcm-modal__icon-wrap" aria-hidden>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M8 9h10M9.5 9V7.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8.5 9l.75 11.5a1.5 1.5 0 0 0 1.5 1.5h4.5a1.5 1.5 0 0 0 1.5-1.5L17.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 13v4M14.5 13v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <h2 id="dcm-title" className="dcm-modal__title">
          {docTypeName}을(를) 삭제하시겠습니까?
        </h2>

        <p className="dcm-modal__desc">
          삭제된 {docTypeName}은(는) 복구할 수 없습니다.
        </p>

        {notice && (
          <div className="dcm-modal__notice">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span>{notice}</span>
          </div>
        )}

        <div className="dcm-modal__actions">
          <button type="button" className="dcm-modal__btn dcm-modal__btn--cancel" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="dcm-modal__btn dcm-modal__btn--delete" onClick={onConfirm}>
            삭제하기
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
