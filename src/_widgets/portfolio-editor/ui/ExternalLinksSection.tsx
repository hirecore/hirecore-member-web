"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { PortfolioLink } from "@/_features/portfolio/lib"
import "./links-section.scss"

// 빠른 입력용 프리셋 레이블
const PRESET_LABELS = ["GitHub", "Figma", "Blog", "Notion", "YouTube", "Demo"]

interface Props {
  externalLinks: PortfolioLink[]
  onAdd: (link: PortfolioLink) => void
  onRemove: (index: number) => void
  /** 정렬 변경 콜백 — 미지정 시 드래그 비활성 */
  onReorder?: (next: PortfolioLink[]) => void
  /** 인라인 수정 콜백 — 미지정 시 수정 버튼 비표시 */
  onUpdate?: (index: number, link: PortfolioLink) => void
  /** 외부 section 래퍼 클래스 (기본: "pw-section pw-section--links") */
  sectionClassName?: string
  /** 라벨/선택 클래스 접두어 (기본: "pw") */
  classPrefix?: string
}

interface ItemProps {
  id: string
  index: number
  link: PortfolioLink
  draggable: boolean
  editable: boolean
  onRemove: (index: number) => void
  onUpdate?: (index: number, link: PortfolioLink) => void
}

function LinkItem({ id, index, link, draggable, editable, onRemove, onUpdate }: ItemProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id, disabled: !draggable })

  const [isEditing, setIsEditing] = useState(false)
  const [editLabel, setEditLabel] = useState(link.label)
  const [editUrl, setEditUrl]     = useState(link.url)
  const [editError, setEditError] = useState<string | null>(null)

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const startEdit = () => {
    setEditLabel(link.label)
    setEditUrl(link.url)
    setEditError(null)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditError(null)
  }

  const saveEdit = () => {
    const trimLabel = editLabel.trim()
    const trimUrl   = editUrl.trim()
    if (!trimLabel) { setEditError("레이블을 입력해주세요"); return }
    if (!trimUrl)   { setEditError("URL을 입력해주세요"); return }
    const finalUrl = /^https?:\/\//i.test(trimUrl) ? trimUrl : `https://${trimUrl}`
    onUpdate?.(index, { label: trimLabel, url: finalUrl })
    setIsEditing(false)
    setEditError(null)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); saveEdit() }
    else if (e.key === "Escape") { e.preventDefault(); cancelEdit() }
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`pls-item${isDragging ? " pls-item--dragging" : ""}${isEditing ? " pls-item--editing" : ""}`}
    >
      {draggable && !isEditing && (
        <button
          type="button"
          className="pls-item__handle"
          aria-label="드래그하여 순서 변경"
          {...attributes}
          {...listeners}
        >
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden>
            <circle cx="4" cy="3"  r="1" fill="currentColor" />
            <circle cx="8" cy="3"  r="1" fill="currentColor" />
            <circle cx="4" cy="7"  r="1" fill="currentColor" />
            <circle cx="8" cy="7"  r="1" fill="currentColor" />
            <circle cx="4" cy="11" r="1" fill="currentColor" />
            <circle cx="8" cy="11" r="1" fill="currentColor" />
          </svg>
        </button>
      )}

      {isEditing ? (
        <>
          <input
            type="text"
            className="pls-item__input pls-item__input--label"
            value={editLabel}
            onChange={(e) => { setEditLabel(e.target.value); setEditError(null) }}
            onKeyDown={handleEditKeyDown}
            maxLength={20}
            placeholder="레이블"
            aria-label="레이블 수정"
          />
          <input
            type="url"
            className="pls-item__input pls-item__input--url"
            value={editUrl}
            onChange={(e) => { setEditUrl(e.target.value); setEditError(null) }}
            onKeyDown={handleEditKeyDown}
            placeholder="https://..."
            aria-label="URL 수정"
          />
          <div className="pls-item__edit-actions">
            <button type="button" className="pls-item__save" onClick={saveEdit} aria-label="저장">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="pls-item__cancel" onClick={cancelEdit} aria-label="취소">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          {editError && <p className="pls-item__error" role="alert">{editError}</p>}
        </>
      ) : (
        <>
          <span className="pls-item__label">{link.label}</span>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pls-item__url"
          >
            {link.url}
          </a>
          <div className="pls-item__actions">
            {editable && (
              <button
                type="button"
                className="pls-item__edit"
                onClick={startEdit}
                aria-label={`${link.label} 링크 수정`}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M8.5 1.5l2 2L4 10l-2.5.5L2 8l6.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <button
              type="button"
              className="pls-item__remove"
              onClick={() => onRemove(index)}
              aria-label={`${link.label} 링크 삭제`}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </li>
  )
}

export function ExternalLinksSection({
  externalLinks, onAdd, onRemove, onReorder, onUpdate,
  sectionClassName, classPrefix = "pw",
}: Props) {
  const [label, setLabel] = useState("")
  const [url,   setUrl]   = useState("")
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleAdd = () => {
    const trimLabel = label.trim()
    const trimUrl   = url.trim()

    if (!trimLabel) { setError("레이블을 입력해주세요"); return }
    if (!trimUrl)   { setError("URL을 입력해주세요"); return }

    // 간단한 URL 형식 보정
    const finalUrl = /^https?:\/\//i.test(trimUrl) ? trimUrl : `https://${trimUrl}`

    if (externalLinks.length >= 6) { setError("링크는 최대 6개까지 추가할 수 있습니다"); return }

    onAdd({ label: trimLabel, url: finalUrl })
    setLabel("")
    setUrl("")
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd() }
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id || !onReorder) return
    const oldIndex = Number(String(active.id).replace("link-", ""))
    const newIndex = Number(String(over.id).replace("link-", ""))
    if (Number.isNaN(oldIndex) || Number.isNaN(newIndex)) return
    onReorder(arrayMove(externalLinks, oldIndex, newIndex))
  }

  const draggable = !!onReorder && externalLinks.length > 1
  const editable = !!onUpdate
  // useSortable id는 안정적이어야 — 인덱스 기반으로 만들면 reorder 후에도 same items 안정
  const items = externalLinks.map((_, i) => `link-${i}`)

  return (
    <section className={sectionClassName ?? `${classPrefix}-section ${classPrefix}-section--links`}>
      <div className={`${classPrefix}-section__head`}>
        <span className={`${classPrefix}-section__label`}>링크</span>
        <span className={`${classPrefix}-section__optional`}>선택</span>
        <span className={`${classPrefix}-section__hint`}>{externalLinks.length}/6</span>
      </div>

      {/* 프리셋 */}
      <div className="pls-presets">
        {PRESET_LABELS.map((p) => (
          <button
            key={p}
            type="button"
            className="pls-preset-btn"
            onClick={() => setLabel(p)}
            aria-label={`${p} 레이블 선택`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 입력 행 */}
      <div className="pls-input-row">
        <div className="pls-input-wrap pls-input-wrap--label">
          <input
            type="text"
            className="pls-input"
            placeholder="레이블 (예: GitHub)"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
            maxLength={20}
          />
        </div>
        <div className="pls-input-wrap pls-input-wrap--url">
          <input
            type="url"
            className="pls-input"
            placeholder="URL (예: https://github.com/...)"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          type="button"
          className="pls-add-btn"
          onClick={handleAdd}
          disabled={externalLinks.length >= 6}
          aria-label="링크 추가"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          추가
        </button>
      </div>

      {error && <p className="pls-error" role="alert">{error}</p>}

      {/* 추가된 링크 목록 */}
      {externalLinks.length > 0 && (
        <ul className="pls-list">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              {externalLinks.map((link, i) => (
                <LinkItem
                  key={items[i]}
                  id={items[i]}
                  index={i}
                  link={link}
                  draggable={draggable}
                  editable={editable}
                  onRemove={onRemove}
                  onUpdate={onUpdate}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
      )}
    </section>
  )
}
