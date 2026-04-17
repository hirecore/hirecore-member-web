import type { Metadata } from "next"
import { PortfolioReadView } from "@/_views/portfolio"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: _id } = await params
  return { title: "포트폴리오 상세" }
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { id } = await params
  return <PortfolioReadView id={id} />
}
