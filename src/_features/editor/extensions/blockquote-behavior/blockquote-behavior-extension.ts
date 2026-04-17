import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"

/**
 * Customizes blockquote behavior:
 * - Enter on empty paragraph inside blockquote → exits blockquote
 * - Shift+Enter inside blockquote → hard break (line break within paragraph)
 * - Drag last block out of blockquote → blockquote is removed automatically (Notion-like)
 */
export const BlockquoteBehavior = Extension.create({
  name: "blockquoteBehavior",
  priority: 200,

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor
        const { $from, empty } = state.selection

        if (!empty) return false

        let insideBlockquote = false
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name === "blockquote") {
            insideBlockquote = true
            break
          }
        }

        if (!insideBlockquote) return false

        if ($from.parent.textContent === "") {
          return editor.commands.liftEmptyBlock()
        }

        return false
      },

      "Shift-Enter": ({ editor }) => {
        const { state } = editor
        const { $from } = state.selection

        let insideBlockquote = false
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name === "blockquote") {
            insideBlockquote = true
            break
          }
        }

        if (!insideBlockquote) return false

        return editor.commands.setHardBreak()
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("blockquoteCleanup"),

        /**
         * After each document change, remove any blockquote that:
         * - has no children, OR contains only empty paragraphs
         * AND the cursor is not currently inside it.
         *
         * Gives Notion-like behavior: dragging the last block out of a
         * blockquote makes the empty blockquote disappear.
         */
        appendTransaction(transactions, _oldState, newState) {
          const docChanged = transactions.some((tr) => tr.docChanged)
          if (!docChanged) return null

          const { selection } = newState
          const toDelete: Array<[number, number]> = []

          newState.doc.descendants((node, pos) => {
            if (node.type.name !== "blockquote") return

            // Never remove while the cursor is inside
            const cursorInside =
              selection.from >= pos && selection.to <= pos + node.nodeSize
            if (cursorInside) return

            // Check if effectively empty
            let effectivelyEmpty = node.childCount === 0
            if (!effectivelyEmpty) {
              effectivelyEmpty = true
              for (let i = 0; i < node.childCount; i++) {
                const child = node.child(i)
                if (child.type.name !== "paragraph" || child.content.size > 0) {
                  effectivelyEmpty = false
                  break
                }
              }
            }

            if (effectivelyEmpty) {
              toDelete.push([pos, pos + node.nodeSize])
              return false // don't descend
            }
          })

          if (toDelete.length === 0) return null

          // Delete in reverse order so earlier positions stay valid
          const tr = newState.tr
          for (let i = toDelete.length - 1; i >= 0; i--) {
            tr.delete(toDelete[i][0], toDelete[i][1])
          }
          return tr
        },
      }),
    ]
  },
})
