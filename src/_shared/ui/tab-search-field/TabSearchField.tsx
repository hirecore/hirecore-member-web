"use client"

import type { ReactNode } from "react"
import "./doc-tab-search-field.scss"

interface TabSearchFieldProps {
  icon?: ReactNode
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function TabSearchField({ icon, placeholder, value, onChange }: TabSearchFieldProps) {
  return (
    <div className="doc-tab-search-field">
      {icon && <span className="doc-tab-search-field__icon" aria-hidden>{icon}</span>}
      <input
        className="doc-tab-search-field__input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
