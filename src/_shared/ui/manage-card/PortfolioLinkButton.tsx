// _shared/ui/manage-card | 포트폴리오 연결 버튼
// 이력서·자기소개서 관리 카드에서 포트폴리오 연결 상태를 표시하고 모달을 여는 버튼.

interface PortfolioLinkButtonProps {
  linkedIds: string[]
  onClick?: () => void
}

export function PortfolioLinkButton({ linkedIds, onClick }: PortfolioLinkButtonProps) {
  return (
    <button
      type="button"
      className={`mc-badge mc-badge--linked mc-badge--linked-btn${linkedIds.length > 0 ? " mc-badge--linked-active" : ""}`}
      onClick={() => onClick?.()}
      title="포트폴리오 연결 관리"
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M5 1H1v10h10V7M7 1h4v4M4.5 7.5l5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {linkedIds.length > 0 ? `${linkedIds.length}개 포트폴리오에 연결됨` : "포트폴리오 연결"}
    </button>
  )
}
