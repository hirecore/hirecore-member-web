"use client"

import type { StorageInfo } from "./StorageMeter"
import { formatBytes } from "./StorageMeter"
import "./storage-indicator.scss"

interface StorageIndicatorProps {
  info: StorageInfo
  sessionBytes: number
  error?: string | null
}

const LEVEL_COLOR = {
  normal: "#3b82f6",
  warning: "#f59e0b",
  danger: "#ef4444",
} as const

export function StorageIndicator({ info, sessionBytes, error }: StorageIndicatorProps) {
  const { used, quota, tier } = info
  const displayUsed = used + sessionBytes
  const percent = Math.min((displayUsed / quota) * 100, 100)
  const remaining = Math.max(quota - displayUsed, 0)
  const level: "normal" | "warning" | "danger" =
    percent >= 95 ? "danger" : percent >= 80 ? "warning" : "normal"

  // 원형 아크 계산
  const radius = 7.5
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference * (1 - percent / 100)
  const arcColor = LEVEL_COLOR[level]

  return (
    <div className={`storage-indicator storage-indicator--${level}`}>
      {/* ── 툴바 노출 영역 ── */}
      <div className="storage-indicator__trigger" aria-label="이미지 저장 공간">
        {/* 원형 진행 아크 */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          className="storage-indicator__arc"
          aria-hidden
        >
          {/* 트랙 */}
          <circle
            cx="10"
            cy="10"
            r={radius}
            stroke={arcColor}
            strokeWidth="2.2"
            fill="none"
            opacity="0.15"
          />
          {/* 진행 */}
          <circle
            cx="10"
            cy="10"
            r={radius}
            stroke={arcColor}
            strokeWidth="2.2"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            transform="rotate(-90 10 10)"
            className="storage-indicator__arc-fill"
          />
        </svg>

        {/* 숫자 */}
        <span className="storage-indicator__label">{formatBytes(displayUsed)}</span>
      </div>

      {/* ── 호버 팝업 ── */}
      <div className="storage-indicator__popup" role="tooltip">
        {/* 헤더 */}
        <div className="storage-indicator__popup-head">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <ellipse cx="7" cy="3.5" rx="5" ry="2" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M2 3.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M2 6.5V10c0 1.1 2.24 2 5 2s5-.9 5-2V6.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
          <span>이미지 저장 공간</span>
          <span className={`storage-indicator__tier storage-indicator__tier--${tier}`}>
            {tier === "gold" ? "Gold" : "Platinum"}
          </span>
        </div>

        {/* 진행 바 */}
        <div className="storage-indicator__popup-track">
          <div
            className={`storage-indicator__popup-fill storage-indicator__popup-fill--${level}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="storage-indicator__popup-percent">{percent.toFixed(0)}% 사용</div>

        {/* 통계 */}
        <div className="storage-indicator__stats">
          <div className="storage-indicator__stat">
            <span className="storage-indicator__stat-label">사용 중</span>
            <span className={`storage-indicator__stat-val storage-indicator__stat-val--${level}`}>
              {formatBytes(displayUsed)}
            </span>
          </div>
          <div className="storage-indicator__stat">
            <span className="storage-indicator__stat-label">전체 한도</span>
            <span className="storage-indicator__stat-val">{formatBytes(quota)}</span>
          </div>
          <div className="storage-indicator__stat">
            <span className="storage-indicator__stat-label">남은 공간</span>
            <span
              className={`storage-indicator__stat-val${level !== "normal" ? ` storage-indicator__stat-val--${level}` : ""}`}
            >
              {formatBytes(remaining)}
            </span>
          </div>
        </div>

        {/* 이번 세션 추가량 */}
        {sessionBytes > 0 && (
          <div className="storage-indicator__session">
            이번 작성에서 +{formatBytes(sessionBytes)} 추가됨
          </div>
        )}

        {/* Gold → 업그레이드 유도 */}
        {tier === "gold" && level !== "normal" && (
          <div className="storage-indicator__upgrade">
            <p>Platinum으로 업그레이드하면 더 많은 공간을 사용할 수 있어요</p>
            <button className="storage-indicator__upgrade-btn" type="button">
              업그레이드 살펴보기 →
            </button>
          </div>
        )}

        {/* 업로드 에러 */}
        {error && (
          <div className="storage-indicator__error" role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M6 3.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <circle cx="6" cy="8.5" r="0.65" fill="currentColor" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
