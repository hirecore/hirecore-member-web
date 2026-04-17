import type { Metadata } from "next"
import { UserLoginView } from "@/_views/auth"

export const metadata: Metadata = { title: "로그인" }

export default function UserLoginRouter() {
  return <UserLoginView />
}