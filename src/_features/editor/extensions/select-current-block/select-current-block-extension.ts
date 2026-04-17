import { Extension } from "@tiptap/core"

/**
 * 블록 단위 키보드 선택 확장.
 *
 * [Cmd+A]
 *   - 1회: 현재 커서가 위치한 블록의 텍스트 전체 선택
 *   - 2회: 이미 블록 전체가 선택된 상태 → 기본 동작(문서 전체 선택)으로 위임
 *
 * [Shift+ArrowDown]
 *   - 현재 블록 끝까지 선택 확장
 *   - 이미 블록 끝에 도달한 경우 → 다음 블록 끝까지 확장
 *
 * [Shift+ArrowUp]
 *   - 현재 블록 시작까지 선택 확장
 *   - 이미 블록 시작에 도달한 경우 → 이전 블록 시작까지 확장
 */
export const SelectCurrentBlock = Extension.create({
  name: "selectCurrentBlock",

  addKeyboardShortcuts() {
    return {
      "Mod-a": ({ editor }) => {
        const { state } = editor
        const { from, to, $from } = state.selection

        const depth = $from.depth
        const blockStart = $from.start(depth)
        const blockEnd = $from.end(depth)

        // 이미 현재 블록 전체가 선택된 경우 → 전체 선택으로 위임
        if (from === blockStart && to === blockEnd) {
          return false
        }

        editor.commands.setTextSelection({ from: blockStart, to: blockEnd })
        return true
      },

      // ── Shift+ArrowDown: 아래 블록으로 선택 확장 ──────────────────────
      "Shift-ArrowDown": ({ editor }) => {
        const { state } = editor
        const { from, to, $to } = state.selection

        const depth = $to.depth
        if (depth === 0) return false

        const blockEnd = $to.end(depth)

        if (to < blockEnd) {
          // 현재 블록 끝까지 먼저 확장
          editor.commands.setTextSelection({ from, to: blockEnd })
          return true
        }

        // 이미 블록 끝 → 다음 블록 끝까지 확장
        const afterCurrentBlock = $to.after(depth)
        if (afterCurrentBlock + 1 >= state.doc.content.size) return false

        const $nextBlock = state.doc.resolve(afterCurrentBlock + 1)
        if ($nextBlock.depth === 0) return false

        const nextBlockEnd = $nextBlock.end($nextBlock.depth)
        editor.commands.setTextSelection({ from, to: nextBlockEnd })
        return true
      },

      // ── Shift+ArrowUp: 위 블록으로 선택 확장 ─────────────────────────
      "Shift-ArrowUp": ({ editor }) => {
        const { state } = editor
        const { from, to, $from } = state.selection

        const depth = $from.depth
        if (depth === 0) return false

        const blockStart = $from.start(depth)

        if (from > blockStart) {
          // 현재 블록 시작까지 먼저 확장
          editor.commands.setTextSelection({ from: blockStart, to })
          return true
        }

        // 이미 블록 시작 → 이전 블록 시작까지 확장
        const beforeCurrentBlock = $from.before(depth)
        if (beforeCurrentBlock <= 1) return false

        const $prevBlock = state.doc.resolve(beforeCurrentBlock - 1)
        if ($prevBlock.depth === 0) return false

        const prevBlockStart = $prevBlock.start($prevBlock.depth)
        editor.commands.setTextSelection({ from: prevBlockStart, to })
        return true
      },
    }
  },
})
