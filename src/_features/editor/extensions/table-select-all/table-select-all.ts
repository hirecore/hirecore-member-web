import { Extension } from "@tiptap/core"
import { NodeSelection, TextSelection } from "@tiptap/pm/state"

/**
 * Cmd+A / Ctrl+A 가 표 셀 안에서 눌리면 점진적 선택:
 * - 1차: 현재 셀 내부 콘텐츠 전체 선택
 * - 2차(셀 콘텐츠 이미 전체 선택 상태): 표 자체를 NodeSelection 으로 잡음
 * - 3차(표 이미 NodeSelection 상태): 기본 동작(본문 전체 선택)에 양보
 */
export const TableSelectAll = Extension.create({
  name: "tableSelectAll",

  addKeyboardShortcuts() {
    return {
      "Mod-a": ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection

        // 표 / 셀 깊이 탐색
        let tableDepth = -1
        let cellDepth = -1
        for (let d = $from.depth; d > 0; d--) {
          const name = $from.node(d).type.name
          if (cellDepth === -1 && (name === "tableCell" || name === "tableHeader")) cellDepth = d
          if (name === "table") { tableDepth = d; break }
        }
        if (tableDepth === -1) return false // 표 밖 — 기본 동작 (본문 전체 선택)

        // 이미 표 NodeSelection 인 경우 → 기본 동작(본문 전체 선택)으로 양보
        if (selection instanceof NodeSelection && selection.node.type.name === "table") {
          return false
        }

        // 현재 셀의 콘텐츠 범위 계산
        if (cellDepth === -1) return false
        const cellPos = $from.before(cellDepth)
        const cellNode = $from.node(cellDepth)
        const cellContentStart = cellPos + 1
        const cellContentEnd = cellPos + cellNode.nodeSize - 1

        // 셀 콘텐츠가 이미 전체 선택돼 있나? → 표 NodeSelection 으로 확장
        const isCellFullySelected =
          selection.from <= cellContentStart && selection.to >= cellContentEnd
        if (isCellFullySelected) {
          const tablePos = $from.before(tableDepth)
          editor.view.dispatch(
            state.tr.setSelection(NodeSelection.create(state.doc, tablePos)),
          )
          return true
        }

        // 1차: 셀 내부 콘텐츠 전체 선택
        editor.view.dispatch(
          state.tr.setSelection(TextSelection.create(state.doc, cellContentStart, cellContentEnd)),
        )
        return true
      },
    }
  },
})
