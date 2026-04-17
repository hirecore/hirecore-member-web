"use client"

import type { StorageInfo } from "./StorageMeter"
import { formatBytes, normalizeTier } from "./StorageMeter"
import "./storage-exceeded-modal.scss"

interface StorageExceededModalProps {
  /** 서버에서 받은 저장 공간 정보 (사용량, 쿼터, 티어) */
  info: StorageInfo
  /** 이번 세션에서 이미 업로드한 누적 바이트 */
  sessionBytes: number
  /** 이번에 시도한 파일의 크기 (바이트) */
  fileSize: number
  /** 닫기 버튼 또는 배경 클릭 시 호출 */
  onClose: () => void
}

/**
 * StorageExceededModal — 저장 공간 초과 시 표시되는 팝업 모달.
 *
 * 사용자가 이미지를 업로드하려 했을 때 남은 공간이 부족하면 S3 요청을
 * 보내기 전에 이 모달을 표시하고 업로드를 취소한다.
 *
 * Gold 티어: Platinum 업그레이드 링크 표시
 * Platinum 티어: 최상위 플랜이므로 "확인" 버튼만 표시
 */
export function StorageExceededModal({
  info,
  sessionBytes,
  fileSize,
  onClose,
}: StorageExceededModalProps) {
  // 화면에 표시할 실제 사용량 = DB 저장 + 이번 세션 업로드 누적
  const displayUsed = info.used + sessionBytes

  // 진행 바 퍼센트 (100% 초과 방지)
  const percent = Math.min((displayUsed / info.quota) * 100, 100)

  // 남은 공간 (음수 방어)
  const remaining = Math.max(info.quota - displayUsed, 0)

  // Gold 티어 여부 (업그레이드 CTA 표시 결정) — 대소문자 정규화 후 비교
  const tier = normalizeTier(info.tier)
  const isGold = tier === "gold"

  return (
    /*
      오버레이 — 클릭 시 모달 닫힘
      role="presentation": 스크린 리더에 의미 없는 요소임을 알림
    */
    <div className="storage-exceeded-overlay" onClick={onClose} role="presentation">
      {/*
        모달 본체 — 클릭 이벤트 버블링 차단 (오버레이 클릭 닫힘 방지)
        role="alertdialog": 스크린 리더에 중요 대화상자임을 알림
      */}
      <div
        className="storage-exceeded-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="se-title"
      >
        {/* 우상단 닫기(×) 버튼 */}
        <button
          className="storage-exceeded-modal__close"
          type="button"
          onClick={onClose}
          aria-label="닫기"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* 경고 아이콘 (원형 느낌표) */}
        <div className="storage-exceeded-modal__icon-wrap" aria-hidden>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="10.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="13" cy="17.5" r="1.1" fill="currentColor" />
          </svg>
        </div>

        {/* 제목 */}
        <h2 id="se-title" className="storage-exceeded-modal__title">
          저장 공간이 부족합니다
        </h2>

        {/* 부제목 — 남은 공간 유무에 따라 메시지 분기 */}
        <p className="storage-exceeded-modal__subtitle">
          {remaining > 0
            ? `업로드 파일(${formatBytes(fileSize)})을 저장하기에 공간이 부족합니다`
            : "이미지 저장 공간이 가득 찼습니다"}
        </p>

        {/* 사용량 시각화 영역 */}
        <div className="storage-exceeded-modal__usage">
          {/* 사용량 헤더: 레이블 + 티어 뱃지 */}
          <div className="storage-exceeded-modal__usage-head">
            <span className="storage-exceeded-modal__usage-label">이미지 저장 공간</span>
            <span className={`storage-exceeded-modal__tier storage-exceeded-modal__tier--${tier}`}>
              {tier === "gold" ? "Gold" : "Platinum"}
            </span>
          </div>

          {/* 사용량 진행 바 */}
          <div className="storage-exceeded-modal__track">
            <div
              className="storage-exceeded-modal__fill"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* 사용 중 / 총 용량 수치 */}
          <div className="storage-exceeded-modal__stats">
            <span className="storage-exceeded-modal__stat-used">
              {formatBytes(displayUsed)} 사용 중
            </span>
            <span className="storage-exceeded-modal__stat-total">
              {formatBytes(info.quota)} 총 용량
            </span>
          </div>
        </div>

        {/* 액션 버튼 영역 */}
        <div className="storage-exceeded-modal__actions">
          {/* 취소 버튼 — 항상 표시 */}
          <button type="button" className="storage-exceeded-modal__cancel" onClick={onClose}>
            취소
          </button>

          {isGold ? (
            /* Gold 티어: Platinum 업그레이드 링크 (별 아이콘 포함) */
            <a href="/upgrade" className="storage-exceeded-modal__upgrade">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path
                  d="M6.5 1L9 5.5H12L9.5 8.5L10.5 12L6.5 9.5L2.5 12L3.5 8.5L1 5.5H4L6.5 1Z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </svg>
              Platinum으로 업그레이드
            </a>
          ) : (
            /* Platinum 티어: 최상위 플랜이므로 업그레이드 없음, "확인"만 표시 */
            <button type="button" className="storage-exceeded-modal__cancel" onClick={onClose}>
              확인
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
