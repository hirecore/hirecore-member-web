"use client"

import { useState, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"

/** 캐러셀 내 개별 이미지 항목 */
interface ImageItem {
  url: string
  alt: string
}

/**
 * ImageCarouselView — 이미지 캐러셀 노드 뷰.
 *
 * TipTap NodeView로 렌더되며, 편집 모드와 읽기 모드 두 가지 형태로 동작한다.
 *
 * [편집 모드 (isEditable=true)]
 *   - 썸네일 스트립: 순서 변경(화살표), 드래그&드롭 정렬
 *   - 개별 블록으로 분리 버튼
 *   - 메인 슬라이드: 이미지 클릭 → 라이트박스 전체화면 보기
 *
 * [읽기 모드 (isEditable=false)]
 *   - 하단 점(dots) 내비게이션
 *   - 이미지 클릭 → 라이트박스 전체화면 보기
 */
export const ImageCarouselView: React.FC<NodeViewProps> = ({
  node,
  selected,
  editor,
  getPos,
  updateAttributes,
}) => {
  const images: ImageItem[] = node.attrs.images ?? []
  const isEditable = editor?.isEditable ?? false

  /* ── 로컬 상태 ──────────────────────────────────────────────────── */
  const [current, setCurrent] = useState(0)          // 현재 표시 중인 슬라이드 인덱스
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)  // 마우스 오버된 썸네일
  const [dragIndex, setDragIndex] = useState<number | null>(null)        // 드래그 중인 썸네일 인덱스
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null) // 드롭 대상 썸네일 인덱스
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null) // 라이트박스 표시 인덱스

  /* ── 라이트박스 키보드 내비게이션 ──────────────────────────────────
     라이트박스가 열려 있을 때만 키 이벤트를 등록한다.
       Escape    → 라이트박스 닫기
       ArrowLeft → 이전 이미지
       ArrowRight → 다음 이미지
     언마운트 또는 라이트박스 닫힘 시 리스너 자동 제거.
  ───────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null)
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : i))
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : i))
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [lightboxIndex, images.length])

  /* ── 메인 슬라이드 내비게이션 ────────────────────────────────────── */
  const prev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setCurrent((c) => (c - 1 + images.length) % images.length)
    },
    [images.length]
  )

  const next = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setCurrent((c) => (c + 1) % images.length)
    },
    [images.length]
  )

  /* ── 화살표 순서 변경 ────────────────────────────────────────────────
     썸네일 오버레이의 좌/우 화살표로 이미지 순서를 바꾼다.
     현재 보고 있는 슬라이드가 이동 대상이면 current도 따라 이동한다.
     setHoveredIndex로 이동 후 위치를 hover 상태로 유지 → 컨트롤 깜빡임 방지.
  ───────────────────────────────────────────────────────────────────── */
  const moveLeft = useCallback(
    (e: React.MouseEvent, idx: number) => {
      e.stopPropagation()
      if (idx === 0) return // 첫 번째는 더 이상 왼쪽으로 이동 불가
      const arr = [...images]
      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      updateAttributes({ images: arr })
      if (current === idx) setCurrent(idx - 1)
      else if (current === idx - 1) setCurrent(idx)
      setHoveredIndex(idx - 1) // 이동한 위치로 hover 유지
    },
    [images, updateAttributes, current]
  )

  const moveRight = useCallback(
    (e: React.MouseEvent, idx: number) => {
      e.stopPropagation()
      if (idx === images.length - 1) return // 마지막은 더 이상 오른쪽으로 이동 불가
      const arr = [...images]
      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      updateAttributes({ images: arr })
      if (current === idx) setCurrent(idx + 1)
      else if (current === idx + 1) setCurrent(idx)
      setHoveredIndex(idx + 1) // 이동한 위치로 hover 유지
    },
    [images, updateAttributes, current]
  )

  /* ── 드래그&드롭 순서 변경 ────────────────────────────────────────
     썸네일을 드래그해 다른 위치로 옮겨 순서를 변경한다.
     e.stopPropagation(): TipTap의 블록 드래그와 이벤트 충돌 방지.
  ───────────────────────────────────────────────────────────────────── */
  const handleDragStart = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.stopPropagation() // TipTap 블록 드래그와 충돌 방지
      e.dataTransfer.effectAllowed = "move"
      setDragIndex(idx)
    },
    []
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = "move"
      if (dragOverIndex !== idx) setDragOverIndex(idx)
    },
    [dragOverIndex]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIdx: number) => {
      e.preventDefault()
      e.stopPropagation()
      if (dragIndex === null || dragIndex === dropIdx) {
        // 드롭 대상이 없거나 제자리 드롭 → 상태만 초기화
        setDragIndex(null)
        setDragOverIndex(null)
        return
      }
      // 배열에서 dragIndex 위치 제거 후 dropIdx 위치에 삽입
      const arr = [...images]
      const [moved] = arr.splice(dragIndex, 1)
      arr.splice(dropIdx, 0, moved)
      updateAttributes({ images: arr })
      setCurrent(dropIdx) // 드롭한 위치를 현재 슬라이드로 포커스
      setDragIndex(null)
      setDragOverIndex(null)
    },
    [dragIndex, images, updateAttributes]
  )

  /** 드래그 종료 시 드래그 상태 초기화 (드롭 실패 포함) */
  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  /* ── 개별 이미지 블록으로 분리 ────────────────────────────────────
     캐러셀 노드를 각각의 독립 image 노드 배열로 교체한다.
     getPos(): 현재 노드의 문서 내 위치(offset) 반환
     replaceWith: 현재 nodeSize 범위를 imageNodes 배열로 교체
  ───────────────────────────────────────────────────────────────────── */
  const splitToIndividual = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!editor || typeof getPos !== "function") return
      const pos = getPos()
      if (pos === undefined) return
      const imageNodes = images.map((img) =>
        editor.schema.nodes.image.create({ src: img.url, alt: img.alt, title: img.alt })
      )
      editor.view.dispatch(
        editor.state.tr.replaceWith(pos, pos + node.nodeSize, imageNodes)
      )
    },
    [editor, getPos, images, node.nodeSize]
  )

  // 이미지가 없으면 렌더하지 않음 (빈 캐러셀 방어)
  if (images.length === 0) return null

  return (
    <NodeViewWrapper
      className="image-carousel-wrapper"
      style={undefined}
    >
      {/* ── 메인 슬라이드 영역 ─────────────────────────────────────── */}
      {/* image-carousel--selected: 편집 모드에서 ProseMirror 노드 선택 시 파란 링으로 표시 */}
      <div className={["image-carousel", selected && isEditable ? "image-carousel--selected" : ""].filter(Boolean).join(" ")}>
        {/*
          슬라이드 트랙: translateX(-N * 100%) 로 현재 슬라이드 표시.
          CSS transition(0.36s cubic-bezier)으로 부드럽게 이동.
        */}
        <div
          className="image-carousel__track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="image-carousel__slide">
              {/*
                onClick 을 img 에만 걸어 이미지 영역 클릭 시에만 반응하게 함.
                슬라이드 배경(패딩) 클릭은 무시 — 캐러셀 블록 선택 시 의도치 않은 오픈 방지.
                편집 모드 / 읽기 모드 모두 이미지 클릭 → 라이트박스 확대.
              */}
              <img
                src={img.url}
                alt={img.alt}
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex(i)
                }}
              />
            </div>
          ))}
        </div>

        {/* 좌/우 화살표 내비게이션 — 이미지가 2개 이상일 때만 표시 */}
        {images.length > 1 && (
          <>
            <button className="image-carousel__nav image-carousel__nav--prev" onClick={prev} type="button" aria-label="이전 이미지">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="image-carousel__nav image-carousel__nav--next" onClick={next} type="button" aria-label="다음 이미지">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* 우상단 슬라이드 카운터 (예: "2 / 5") */}
            <div className="image-carousel__counter" aria-live="polite">
              {current + 1} / {images.length}
            </div>

            {/* 하단 점(dots) 내비게이션 — 읽기 모드에서만 표시 */}
            {!isEditable && (
              <div className="image-carousel__dots" role="tablist">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={["image-carousel__dot", i === current ? "image-carousel__dot--active" : ""].filter(Boolean).join(" ")}
                    onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                    type="button"
                    role="tab"
                    aria-selected={i === current}
                    aria-label={`${i + 1}번째 이미지`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* 개별 블록 분리 버튼 — 편집 모드에서만 표시 */}
        {isEditable && (
          <button className="image-carousel__split-btn" onClick={splitToIndividual} type="button" title="개별 이미지 블록으로 분리">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: "0.3rem", flexShrink: 0 }}>
              <rect x="1" y="2" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <rect x="9" y="2" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            개별 블록으로 분리
          </button>
        )}
      </div>

      {/* ── 썸네일 스트립 (이미지 2개 이상이면 편집·읽기 모드 모두 표시) ────
          편집 모드: 드래그&드롭, 화살표 순서 변경, 안내 문구
          읽기 모드: 클릭으로 슬라이드 이동만 가능 (드래그·컨트롤 없음)
      ───────────────────────────────────────────────────────────────── */}
      {images.length > 1 && (
        <div className={[
          "image-carousel__thumb-section",
          isEditable ? "image-carousel__thumb-section--editable" : "",
        ].filter(Boolean).join(" ")}>
          <div className="image-carousel__thumbs">
            {images.map((img, i) => (
              <div
                key={i}
                className={[
                  "image-carousel__thumb",
                  i === current ? "image-carousel__thumb--active" : "",
                  i === hoveredIndex ? "image-carousel__thumb--hovered" : "",
                  i === dragIndex ? "image-carousel__thumb--dragging" : "",
                  i === dragOverIndex && i !== dragIndex ? "image-carousel__thumb--dragover" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                // drag 속성은 편집 모드에서만 활성화
                draggable={isEditable}
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onDragStart={isEditable ? (e) => handleDragStart(e, i) : undefined}
                onDragOver={isEditable ? (e) => handleDragOver(e, i) : undefined}
                onDrop={isEditable ? (e) => handleDrop(e, i) : undefined}
                onDragEnd={isEditable ? handleDragEnd : undefined}
              >
                <img src={img.url} alt={img.alt} draggable={false} />

                {/* 썸네일 오버레이 컨트롤: 편집 모드에서만 표시 */}
                {isEditable && (
                  <div className="image-carousel__thumb-controls">
                    <button
                      className="image-carousel__thumb-move"
                      onClick={(e) => moveLeft(e, i)}
                      disabled={i === 0}
                      type="button"
                      aria-label="앞으로 이동"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M7.5 9.5L4 6L7.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {/* 현재 순번 표시 */}
                    <span className="image-carousel__thumb-index">{i + 1}</span>
                    <button
                      className="image-carousel__thumb-move"
                      onClick={(e) => moveRight(e, i)}
                      disabled={i === images.length - 1}
                      type="button"
                      aria-label="뒤로 이동"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 편집 모드 안내 문구 — 읽기 모드에서는 표시하지 않음 */}
          {isEditable && (
            <div className="image-carousel__hint-group">
              <div className="image-carousel__hint">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6 5.5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="6" cy="3.5" r="0.6" fill="currentColor" />
                </svg>
                드래그하거나 화살표로 이미지 순서를 조정하세요
              </div>
              <div className="image-carousel__hint image-carousel__hint--sub">
                각 이미지를 독립 블록으로 올리고 싶다면 <span className="image-carousel__hint-em">개별 블록으로 분리</span>를 눌러주세요
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 라이트박스 포털 ───────────────────────────────────────────
          createPortal 을 사용하는 이유:
          에디터 DOM 안에 렌더하면 z-index 쌓임 맥락에 갇혀 전체화면이 안 된다.
          document.body 에 직접 렌더하여 z-index: 9999 로 모든 요소 위에 표시.
      ──────────────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && createPortal(
        <div
          className="carousel-lightbox"
          onClick={() => setLightboxIndex(null)} // 배경 클릭 시 닫힘
          role="dialog"
          aria-modal="true"
          aria-label="이미지 확대 보기"
        >
          {/* 우상단 닫기(×) 버튼 */}
          <button
            className="carousel-lightbox__close"
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null) }}
            aria-label="닫기"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 상단 중앙 슬라이드 카운터 — 이미지 2개 이상 시 표시 */}
          {images.length > 1 && (
            <div className="carousel-lightbox__counter" aria-live="polite">
              {lightboxIndex + 1} / {images.length}
            </div>
          )}

          {/*
            이미지 래퍼 — 클릭 이벤트 차단 (배경 클릭 닫힘 방지)
            max-width: min(90vw, 1200px) / max-height: 80vh 로 화면 내 적절히 표시
          */}
          <div className="carousel-lightbox__img-wrap" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].alt}
              draggable={false}
            />
          </div>

          {/* 좌/우 화살표 — 이미지 2개 이상 시 표시 */}
          {images.length > 1 && (
            <>
              <button
                className="carousel-lightbox__arrow carousel-lightbox__arrow--prev"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : i))
                }}
                aria-label="이전 이미지"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M14 5L8 11L14 17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="carousel-lightbox__arrow carousel-lightbox__arrow--next"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : i))
                }}
                aria-label="다음 이미지"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M8 5l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          {/* 하단 점(dots) 내비게이션 — 이미지 2개 이상 시 표시 */}
          {images.length > 1 && (
            <div className="carousel-lightbox__dots" role="tablist">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={[
                    "carousel-lightbox__dot",
                    i === lightboxIndex ? "carousel-lightbox__dot--active" : "",
                  ].filter(Boolean).join(" ")}
                  type="button"
                  role="tab"
                  aria-selected={i === lightboxIndex}
                  aria-label={`${i + 1}번 이미지`}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </NodeViewWrapper>
  )
}
