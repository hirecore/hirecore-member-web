// _shared/api | 이미지 업로드 API — Presigned URL 발급 + S3 PUT
import { httpClient } from "@/_shared/config"

export interface PresignedFileRequest {
  purpose: "contentImage" | "thumbnailImage"
  mimeType: string
  originalFileName: string
  width: number
  height: number
  fileExtension: "webp"
  domainType: "portfolio" | "resume"
  clientFileId: number
  fileSizeBytes: number
}

export interface PresignedFileResponse {
  clientFileId: string
  imageFileMetaId: number
  presignedUrl: string
  publicUrl: string
}

export interface PresignedUrlResult {
  files: PresignedFileResponse[]
}

/**
 * Presigned PUT URL 발급 — 다중 파일 일괄 요청
 */
export async function requestPresignedUrls(
  files: PresignedFileRequest[]
): Promise<PresignedUrlResult> {
  const { data } = await httpClient.post<PresignedUrlResult>(
    "/api/users/files/images/presigned-url",
    { files }
  )
  return data
}

/**
 * S3에 파일을 직접 PUT 업로드
 */
export async function uploadToS3(
  presignedUrl: string,
  file: File,
  onProgress?: (progress: number) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  const xhr = new XMLHttpRequest()

  await new Promise<void>((resolve, reject) => {
    xhr.open("PUT", presignedUrl, true)
    xhr.setRequestHeader("Content-Type", file.type)

    if (abortSignal) {
      abortSignal.addEventListener("abort", () => xhr.abort())
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`S3 업로드 실패: ${xhr.status}`))
    }

    xhr.onerror = () => reject(new Error("S3 업로드 네트워크 오류"))
    xhr.onabort = () => reject(new Error("업로드가 취소되었습니다"))

    xhr.send(file)
  })
}

/**
 * 이미지 파일의 width/height를 측정
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("이미지 크기를 측정할 수 없습니다"))
    }
    img.src = url
  })
}
