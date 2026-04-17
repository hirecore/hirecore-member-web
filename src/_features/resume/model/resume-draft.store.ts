import type { JSONContent } from "@tiptap/core"
import { createDraftStore } from "@/_shared/lib"

export interface ExternalLink {
  label: string
  url: string
}

export interface ResumeDraftData {
  visibility: "public" | "private"
  title: string
  memo: string
  interestFields: string[]
  tags: string[]
  linkedIds: string[]
  externalLinks: ExternalLink[]
  content: JSONContent
}

export const useResumeDraftStore = createDraftStore<ResumeDraftData>()
