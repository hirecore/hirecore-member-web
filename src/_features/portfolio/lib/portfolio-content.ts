import type { JSONContent } from "@tiptap/core"
import type { TocHeading } from "./portfolio.types"

export function extractHeadings(node: JSONContent): TocHeading[] {
  const result: TocHeading[] = []

  function getText(n: JSONContent): string {
    if (n.text) return n.text
    return (n.content ?? []).map(getText).join("")
  }

  function walk(n: JSONContent) {
    if (n.type === "heading" && [1, 2, 3].includes(n.attrs?.level)) {
      const text = getText(n).trim()
      if (text) result.push({ id: `toc-h-${result.length}`, level: n.attrs!.level as 1 | 2 | 3, text })
    }
    n.content?.forEach(walk)
  }

  walk(node)
  return result
}
