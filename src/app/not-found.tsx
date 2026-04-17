import Link from "next/link"
import "./not-found.scss"

export default function NotFound() {
  return (
    <div className="nf-root">
      <div className="nf-container">
        <div className="nf-glow" aria-hidden />

        <div className="nf-code-wrap">
          <span className="nf-code">404</span>
        </div>

        <div className="nf-content">
          <h1 className="nf-title">페이지를 찾을 수 없습니다</h1>
          <p className="nf-desc">
            요청하신 페이지가 삭제되었거나 주소가 변경되었을 수 있습니다.
          </p>
        </div>

        <Link href="/" className="nf-btn">
          홈으로 돌아가기
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
