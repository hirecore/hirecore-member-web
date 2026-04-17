import Link from "next/link"
import { USER_ROUTES } from "@/_shared/config"

export default function NotFound() {
  return (
    <div style={{ padding: "4rem 1rem", textAlign: "center" }}>
      <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "1rem" }}>
        존재하지 않거나 삭제된 포트폴리오입니다.
      </p>
      <Link
        href={USER_ROUTES.portfolio.list}
        style={{
          fontSize: "0.85rem",
          color: "#3b82f6",
          textDecoration: "underline",
        }}
      >
        포트폴리오 목록으로 돌아가기
      </Link>
    </div>
  )
}
