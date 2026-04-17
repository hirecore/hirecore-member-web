"use client"

import "./session-quota-error-modal.scss"

interface Props {
  onClose: () => void
}

export function SessionQuotaErrorModal({ onClose }: Props) {
  return (
    <div className="pw-sq-overlay" role="dialog" aria-modal aria-label="저장 용량 초과">
      <div className="pw-sq-panel">
        <div className="pw-sq-panel__icon" aria-hidden>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.6" />
            <path d="M16 9v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="21.5" r="1.2" fill="currentColor" />
          </svg>
        </div>

        <h2 className="pw-sq-panel__title">저장 공간이 부족합니다</h2>
        <p className="pw-sq-panel__desc">
          포스팅에 포함된 이미지 용량이 너무 커서<br />
          브라우저 임시 저장소에 저장할 수 없어요.
        </p>

        <div className="pw-sq-panel__guide">
          <div className="pw-sq-panel__guide-item">
            <span className="pw-sq-panel__guide-num">1</span>
            <span>에디터에서 일부 이미지를 삭제하거나 용량이 작은 이미지로 교체해주세요.</span>
          </div>
          <div className="pw-sq-panel__guide-item">
            <span className="pw-sq-panel__guide-num">2</span>
            <span>이미지 1장당 최대 <strong>5MB</strong>, 세션 저장소는 약 <strong>5MB</strong> 제한입니다.</span>
          </div>
          <div className="pw-sq-panel__guide-item">
            <span className="pw-sq-panel__guide-num">3</span>
            <span>서비스 정식 출시 후에는 클라우드 업로드로 제한이 사라집니다.</span>
          </div>
        </div>

        <button type="button" className="pw-sq-panel__btn" onClick={onClose}>
          확인, 이미지를 줄여볼게요
        </button>
      </div>
    </div>
  )
}
