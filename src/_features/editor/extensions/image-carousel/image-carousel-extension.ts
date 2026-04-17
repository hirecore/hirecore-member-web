import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ImageCarouselView } from "./image-carousel-node-view"

export const ImageCarousel = Node.create({
  name: "imageCarousel",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: (element) => {
          const raw = element.getAttribute("data-images")
          try {
            return raw ? JSON.parse(raw) : []
          } catch {
            return []
          }
        },
        renderHTML: (attributes) => ({
          "data-images": JSON.stringify(attributes.images),
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="imageCarousel"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "imageCarousel" }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageCarouselView)
  },
})
