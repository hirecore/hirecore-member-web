"use client"

import "./avatar-placeholder.scss"

interface AvatarPlaceholderProps {
  name: string
  size?: number
  className?: string
}

export function AvatarPlaceholder({ name, size = 40, className }: AvatarPlaceholderProps) {
  const hue = (name.charCodeAt(0) * 37) % 360
  return (
    <div
      className={`avatar-ph${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue} 65% 55%)` }}
      aria-hidden
    >
      {name.slice(0, 1)}
    </div>
  )
}
