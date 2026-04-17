// _features/editor/model | 이미지 업로드 피드백 상태 — 토스트 에러(자동 소멸) + 스토리지 초과 모달
// 두 가지 실패 피드백은 항상 함께 생성·사용되므로 한 훅으로 묶는다.
// - uploadError: 일반 실패 → 3초 후 자동 소멸 토스트
// - exceededModal: 스토리지 초과 → 사용자가 직접 닫는 모달
import { useEffect, useRef, useState } from "react"
import type { MutableRefObject } from "react"

/** 일반 업로드 실패 토스트 자동 소멸 딜레이(ms) */
const UPLOAD_ERROR_AUTO_CLEAR_MS = 3000

export interface EditorUploadFeedbackResult {
  /** 현재 에러 메시지 — null이면 토스트 미표시 */
  uploadError: string | null
  /** 메시지가 동일해도 토스트 재-애니메이션을 트리거하기 위한 증가 키 */
  uploadErrorKey: number
  /**
   * 항상 최신 showUploadError 구현을 가리키는 ref.
   * ImageUploadNode.onError 와 useEditorImagePasteHandler에 전달한다.
   */
  showUploadErrorRef: MutableRefObject<(msg: string) => void>
  /** 스토리지 초과 모달 상태 — null이면 미표시 */
  exceededModal: { fileSize: number } | null
  /** 스토리지 초과 모달 상태 setter — useStableImageUpload / useEditorImagePasteHandler에 전달 */
  setExceededModal: (v: { fileSize: number } | null) => void
}

/**
 * 이미지 업로드 피드백 상태를 한 곳에 모은다.
 * showUploadErrorRef는 렌더마다 current를 교체하는 ref 패턴으로 stale closure 없이 항상 최신 setter를 참조한다.
 * 언마운트 시 pending 타이머를 정리해 비마운트 컴포넌트에 setState가 호출되지 않도록 한다.
 */
export function useEditorUploadFeedback(): EditorUploadFeedbackResult {
  const [uploadError,    setUploadError]    = useState<string | null>(null)
  const [uploadErrorKey, setUploadErrorKey] = useState(0)
  const uploadErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [exceededModal, setExceededModal] = useState<{ fileSize: number } | null>(null)

  // 언마운트 시 pending 타이머 정리
  useEffect(() => {
    return () => { if (uploadErrorTimerRef.current) clearTimeout(uploadErrorTimerRef.current) }
  }, [])

  // 렌더마다 current를 교체 — 모든 의존성이 ref/setter이므로 stale closure 없음
  const showUploadErrorRef = useRef((_msg: string) => {})
  showUploadErrorRef.current = (msg: string) => {
    if (uploadErrorTimerRef.current) clearTimeout(uploadErrorTimerRef.current)
    setUploadError(msg)
    setUploadErrorKey((k) => k + 1)
    uploadErrorTimerRef.current = setTimeout(() => setUploadError(null), UPLOAD_ERROR_AUTO_CLEAR_MS)
  }

  return { uploadError, uploadErrorKey, showUploadErrorRef, exceededModal, setExceededModal }
}
