"use client"

import "./doc-tab-header.scss"

interface TabDocHeaderProps {
  title: string
  count: number
}

export function TabDocHeader({ title, count }: TabDocHeaderProps) {
  return (
    <div className="doc-tab-header">
      <div className="doc-tab-header__left">
        <h2 className="doc-tab-header__title">{title}</h2>
        <span className="doc-tab-header__count">{count}</span>
      </div>
    </div>
  )
}
