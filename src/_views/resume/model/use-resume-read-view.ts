"use client"

// _views/resume/model | 이력서 상세 읽기 뷰 비즈니스 로직
// 에디터 초기화·콘텐츠 주입·TOC 추적·데이터 미존재 리다이렉트 — UI와 무관하므로 model에 분리
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { JSONContent } from "@tiptap/core"
import { useReadOnlyEditor } from "@/_features/editor"
import { USER_ROUTES } from "@/_shared/config"
import { useResumeDetail } from "@/_entities/resume"
import { useCurrentUser } from "@/_features/auth"
// TOC 추적 훅은 portfolio feature에 정의되어 있으나 일반 에디터 기능이라 재사용 (추후 _features/editor로 이동 권장)
import { useTocTracking } from "@/_features/portfolio"

export function useResumeReadView(id: string) {
  const router = useRouter()
  const data = useResumeDetail(id)
  const { data: currentUser } = useCurrentUser()

  // TODO: API 연결 시 authorId 비교로 교체 — 현재는 mock 데이터 확인용으로 로그인 시 소유자로 간주
  const isOwner = !!(currentUser && data)

  const editor = useReadOnlyEditor({ content: data?.content, includeImages: true })

  // TOC: 헤딩 추출 + sticky 감지 + 활성 헤딩 추적
  // scrollOffset 100: 헤더(80px) + 약간의 여유 — 탭바가 없는 이력서 페이지에 맞춤
  const { tocHeadings, scrollToHeading, activeId } = useTocTracking({
    editor,
    content: data?.content as JSONContent | undefined,
    scrollOffset: 100,
  })

  // 존재하지 않는 이력서 ID → 마이페이지로 리다이렉트
  useEffect(() => {
    if (!data) router.replace(USER_ROUTES.mypage)
  }, [data, router])

  return { data, editor, tocHeadings, scrollToHeading, activeId, isOwner }
}
