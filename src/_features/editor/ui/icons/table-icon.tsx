import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TableIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 10h18" />
      <path d="M3 16h18" />
      <path d="M9 4v16" />
      <path d="M15 4v16" />
    </svg>
  )
})

TableIcon.displayName = "TableIcon"
