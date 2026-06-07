"use client"

// _shared/ui/manage-card | 통합 문서 관리 카드
// 포트폴리오·이력서·자기소개서 관리 카드의 공통 레이아웃과 서브 컴포넌트를 제공한다.
// 색상 분기는 CSS custom properties (--mc-rgb, --mc-color 등)로 처리.

import type { ReactNode } from "react"
import { Tags2Row } from "@/_shared/ui/tags-row"
import { formatDateTimeMinute } from "@/_shared/lib"
import "./document-manage-card.scss"

export type ManageCardColorScheme = "green" | "amber" | "blue"

export interface DocumentManageCardProps {
  id: string
  title: string
  updatedAt: string
  visibility: "public" | "private"
  privateMemo?: string
  tags: string[]
  viewMode: "grid" | "list"
  colorScheme: ManageCardColorScheme

  /** Grid 모드 상단 헤더 (아이콘 밴드 또는 썸네일) */
  gridHeader?: ReactNode
  /** List 모드 좌측 영역 (아이콘 박스 또는 썸네일) */
  listAside?: ReactNode
  /** 공개/비공개 배지 뒤에 추가되는 메타 정보 */
  extraMeta?: ReactNode
  /** 제목 위 카테고리 표시 (포트폴리오·이력서·자기소개서 공통) */
  categoryHeader?: ReactNode
  /** 연결 정보 섹션 (포트폴리오 연결 버튼 또는 문서 연결 칩) */
  relationsSection?: ReactNode

  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function DocumentManageCard({
  id, title, updatedAt, visibility, privateMemo, tags,
  viewMode, colorScheme,
  gridHeader, listAside, extraMeta, categoryHeader, relationsSection,
  onView, onEdit, onDelete,
}: DocumentManageCardProps) {

  const Actions = () => (
    <div className="mc-actions">
      <button type="button" className="mc-actions__btn mc-actions__btn--view" onClick={() => onView(id)}>보기</button>
      <button type="button" className="mc-actions__btn" onClick={() => onEdit(id)}>수정</button>
      <button type="button" className="mc-actions__btn mc-actions__btn--danger" onClick={() => onDelete(id)}>삭제</button>
    </div>
  )

  const Memo = () => (
    <div className="mc-memo">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      {privateMemo
        ? <span className="mc-memo__text">{privateMemo}</span>
        : <span className="mc-memo__text mc-memo__text--empty">나만 보는 메모가 작성되지 않았어요</span>
      }
    </div>
  )

  const TagsSection = () => (
    <div className="mc-tags-section">
      {tags.length > 0
        ? <Tags2Row tags={tags} containerClass="mc-tags" tagClass="mc-tag" moreClass="mc-tag mc-tag--more" />
        : <span className="mc-tags-empty">등록된 태그가 없어요</span>
      }
    </div>
  )

  const formattedDate = formatDateTimeMinute(updatedAt)

  if (viewMode === "grid") {
    return (
      <article className={`mc-root mc-root--grid mc-root--${colorScheme}`}>
        {gridHeader}
        <div className="mc-body">
          <div className="mc-info-top">
            <section className="mc-summary">
              {categoryHeader && <div className="mc-category-row">{categoryHeader}</div>}
              <div className="mc-summary__title-row">
                <h3 className="mc-title">{title}</h3>
                <span className="mc-date">{formattedDate}</span>
              </div>
              <div className="mc-summary__meta">
                <span className={`mc-badge mc-badge--${visibility}`}>
                  {visibility === "public" ? "공개" : "비공개"}
                </span>
                {extraMeta}
              </div>
            </section>
            <Memo />
          </div>
          <TagsSection />
          {relationsSection}
          <footer className="mc-card-footer">
            <Actions />
          </footer>
        </div>
      </article>
    )
  }

  return (
    <article className={`mc-root mc-root--list mc-root--${colorScheme}`}>
      {listAside}
      <div className="mc-body">
        <section className="mc-summary">
          {categoryHeader && <div className="mc-category-row">{categoryHeader}</div>}
          <div className="mc-summary__title-row">
            <h3 className="mc-title">{title}</h3>
            <Actions />
          </div>
          <div className="mc-summary__meta">
            <span className={`mc-badge mc-badge--${visibility}`}>
              {visibility === "public" ? "공개" : "비공개"}
            </span>
            {extraMeta}
            <span className="mc-date">{formattedDate}</span>
          </div>
        </section>
        <Memo />
        <TagsSection />
        {relationsSection}
      </div>
    </article>
  )
}
