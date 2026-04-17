"use client"

import "./tags-section.scss"

interface Props {
  tags: string[]
  tagInput: string
  onInputChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onRemove: (tag: string) => void
}

export function TagsSection({ tags, tagInput, onInputChange, onKeyDown, onRemove }: Props) {
  return (
    <section className="pw-section pw-section--tags">
      <div className="pw-section__head">
        <span className="pw-section__label">태그</span>
        <span className="pw-section__optional">선택</span>
        <span className="pw-section__hint">{tags.length}/10</span>
      </div>
      <div className="pw-tags-wrap">
        {tags.map((tag) => (
          <span key={tag} className="pw-tag">
            #{tag}
            <button
              type="button"
              className="pw-tag__remove"
              onClick={() => onRemove(tag)}
              aria-label={`${tag} 태그 삭제`}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
        {tags.length < 10 && (
          <input
            type="text"
            className="pw-tag-input"
            placeholder={tags.length === 0 ? "태그 입력 후 Enter (예: React, 프론트엔드)" : "태그 추가..."}
            value={tagInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
        )}
      </div>
    </section>
  )
}
