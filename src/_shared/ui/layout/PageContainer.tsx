// _shared/ui/layout | 공통 수평 제약 컨테이너
// max-width + 중앙 정렬 + mobile-first 수평 패딩만 담당. 수직 패딩은 각 뷰의 책임.
import "./page-container.scss"

export type PageWidth = "wide" | "write" | "content"

interface PageContainerProps {
  width?: PageWidth
  children: React.ReactNode
  className?: string
}

export function PageContainer({ width = "wide", children, className }: PageContainerProps) {
  const cls = ["page-container", `page-container--${width}`, className].filter(Boolean).join(" ")
  return <div className={cls}>{children}</div>
}
