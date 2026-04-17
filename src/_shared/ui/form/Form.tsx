import type { ComponentProps } from "react"

interface FormProps extends ComponentProps<"form"> {
  layout?: "vertical" | "horizontal"
}

export const Form = ({
  className,
  layout = "vertical",
  ...props
}: FormProps) => {
  const cls = ["form", layout !== "vertical" && `form--${layout}`, className].filter(Boolean).join(" ")
  return (
    <form
      noValidate
      className={cls}
      {...props}
    />
  )
}

Form.displayName = "Form"
