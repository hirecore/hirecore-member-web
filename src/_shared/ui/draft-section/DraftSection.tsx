"use client"

import "./draft-section.scss"

export interface DraftItem {
  id: string
  title: string
  updatedAt: string
}

interface DraftSectionProps {
  items: DraftItem[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function DraftSection({ items, onEdit, onDelete }: DraftSectionProps) {
  if (items.length === 0) return null

  return (
    <section className="draft-section">
      <div className="draft-section__header">
        <div className="draft-section__header-left">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="draft-section__icon">
            <path d="M12 9v2.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10.5 3v3.5M8.75 4.75h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <h3 className="draft-section__title">임시저장</h3>
          <span className="draft-section__count">{items.length}</span>
        </div>
      </div>

      <div className="draft-section__list">
        {items.map((item) => (
          <article key={item.id} className="draft-card">
            <div className="draft-card__badge">임시저장</div>
            <div className="draft-card__body">
              <h4 className="draft-card__title">{item.title}</h4>
              <span className="draft-card__date">{item.updatedAt}</span>
            </div>
            <div className="draft-card__actions">
              <button type="button" className="draft-card__btn draft-card__btn--edit" onClick={() => onEdit(item.id)}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M11.5 2.5l2 2-7 7H4.5v-2l7-7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M9.5 4.5l2 2" stroke="currentColor" strokeWidth="1.3" />
                </svg>
                이어서 작성
              </button>
              <button type="button" className="draft-card__btn draft-card__btn--delete" onClick={() => onDelete(item.id)}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
