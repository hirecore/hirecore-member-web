import type { Metadata } from "next"
import { CoverLetterReadView } from "@/_views/coverletter"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: _id } = await params
  return { title: "자기소개서 상세" }
}

export default async function CoverletterPage({ params }: Props) {
  const { id } = await params
  return <CoverLetterReadView id={id} />
}
