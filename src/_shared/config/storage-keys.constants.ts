// _shared/config | 브라우저 storage 키 단일 소스
// localStorage·sessionStorage 키 문자열을 한 곳에서 관리하여 오타·충돌·검색 누락을 방지한다.
// 작성 흐름 드래프트 키는 authoring.constants.ts (별도 도메인 그룹) 유지.

/** localStorage 키 */
export const LOCAL_STORAGE_KEYS = {
  /** 다크/라이트 테마 (use-theme.hook) */
  THEME: "theme",
  /** 포트폴리오 목록 뷰 모드 (PortfolioListView) */
  PORTFOLIO_LIST_VIEW_MODE: "portfolio_view_mode",
  /** 마이페이지 — 포트폴리오 탭 뷰 모드 */
  MYPAGE_PORTFOLIO_VIEW_MODE: "ump_portfolio_view",
  /** 마이페이지 — 이력서 탭 뷰 모드 */
  MYPAGE_RESUME_VIEW_MODE: "ump_resume_view",
  /** 마이페이지 — 자기소개서 탭 뷰 모드 */
  MYPAGE_COVERLETTER_VIEW_MODE: "ump_coverletter_view",
} as const

/** sessionStorage 키 */
export const SESSION_STORAGE_KEYS = {
  /** 카카오 로그아웃 직후 재로그인 시 prompt=login 강제 (oauth-logout/oauth) */
  KAKAO_FORCE_LOGIN: "kakao_force_login",
} as const
