"use client"

// _shared/model | 다크/라이트 테마 전환 훅
// lib/가 아닌 model/에 위치하는 이유: localStorage + DOM 부수효과 + useState를 동반하는 훅이므로 FSD §5 기준 model 세그먼트에 속함
import { useEffect, useState } from "react"
import { LOCAL_STORAGE_KEYS } from "@/_shared/config"

export const useTheme = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME)
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const dark = stored === "dark" || (!stored && prefersDark)
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
  }, [])

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, next ? "dark" : "light")
      return next
    })
  }

  return { isDark, toggle }
}
