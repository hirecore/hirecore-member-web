import type { ComponentProps } from "react"
import "./label.scss"

interface LabelProps extends ComponentProps<"label"> {
  variant?: "default" | "error"
  requiredMark?: boolean
}

export const Label = ({
  className,
  variant = "default",
  children,
  requiredMark,
  ...props
}: LabelProps) => {
  const cls = ["lb", variant !== "default" && `lb--${variant}`, className].filter(Boolean).join(" ")
  return (
    <label className={cls} {...props}>
      {children}
      {requiredMark && <span className="lb-required-mark">*</span>}
    </label>
  )
}

Label.displayName = "Label"
