"use client"

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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import "./tags-section.scss"

interface Props {
  tags: string[]
  tagInput: string
  onInputChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onRemove: (tag: string) => void
  /** 드래그 정렬 콜백. 미지정 시 드래그 비활성. */
  onReorder?: (next: string[]) => void
  /** 외부 section 래퍼 클래스 prefix (기본 "pw") */
  classPrefix?: string
  /** 빈 상태 placeholder (기본값 있음) */
  emptyPlaceholder?: string
  /** 일부 입력된 상태 placeholder */
  partialPlaceholder?: string
}

interface ChipProps {
  tag: string
  onRemove: (tag: string) => void
  draggable: boolean
}

function TagChip({ tag, onRemove, draggable }: ChipProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: tag, disabled: !draggable })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: draggable ? (isDragging ? "grabbing" : "grab") : "default",
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <span
      ref={setNodeRef}
      style={style}
      className={`pw-tag${isDragging ? " pw-tag--dragging" : ""}`}
      {...attributes}
      {...listeners}
    >
      #{tag}
      <button
        type="button"
        className="pw-tag__remove"
        onClick={(e) => { e.stopPropagation(); onRemove(tag) }}
        // 드래그 활성화 거리(5px) 미만의 클릭이지만, 안전을 위해 포인터 다운 단계에서 분리
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`${tag} 태그 삭제`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  )
}

export function TagsSection({
  tags, tagInput, onInputChange, onKeyDown, onRemove,
  onReorder, classPrefix = "pw",
  emptyPlaceholder = "태그 입력 후 Enter (예: React, 프론트엔드)",
  partialPlaceholder = "태그 추가...",
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id || !onReorder) return
    const oldIndex = tags.indexOf(String(active.id))
    const newIndex = tags.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(tags, oldIndex, newIndex))
  }

  const draggable = !!onReorder && tags.length > 1

  return (
    <section className={`${classPrefix}-section ${classPrefix}-section--tags`}>
      <div className={`${classPrefix}-section__head`}>
        <span className={`${classPrefix}-section__label`}>태그</span>
        <span className={`${classPrefix}-section__optional`}>선택</span>
        <span className={`${classPrefix}-section__hint`}>{tags.length}/10</span>
      </div>
      <div className="pw-tags-wrap">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tags} strategy={rectSortingStrategy}>
            {tags.map((tag) => (
              <TagChip key={tag} tag={tag} onRemove={onRemove} draggable={draggable} />
            ))}
          </SortableContext>
        </DndContext>
        {tags.length < 10 && (
          <input
            type="text"
            className="pw-tag-input"
            placeholder={tags.length === 0 ? emptyPlaceholder : partialPlaceholder}
            value={tagInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
          />
        )}
      </div>
    </section>
  )
}
