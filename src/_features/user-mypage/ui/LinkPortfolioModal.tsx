"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { USER_ROUTES } from "@/_shared/config"
import { useBodyLock } from "@/_shared/model"
import { useSelectablePortfolios, type SelectablePortfolio } from "@/_entities/portfolio"
import "./link-portfolio-modal.scss"

/** "L1 · L3" 형태 라벨 — 표시용 라벨은 데이터에 미리 포함됨 */
function formatCategoryLabel(p: SelectablePortfolio): string {
  const major = p.majorCategoryName
  const leaf = p.customCategory || p.categoryName
  if (!major && !leaf) return ""
  if (!major) return leaf
  if (!leaf) return major
  return major === leaf ? major : `${major} · ${leaf}`
}

interface Props {
  linkedIds: string[]
  onClose: () => void
  onSave: (ids: string[]) => void
}

function PortfolioThumb({ title }: { title: string }) {
  const c0 = title.charCodeAt(0) || 65
  const hue = (c0 * 47) % 360
  const hue2 = (hue + 55) % 360
  return (
    <div
      className="lpm-item__thumb"
      style={{ background: `linear-gradient(140deg, hsl(${hue} 68% 52%), hsl(${hue2} 72% 38%))` }}
      aria-hidden
    >
      {title.slice(0, 1)}
    </div>
  )
}

export function LinkPortfolioModal({ linkedIds, onClose, onSave }: Props) {
  const portfolios = useSelectablePortfolios()
  const [selected, setSelected] = useState<Set<string>>(new Set(linkedIds))
  const [searchQuery, setSearchQuery] = useState("")
  const overlayRef = useRef<HTMLDivElement>(null)

  useBodyLock(true, onClose)

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const connect    = (id: string) => setSelected((prev) => new Set([...prev, id]))
  const disconnect = (id: string) => setSelected((prev) => { const next = new Set(prev); next.delete(id); return next })

  const handleSave = () => { onSave(Array.from(selected)); onClose() }

  const connectedPortfolios   = portfolios.filter((p: SelectablePortfolio) => selected.has(p.id))
  const availablePortfolios   = portfolios.filter((p: SelectablePortfolio) => !selected.has(p.id))
  const filteredAvailable     = availablePortfolios.filter((p: SelectablePortfolio) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      ref={overlayRef}
      className="lpm-overlay"
      role="dialog"
      aria-modal
      aria-label="포트폴리오 연결 관리"
      onClick={handleOverlayClick}
    >
      <div className="lpm-panel">

        {/* 헤더 */}
        <div className="lpm-header">
          <span className="lpm-header__title">포트폴리오 연결 관리</span>
          <button type="button" className="lpm-header__close" onClick={onClose} aria-label="닫기">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="lpm-body">

          {/* ── 섹션 1: 현재 연결된 포트폴리오 ── */}
          <div className="lpm-section">
            <div className="lpm-section__head">
              <span className="lpm-section__label">현재 연결된 포트폴리오</span>
              {connectedPortfolios.length > 0 && (
                <span className="lpm-section__count">{connectedPortfolios.length}개</span>
              )}
            </div>

            {connectedPortfolios.length > 0 ? (
              <ul className="lpm-list lpm-list--connected">
                {connectedPortfolios.map((p) => (
                  <li key={p.id}>
                    <div className="lpm-item lpm-item--connected">
                      <PortfolioThumb title={p.title} />
                      <div className="lpm-item__info">
                        <span className="lpm-item__title">{p.title}</span>
                        <div className="lpm-item__meta">
                          <span className="lpm-item__cat">{formatCategoryLabel(p)}</span>
                          <div className="lpm-item__tags">
                            {p.tags.slice(0, 2).map((t) => (
                              <span key={t} className="lpm-item__tag">#{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="lpm-item__action lpm-item__action--disconnect"
                        onClick={() => disconnect(p.id)}
                        aria-label={`${p.title} 연결 해제`}
                      >
                        해제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="lpm-section__empty">아직 연결된 포트폴리오가 없어요.</p>
            )}
          </div>

          {/* ── 섹션 2: 연결 추가 ── */}
          <div className="lpm-section">
            <div className="lpm-section__head">
              <span className="lpm-section__label">연결 추가</span>
            </div>

            {availablePortfolios.length > 0 ? (
              <>
                {/* 검색 */}
                <div className="lpm-search">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    className="lpm-search__input"
                    placeholder="포트폴리오 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button type="button" className="lpm-search__clear" onClick={() => setSearchQuery("")} aria-label="검색어 지우기">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                {filteredAvailable.length > 0 ? (
                  <ul className="lpm-list">
                    {filteredAvailable.map((p) => (
                      <li key={p.id}>
                        <div className="lpm-item">
                          <PortfolioThumb title={p.title} />
                          <div className="lpm-item__info">
                            <span className="lpm-item__title">{p.title}</span>
                            <div className="lpm-item__meta">
                              <span className="lpm-item__cat">{formatCategoryLabel(p)}</span>
                              <div className="lpm-item__tags">
                                {p.tags.slice(0, 2).map((t) => (
                                  <span key={t} className="lpm-item__tag">#{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="lpm-item__action lpm-item__action--connect"
                            onClick={() => connect(p.id)}
                            aria-label={`${p.title} 연결하기`}
                          >
                            연결
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="lpm-section__empty">검색 결과가 없습니다.</p>
                )}
              </>
            ) : (
              <p className="lpm-section__empty">모든 포트폴리오가 연결되어 있어요.</p>
            )}
          </div>

          {/* 포트폴리오 등록 링크 */}
          <Link href={USER_ROUTES.portfolio.write} className="lpm-cta-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            새 포트폴리오 등록하기
          </Link>

        </div>

        {/* 푸터 */}
        <div className="lpm-footer">
          <button type="button" className="lpm-footer__cancel" onClick={onClose}>취소</button>
          <button type="button" className="lpm-footer__save" onClick={handleSave}>
            저장 ({selected.size}개 연결)
          </button>
        </div>

      </div>
    </div>
  )
}
