"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { Editor } from "@tiptap/core"
import type { Node as PMNode } from "@tiptap/pm/model"
import "./table-hover-controls.scss"

interface Props {
  editor: Editor
}

interface RowInfo { top: number; height: number; rowIndex: number }
interface ColInfo { left: number; width: number; colIndex: number }
interface MenuState { type: "row" | "col"; index: number; top: number; left: number }
interface DragState { type: "row" | "col"; sourceIdx: number; targetIdx: number | null }

const HANDLE_W = 14   // 핸들 너비
const HANDLE_H = 14
const HANDLE_GAP = 6  // 핸들/표 사이 간격
const STRIP = 22      // + strip 두께
const STRIP_GAP = 8   // + strip 과 wrapper 사이 간격 (스크롤바 아래로 배치)

/**
 * Notion-style 표 hover 컨트롤
 * - 표 hover 시 즉시 모든 핸들·strip 노출 (기본 visible, 표 떠나면 사라짐)
 * - 셀 안에 메뉴 안 띄움 — 핸들 클릭 시에만 메뉴
 * - 메뉴 열린 동안 대상 행/열을 파란 highlight
 */
export function TableHoverControls({ editor }: Props) {
  const [tableEl, setTableEl] = useState<HTMLTableElement | null>(null)
  const [tableRect, setTableRect] = useState<DOMRect | null>(null)
  const [wrapperRect, setWrapperRect] = useState<DOMRect | null>(null)
  const [rows, setRows] = useState<RowInfo[]>([])
  const [cols, setCols] = useState<ColInfo[]>([])
  const [menu, setMenu] = useState<MenuState | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)
  const layerRef = useRef<HTMLDivElement | null>(null)
  const menuRef  = useRef<HTMLDivElement | null>(null)
  const ghostRef = useRef<HTMLDivElement | null>(null)

  const recalc = useCallback((el: HTMLTableElement) => {
    setTableRect(el.getBoundingClientRect())
    // wrapper(.tableWrapper or 직계 부모)는 가로 스크롤 컨테이너.
    // tiptap 버전에 따라 클래스가 없을 수 있어 parentElement 로도 fallback.
    const wrapper = (el.closest(".tableWrapper") ?? el.parentElement) as HTMLElement | null
    setWrapperRect((wrapper ?? el).getBoundingClientRect())
    const trEls = Array.from(el.querySelectorAll("tr")) as HTMLTableRowElement[]
    setRows(trEls.map((tr, i) => {
      const r = tr.getBoundingClientRect()
      return { top: r.top, height: r.height, rowIndex: i }
    }))
    const firstRow = trEls[0]
    setCols(
      firstRow
        ? (Array.from(firstRow.children) as HTMLElement[]).map((c, i) => {
            const r = c.getBoundingClientRect()
            return { left: r.left, width: r.width, colIndex: i }
          })
        : [],
    )
  }, [])

  useEffect(() => {
    // document 전역에서 mousemove 추적 — 포털(body)로 옮겨진 컨트롤 위에서도 활성 유지
    const onMove = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t) return

      // 1) 우리 포털 안(핸들/strip/메뉴) — 활성 유지
      if (layerRef.current?.contains(t) || menuRef.current?.contains(t)) return

      // 2) 에디터 내부의 table 위 — 해당 table 활성화
      const table = t.closest("table") as HTMLTableElement | null
      if (table && editor.view.dom.contains(table)) {
        if (table !== tableEl) setTableEl(table)
        recalc(table)
        return
      }

      // 3) 현재 활성 table 의 wrapper 주변 padding 영역 — 핸들·strip 위 마우스 이동 시 활성 유지
      if (tableEl && tableEl.isConnected) {
        const wrapper = tableEl.closest(".tableWrapper") as HTMLElement | null
        const r = (wrapper ?? tableEl).getBoundingClientRect()
        const PAD = 48   // 핸들(14) + 간격(6) + strip(22) + 스크롤바(~10) 여유
        const inZone =
          e.clientX >= r.left - PAD &&
          e.clientX <= r.right + PAD &&
          e.clientY >= r.top - PAD &&
          e.clientY <= r.bottom + PAD
        if (inZone) {
          recalc(tableEl)
          return
        }
      }

      // 4) 진짜 외부 — 메뉴 닫혀있을 때만 숨김
      if (!menu) setTableEl(null)
    }

    document.addEventListener("mousemove", onMove, { passive: true })
    return () => document.removeEventListener("mousemove", onMove)
  }, [editor, tableEl, menu, recalc])

  useEffect(() => {
    if (!tableEl) return
    const update = () => { if (tableEl.isConnected) recalc(tableEl) }
    window.addEventListener("scroll", update, { passive: true, capture: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update, { capture: true })
      window.removeEventListener("resize", update)
    }
  }, [tableEl, recalc])

  useEffect(() => {
    if (!menu) return
    const h = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (menuRef.current?.contains(t)) return
      if (layerRef.current?.contains(t)) return
      setMenu(null)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [menu])

  // ── 표가 doc 에서 제거되면(예: 선택 후 Delete) 즉시 컨트롤 클리어 ──
  // editor 업데이트 직후 tableEl 의 연결 상태를 검사 — mousemove 를 기다리지 않고 핸들이 사라지도록.
  useEffect(() => {
    if (!editor) return
    const onUpdate = () => {
      if (tableEl && !tableEl.isConnected) {
        setTableEl(null)
        setTableRect(null)
        setWrapperRect(null)
        setRows([])
        setCols([])
        setMenu(null)
        setDrag(null)
      }
    }
    editor.on("update", onUpdate)
    return () => { editor.off("update", onUpdate) }
  }, [editor, tableEl])

  // ── FLIP 애니메이션 helper: swap 직전 셀 위치 스냅샷 + swap 후 inverse transform 적용 ──
  // 셀이 (rowIdx, colIdx) → 새 위치로 이동할 때, 이전 위치에서 새 위치로 슬라이드
  const snapshotCells = useCallback(
    (
      el: HTMLTableElement,
      type: "row" | "col",
      fromIdx: number,
      toIdx: number,
    ): Map<string, DOMRect> => {
      const snaps = new Map<string, DOMRect>()
      const trs = Array.from(el.querySelectorAll("tr")) as HTMLTableRowElement[]
      if (type === "col") {
        trs.forEach((tr, r) => {
          const cf = tr.children[fromIdx] as HTMLElement | undefined
          const ct = tr.children[toIdx] as HTMLElement | undefined
          if (cf) snaps.set(`${r}-${fromIdx}`, cf.getBoundingClientRect())
          if (ct) snaps.set(`${r}-${toIdx}`, ct.getBoundingClientRect())
        })
      } else {
        ;[fromIdx, toIdx].forEach((rowIdx) => {
          const tr = trs[rowIdx]
          if (!tr) return
          Array.from(tr.children).forEach((cell, colIdx) => {
            snaps.set(`${rowIdx}-${colIdx}`, (cell as HTMLElement).getBoundingClientRect())
          })
        })
      }
      return snaps
    },
    [],
  )

  const flipAnimate = useCallback(
    (
      newTable: HTMLTableElement,
      snaps: Map<string, DOMRect>,
      type: "row" | "col",
      fromIdx: number,
      toIdx: number,
    ) => {
      const trs = Array.from(newTable.querySelectorAll("tr")) as HTMLTableRowElement[]
      // 노션 톤: 약간 길고 부드러운 ease-out + lift 효과(살짝 떠올랐다가 안착)
      const DURATION = 240
      const EASING = "cubic-bezier(0.22, 1, 0.36, 1)" // 노션식 ease-out-quint
      const LIFT_SHADOW = "0 6px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06)"

      // WAAPI 로 옛 위치 → 새 위치 슬라이드 + 살짝 들리는 lift
      const slide = (cellEl: HTMLElement, oldRect: DOMRect) => {
        const newRect = cellEl.getBoundingClientRect()
        const dx = oldRect.left - newRect.left
        const dy = oldRect.top - newRect.top
        if (dx === 0 && dy === 0) return

        // 애니메이션 중 다른 셀 위로 떠오르도록
        cellEl.style.position = "relative"
        cellEl.style.zIndex = "2"

        const animation = cellEl.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) scale(1)`, boxShadow: "none", offset: 0 },
            { transform: `translate(${dx * 0.5}px, ${dy * 0.5}px) scale(1.015)`, boxShadow: LIFT_SHADOW, offset: 0.5 },
            { transform: "translate(0, 0) scale(1)", boxShadow: "none", offset: 1 },
          ],
          { duration: DURATION, easing: EASING, fill: "none" },
        )
        animation.onfinish = () => {
          cellEl.style.position = ""
          cellEl.style.zIndex = ""
        }
      }

      if (type === "col") {
        // 새 fromIdx 셀에는 옛 toIdx 위치의 콘텐츠가 들어가 있음
        trs.forEach((tr, r) => {
          const newFrom = tr.children[fromIdx] as HTMLElement | undefined
          const newTo = tr.children[toIdx] as HTMLElement | undefined
          if (newFrom) {
            const old = snaps.get(`${r}-${toIdx}`)
            if (old) slide(newFrom, old)
          }
          if (newTo) {
            const old = snaps.get(`${r}-${fromIdx}`)
            if (old) slide(newTo, old)
          }
        })
      } else {
        // 새 fromIdx 행에는 옛 toIdx 행의 셀들이 들어가 있음
        const newFromRow = trs[fromIdx]
        const newToRow = trs[toIdx]
        if (newFromRow) {
          Array.from(newFromRow.children).forEach((cell, c) => {
            const old = snaps.get(`${toIdx}-${c}`)
            if (old) slide(cell as HTMLElement, old)
          })
        }
        if (newToRow) {
          Array.from(newToRow.children).forEach((cell, c) => {
            const old = snaps.get(`${fromIdx}-${c}`)
            if (old) slide(cell as HTMLElement, old)
          })
        }
      }
    },
    [],
  )

  // ── 표 node + position 찾기 (swap 작업의 공통 사전조건) ──
  const findTableNode = useCallback((): { tableNode: PMNode; tablePos: number } | null => {
    if (!tableEl) return null
    const { state, view } = editor
    let insidePos = -1
    try { insidePos = view.posAtDOM(tableEl, 0) } catch { return null }
    if (insidePos < 0) return null
    const $pos = state.doc.resolve(insidePos)
    for (let d = $pos.depth; d > 0; d--) {
      if ($pos.node(d).type.name === "table") {
        return { tableNode: $pos.node(d), tablePos: $pos.before(d) }
      }
    }
    return null
  }, [editor, tableEl])

  // dispatch 후 새 table DOM 찾기 + FLIP 애니메이션 적용 후 recalc
  const afterSwap = useCallback(
    (snaps: Map<string, DOMRect>, tablePos: number, type: "row" | "col", fromIdx: number, toIdx: number) => {
      requestAnimationFrame(() => {
        const nodeDom = editor.view.nodeDOM(tablePos) as HTMLElement | null
        const newTableEl: HTMLTableElement | null =
          nodeDom?.tagName === "TABLE"
            ? (nodeDom as HTMLTableElement)
            : (nodeDom?.querySelector("table") as HTMLTableElement | null)
        if (!newTableEl) return
        flipAnimate(newTableEl, snaps, type, fromIdx, toIdx)
        setTableEl(newTableEl)
        recalc(newTableEl)
      })
    },
    [editor, recalc, flipAnimate],
  )

  // ── 열 swap: 각 row 의 cells 배열에서 두 위치 교환 + FLIP 애니메이션 ──
  const swapColumns = useCallback(
    (fromCol: number, toCol: number) => {
      if (fromCol === toCol) return
      const found = findTableNode()
      if (!found || !tableEl) return
      const { tableNode, tablePos } = found

      // 1) 스냅샷 (현재 위치)
      const snaps = snapshotCells(tableEl, "col", fromCol, toCol)

      // 2) 새 table 빌드 & dispatch
      const newRowNodes: PMNode[] = []
      for (let r = 0; r < tableNode.childCount; r++) {
        const rowNode = tableNode.child(r)
        if (fromCol >= rowNode.childCount || toCol >= rowNode.childCount) {
          newRowNodes.push(rowNode); continue
        }
        const cellsArr: PMNode[] = []
        for (let c = 0; c < rowNode.childCount; c++) cellsArr.push(rowNode.child(c))
        const tmp = cellsArr[fromCol]
        cellsArr[fromCol] = cellsArr[toCol]
        cellsArr[toCol] = tmp
        newRowNodes.push(rowNode.type.create(rowNode.attrs, cellsArr, rowNode.marks))
      }
      const newTable = tableNode.type.create(tableNode.attrs, newRowNodes, tableNode.marks)
      editor.view.dispatch(
        editor.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable),
      )

      // 3) 새 table DOM 찾아 FLIP 적용
      afterSwap(snaps, tablePos, "col", fromCol, toCol)
    },
    [editor, tableEl, findTableNode, snapshotCells, afterSwap],
  )

  // ── 행 swap: tableNode 의 rows 배열에서 두 위치 교환 + FLIP 애니메이션 ──
  const swapRows = useCallback(
    (fromRow: number, toRow: number) => {
      if (fromRow === toRow) return
      const found = findTableNode()
      if (!found || !tableEl) return
      const { tableNode, tablePos } = found
      if (fromRow >= tableNode.childCount || toRow >= tableNode.childCount) return

      const snaps = snapshotCells(tableEl, "row", fromRow, toRow)

      const newRowNodes: PMNode[] = []
      for (let r = 0; r < tableNode.childCount; r++) newRowNodes.push(tableNode.child(r))
      const tmp = newRowNodes[fromRow]
      newRowNodes[fromRow] = newRowNodes[toRow]
      newRowNodes[toRow] = tmp

      const newTable = tableNode.type.create(tableNode.attrs, newRowNodes, tableNode.marks)
      editor.view.dispatch(
        editor.state.tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable),
      )

      afterSwap(snaps, tablePos, "row", fromRow, toRow)
    },
    [editor, tableEl, findTableNode, snapshotCells, afterSwap],
  )

  // ── 마우스 좌표 → 행/열 index ──
  const findColAtX = useCallback(
    (clientX: number): number | null => {
      for (let i = 0; i < cols.length; i++) {
        const c = cols[i]
        if (clientX >= c.left && clientX <= c.left + c.width) return i
      }
      return null
    },
    [cols],
  )
  const findRowAtY = useCallback(
    (clientY: number): number | null => {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        if (clientY >= r.top && clientY <= r.top + r.height) return i
      }
      return null
    },
    [rows],
  )

  // ── 드래그 ghost 생성: 선택된 행/열의 시각 복제본 (반투명, 마우스 따라다님) ──
  const createDragGhost = useCallback(
    (el: HTMLTableElement, type: "row" | "col", idx: number): HTMLDivElement => {
      const wrap = document.createElement("div")
      wrap.className = "thc-drag-ghost"

      const ghostTable = document.createElement("table")
      const tbody = document.createElement("tbody")
      ghostTable.appendChild(tbody)

      const trs = Array.from(el.querySelectorAll("tr")) as HTMLTableRowElement[]

      if (type === "row") {
        const sourceTr = trs[idx]
        if (sourceTr) {
          const clone = sourceTr.cloneNode(true) as HTMLTableRowElement
          // contenteditable 제거 — ghost 는 편집 안 함
          clone.removeAttribute("contenteditable")
          clone.querySelectorAll("[contenteditable]").forEach((e) => e.removeAttribute("contenteditable"))
          tbody.appendChild(clone)
        }
        ghostTable.style.width = `${el.getBoundingClientRect().width}px`
        ghostTable.style.tableLayout = "fixed"
      } else {
        // col — 각 row 의 idx 셀만 추출해 세로 스택
        let colW = 0
        trs.forEach((tr) => {
          const cell = tr.children[idx]
          if (!cell) return
          const newTr = document.createElement("tr")
          const cellClone = cell.cloneNode(true) as HTMLElement
          cellClone.removeAttribute("contenteditable")
          cellClone.querySelectorAll("[contenteditable]").forEach((e) => e.removeAttribute("contenteditable"))
          newTr.appendChild(cellClone)
          tbody.appendChild(newTr)
          if (!colW) colW = (cell as HTMLElement).getBoundingClientRect().width
        })
        ghostTable.style.width = `${colW}px`
        ghostTable.style.tableLayout = "fixed"
      }

      wrap.appendChild(ghostTable)
      return wrap
    },
    [],
  )

  // ── 핸들 mousedown: click 또는 drag-to-swap 분기 (행/열 공용) ──
  const onHandleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, type: "row" | "col", index: number) => {
      e.stopPropagation()
      e.preventDefault()
      const btnRect = e.currentTarget.getBoundingClientRect()
      const startX = e.clientX
      const startY = e.clientY
      let dragging = false

      const findTarget = (ev: MouseEvent) =>
        type === "col" ? findColAtX(ev.clientX) : findRowAtY(ev.clientY)

      // ghost 위치를 마우스에 맞춰 갱신 (col → X 따라, row → Y 따라)
      const positionGhost = (ev: MouseEvent) => {
        const g = ghostRef.current
        if (!g || !tableEl) return
        const tRect = tableEl.getBoundingClientRect()
        if (type === "col") {
          const w = g.offsetWidth
          g.style.left = `${ev.clientX - w / 2}px`
          g.style.top = `${tRect.top}px`
        } else {
          const h = g.offsetHeight
          g.style.left = `${tRect.left}px`
          g.style.top = `${ev.clientY - h / 2}px`
        }
      }

      const onMove = (ev: MouseEvent) => {
        if (!dragging) {
          if (Math.abs(ev.clientX - startX) < 5 && Math.abs(ev.clientY - startY) < 5) return
          dragging = true
          setDrag({ type, sourceIdx: index, targetIdx: index })
          if (tableEl) {
            const g = createDragGhost(tableEl, type, index)
            document.body.appendChild(g)
            ghostRef.current = g
            // 첫 위치 즉시 갱신 (offset* 측정을 위해 DOM 부착 후)
            positionGhost(ev)
          }
        } else {
          positionGhost(ev)
        }
        const target = findTarget(ev)
        setDrag((prev) => prev ? { ...prev, targetIdx: target } : null)
      }
      const onUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onMove)
        document.removeEventListener("mouseup", onUp)
        if (ghostRef.current) {
          ghostRef.current.remove()
          ghostRef.current = null
        }
        if (dragging) {
          const target = findTarget(ev)
          if (target !== null && target !== index) {
            if (type === "col") swapColumns(index, target)
            else swapRows(index, target)
          }
          setDrag(null)
        } else {
          // 단순 클릭 → 메뉴 오픈
          const left = type === "col" ? btnRect.left : btnRect.right + 4
          setMenu({ type, index, top: btnRect.bottom + 6, left })
        }
      }
      document.addEventListener("mousemove", onMove)
      document.addEventListener("mouseup", onUp)
    },
    [findColAtX, findRowAtY, swapColumns, swapRows, tableEl, createDragGhost],
  )

  const runOnTarget = useCallback(
    (target: { type: "row" | "col"; index: number }, command: (e: Editor) => boolean) => {
      if (!tableEl) return
      const trs = Array.from(tableEl.querySelectorAll("tr")) as HTMLTableRowElement[]
      let cellDom: HTMLElement | null = null
      if (target.type === "row") cellDom = trs[target.index]?.children[0] as HTMLElement | null
      else                       cellDom = trs[0]?.children[target.index] as HTMLElement | null
      if (!cellDom) return
      const pos = editor.view.posAtDOM(cellDom, 0)
      if (pos == null || pos < 0) return
      editor.chain().focus().setTextSelection(pos + 1).run()
      command(editor)
      setMenu(null)
      requestAnimationFrame(() => {
        if (tableEl.isConnected) recalc(tableEl)
        else setTableEl(null)
      })
    },
    [editor, tableEl, recalc],
  )

  const addRowEnd = useCallback(() => {
    if (!tableEl) return
    const last = tableEl.querySelectorAll("tr").length - 1
    runOnTarget({ type: "row", index: last }, (e) => e.chain().focus().addRowAfter().run())
  }, [tableEl, runOnTarget])

  const addColEnd = useCallback(() => {
    if (!tableEl) return
    const first = tableEl.querySelector("tr")
    if (!first) return
    runOnTarget({ type: "col", index: first.children.length - 1 }, (e) => e.chain().focus().addColumnAfter().run())
  }, [tableEl, runOnTarget])

  if (!tableEl || !tableRect || !wrapperRect) return null

  // 표와 wrapper 의 가시 영역 교집합 — 컨트롤 위치 기준
  // 표가 wrapper 보다 좁으면 표 가장자리, 표가 overflow 하면 wrapper 가장자리에 컨트롤 붙임
  const visLeft   = Math.max(tableRect.left,   wrapperRect.left)
  const visRight  = Math.min(tableRect.right,  wrapperRect.right)
  const visTop    = Math.max(tableRect.top,    wrapperRect.top)
  const visBottom = Math.min(tableRect.bottom, wrapperRect.bottom)
  const visWidth  = Math.max(0, visRight - visLeft)
  const visHeight = Math.max(0, visBottom - visTop)

  // 메뉴 열린 동안 강조할 행/열 rect
  const highlight = menu
    ? menu.type === "row"
      ? rows.find((r) => r.rowIndex === menu.index)
      : cols.find((c) => c.colIndex === menu.index)
    : null

  const menuItems = menu?.type === "row"
    ? ([
        { icon: <IcArrowUp />,   label: "위에 행 추가",   fn: (e: Editor) => e.chain().focus().addRowBefore().run() },
        { icon: <IcArrowDown />, label: "아래에 행 추가", fn: (e: Editor) => e.chain().focus().addRowAfter().run() },
        { icon: <IcHeader />,    label: "머리글 행 토글", fn: (e: Editor) => e.chain().focus().toggleHeaderRow().run() },
        { icon: <IcTrash />,     label: "행 삭제",        fn: (e: Editor) => e.chain().focus().deleteRow().run(), danger: true },
      ] as const)
    : menu?.type === "col"
    ? ([
        { icon: <IcArrowLeft />,  label: "왼쪽에 열 추가",  fn: (e: Editor) => e.chain().focus().addColumnBefore().run() },
        { icon: <IcArrowRight />, label: "오른쪽에 열 추가", fn: (e: Editor) => e.chain().focus().addColumnAfter().run() },
        { icon: <IcHeader />,     label: "머리글 열 토글",  fn: (e: Editor) => e.chain().focus().toggleHeaderColumn().run() },
        { icon: <IcTrash />,      label: "열 삭제",         fn: (e: Editor) => e.chain().focus().deleteColumn().run(), danger: true },
      ] as const)
    : []

  return createPortal(
    <>
      <div ref={layerRef} className="thc-layer" aria-hidden>

        {/* 메뉴 열렸을 때 대상 행/열 강조 */}
        {highlight && menu && menu.type === "row" && "top" in highlight && (
          <div
            className="thc-highlight"
            style={{ top: highlight.top, left: tableRect.left, width: tableRect.width, height: highlight.height }}
          />
        )}
        {highlight && menu && menu.type === "col" && "left" in highlight && (
          <div
            className="thc-highlight"
            style={{ top: tableRect.top, left: highlight.left, width: highlight.width, height: tableRect.height }}
          />
        )}

        {/* 드래그 중: source 는 옅게, target 은 강조 (행/열 공용) */}
        {drag && (() => {
          if (drag.type === "col") {
            const src = cols.find((c) => c.colIndex === drag.sourceIdx)
            const tgt = drag.targetIdx != null ? cols.find((c) => c.colIndex === drag.targetIdx) : null
            return (
              <>
                {src && (
                  <div className="thc-drag-source"
                    style={{ top: tableRect.top, left: src.left, width: src.width, height: tableRect.height }} />
                )}
                {tgt && tgt.colIndex !== drag.sourceIdx && (
                  <div className="thc-drag-target"
                    style={{ top: tableRect.top, left: tgt.left, width: tgt.width, height: tableRect.height }} />
                )}
              </>
            )
          } else {
            const src = rows.find((r) => r.rowIndex === drag.sourceIdx)
            const tgt = drag.targetIdx != null ? rows.find((r) => r.rowIndex === drag.targetIdx) : null
            return (
              <>
                {src && (
                  <div className="thc-drag-source"
                    style={{ top: src.top, left: tableRect.left, width: tableRect.width, height: src.height }} />
                )}
                {tgt && tgt.rowIndex !== drag.sourceIdx && (
                  <div className="thc-drag-target"
                    style={{ top: tgt.top, left: tableRect.left, width: tableRect.width, height: tgt.height }} />
                )}
              </>
            )
          }
        })()}

        {/* 행 핸들 — 표 왼쪽 보더 라인 위에 위치. mousedown 으로 click/drag 분기. */}
        {rows.map((r) => (
          <button
            key={`r-${r.rowIndex}`}
            type="button"
            className="thc-handle thc-handle--row"
            style={{
              top: r.top + r.height / 2 - HANDLE_H / 2,
              left: visLeft - HANDLE_W / 2,
            }}
            aria-label={`${r.rowIndex + 1}행 메뉴`}
            onMouseDown={(e) => onHandleMouseDown(e, "row", r.rowIndex)}
            data-dragging={drag?.type === "row" && drag.sourceIdx === r.rowIndex ? "1" : undefined}
          >
            <span className="thc-handle__dash"><DashVertical /></span>
            <span className="thc-handle__grip"><GripDotsVertical /></span>
          </button>
        ))}

        {/* 열 핸들 — 표 위쪽 보더 라인 위에 위치 (버튼 중심이 라인 위). 시야 밖 열은 제외. */}
        {cols
          .filter((c) => {
            const cx = c.left + c.width / 2
            return cx >= wrapperRect.left && cx <= wrapperRect.right
          })
          .map((c) => (
            <button
              key={`c-${c.colIndex}`}
              type="button"
              className="thc-handle thc-handle--col"
              style={{
                top: visTop - HANDLE_H / 2,
                left: c.left + c.width / 2 - HANDLE_W / 2,
              }}
              aria-label={`${c.colIndex + 1}열 메뉴`}
              onMouseDown={(e) => onHandleMouseDown(e, "col", c.colIndex)}
              data-dragging={drag?.type === "col" && drag.sourceIdx === c.colIndex ? "1" : undefined}
            >
              <span className="thc-handle__dash"><DashHorizontal /></span>
              <span className="thc-handle__grip"><GripDotsHorizontal /></span>
            </button>
          ))}

        {/* + 행 strip — wrapper 아래(스크롤바 아래)에 배치, 폭은 표 가시 영역에 맞춤 */}
        <button
          type="button"
          className="thc-add thc-add--row"
          style={{
            top: wrapperRect.bottom + STRIP_GAP,
            left: visLeft,
            width: visWidth,
            height: STRIP,
          }}
          aria-label="행 추가"
          onClick={(e) => { e.stopPropagation(); addRowEnd() }}
        ><PlusIcon /></button>

        {/* + 열 strip — 표 오른쪽(표가 fit 하면 표 옆, overflow 시 wrapper 가장자리)에 배치 */}
        <button
          type="button"
          className="thc-add thc-add--col"
          style={{
            top: visTop,
            left: visRight + HANDLE_GAP,
            width: STRIP,
            height: visHeight,
          }}
          aria-label="열 추가"
          onClick={(e) => { e.stopPropagation(); addColEnd() }}
        ><PlusIcon /></button>
      </div>

      {menu && (
        <div ref={menuRef} className="thc-menu" style={{ top: menu.top, left: menu.left }} role="menu">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`thc-menu__item${"danger" in item && item.danger ? " thc-menu__item--danger" : ""}`}
              onClick={(e) => {
                e.stopPropagation()
                runOnTarget({ type: menu.type, index: menu.index }, item.fn)
              }}
            >
              <span className="thc-menu__icon">{item.icon}</span>
              <span className="thc-menu__label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </>,
    document.body,
  )
}

// 행 핸들 — 가로 대시 (행의 방향과 평행)
const DashHorizontal = () => (
  <svg width="11" height="2" viewBox="0 0 11 2" fill="currentColor" aria-hidden>
    <rect x="0" y="0" width="11" height="2" rx="1" />
  </svg>
)
// 열 핸들 — 세로 대시 (열의 방향과 평행)
const DashVertical = () => (
  <svg width="2" height="11" viewBox="0 0 2 11" fill="currentColor" aria-hidden>
    <rect x="0" y="0" width="2" height="11" rx="1" />
  </svg>
)
// 행 핸들 hover — 2×3 (세로형) grip
const GripDotsVertical = () => (
  <svg width="9" height="13" viewBox="0 0 9 13" fill="currentColor" aria-hidden>
    <circle cx="2" cy="2"  r="1.1" />
    <circle cx="7" cy="2"  r="1.1" />
    <circle cx="2" cy="6.5" r="1.1" />
    <circle cx="7" cy="6.5" r="1.1" />
    <circle cx="2" cy="11" r="1.1" />
    <circle cx="7" cy="11" r="1.1" />
  </svg>
)
// 열 핸들 hover — 3×2 (가로형) grip
const GripDotsHorizontal = () => (
  <svg width="13" height="9" viewBox="0 0 13 9" fill="currentColor" aria-hidden>
    <circle cx="2"   cy="2" r="1.1" />
    <circle cx="6.5" cy="2" r="1.1" />
    <circle cx="11"  cy="2" r="1.1" />
    <circle cx="2"   cy="7" r="1.1" />
    <circle cx="6.5" cy="7" r="1.1" />
    <circle cx="11"  cy="7" r="1.1" />
  </svg>
)
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)
const IcArrowUp = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 11V3M3.5 6.5L7 3l3.5 3.5" />
  </svg>
)
const IcArrowDown = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M7 3v8M3.5 7.5L7 11l3.5-3.5" />
  </svg>
)
const IcArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M11 7H3M6.5 3.5L3 7l3.5 3.5" />
  </svg>
)
const IcArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" />
  </svg>
)
const IcHeader = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2.5" y="2.5" width="9" height="9" rx="1.2" />
    <rect x="2.5" y="2.5" width="9" height="3" fill="currentColor" opacity="0.45" stroke="none" />
  </svg>
)
const IcTrash = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 4h8M5.5 4V3a1 1 0 011-1h1a1 1 0 011 1v1M4 4l.5 7a1 1 0 001 .9h3a1 1 0 001-.9L10 4" />
  </svg>
)
