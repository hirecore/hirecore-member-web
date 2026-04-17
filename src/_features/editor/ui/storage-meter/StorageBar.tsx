"use client"

// _features/editor/ui/storage-meter | editor-card 내부 저장 공간 보조 바
import type { StorageInfo } from "./StorageMeter"
import { formatBytes, normalizeTier } from "./StorageMeter"
import "./storage-bar.scss"

interface StorageBarProps {
  /** 서버에서 받은 저장 공간 정보 (사용량, 쿼터, 티어) */
  info: StorageInfo
  /** 이번 편집 세션에서 새로 업로드한 누적 바이트 */
  sessionBytes: number
  /** 업로드 에러 메시지 — 있으면 바 하단에 인라인 표시 */
  error?: string | null
  /** 에러 표시 애니메이션 재시작용 키 — 같은 에러가 다시 발생할 때 증가 */
  errorKey?: number
}

/**
 * StorageBar — editor-card 내부 저장 공간 사용량 바.
 *
 * 사용량 비율에 따라 세 단계로 시각적으로 구분된다:
 *   normal  (0 ~ 79%)  → 기본 스타일
 *   warning (80 ~ 94%) → 주황 계열 배경 + 경고 강조
 *   danger  (95 ~ 100%) → 빨강 계열 배경 + 위험 강조
 *
 * write view SCSS에서 position: static override 적용됨.
 */
export function StorageBar({ info, sessionBytes, error, errorKey }: StorageBarProps) {
  const { used, quota } = info
  const tier = normalizeTier(info.tier)

  // 화면에 표시할 사용량 = DB 저장 사용량 + 이번 세션 업로드 누적
  const displayUsed = used + sessionBytes

  // 퍼센트는 0 ~ 100 사이로 클램핑 (quota 초과 시 100으로 고정)
  const percent = Math.min((displayUsed / quota) * 100, 100)

  // 남은 공간은 음수가 될 수 없도록 0 이하 방어
  const remaining = Math.max(quota - displayUsed, 0)

  // 퍼센트 기준 경고 레벨 계산
  const level: "normal" | "warning" | "danger" =
    percent >= 95 ? "danger" : percent >= 80 ? "warning" : "normal"

  return (
    <div className={`storage-bar storage-bar--${level}`}>
      {/* 내부 레이아웃 — max-width 860px, 에디터 콘텐츠와 동일 너비로 정렬 */}
      <div className="storage-bar__inner">
        {/* 왼쪽: DB 아이콘 + "이미지 저장 공간" 레이블 */}
        <div className="storage-bar__left">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <ellipse cx="6.5" cy="3.2" rx="4.5" ry="1.7" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 3.2v3c0 .94 2.01 1.7 4.5 1.7s4.5-.76 4.5-1.7v-3" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 6.2v3c0 .94 2.01 1.7 4.5 1.7s4.5-.76 4.5-1.7v-3" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <span className="storage-bar__label">이미지 저장 공간</span>
        </div>

        {/* 가운데: 진행 바 + 수치 표시 */}
        <div className="storage-bar__center">
          {/* 진행 바 트랙 */}
          <div className="storage-bar__track">
            <div
              className={`storage-bar__fill storage-bar__fill--${level}`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* 현재 사용량 (경고 레벨에 따라 색상 강조) */}
          <span className={`storage-bar__used storage-bar__used--${level}`}>
            {formatBytes(displayUsed)}
          </span>
          <span className="storage-bar__sep">/</span>
          {/* 총 쿼터 */}
          <span className="storage-bar__quota">{formatBytes(quota)}</span>

          {/* 이번 세션 추가량 — 업로드가 있을 때만 표시 */}
          {sessionBytes > 0 && (
            <span className="storage-bar__session">+{formatBytes(sessionBytes)}</span>
          )}

          {/* 경고/위험 레벨일 때 남은 공간 표시 */}
          {level !== "normal" && (
            <span className={`storage-bar__remaining storage-bar__remaining--${level}`}>
              {remaining > 0 ? `${formatBytes(remaining)} 남음` : "가득 참"}
            </span>
          )}
        </div>

        {/* 오른쪽: 에러 메시지 + 멤버십 티어 뱃지 */}
        <div className="storage-bar__right">
          {/* 업로드 에러 — key={errorKey}: 재마운트 → CSS 애니메이션 재시작 */}
          {error && (
            <div key={errorKey} className="storage-bar__error" role="alert">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5.5 3V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="5.5" cy="7.8" r="0.55" fill="currentColor" />
              </svg>
              {error}
            </div>
          )}
          <span className={`storage-bar__tier storage-bar__tier--${tier}`}>
            {tier === "gold" ? "Gold" : "Platinum"}
          </span>
        </div>
      </div>
    </div>
  )
}
