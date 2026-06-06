// _features/editor/model | 안정적인 이미지 업로드 파이프라인 훅
// WebP 변환 → quota 검사 → pendingUploadBytes 관리 → URL 반환 의 전체 흐름을 담는다.
// ref 패턴으로 stale closure 없이 항상 최신 상태를 참조하면서도 trackedUpload는 stable 참조를 유지한다.
import { useCallback, useRef } from "react"
import type { StorageInfo } from "@/_shared/model"
import { registerBlobOriginalName } from "@/_shared/api"
import { validateImageFilename } from "@/_shared/lib"
import { handleImageUpload, toWebP } from "../lib"

interface StableImageUploadOptions {
  /** 현재 사용자 스토리지 정보 ref — quota 계산에 사용 */
  storageInfoRef: React.MutableRefObject<StorageInfo | undefined>
  /** 현재 세션 사용 bytes ref */
  sessionBytesRef: React.MutableRefObject<number>
  /** 업로드 진행 중 bytes ref — quota 선검사와 UI 반영에 사용 */
  pendingUploadBytesRef: React.MutableRefObject<number>
  /** 업로드 완료 URL → 파일 크기 매핑 ref */
  uploadedSizesRef: React.MutableRefObject<Map<string, number>>
  /** 스토리지 초과 시 호출 — ExceededModal 표시 */
  setExceededModal: (v: { fileSize: number } | null) => void
  /** StorageBar 등 UI에 즉시 반영할 sessionBytes state setter */
  setSessionBytes: (bytes: number) => void
}

export interface StableImageUploadResult {
  /**
   * 항상 최신 업로드 함수를 가리키는 ref.
   * ImageUploadNode나 paste handler에 uploadRef로 전달해 사용한다.
   */
  stableUploadRef: React.MutableRefObject<(file: File) => Promise<string>>
  /**
   * stable 참조가 보장된 업로드 콜백.
   * ImageUploadNode의 upload prop에 직접 전달한다.
   */
  trackedUpload: (file: File) => Promise<string>
}

/**
 * 이미지 파일을 받아 WebP 변환 → quota 검사 → 업로드 → 상태 갱신까지 수행한다.
 *
 * 업로드 파이프라인 규칙:
 * 1. toWebP로 변환
 * 2. storageInfo가 있으면 quota 선검사 — 초과 시 ExceededModal + "__QUOTA_EXCEEDED__" throw
 * 3. quota 통과 시 pendingUploadBytesRef 증가 (UI에 즉시 반영)
 * 4. handleImageUpload 실행
 * 5. 성공 시 uploadedSizesRef에 url→size 저장, sessionBytesRef 증가
 * 6. finally에서 pendingUploadBytesRef 감소 (성공/실패 무관)
 */
export function useStableImageUpload({
  storageInfoRef,
  sessionBytesRef,
  pendingUploadBytesRef,
  uploadedSizesRef,
  setExceededModal,
  setSessionBytes,
}: StableImageUploadOptions): StableImageUploadResult {
  const stableUploadRef = useRef<(file: File) => Promise<string>>(handleImageUpload)

  // 렌더마다 최신 ref 값을 참조하도록 current를 교체 — 모든 의존성이 ref이므로 stale closure 없음
  stableUploadRef.current = async (file: File): Promise<string> => {
    // 사용자 입력 파일명 1차 검증 — 백엔드 검증과 별개의 UX + 다층 방어용 차단
    const filenameCheck = validateImageFilename(file.name)
    if (!filenameCheck.ok) {
      throw new Error(filenameCheck.reason)
    }
    const webpFile = await toWebP(file)
    const info = storageInfoRef.current
    if (info) {
      const projected = info.used + sessionBytesRef.current + pendingUploadBytesRef.current + webpFile.size
      if (projected > info.quota) {
        setExceededModal({ fileSize: webpFile.size })
        throw new Error("__QUOTA_EXCEEDED__")
      }
      pendingUploadBytesRef.current += webpFile.size
      setSessionBytes(sessionBytesRef.current + pendingUploadBytesRef.current)
    }
    try {
      const url = await handleImageUpload(webpFile)
      // 등록 시점 Presigned URL 요청의 originalFileName 으로 사용자 업로드 원본 파일명 전달
      registerBlobOriginalName(url, file.name)
      uploadedSizesRef.current.set(url, webpFile.size)
      if (info) sessionBytesRef.current += webpFile.size
      return url
    } finally {
      if (info) {
        pendingUploadBytesRef.current = Math.max(0, pendingUploadBytesRef.current - webpFile.size)
        setSessionBytes(sessionBytesRef.current + pendingUploadBytesRef.current)
      }
    }
  }

  // ImageUploadNode.upload prop에 stable 참조로 전달하기 위한 래퍼
  const trackedUpload = useCallback((file: File) => stableUploadRef.current(file), [])

  return { stableUploadRef, trackedUpload }
}
