import type { Metadata } from "next"
import { ResumeReadView } from "@/_views/resume"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: _id } = await params
  return { title: "이력서 상세" }
}

export default async function ResumePage({ params }: Props) {
  const { id } = await params
  return <ResumeReadView id={id} />
}
