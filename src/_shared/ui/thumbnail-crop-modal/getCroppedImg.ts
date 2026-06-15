import type { Area } from "react-easy-crop"

/**
 * 크롭 영역(원본 이미지 픽셀 좌표 기준)을 잘라 PNG File 로 반환한다.
 * 후속 toWebP 단계에서 다시 변환되므로 여기선 무손실 PNG 로 둔다.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  fileName: string,
): Promise<File> {
  const image = await loadImage(imageSrc)

  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("canvas context 생성 실패")

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  )

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("canvas.toBlob 실패")); return }
      const baseName = fileName.replace(/\.[^/.]+$/, "")
      resolve(new File([blob], baseName + ".png", { type: "image/png" }))
    }, "image/png")
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("이미지 로드 실패"))
    img.src = src
  })
}
