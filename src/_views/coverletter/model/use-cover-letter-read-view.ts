"use client"

// _views/coverletter/model | 자기소개서 상세 읽기 뷰 비즈니스 로직
// 에디터 초기화·콘텐츠 주입·TOC 추적·데이터 미존재 리다이렉트 — UI와 무관하므로 model에 분리
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { JSONContent } from "@tiptap/core"
import { useReadOnlyEditor } from "@/_features/editor"
import { USER_ROUTES } from "@/_shared/config"
import { useCoverLetterDetail } from "@/_entities/coverletter"
import { useTocTracking } from "@/_features/portfolio"

export function useCoverLetterReadView(id: string) {
  const router = useRouter()
  const data = useCoverLetterDetail(id)

  // 이미지 확장 제외 — 자기소개서는 텍스트 전용
  const editor = useReadOnlyEditor({ content: data?.content, includeImages: false })

  // TOC: scrollOffset 100 — 탭바가 없는 자소서 페이지에 맞춤 (헤더 80 + 여유)
  const { tocHeadings, scrollToHeading, activeId } = useTocTracking({
    editor,
    content: data?.content as JSONContent | undefined,
    scrollOffset: 100,
  })

  // 존재하지 않는 자기소개서 ID → 마이페이지로 리다이렉트
  useEffect(() => {
    if (!data) router.replace(USER_ROUTES.mypage)
  }, [data, router])

  return { data, editor, tocHeadings, scrollToHeading, activeId }
}
