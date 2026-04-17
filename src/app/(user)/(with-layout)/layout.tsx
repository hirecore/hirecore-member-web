import { MainHeader } from "@/_widgets/layout"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainHeader />
      <main>{children}</main>
    </>
  )
}
