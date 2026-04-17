import type { JSONContent } from "@tiptap/core"
import { createDraftStore } from "@/_shared/lib"
import type { ExternalLink } from "@/_shared/model"

export interface CoverLetterDraftData {
  visibility: "public" | "private"
  title: string
  memo: string
  interestFields: string[]
  tags: string[]
  linkedIds: string[]
  externalLinks: ExternalLink[]
  content: JSONContent
}

export const useCoverLetterDraftStore = createDraftStore<CoverLetterDraftData>()
