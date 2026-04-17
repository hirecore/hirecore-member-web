// _shared/lib | Mock 데이터 공통 헬퍼
// entity 레이어 mock 파일들이 반복적으로 만드는 author 객체와 TipTap 노드 빌더를 통합한다.
// API 연결 후 entity/api 디렉토리와 함께 제거 예정.

import type { JSONContent } from "@tiptap/core"

/** Mock 데이터에 공통으로 사용되는 기본 작성자 */
export const MOCK_DEFAULT_AUTHOR = { name: "김은철", profileImageUrl: null } as const

/** TipTap 텍스트 노드 */
export const mockText = (text: string): JSONContent => ({ type: "text", text })

/** TipTap heading 노드 (h1/h2/h3) */
export const mockHeading = (level: 1 | 2 | 3, text: string): JSONContent => ({
  type: "heading",
  attrs: { level },
  content: [mockText(text)],
})

/** TipTap paragraph 노드 */
export const mockParagraph = (text: string): JSONContent => ({
  type: "paragraph",
  content: [mockText(text)],
})

/** TipTap bulletList 노드 — 각 항목은 paragraph로 래핑 */
export const mockBulletList = (items: string[]): JSONContent => ({
  type: "bulletList",
  content: items.map((text) => ({
    type: "listItem",
    content: [mockParagraph(text)],
  })),
})

/** TipTap doc 노드 — top-level 컨테이너 */
export const mockDoc = (...nodes: JSONContent[]): JSONContent => ({
  type: "doc",
  content: nodes,
})
