"use client"

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ reset }: Props) {
  return (
    <div style={{ padding: "4rem 1rem", textAlign: "center" }}>
      <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "1rem" }}>
        자기소개서를 불러오는 중 오류가 발생했습니다.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: "0.5rem 1.25rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(0,0,0,0.1)",
          background: "transparent",
          fontSize: "0.85rem",
          cursor: "pointer",
        }}
      >
        다시 시도
      </button>
    </div>
  )
}
