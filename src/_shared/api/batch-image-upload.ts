// _shared/api | 등록/임시저장 시 에디터 본문 이미지 일괄 업로드
// blob URL → WebP 변환 → Presigned URL 일괄 발급 → S3 병렬 업로드 → JSON 내 URL 교체

import type { JSONContent } from "@tiptap/core"
import { requestPresignedUrls, uploadToS3, getImageDimensions } from "./image-upload"
import type { PresignedFileRequest } from "./image-upload"

// blob URL → 사용자가 업로드한 원본 파일명 매핑.
// 업로드 진입점(useStableImageUpload)에서 blob URL 생성 직후 등록하고,
// Presigned URL 요청 시 originalFileName 값으로 그대로 전송한다.
// blob URL 자체가 탭 세션 동안만 유효하므로 별도 cleanup 없이 페이지 unload 시 함께 GC 됨.
const blobOriginalNames = new Map<string, string>()

export function registerBlobOriginalName(blobUrl: string, originalName: string): void {
  blobOriginalNames.set(blobUrl, originalName)
}

interface BlobImageInfo {
  blobUrl: string
  file: File
  width: number
  height: number
}

/**
 * 에디터 JSON에서 blob: URL 이미지를 모두 수집한다.
 */
function collectBlobUrls(content: JSONContent): string[] {
  const urls: string[] = []

  function walk(node: JSONContent) {
    // 단일 이미지
    if (node.type === "image" && typeof node.attrs?.src === "string" && node.attrs.src.startsWith("blob:")) {
      urls.push(node.attrs.src)
    }
    // 이미지 캐러셀
    if (node.type === "imageCarousel" && Array.isArray(node.attrs?.images)) {
      for (const img of node.attrs.images) {
        if (typeof img.url === "string" && img.url.startsWith("blob:")) {
          urls.push(img.url)
        }
      }
    }
    // 재귀
    if (node.content) {
      for (const child of node.content) {
        walk(child)
      }
    }
  }

  walk(content)
  return [...new Set(urls)] // 중복 제거
}

/**
 * blob URL을 File 객체로 변환한다.
 */
async function blobUrlToFile(blobUrl: string, index: number): Promise<File> {
  const res = await fetch(blobUrl)
  const blob = await res.blob()
  const ext = blob.type.split("/")[1] || "webp"
  return new File([blob], `image-${index}.${ext}`, { type: blob.type })
}

/**
 * 에디터 JSON 내 blob URL을 publicUrl로 교체한다.
 */
function replaceBlobUrls(content: JSONContent, urlMap: Map<string, string>): JSONContent {
  function walk(node: JSONContent): JSONContent {
    // 단일 이미지
    if (node.type === "image" && typeof node.attrs?.src === "string" && urlMap.has(node.attrs.src)) {
      return { ...node, attrs: { ...node.attrs, src: urlMap.get(node.attrs.src)! } }
    }
    // 이미지 캐러셀
    if (node.type === "imageCarousel" && Array.isArray(node.attrs?.images)) {
      const newImages = node.attrs.images.map((img: { url: string; alt?: string }) => {
        if (urlMap.has(img.url)) {
          return { ...img, url: urlMap.get(img.url)! }
        }
        return img
      })
      return { ...node, attrs: { ...node.attrs, images: newImages } }
    }
    // 재귀
    if (node.content) {
      return { ...node, content: node.content.map((child) => walk(child)) }
    }
    return node
  }

  return walk(content)
}

export interface BatchUploadOptions {
  /** 에디터 JSON 콘텐츠 */
  content: JSONContent
  /** 도메인 타입 */
  domainType: "portfolio" | "resume"
  /** WebP 변환 함수 */
  toWebP: (file: File) => Promise<File>
  /** 진행 상태 콜백 (0~100) */
  onProgress?: (progress: number) => void
}

export interface BatchUploadResult {
  /** blob URL이 publicUrl로 교체된 JSON */
  content: JSONContent
  /** 업로드된 파일 수 */
  uploadedCount: number
  /** publicUrl → imageFileMetaId(TSID 문자열). 등록 API의 contentImageIds 산출에 사용 */
  imageIdMap: Map<string, string>
}

/**
 * 에디터 본문의 blob URL 이미지를 일괄 S3 업로드하고, publicUrl로 교체된 JSON을 반환한다.
 *
 * blob URL이 없으면 원본 JSON을 그대로 반환한다.
 */
export async function batchUploadImages({
  content, domainType, toWebP, onProgress,
}: BatchUploadOptions): Promise<BatchUploadResult> {
  // 1. blob URL 수집
  const blobUrls = collectBlobUrls(content)
  if (blobUrls.length === 0) {
    return { content, uploadedCount: 0, imageIdMap: new Map() }
  }

  onProgress?.(5)

  // 2. blob URL → File → WebP 변환 + 크기 측정
  const imageInfos: BlobImageInfo[] = await Promise.all(
    blobUrls.map(async (url, i) => {
      const rawFile = await blobUrlToFile(url, i)
      const webpFile = await toWebP(rawFile)
      const { width, height } = await getImageDimensions(webpFile)
      return { blobUrl: url, file: webpFile, width, height }
    })
  )

  onProgress?.(20)

  // 3. Presigned URL 일괄 발급
  const requests: PresignedFileRequest[] = imageInfos.map((info, i) => ({
    purpose: "contentImage" as const,
    mimeType: "image/webp",
    // 사용자가 업로드한 원본 파일명 우선, 미등록 시 합성 이름 fallback
    originalFileName: blobOriginalNames.get(info.blobUrl) ?? info.file.name,
    width: info.width,
    height: info.height,
    fileExtension: "webp" as const,
    domainType,
    clientFileId: i + 1,
    fileSizeBytes: info.file.size,
  }))

  const presignedResult = await requestPresignedUrls(requests)

  onProgress?.(40)

  // 4. S3 병렬 업로드
  const urlMap = new Map<string, string>()
  const imageIdMap = new Map<string, string>()
  const uploadPromises = presignedResult.files.map(async (presigned, i) => {
    const info = imageInfos[i]
    await uploadToS3(presigned.presignedUrl, info.file)
    urlMap.set(info.blobUrl, presigned.publicUrl)
    imageIdMap.set(presigned.publicUrl, presigned.imageFileMetaId)
  })

  // 진행률을 업로드 완료 개수로 추적
  let completed = 0
  await Promise.all(
    uploadPromises.map((p) =>
      p.then(() => {
        completed++
        const progress = 40 + Math.round((completed / uploadPromises.length) * 55)
        onProgress?.(progress)
      })
    )
  )

  // 5. JSON 내 blob URL → publicUrl 교체
  const updatedContent = replaceBlobUrls(content, urlMap)

  onProgress?.(100)

  return { content: updatedContent, uploadedCount: urlMap.size, imageIdMap }
}

/**
 * 에디터 JSON에서 모든 이미지 URL을 수집한다 (단일 이미지 + 캐러셀, 중복 제거).
 * 등록 API의 contentImageIds 산출 시 현재 본문에 박힌 publicUrl 들을 뽑아내는 용도.
 */
export function collectImageUrls(content: JSONContent): string[] {
  const urls: string[] = []

  function walk(node: JSONContent) {
    if (node.type === "image" && typeof node.attrs?.src === "string") {
      urls.push(node.attrs.src)
    }
    if (node.type === "imageCarousel" && Array.isArray(node.attrs?.images)) {
      for (const img of node.attrs.images) {
        if (typeof img.url === "string") urls.push(img.url)
      }
    }
    if (node.content) {
      for (const child of node.content) walk(child)
    }
  }

  walk(content)
  return [...new Set(urls)]
}
