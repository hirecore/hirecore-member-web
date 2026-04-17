// _shared/model | 작성 흐름 공통 타입
// portfolio / resume / coverletter 도메인이 공유하는 최소 공통 타입

/** 문서 공개 여부 — 세 도메인 공통 */
export type Visibility = "public" | "private"

/**
 * 마이페이지 관리 카드용 공통 문서 타입.
 * 이력서·자기소개서가 공유하는 필드 집합 — ManageCard에서 동일하게 표시된다.
 *
 * 포트폴리오는 likeCount/projectType/thumbnailUrl/linkedResume 등 추가 필드가 있어 별도 타입(ManagedPortfolio) 사용.
 */
export interface ManagedDocument {
  id: string
  title: string
  privateMemo?: string
  updatedAt: string
  visibility: Visibility
  tags: string[]
  interestFields?: string[]
  linkedPortfolioCount: number
  linkedPortfolioIds?: string[]
}

/**
 * 사용자 스토리지 현황.
 * - _entities/user: useStorageInfo 훅이 반환
 * - _features/editor: StorageMeter / StorageBar / StorageExceededModal이 표시
 * 두 레이어가 모두 참조하므로 _shared/model에서 정의한다.
 *
 * tier는 백엔드 응답 대소문자 혼용("gold" | "Gold" | "GOLD")을 수용하기 위해 string으로 선언.
 */
/** 외부 링크 (GitHub, Blog 등) — 포트폴리오·이력서·자기소개서 공통 */
export interface ExternalLink {
  label: string
  url: string
}

/** 연결된 포트폴리오 요약 — 이력서·자기소개서 상세에서 사용 */
export interface LinkedPortfolio {
  id: string
  title: string
  thumbnailUrl: string | null
  tags: string[]
}

export interface StorageInfo {
  used: number
  quota: number
  /** 백엔드에서 대소문자 어떤 형태로 오더라도 수용 */
  tier: string
}
