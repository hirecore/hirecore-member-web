import { Extension } from "@tiptap/core"
import type { Editor } from "@tiptap/core"
import Suggestion from "@tiptap/suggestion"
import { ReactRenderer } from "@tiptap/react"
import { SlashCommandMenu } from "./slash-command-menu"

export interface SlashCommandItem {
  title: string
  description: string
  searchTerms: string[]
  icon: string
  command: (props: { editor: Editor; range: { from: number; to: number } }) => void
}

const ALL_COMMANDS: SlashCommandItem[] = [
  {
    title: "텍스트",
    description: "일반 텍스트로 작성을 시작합니다",
    searchTerms: ["p", "paragraph", "텍스트", "text"],
    icon: "¶",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).clearNodes().run()
    },
  },
  {
    title: "제목 1",
    description: "최상위 큰 제목",
    searchTerms: ["h1", "heading", "제목", "heading1"],
    icon: "H1",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run()
    },
  },
  {
    title: "제목 2",
    description: "중간 크기 제목",
    searchTerms: ["h2", "heading2", "제목2"],
    icon: "H2",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
    },
  },
  {
    title: "제목 3",
    description: "소제목",
    searchTerms: ["h3", "heading3", "제목3"],
    icon: "H3",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run()
    },
  },
  {
    title: "글머리 기호 목록",
    description: "순서 없는 항목 목록",
    searchTerms: ["bullet", "ul", "list", "글머리", "목록"],
    icon: "•",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: "번호 목록",
    description: "번호가 매겨진 순서 목록",
    searchTerms: ["ordered", "ol", "number", "번호", "목록"],
    icon: "1.",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: "할 일 목록",
    description: "체크박스 작업 목록",
    searchTerms: ["todo", "task", "checkbox", "할일", "체크"],
    icon: "☐",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: "인용구",
    description: "인용 텍스트 블록",
    searchTerms: ["quote", "blockquote", "인용"],
    icon: "❝",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run()
    },
  },
  {
    title: "코드 블록",
    description: "코드 서식이 있는 블록",
    searchTerms: ["code", "pre", "코드", "code block"],
    icon: "</>",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run()
    },
  },
  {
    title: "구분선",
    description: "섹션을 나누는 수평선",
    searchTerms: ["hr", "divider", "line", "구분선", "수평선"],
    icon: "—",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
  {
    title: "이미지",
    description: "이미지를 업로드합니다",
    searchTerms: ["image", "img", "photo", "이미지", "사진"],
    icon: "🖼",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setImageUploadNode().run()
    },
  },
]

function filterItems(query: string): SlashCommandItem[] {
  if (!query) return ALL_COMMANDS
  const lower = query.toLowerCase()
  return ALL_COMMANDS.filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.searchTerms.some((term) => term.toLowerCase().includes(lower))
  )
}

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem>({
        editor: this.editor,
        char: "/",
        allowSpaces: false,
        items: ({ query }) => filterItems(query),

        command: ({ editor, range, props: item }) => {
          item.command({ editor, range })
        },

        render: () => {
          let component: ReactRenderer | null = null
          let popupEl: HTMLDivElement | null = null

          const removePopup = () => {
            popupEl?.remove()
            popupEl = null
            component?.destroy()
            component = null
          }

          const updatePosition = (clientRect: (() => DOMRect | null) | null | undefined) => {
            if (!popupEl || !clientRect) return
            const rect = clientRect()
            if (!rect) return
            const viewportHeight = window.innerHeight
            const menuHeight = 320
            const spaceBelow = viewportHeight - rect.bottom
            if (spaceBelow < menuHeight) {
              popupEl.style.top = `${rect.top - menuHeight - 4}px`
            } else {
              popupEl.style.top = `${rect.bottom + 4}px`
            }
            popupEl.style.left = `${rect.left}px`
          }

          return {
            onStart(props) {
              component = new ReactRenderer(SlashCommandMenu, {
                props,
                editor: props.editor,
              })

              popupEl = document.createElement("div")
              popupEl.style.position = "fixed"
              popupEl.style.zIndex = "9999"
              document.body.appendChild(popupEl)
              popupEl.appendChild(component.element)

              updatePosition(props.clientRect)
            },

            onUpdate(props) {
              component?.updateProps(props)
              updatePosition(props.clientRect)
            },

            onKeyDown(props) {
              if (props.event.key === "Escape") {
                removePopup()
                return true
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return (component?.ref as any)?.onKeyDown(props) ?? false
            },

            onExit() {
              removePopup()
            },
          }
        },
      }),
    ]
  },
})
