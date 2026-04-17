"use client"

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"

const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "tsx", label: "TSX" },
  { value: "jsx", label: "JSX" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "bash", label: "Bash / Shell" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "xml", label: "XML" },
  { value: "graphql", label: "GraphQL" },
  { value: "dockerfile", label: "Dockerfile" },
]

export function SyntaxCodeBlockNodeView({ node, updateAttributes, editor }: NodeViewProps) {
  const language = node.attrs.language || "plaintext"
  const isEditable = editor.isEditable

  return (
    <NodeViewWrapper className="code-block-node">
      <div className="code-block-header" contentEditable={false}>
        <span className="code-block-lang-dot" />
        <span className="code-block-lang-dot" />
        <span className="code-block-lang-dot" />
        {isEditable ? (
          <select
            className="code-block-lang-select"
            value={language}
            onChange={(e) => updateAttributes({ language: e.target.value })}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="code-block-lang-badge">{language}</span>
        )}
      </div>
      <pre>
        <NodeViewContent />
      </pre>
    </NodeViewWrapper>
  )
}
