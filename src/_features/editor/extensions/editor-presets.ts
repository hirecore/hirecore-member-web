// _features/editor/extensions | 에디터 확장 프리셋
// 읽기 전용·쓰기 모드별 Tiptap 확장 조합을 상수로 제공한다.
// 개별 뷰에서 13줄 이상의 import 보일러플레이트를 제거하기 위한 SSOT.

import { StarterKit } from "@tiptap/starter-kit"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { Selection } from "@tiptap/extensions"
import { ResizableImage } from "./resizable-image"
import { ImageCarousel } from "./image-carousel"
import { SyntaxCodeBlock } from "./syntax-code-block"
import { HorizontalRule } from "./horizontal-rule"
import { SlashCommand } from "./slash-command"
import { SelectCurrentBlock } from "./select-current-block"
import { BlockquoteBehavior } from "./blockquote-behavior"

// ── 읽기 전용 기본 확장 (이미지 제외) ─────────────────────────
const READONLY_BASE = [
  StarterKit.configure({ horizontalRule: false, codeBlock: false }),
  SyntaxCodeBlock, HorizontalRule,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList, TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  TextStyle, Color, Typography, Superscript, Subscript,
]

/** 읽기 전용 — 이미지 포함 (이력서, 포트폴리오) */
export const READONLY_EXTENSIONS = [...READONLY_BASE, ResizableImage, ImageCarousel]

/** 읽기 전용 — 텍스트 전용 (자기소개서) */
export const READONLY_TEXT_EXTENSIONS = [...READONLY_BASE]

// ── 쓰기 모드 기본 확장 (이미지 제외) ─────────────────────────
// ImageUploadNode는 뷰마다 upload 핸들러가 다르므로 프리셋에 포함하지 않는다.
const WRITE_BASE = [
  StarterKit.configure({
    horizontalRule: false,
    codeBlock: false,
    link: { openOnClick: false, enableClickSelection: true },
  }),
  SyntaxCodeBlock, HorizontalRule,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TaskList, TaskItem.configure({ nested: true }),
  Highlight.configure({ multicolor: true }),
  TextStyle, Color, Typography, Superscript, Subscript,
  Selection, SlashCommand, SelectCurrentBlock, BlockquoteBehavior,
]

/** 쓰기 모드 — 텍스트 전용 (자기소개서) */
export const WRITE_TEXT_EXTENSIONS = [...WRITE_BASE]

/** 쓰기 모드 — 이미지 포함 (이력서, 포트폴리오). ImageUploadNode는 별도 추가 필요 */
export const WRITE_IMAGE_EXTENSIONS = [...WRITE_BASE, ResizableImage, ImageCarousel]
