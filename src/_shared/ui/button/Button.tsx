import type { ButtonHTMLAttributes, ReactNode } from "react"
import "./button.scss"

export type ButtonVariant =
  | "default" | "primary" | "outline" | "ghost" | "softblue"
  | "kakao" | "google" | "apple" | "github"

export type ButtonSize = "sm" | "md" | "lg" | "icon"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children?: ReactNode
}

export function Button({
  variant = "default",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: ButtonProps) {
  const cls = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && "btn--full",
    className,
  ].filter(Boolean).join(" ")

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}

Button.displayName = "Button"