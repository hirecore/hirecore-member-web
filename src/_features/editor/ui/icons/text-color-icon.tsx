import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

/** "A" 글자 아래 색상 바가 있는 텍스트 색상 아이콘 */
export const TextColorIcon = memo(({ className, ...props }: SvgProps) => (
  <svg
    width="24"
    height="24"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* "A" 글자 */}
    <path
      d="M9 17L12.5 7L16 17M10 14.5H15"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 색상 표시 바 */}
    <rect
      x="5"
      y="19.5"
      width="14"
      height="2"
      rx="1"
      fill="var(--text-color-indicator, currentColor)"
    />
  </svg>
))

TextColorIcon.displayName = "TextColorIcon"
