import Link from "next/link"
import { USER_ROUTES } from "@/_shared/config"

export default function NotFound() {
  return (
    <div style={{ padding: "4rem 1rem", textAlign: "center" }}>
      <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "1rem" }}>
        존재하지 않거나 삭제된 이력서입니다.
      </p>
      <Link
        href={USER_ROUTES.mypage}
        style={{
          fontSize: "0.85rem",
          color: "#059669",
          textDecoration: "underline",
        }}
      >
        마이페이지로 돌아가기
      </Link>
    </div>
  )
}
