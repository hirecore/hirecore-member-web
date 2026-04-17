/**
 * 앱 전체 라우팅 경로 단일 소스
 * 경로 변경 시 이 파일만 수정하면 됩니다.
 */
export const USER_ROUTES = {
  /** 포트폴리오 목록 (홈) */
  home: "/",

  auth: {
    login:             "/login",
    loginError:        (error: string) => `/login?error=${error}` as const,
  },

  portfolio: {
    list:    "/portfolio",
    write:   "/portfolio/write",
    preview: "/portfolio/preview",
    detail:  (id: string | number) => `/portfolio/${id}`,
  },

  resume: {
    list:    "/resume",
    write:   "/resume/write",
    preview: "/resume/preview",
    detail:  (id: string | number) => `/resume/${id}`,
  },

  coverletter: {
    list:    "/coverletter",
    write:   "/coverletter/write",
    preview: "/coverletter/preview",
    detail:  (id: string | number) => `/coverletter/${id}`,
  },

  mypage:  "/mypage",
  upgrade: "/upgrade",
} as const
