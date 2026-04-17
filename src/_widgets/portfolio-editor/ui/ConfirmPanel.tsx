"use client"

import { type ConfirmData, getCategoryPath, isCustomInputCategory } from "@/_features/portfolio/lib"
import "./confirm-panel.scss"

interface Props {
  data: ConfirmData
  /** 표시용 라벨 — useCustom 시 customCategory, 아니면 path label */
  categoryLabel: string
  onBack: () => void
  onConfirm: () => void
}

export function ConfirmPanel({ data, categoryLabel, onBack, onConfirm }: Props) {
  // L1 / L2 / L3 경로 — "기타(직접입력)"이면 직접입력 텍스트 표시
  const path = getCategoryPath(data.category.categoryCode)
  const useCustom = isCustomInputCategory(data.category.categoryCode) && data.category.customCategory

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "직무 카테고리",
      value: (
        <span className="pw-confirm__value-pair">
          {useCustom ? (
            <span className="pw-confirm__badge">{data.category.customCategory}</span>
          ) : (
            path.map((node, idx) => (
              <span key={node.code} className="pw-confirm__value-pair">
                {idx > 0 && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M4 2.5l3.5 3.5L4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span className={`pw-confirm__badge${idx === path.length - 1 ? " pw-confirm__badge--sub" : ""}`}>{node.name}</span>
              </span>
            ))
          )}
          {!useCustom && categoryLabel === "" && <span className="pw-confirm__none">미지정</span>}
        </span>
      ),
    },
    { label: "프로젝트 유형", value: data.projectType === "personal" ? "개인 프로젝트" : "팀 프로젝트" },
    { label: "공개 설정",     value: data.visibility === "public" ? "공개" : "비공개" },
    { label: "포스팅 제목",   value: <span className="pw-confirm__title-val">{data.title}</span> },
    {
      label: "썸네일",
      value: data.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.thumbnailUrl} alt="썸네일" className="pw-confirm__thumb" />
      ) : (
        <span className="pw-confirm__none">없음</span>
      ),
    },
    {
      label: "링크",
      value: data.externalLinks && data.externalLinks.length > 0 ? (
        <span className="pw-confirm__tags">
          {data.externalLinks.map((link, i) => (
            <span key={i} className="pw-confirm__tag pw-confirm__tag--link">{link.label}</span>
          ))}
        </span>
      ) : (
        <span className="pw-confirm__none">없음</span>
      ),
    },
    {
      label: "태그",
      value: data.tags.length > 0 ? (
        <span className="pw-confirm__tags">
          {data.tags.map((t) => <span key={t} className="pw-confirm__tag">#{t}</span>)}
        </span>
      ) : (
        <span className="pw-confirm__none">없음</span>
      ),
    },
    { label: "포스팅 내용", value: <span className="pw-confirm__content-ok">✓ 작성 완료</span> },
  ]

  return (
    <div className="pw-confirm-overlay" role="dialog" aria-modal aria-label="등록 확인">
      <div className="pw-confirm-panel">
        <div className="pw-confirm-panel__header">
          <button type="button" className="pw-confirm-panel__back" onClick={onBack} aria-label="수정하기">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            수정하기
          </button>
          <span className="pw-confirm-panel__title">작성 내용 확인</span>
          <div style={{ width: "5rem" }} />
        </div>

        <div className="pw-confirm-panel__body">
          <p className="pw-confirm-panel__desc">
            아래 내용으로 포트폴리오가 등록됩니다. 확인 후 등록해주세요.
          </p>
          <div className="pw-confirm-rows">
            {rows.map((row) => (
              <div key={row.label} className="pw-confirm-row">
                <span className="pw-confirm-row__label">{row.label}</span>
                <span className="pw-confirm-row__value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pw-confirm-panel__footer">
          <button type="button" className="pw-confirm-panel__cancel" onClick={onBack}>수정하기</button>
          <button type="button" className="pw-confirm-panel__submit" onClick={onConfirm}>
            등록 완료
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
