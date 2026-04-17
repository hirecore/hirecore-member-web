"use client"

// _features/portfolio/model | TOC 추적 훅
// 포트폴리오 읽기·미리보기 뷰에서 공통으로 사용하는 TOC 관련 로직을 통합한다.
// sticky 감지, heading ID 주입, 스크롤 기반 활성 헤딩 추적, scrollToHeading.

import { useEffect, useRef, useState } from "react"
import type { Editor } from "@tiptap/core"
import type { JSONContent } from "@tiptap/core"
import { extractHeadings } from "../lib"

interface UseTocTrackingOptions {
  editor: Editor | null
  content?: JSONContent
  /** 활성 헤딩 판정용 viewport top offset (기본 120 = header 80 + 탭바 40).
   *  탭바가 없는 페이지(이력서/자소서)는 80 정도가 적절. */
  scrollOffset?: number
}

export function useTocTracking({ editor, content, scrollOffset = 120 }: UseTocTrackingOptions) {
  const [tabsSticky, setTabsSticky] = useState(false)
  const [activeId, setActiveId]     = useState("")
  const tabsSentinelRef = useRef<HTMLDivElement>(null)

  const tocHeadings = content ? extractHeadings(content) : []

  // 탭 sticky 감지 — 탭 바가 헤더 뒤로 사라지는 시점을 파악해 shadow/스타일 전환
  useEffect(() => {
    const sentinel = tabsSentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setTabsSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // 에디터 렌더 후 heading DOM ID 주입 — TOC 클릭 시 앵커 링크가 동작하려면 id가 필요.
  //
  // 이전 구현은 단일 rAF로 1프레임만 기다렸는데, setContent 직후 ProseMirror가 DOM을
  // 업데이트하는 타이밍이 fragile해서 종종 ID 주입 실패 → 클릭/스크롤 시 active 미반영.
  //
  // 개선: editor.on('update') 콜백으로 DOM 변경 시마다 ID 재주입 + 마운트 시 즉시 1회 시도.
  // 이 방식은 setContent / 사용자 입력 / 외부 변경 모두를 안정적으로 커버한다.
  useEffect(() => {
    if (!editor || !tocHeadings.length) return

    const injectIds = () => {
      const pm = editor.view.dom as HTMLElement
      pm.querySelectorAll<HTMLElement>("h1, h2, h3").forEach((el, i) => {
        if (tocHeadings[i]) el.id = tocHeadings[i].id
      })
    }

    // 1) 즉시 시도
    injectIds()
    // 2) 다음 프레임에도 한 번 더 (setContent의 비동기 DOM 반영 대비)
    const raf = requestAnimationFrame(injectIds)
    // 3) editor의 모든 update 시 (예: 비동기 콘텐츠 주입, 이미지 로드 등)
    editor.on("update", injectIds)

    return () => {
      cancelAnimationFrame(raf)
      editor.off("update", injectIds)
    }
  }, [editor, tocHeadings])

  // 스크롤 위치 기반 활성 헤딩 추적 — TOC 하이라이트 동기화
  useEffect(() => {
    if (!tocHeadings.length) return
    const onScroll = () => {
      let found = ""
      for (const h of tocHeadings) {
        const el = document.getElementById(h.id)
        if (el && el.getBoundingClientRect().top <= scrollOffset) found = h.id
      }
      setActiveId(found || (tocHeadings[0]?.id ?? ""))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [tocHeadings, scrollOffset])

  // TOC 항목 클릭 시 해당 헤딩으로 부드럽게 스크롤 — scrollOffset 기준
  const scrollToHeading = (headingId: string) => {
    const el = document.getElementById(headingId)
    if (!el) return
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - (scrollOffset - 16),
      behavior: "smooth",
    })
  }

  return { tocHeadings, tabsSticky, activeId, tabsSentinelRef, scrollToHeading }
}
