import type { ComponentProps } from "react"
import "./input.scss"

interface InputProps extends Omit<ComponentProps<"input">, "size"> {
  variant?: "default" | "error"
  hasError?: boolean
}

export const Input = ({
  className,
  variant,
  type = "text",
  hasError,
  ...props
}: InputProps) => {
  const computedVariant = hasError ? "error" : (variant ?? "default")
  const cls = ["input", computedVariant !== "default" && `input--${computedVariant}`, className].filter(Boolean).join(" ")
  return (
    <input
      type={type}
      aria-invalid={hasError ? "true" : "false"}
      className={cls}
      {...props}
    />
  )
}

Input.displayName = "Input"
