"use client"

import { Button } from "@/_shared/ui/button"
import "./draft-restore-modal.scss"

interface DraftRestoreModalProps {
  /** "포트폴리오" | "이력서" | "자기소개서" */
  docTypeName: string
  draftTitle?: string
  /** 이미지 포함 에디터 내용이 저장 용량 초과로 저장되지 않은 경우 true */
  contentTruncated?: boolean
  /**
   * 이미지가 세션 한정 blob URL이어서 draft에서 제외된 경우 true.
   * contentTruncated와 달리 텍스트/양식은 정상 복원된다.
   */
  imagesDropped?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DraftRestoreModal({ docTypeName, draftTitle, contentTruncated, imagesDropped, onConfirm, onCancel }: DraftRestoreModalProps) {
  return (
    <div className="draft-modal" role="dialog" aria-modal aria-label="임시저장 복원">
      <div className="draft-modal__panel">
        <div className="draft-modal__icon" aria-hidden>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 4v10M14 4l-4 4M14 4l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 18v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="draft-modal__title">작성 중이던 {docTypeName}이(가) 있어요</h2>
        {contentTruncated ? (
          <p className="draft-modal__desc">
            이전에 작성하던 {docTypeName}이(가) 남아있습니다.<br />
            <strong>이미지를 포함한 에디터 내용은 저장 용량 초과로 복원되지 않으며, 양식 정보만 복원됩니다.</strong>
          </p>
        ) : imagesDropped ? (
          <p className="draft-modal__desc">
            이전에 작성하던 {docTypeName}이(가) 남아있습니다.<br />
            <strong>이미지는 브라우저 세션 특성상 복원되지 않으며, 텍스트와 양식 정보는 그대로 복원됩니다.</strong>
          </p>
        ) : (
          <p className="draft-modal__desc">
            이전에 작성하던 {docTypeName}이(가) 남아있습니다.<br />이어서 작성하시겠어요?
          </p>
        )}

        {draftTitle && (
          <div className="draft-modal__preview">
            <span className="draft-modal__preview-label">제목</span>
            <span className="draft-modal__preview-val">{draftTitle}</span>
          </div>
        )}

        <div className="draft-modal__actions">
          <Button variant="outline" size="md" fullWidth onClick={onCancel}>새로 시작</Button>
          <Button variant="primary" size="md" fullWidth onClick={onConfirm}>
            이어서 작성
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  )
}
