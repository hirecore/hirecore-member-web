"use client"

import "./storage-meter.scss"
import type { StorageInfo } from "@/_shared/model"

// StorageInfo는 _shared/model/authoring.schema에서 정의 — entity/user와 공유
export type { StorageInfo }

/** tier 문자열을 소문자로 정규화. 알 수 없는 값은 "gold"로 폴백 */
export function normalizeTier(tier: string): "gold" | "platinum" {
  const lower = tier.toLowerCase()
  if (lower === "platinum") return "platinum"
  return "gold"
}

interface StorageMeterProps {
  info: StorageInfo
  sessionBytes: number
  error?: string | null
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB"
  const mb = bytes / (1024 * 1024)
  if (mb < 0.1) return `${(bytes / 1024).toFixed(1)} KB`
  return `${mb.toFixed(1)} MB`
}

export function StorageMeter({ info, sessionBytes, error }: StorageMeterProps) {
  const { used, quota } = info
  const tier = normalizeTier(info.tier)
  const displayUsed = used + sessionBytes
  const percent = Math.min((displayUsed / quota) * 100, 100)
  const remaining = Math.max(quota - displayUsed, 0)
  const level: "normal" | "warning" | "danger" =
    percent >= 95 ? "danger" : percent >= 80 ? "warning" : "normal"

  return (
    <div className="storage-meter">
      {/* 프로그레스 바 */}
      <div className="storage-meter__track">
        <div
          className={[
            "storage-meter__fill",
            `storage-meter__fill--${level}`,
            percent >= 100 ? "storage-meter__fill--pulse" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 정보 행 */}
      <div className="storage-meter__row">
        {/* 스토리지 아이콘 */}
        <svg
          className="storage-meter__icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden
        >
          <ellipse cx="6" cy="3" rx="4" ry="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M2 3v2.5c0 .83 1.79 1.5 4 1.5s4-.67 4-1.5V3"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M2 5.5V8c0 .83 1.79 1.5 4 1.5S10 8.83 10 8V5.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>

        {/* 사용량 */}
        <span className={`storage-meter__used storage-meter__used--${level}`}>
          {formatBytes(displayUsed)}
        </span>
        <span className="storage-meter__sep">/</span>
        <span className="storage-meter__quota">{formatBytes(quota)}</span>

        {/* 이번 세션 추가량 */}
        {sessionBytes > 0 && (
          <span className="storage-meter__session">
            +{formatBytes(sessionBytes)} 이번 세션
          </span>
        )}

        {/* 남은 용량 경고 */}
        {level !== "normal" && remaining > 0 && (
          <span className={`storage-meter__remaining storage-meter__remaining--${level}`}>
            {formatBytes(remaining)} 남음
          </span>
        )}
        {remaining === 0 && (
          <span className="storage-meter__remaining storage-meter__remaining--danger">
            저장 공간 가득 참
          </span>
        )}

        {/* 티어 뱃지 + 업그레이드 CTA */}
        <div className="storage-meter__right">
          {tier === "gold" && level !== "normal" && (
            <span className="storage-meter__upgrade">업그레이드 →</span>
          )}
          <span className={`storage-meter__tier storage-meter__tier--${tier}`}>
            {tier === "gold" ? "Gold" : "Platinum"}
          </span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="storage-meter__error" role="alert">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M6 3.5V6.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="6" cy="8.5" r="0.65" fill="currentColor" />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}
