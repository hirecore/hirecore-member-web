import type { Metadata } from "next"
import { Suspense } from "react"
import { UserMypageView } from "@/_views/user-mypage"

export const metadata: Metadata = { title: "마이페이지" }

export default function MypagePage() {
  return (
    <Suspense fallback={<div className="ump-loading" />}>
      <UserMypageView />
    </Suspense>
  )
}
