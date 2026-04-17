"use client"

// _views/coverletter/model | 자기소개서 미리보기 뷰 비즈니스 로직
// draft store 읽기·에디터 초기화·핸들러·리다이렉트를 View에서 분리
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useReadOnlyEditor } from "@/_features/editor"
import { useCoverLetterDraftStore } from "@/_features/coverletter"
import { USER_ROUTES } from "@/_shared/config"

export function useCoverLetterPreviewView() {
  const router      = useRouter()
  const previewData = useCoverLetterDraftStore((s) => s.previewData)

  const editor = useReadOnlyEditor({ content: previewData?.content, includeImages: false })

  // previewData 없으면 작성 뷰로 리다이렉트 (직접 URL 접근 방어)
  useEffect(() => {
    if (!previewData) router.replace(USER_ROUTES.coverletter.write)
  }, [previewData, router])

  // 편집으로 돌아가기 — backFromPreview 플래그 설정 후 write 뷰로 이동
  const handleEdit = () => {
    useCoverLetterDraftStore.getState().setBackFromPreview(true)
    router.push(USER_ROUTES.coverletter.write)
  }

  // 등록하기 — previewData 소비 후 API 호출 (TODO: POST /api/coverletters)
  const handleSubmit = () => {
    if (!previewData) return
    useCoverLetterDraftStore.getState().clearPreviewData()
    router.replace(USER_ROUTES.mypage + "?tab=coverletter")
  }

  return { previewData, editor, handleEdit, handleSubmit }
}
