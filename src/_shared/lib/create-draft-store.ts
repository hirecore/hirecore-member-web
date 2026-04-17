// _shared/lib | 드래프트 스토어 팩토리
// 포트폴리오·이력서·자기소개서 드래프트 Zustand 스토어의 공통 구조를 제네릭으로 제공한다.

import { create } from "zustand"

export interface DraftState<T> {
  previewData:       T | null
  isBackFromPreview: boolean

  setPreviewData:     (data: T) => void
  clearPreviewData:   () => void
  setBackFromPreview: (value: boolean) => void
}

export function createDraftStore<T>() {
  return create<DraftState<T>>((set) => ({
    previewData:       null,
    isBackFromPreview: false,

    setPreviewData:     (data)  => set({ previewData: data }),
    clearPreviewData:   ()      => set({ previewData: null }),
    setBackFromPreview: (value) => set({ isBackFromPreview: value }),
  }))
}
