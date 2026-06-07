"use client"

// _features/document-link/ui | 포트폴리오 ↔ 이력서/자기소개서 연결 모달
// PortfolioManageCard에서 분리 — Entity 레이어가 Feature 로직을 소유하던 구조를 해소

import { useState } from "react"
import { useBodyLock } from "@/_shared/model"
import type { LinkedDoc, AvailableDoc, DocType } from "@/_entities/portfolio"
import "./doc-link-modal.scss"

interface DocLinkModalProps {
  docType: DocType
  doc: LinkedDoc | null
  availableDocs: AvailableDoc[]
  onClose: () => void
  onLink: (docId: string | null) => void
  onNavigateToWrite: () => void
}

export function DocLinkModal({
  docType, doc, availableDocs, onClose, onLink, onNavigateToWrite,
}: DocLinkModalProps) {
  const label = docType === "resume" ? "이력서" : "자기소개서"

  useBodyLock(true, onClose)

  // linked 상태면 info 뷰 먼저, unlinked + docs 있으면 바로 list
  const [showList, setShowList] = useState(!doc && availableDocs.length > 0)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDocs = availableDocs.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  /* ── 헤더 ── */
  const Header = ({ titleText }: { titleText: string }) => (
    <div className="dlm-modal__header">
      <div className="dlm-modal__header-left">
        <span className={`dlm-modal__badge dlm-modal__badge--${docType}`}>{label}</span>
        <span className="dlm-modal__title">{titleText}</span>
      </div>
      <button type="button" className="dlm-modal__close" onClick={onClose} aria-label="닫기">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )

  /* ── 검색창 ── */
  const SearchBox = () => (
    <div className="dlm-modal__search">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden className="dlm-modal__search-icon">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <input
        type="text"
        className="dlm-modal__search-input"
        placeholder={`${label} 검색`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoFocus
      />
      {searchQuery && (
        <button type="button" className="dlm-modal__search-clear" onClick={() => setSearchQuery("")} aria-label="검색어 지우기">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  )

  /* ── 문서 선택 리스트 ── */
  const DocList = ({ onSelect }: { onSelect: (d: AvailableDoc) => void }) => (
    <>
      <SearchBox />
      <div className="dlm-modal__doc-list">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((d) => (
            <button key={d.id} type="button" className="dlm-modal__doc-item" onClick={() => onSelect(d)}>
              <div className="dlm-modal__doc-item__info">
                <p className="dlm-modal__doc-item__title">{d.title}</p>
                <p className="dlm-modal__doc-item__date">최종수정 {d.updatedAt}</p>
                {d.tags && d.tags.length > 0 && (
                  <div className="dlm-modal__doc-item__tags">
                    {d.tags.slice(0, 3).map((t) => <span key={t}>#{t}</span>)}
                  </div>
                )}
              </div>
              <svg className="dlm-modal__doc-item__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))
        ) : (
          <p className="dlm-modal__search-empty">검색 결과가 없습니다.</p>
        )}
      </div>
    </>
  )

  /* ── CASE 1: 연결됨 + info 뷰 ── */
  if (doc && !showList) {
    return (
      <div className="dlm-overlay" onClick={onClose} role="dialog" aria-modal aria-label={`${label} 미리보기`}>
        <div className="dlm-modal" onClick={(e) => e.stopPropagation()}>
          <Header titleText={doc.title} />
          {/* 백엔드 summary API 는 { id, title } 만 제공 — visibility/updatedAt/tags 가
              있는 경우(mock 또는 향후 리치 응답)에만 메타 영역 노출 */}
          {(doc.visibility || doc.updatedAt || (doc.tags && doc.tags.length > 0)) && (
            <div className="dlm-modal__doc-preview">
              {(doc.visibility || doc.updatedAt) && (
                <div className="dlm-modal__doc-meta">
                  {doc.visibility && (
                    <span className={`dlm-modal__doc-badge dlm-modal__doc-badge--${doc.visibility}`}>
                      {doc.visibility === "public" ? "공개" : "비공개"}
                    </span>
                  )}
                  {doc.updatedAt && (
                    <span className="dlm-modal__doc-date">최종수정 {doc.updatedAt}</span>
                  )}
                </div>
              )}
              {doc.tags && doc.tags.length > 0 && (
                <div className="dlm-modal__doc-tags">
                  {doc.tags.map((t) => <span key={t} className="dlm-modal__doc-tag">#{t}</span>)}
                </div>
              )}
            </div>
          )}
          <div className="dlm-modal__footer">
            <button type="button" className="dlm-modal__btn dlm-modal__btn--unlink" onClick={() => onLink(null)}>
              연결 해제
            </button>
            {availableDocs.length > 0 && (
              <button type="button" className="dlm-modal__btn dlm-modal__btn--cancel" onClick={() => setShowList(true)}>
                다른 문서로 변경
              </button>
            )}
            <button type="button" className="dlm-modal__btn dlm-modal__btn--cancel" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── CASE 2: 연결됨 + list 뷰 (다른 문서로 변경) ── */
  if (doc && showList) {
    return (
      <div className="dlm-overlay" onClick={onClose} role="dialog" aria-modal>
        <div className="dlm-modal" onClick={(e) => e.stopPropagation()}>
          <Header titleText={`${label} 변경`} />
          <p className="dlm-modal__desc">연결할 {label}를 선택해주세요.</p>
          <DocList onSelect={(d) => onLink(d.id)} />
          <div className="dlm-modal__footer">
            <button type="button" className="dlm-modal__btn dlm-modal__btn--cancel" onClick={() => setShowList(false)}>
              ← 돌아가기
            </button>
            <button
              type="button"
              className={`dlm-modal__btn dlm-modal__btn--primary dlm-modal__btn--${docType}`}
              onClick={onNavigateToWrite}
            >
              새로 작성하기
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── CASE 3: 미연결 + 기존 문서 있음 ── */
  if (!doc && availableDocs.length > 0) {
    return (
      <div className="dlm-overlay" onClick={onClose} role="dialog" aria-modal>
        <div className="dlm-modal" onClick={(e) => e.stopPropagation()}>
          <Header titleText={`${label} 연결`} />
          <p className="dlm-modal__desc">이 포트폴리오에 연결할 {label}를 선택해주세요.</p>
          <DocList onSelect={(d) => onLink(d.id)} />
          <div className="dlm-modal__footer">
            <button type="button" className="dlm-modal__btn dlm-modal__btn--cancel" onClick={onClose}>닫기</button>
            <button
              type="button"
              className={`dlm-modal__btn dlm-modal__btn--primary dlm-modal__btn--${docType}`}
              onClick={onNavigateToWrite}
            >
              새로 작성하기
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── CASE 4: 미연결 + 문서 없음 ── */
  return (
    <div className="dlm-overlay" onClick={onClose} role="dialog" aria-modal aria-label={`${label} 연결 안내`}>
      <div className="dlm-modal" onClick={(e) => e.stopPropagation()}>
        <Header titleText={`연결된 ${label}가 없어요`} />
        <div className="dlm-modal__empty">
          <div className="dlm-modal__empty-icon">
            {docType === "resume" ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 9l10 7 10-7" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            )}
          </div>
          <p className="dlm-modal__empty-title">아직 작성한 {label}가 없습니다</p>
          <p className="dlm-modal__empty-desc">
            {label}를 작성하고 포트폴리오와 연결하면<br />
            더 풍부한 정보를 함께 보여줄 수 있어요.
          </p>
        </div>
        <div className="dlm-modal__footer">
          <button type="button" className="dlm-modal__btn dlm-modal__btn--cancel" onClick={onClose}>닫기</button>
          <button
            type="button"
            className={`dlm-modal__btn dlm-modal__btn--primary dlm-modal__btn--${docType}`}
            onClick={onNavigateToWrite}
          >
            {label} 작성하기
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
