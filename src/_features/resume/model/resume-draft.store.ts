import type { JSONContent } from "@tiptap/core"
import { createDraftStore } from "@/_shared/lib"

export interface ResumeDraftData {
  visibility: "public" | "private"
  title: string
  memo: string
  interestFields: string[]
  tags: string[]
  linkedIds: string[]
  content: JSONContent
}

export const useResumeDraftStore = createDraftStore<ResumeDraftData>()
