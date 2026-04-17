import { ReactNodeViewRenderer } from "@tiptap/react"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { createLowlight, common } from "lowlight"

import { SyntaxCodeBlockNodeView } from "./syntax-code-block-node-view"

const lowlight = createLowlight(common)

// Map TSX/JSX to their parent languages for highlighting
lowlight.registerAlias({ typescript: ["tsx"] })
lowlight.registerAlias({ javascript: ["jsx"] })

const BaseSyntaxCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(SyntaxCodeBlockNodeView)
  },

  addKeyboardShortcuts() {
    return {
      // Tab → insert 4 spaces (only inside code block)
      Tab: () => {
        const { $from } = this.editor.state.selection
        if ($from.parent.type !== this.type) return false
        return this.editor.commands.insertContent("    ")
      },

      // Backspace → delete exactly 1 character (prevent any smart-indent deletion)
      Backspace: () => {
        const { $from, empty } = this.editor.state.selection
        if (!empty) return false
        if ($from.parent.type !== this.type) return false
        return this.editor.commands.deleteRange({ from: $from.pos - 1, to: $from.pos })
      },
    }
  },
})

export const SyntaxCodeBlock = BaseSyntaxCodeBlock.configure({
  lowlight,
  defaultLanguage: "plaintext",
})
