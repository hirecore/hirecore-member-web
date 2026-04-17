// _features/portfolio/lib | 직무 카테고리 단일 SSOT
// 백엔드 data.sql의 job_category 테이블을 그대로 옮긴 데이터.
// 3-level 계층: L1(분야) → L2(카테고리) → L3(직무)
// is_assignable=true 인 L3만 사용자가 실제로 선택 가능 (L1/L2는 그룹핑 전용)
// allows_custom_input=true 인 "기타(직접입력)" L3는 자유 텍스트 입력 노출

export interface JobCategoryNode {
  /** 백엔드 동일 코드 (영어 대문자 + 언더스코어). API 연동 시 그대로 전송 */
  code: string
  /** 화면 표시용 한글 이름 */
  name: string
  /** 1: 분야, 2: 카테고리, 3: 직무 */
  depth: 1 | 2 | 3
  /** 상위 카테고리 코드 (L1은 null) */
  parentCode: string | null
  /** 사용자가 직접 선택 가능한가 (L3만 true) */
  isAssignable: boolean
  /** "기타(직접입력)" 자유 텍스트 입력 허용 여부 */
  allowsCustomInput: boolean
  /** 동일 부모 내 정렬 순서 (오름차순) */
  sortOrder: number
}

// ── L1: 분야 (8개) ─────────────────────────────────────────────
export const JOB_CATEGORIES: JobCategoryNode[] = [
  { code: "DEVELOPMENT_DATA",    name: "개발·데이터",     depth: 1, parentCode: null, isAssignable: false, allowsCustomInput: false, sortOrder: 10 },
  { code: "PLANNING_STRATEGY",   name: "기획·전략",       depth: 1, parentCode: null, isAssignable: false, allowsCustomInput: false, sortOrder: 20 },
  { code: "DESIGN",              name: "디자인",          depth: 1, parentCode: null, isAssignable: false, allowsCustomInput: false, sortOrder: 30 },
  { code: "MARKETING_AD",        name: "마케팅·광고",     depth: 1, parentCode: null, isAssignable: false, allowsCustomInput: false, sortOrder: 40 },
  { code: "BUSINESS_MANAGEMENT", name: "경영·비즈니스",   depth: 1, parentCode: null, isAssignable: false, allowsCustomInput: false, sortOrder: 50 },
  { code: "SALES_SERVICE",       name: "영업·서비스",     depth: 1, parentCode: null, isAssignable: false, allowsCustomInput: false, sortOrder: 60 },
  { code: "MEDIA_CONTENT",       name: "미디어·콘텐츠",   depth: 1, parentCode: null, isAssignable: false, allowsCustomInput: false, sortOrder: 70 },
  { code: "EDUCATION",           name: "교육",            depth: 1, parentCode: null, isAssignable: false, allowsCustomInput: false, sortOrder: 80 },

  // ── 개발·데이터 ─────────────────────────────────────────────
  { code: "SOFTWARE_ENGINEERING", name: "SW개발",         depth: 2, parentCode: "DEVELOPMENT_DATA", isAssignable: false, allowsCustomInput: false, sortOrder: 10 },
  { code: "DATA_AI",              name: "데이터·AI",      depth: 2, parentCode: "DEVELOPMENT_DATA", isAssignable: false, allowsCustomInput: false, sortOrder: 20 },
  { code: "INFRA_PLATFORM",       name: "인프라·플랫폼",  depth: 2, parentCode: "DEVELOPMENT_DATA", isAssignable: false, allowsCustomInput: false, sortOrder: 30 },
  { code: "SECURITY_QUALITY",     name: "보안·품질",      depth: 2, parentCode: "DEVELOPMENT_DATA", isAssignable: false, allowsCustomInput: false, sortOrder: 40 },

  { code: "BACKEND_ENGINEER",            name: "백엔드 개발",         depth: 3, parentCode: "SOFTWARE_ENGINEERING", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "FRONTEND_ENGINEER",           name: "프론트엔드 개발",     depth: 3, parentCode: "SOFTWARE_ENGINEERING", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "FULLSTACK_ENGINEER",          name: "풀스택 개발",         depth: 3, parentCode: "SOFTWARE_ENGINEERING", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "MOBILE_APP_ENGINEER",         name: "모바일 앱 개발",      depth: 3, parentCode: "SOFTWARE_ENGINEERING", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "GAME_CLIENT_ENGINEER",        name: "게임 클라이언트 개발", depth: 3, parentCode: "SOFTWARE_ENGINEERING", isAssignable: true, allowsCustomInput: false, sortOrder: 50 },
  { code: "GAME_SERVER_ENGINEER",        name: "게임 서버 개발",      depth: 3, parentCode: "SOFTWARE_ENGINEERING", isAssignable: true, allowsCustomInput: false, sortOrder: 60 },
  { code: "EMBEDDED_IOT_ENGINEER",       name: "임베디드·IoT 개발",   depth: 3, parentCode: "SOFTWARE_ENGINEERING", isAssignable: true, allowsCustomInput: false, sortOrder: 70 },
  { code: "SOFTWARE_ENGINEERING_OTHER",  name: "기타(직접입력)",      depth: 3, parentCode: "SOFTWARE_ENGINEERING", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "DATA_ANALYST",            name: "데이터 분석",        depth: 3, parentCode: "DATA_AI", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "DATA_ENGINEER",           name: "데이터 엔지니어",    depth: 3, parentCode: "DATA_AI", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "DATA_SCIENTIST",          name: "데이터 사이언티스트", depth: 3, parentCode: "DATA_AI", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "MACHINE_LEARNING_ENGINEER", name: "머신러닝 엔지니어", depth: 3, parentCode: "DATA_AI", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "AI_APPLICATION_ENGINEER", name: "AI 애플리케이션 개발", depth: 3, parentCode: "DATA_AI", isAssignable: true, allowsCustomInput: false, sortOrder: 50 },
  { code: "MLOPS_ENGINEER",          name: "MLOps 엔지니어",     depth: 3, parentCode: "DATA_AI", isAssignable: true, allowsCustomInput: false, sortOrder: 60 },
  { code: "DATA_AI_OTHER",           name: "기타(직접입력)",     depth: 3, parentCode: "DATA_AI", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "DEVOPS_ENGINEER",       name: "DevOps 엔지니어",   depth: 3, parentCode: "INFRA_PLATFORM", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "CLOUD_ENGINEER",        name: "클라우드 엔지니어",  depth: 3, parentCode: "INFRA_PLATFORM", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "SRE",                   name: "SRE",               depth: 3, parentCode: "INFRA_PLATFORM", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "SYSTEM_ENGINEER",       name: "시스템 엔지니어",    depth: 3, parentCode: "INFRA_PLATFORM", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "NETWORK_ENGINEER",      name: "네트워크 엔지니어",  depth: 3, parentCode: "INFRA_PLATFORM", isAssignable: true, allowsCustomInput: false, sortOrder: 50 },
  { code: "DBA",                   name: "DBA",               depth: 3, parentCode: "INFRA_PLATFORM", isAssignable: true, allowsCustomInput: false, sortOrder: 60 },
  { code: "INFRA_PLATFORM_OTHER",  name: "기타(직접입력)",    depth: 3, parentCode: "INFRA_PLATFORM", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "SECURITY_ENGINEER",         name: "보안 엔지니어",  depth: 3, parentCode: "SECURITY_QUALITY", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "QA_ENGINEER",               name: "QA 엔지니어",    depth: 3, parentCode: "SECURITY_QUALITY", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "TEST_AUTOMATION_ENGINEER",  name: "테스트 자동화",  depth: 3, parentCode: "SECURITY_QUALITY", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "PERFORMANCE_TEST_ENGINEER", name: "성능 테스트",    depth: 3, parentCode: "SECURITY_QUALITY", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "SECURITY_QUALITY_OTHER",    name: "기타(직접입력)", depth: 3, parentCode: "SECURITY_QUALITY", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  // ── 기획·전략 ──────────────────────────────────────────────
  { code: "PRODUCT_PLANNING",      name: "프로덕트 기획",       depth: 2, parentCode: "PLANNING_STRATEGY", isAssignable: false, allowsCustomInput: false, sortOrder: 10 },
  { code: "BUSINESS_STRATEGY",     name: "비즈니스·전략 기획",  depth: 2, parentCode: "PLANNING_STRATEGY", isAssignable: false, allowsCustomInput: false, sortOrder: 20 },
  { code: "RESEARCH_INVESTMENT",   name: "리서치·투자",         depth: 2, parentCode: "PLANNING_STRATEGY", isAssignable: false, allowsCustomInput: false, sortOrder: 30 },

  { code: "SERVICE_PLANNER",         name: "서비스 기획",   depth: 3, parentCode: "PRODUCT_PLANNING", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "PRODUCT_MANAGER",         name: "PM",            depth: 3, parentCode: "PRODUCT_PLANNING", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "PRODUCT_OWNER",           name: "PO",            depth: 3, parentCode: "PRODUCT_PLANNING", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "PROJECT_MANAGER",         name: "프로젝트 매니저", depth: 3, parentCode: "PRODUCT_PLANNING", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "UX_PLANNER",              name: "UX 기획",       depth: 3, parentCode: "PRODUCT_PLANNING", isAssignable: true, allowsCustomInput: false, sortOrder: 50 },
  { code: "PRODUCT_PLANNING_OTHER",  name: "기타(직접입력)", depth: 3, parentCode: "PRODUCT_PLANNING", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "BUSINESS_PLANNER",         name: "사업 기획",       depth: 3, parentCode: "BUSINESS_STRATEGY", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "STRATEGY_PLANNER",         name: "전략 기획",       depth: 3, parentCode: "BUSINESS_STRATEGY", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "NEW_BUSINESS_PLANNER",     name: "신사업 기획",     depth: 3, parentCode: "BUSINESS_STRATEGY", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "OPERATION_PLANNER",        name: "운영 기획",       depth: 3, parentCode: "BUSINESS_STRATEGY", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "BUSINESS_STRATEGY_OTHER",  name: "기타(직접입력)",  depth: 3, parentCode: "BUSINESS_STRATEGY", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "IR",                          name: "IR",              depth: 3, parentCode: "RESEARCH_INVESTMENT", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "INVESTMENT_REVIEW",           name: "투자 심사",       depth: 3, parentCode: "RESEARCH_INVESTMENT", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "MARKET_RESEARCH",             name: "시장·사업 리서치", depth: 3, parentCode: "RESEARCH_INVESTMENT", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "CONSULTANT",                  name: "컨설턴트",        depth: 3, parentCode: "RESEARCH_INVESTMENT", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "RESEARCH_INVESTMENT_OTHER",   name: "기타(직접입력)",  depth: 3, parentCode: "RESEARCH_INVESTMENT", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  // ── 디자인 ──────────────────────────────────────────────────
  { code: "UI_UX_PRODUCT_DESIGN",      name: "UI·UX·프로덕트 디자인", depth: 2, parentCode: "DESIGN", isAssignable: false, allowsCustomInput: false, sortOrder: 10 },
  { code: "VISUAL_BRAND_DESIGN",       name: "비주얼·브랜드 디자인",  depth: 2, parentCode: "DESIGN", isAssignable: false, allowsCustomInput: false, sortOrder: 20 },
  { code: "VIDEO_MOTION_DESIGN",       name: "영상·모션 디자인",      depth: 2, parentCode: "DESIGN", isAssignable: false, allowsCustomInput: false, sortOrder: 30 },
  { code: "PRODUCT_INDUSTRIAL_DESIGN", name: "제품·산업 디자인",      depth: 2, parentCode: "DESIGN", isAssignable: false, allowsCustomInput: false, sortOrder: 40 },

  { code: "UI_DESIGNER",                  name: "UI 디자이너",        depth: 3, parentCode: "UI_UX_PRODUCT_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "UX_DESIGNER",                  name: "UX 디자이너",        depth: 3, parentCode: "UI_UX_PRODUCT_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "PRODUCT_DESIGNER",             name: "프로덕트 디자이너",  depth: 3, parentCode: "UI_UX_PRODUCT_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "UX_RESEARCHER",                name: "UX 리서처",          depth: 3, parentCode: "UI_UX_PRODUCT_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "UI_UX_PRODUCT_DESIGN_OTHER",   name: "기타(직접입력)",     depth: 3, parentCode: "UI_UX_PRODUCT_DESIGN", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "GRAPHIC_DESIGNER",            name: "그래픽 디자이너",  depth: 3, parentCode: "VISUAL_BRAND_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "BRAND_DESIGNER",              name: "브랜드 디자이너",  depth: 3, parentCode: "VISUAL_BRAND_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "CONTENT_DESIGNER",            name: "콘텐츠 디자이너",  depth: 3, parentCode: "VISUAL_BRAND_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "ILLUSTRATOR",                 name: "일러스트레이터",   depth: 3, parentCode: "VISUAL_BRAND_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "VISUAL_BRAND_DESIGN_OTHER",   name: "기타(직접입력)",   depth: 3, parentCode: "VISUAL_BRAND_DESIGN", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "MOTION_DESIGNER",             name: "모션 디자이너", depth: 3, parentCode: "VIDEO_MOTION_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "VIDEO_EDITOR",                name: "영상 편집",     depth: 3, parentCode: "VIDEO_MOTION_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "THREE_D_GRAPHICS_DESIGNER",   name: "3D 그래픽",     depth: 3, parentCode: "VIDEO_MOTION_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "VIDEO_MOTION_DESIGN_OTHER",   name: "기타(직접입력)", depth: 3, parentCode: "VIDEO_MOTION_DESIGN", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "INDUSTRIAL_DESIGNER",            name: "산업 디자이너",       depth: 3, parentCode: "PRODUCT_INDUSTRIAL_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "PACKAGE_DESIGNER",               name: "패키지 디자이너",     depth: 3, parentCode: "PRODUCT_INDUSTRIAL_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "SPACE_EXHIBITION_DESIGNER",      name: "공간·전시 디자이너",  depth: 3, parentCode: "PRODUCT_INDUSTRIAL_DESIGN", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "PRODUCT_INDUSTRIAL_DESIGN_OTHER", name: "기타(직접입력)",     depth: 3, parentCode: "PRODUCT_INDUSTRIAL_DESIGN", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  // ── 마케팅·광고 ─────────────────────────────────────────────
  { code: "DIGITAL_PERFORMANCE_MARKETING", name: "디지털·퍼포먼스 마케팅", depth: 2, parentCode: "MARKETING_AD", isAssignable: false, allowsCustomInput: false, sortOrder: 10 },
  { code: "BRAND_CONTENT_MARKETING",       name: "브랜드·콘텐츠 마케팅",   depth: 2, parentCode: "MARKETING_AD", isAssignable: false, allowsCustomInput: false, sortOrder: 20 },
  { code: "PR_COMMUNICATION",              name: "PR·커뮤니케이션",        depth: 2, parentCode: "MARKETING_AD", isAssignable: false, allowsCustomInput: false, sortOrder: 30 },
  { code: "CRM_GROWTH_MARKETING",          name: "CRM·그로스 마케팅",      depth: 2, parentCode: "MARKETING_AD", isAssignable: false, allowsCustomInput: false, sortOrder: 40 },

  { code: "PERFORMANCE_MARKETER",                name: "퍼포먼스 마케팅", depth: 3, parentCode: "DIGITAL_PERFORMANCE_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "SEO_ASO_MARKETER",                    name: "SEO·ASO",         depth: 3, parentCode: "DIGITAL_PERFORMANCE_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "APP_MARKETER",                        name: "앱 마케팅",       depth: 3, parentCode: "DIGITAL_PERFORMANCE_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "DIGITAL_PERFORMANCE_MARKETING_OTHER", name: "기타(직접입력)",  depth: 3, parentCode: "DIGITAL_PERFORMANCE_MARKETING", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "BRAND_MARKETER",              name: "브랜드 마케팅", depth: 3, parentCode: "BRAND_CONTENT_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "CONTENT_MARKETER",            name: "콘텐츠 마케팅", depth: 3, parentCode: "BRAND_CONTENT_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "SNS_MARKETER",                name: "SNS 마케팅",    depth: 3, parentCode: "BRAND_CONTENT_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "COPYWRITER",                  name: "카피라이터",    depth: 3, parentCode: "BRAND_CONTENT_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "BRAND_CONTENT_MARKETING_OTHER", name: "기타(직접입력)", depth: 3, parentCode: "BRAND_CONTENT_MARKETING", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "PR_MANAGER",                      name: "PR·홍보",            depth: 3, parentCode: "PR_COMMUNICATION", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "CORPORATE_COMMUNICATION_MANAGER", name: "기업 커뮤니케이션",   depth: 3, parentCode: "PR_COMMUNICATION", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "INFLUENCER_MARKETER",             name: "인플루언서 마케팅",  depth: 3, parentCode: "PR_COMMUNICATION", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "PR_COMMUNICATION_OTHER",          name: "기타(직접입력)",      depth: 3, parentCode: "PR_COMMUNICATION", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "CRM_MARKETER",                  name: "CRM 마케팅",        depth: 3, parentCode: "CRM_GROWTH_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "GROWTH_MARKETER",               name: "그로스 마케팅",      depth: 3, parentCode: "CRM_GROWTH_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "MARKETING_AUTOMATION_MANAGER",  name: "마케팅 자동화",      depth: 3, parentCode: "CRM_GROWTH_MARKETING", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "CRM_GROWTH_MARKETING_OTHER",    name: "기타(직접입력)",     depth: 3, parentCode: "CRM_GROWTH_MARKETING", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  // ── 경영·비즈니스 ────────────────────────────────────────────
  { code: "HR_ORGANIZATION",        name: "인사·조직",          depth: 2, parentCode: "BUSINESS_MANAGEMENT", isAssignable: false, allowsCustomInput: false, sortOrder: 10 },
  { code: "FINANCE_ACCOUNTING",     name: "재무·회계",          depth: 2, parentCode: "BUSINESS_MANAGEMENT", isAssignable: false, allowsCustomInput: false, sortOrder: 20 },
  { code: "LEGAL_COMPLIANCE",       name: "법무·컴플라이언스",  depth: 2, parentCode: "BUSINESS_MANAGEMENT", isAssignable: false, allowsCustomInput: false, sortOrder: 30 },
  { code: "OPERATIONS_PROCUREMENT", name: "운영·구매",          depth: 2, parentCode: "BUSINESS_MANAGEMENT", isAssignable: false, allowsCustomInput: false, sortOrder: 40 },

  { code: "HR_GENERALIST",                name: "HR",            depth: 3, parentCode: "HR_ORGANIZATION", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "TALENT_ACQUISITION",           name: "채용",          depth: 3, parentCode: "HR_ORGANIZATION", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "HRBP",                         name: "HRBP",          depth: 3, parentCode: "HR_ORGANIZATION", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "COMPENSATION_BENEFITS_MANAGER", name: "보상·평가",     depth: 3, parentCode: "HR_ORGANIZATION", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "HR_ORGANIZATION_OTHER",        name: "기타(직접입력)", depth: 3, parentCode: "HR_ORGANIZATION", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "ACCOUNTANT",                name: "회계",          depth: 3, parentCode: "FINANCE_ACCOUNTING", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "FINANCE_MANAGER",           name: "재무",          depth: 3, parentCode: "FINANCE_ACCOUNTING", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "FPNA_MANAGER",              name: "FP&A",          depth: 3, parentCode: "FINANCE_ACCOUNTING", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "TAX_MANAGER",               name: "세무",          depth: 3, parentCode: "FINANCE_ACCOUNTING", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "FINANCE_ACCOUNTING_OTHER",  name: "기타(직접입력)", depth: 3, parentCode: "FINANCE_ACCOUNTING", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "LEGAL_COUNSEL",          name: "법무",          depth: 3, parentCode: "LEGAL_COMPLIANCE", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "COMPLIANCE_MANAGER",     name: "컴플라이언스",   depth: 3, parentCode: "LEGAL_COMPLIANCE", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "CONTRACT_MANAGER",       name: "계약 관리",     depth: 3, parentCode: "LEGAL_COMPLIANCE", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "LEGAL_COMPLIANCE_OTHER", name: "기타(직접입력)", depth: 3, parentCode: "LEGAL_COMPLIANCE", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "BUSINESS_OPERATIONS_MANAGER", name: "비즈니스 운영", depth: 3, parentCode: "OPERATIONS_PROCUREMENT", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "PROCUREMENT_MANAGER",         name: "구매·조달",     depth: 3, parentCode: "OPERATIONS_PROCUREMENT", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "SUPPLY_CHAIN_MANAGER",        name: "SCM",          depth: 3, parentCode: "OPERATIONS_PROCUREMENT", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "OFFICE_ADMINISTRATOR",        name: "사무·행정",    depth: 3, parentCode: "OPERATIONS_PROCUREMENT", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "OPERATIONS_PROCUREMENT_OTHER", name: "기타(직접입력)", depth: 3, parentCode: "OPERATIONS_PROCUREMENT", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  // ── 영업·서비스 ─────────────────────────────────────────────
  { code: "B2B_SALES",                 name: "B2B 영업",       depth: 2, parentCode: "SALES_SERVICE", isAssignable: false, allowsCustomInput: false, sortOrder: 10 },
  { code: "B2C_RETAIL_SALES",          name: "B2C·리테일 영업", depth: 2, parentCode: "SALES_SERVICE", isAssignable: false, allowsCustomInput: false, sortOrder: 20 },
  { code: "CUSTOMER_SUCCESS_SUPPORT",  name: "고객성공·지원",   depth: 2, parentCode: "SALES_SERVICE", isAssignable: false, allowsCustomInput: false, sortOrder: 30 },
  { code: "PARTNERSHIP_BD",            name: "파트너십·BD",     depth: 2, parentCode: "SALES_SERVICE", isAssignable: false, allowsCustomInput: false, sortOrder: 40 },

  { code: "ENTERPRISE_SALES",  name: "기업 영업",      depth: 3, parentCode: "B2B_SALES", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "SOLUTION_SALES",    name: "솔루션 영업",    depth: 3, parentCode: "B2B_SALES", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "TECHNICAL_SALES",   name: "기술 영업",      depth: 3, parentCode: "B2B_SALES", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "B2B_SALES_OTHER",   name: "기타(직접입력)", depth: 3, parentCode: "B2B_SALES", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "RETAIL_SALES",            name: "리테일 영업",    depth: 3, parentCode: "B2C_RETAIL_SALES", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "FIELD_SALES",             name: "필드 세일즈",    depth: 3, parentCode: "B2C_RETAIL_SALES", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "INSIDE_SALES",            name: "인사이드 세일즈", depth: 3, parentCode: "B2C_RETAIL_SALES", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "B2C_RETAIL_SALES_OTHER",  name: "기타(직접입력)", depth: 3, parentCode: "B2C_RETAIL_SALES", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "CUSTOMER_SERVICE",              name: "고객 상담·CS", depth: 3, parentCode: "CUSTOMER_SUCCESS_SUPPORT", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "CUSTOMER_SUCCESS_MANAGER",      name: "CSM",          depth: 3, parentCode: "CUSTOMER_SUCCESS_SUPPORT", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "CX_MANAGER",                    name: "CX 매니저",    depth: 3, parentCode: "CUSTOMER_SUCCESS_SUPPORT", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "TECHNICAL_SUPPORT_ENGINEER",    name: "기술 지원",    depth: 3, parentCode: "CUSTOMER_SUCCESS_SUPPORT", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "CUSTOMER_SUCCESS_SUPPORT_OTHER", name: "기타(직접입력)", depth: 3, parentCode: "CUSTOMER_SUCCESS_SUPPORT", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "PARTNERSHIP_MANAGER",           name: "파트너십",      depth: 3, parentCode: "PARTNERSHIP_BD", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "BUSINESS_DEVELOPMENT_MANAGER",  name: "사업 개발",     depth: 3, parentCode: "PARTNERSHIP_BD", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "ALLIANCE_MANAGER",              name: "전략 제휴",     depth: 3, parentCode: "PARTNERSHIP_BD", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "PARTNERSHIP_BD_OTHER",          name: "기타(직접입력)", depth: 3, parentCode: "PARTNERSHIP_BD", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  // ── 미디어·콘텐츠 ───────────────────────────────────────────
  { code: "EDITORIAL_WRITING",  name: "에디토리얼·글쓰기", depth: 2, parentCode: "MEDIA_CONTENT", isAssignable: false, allowsCustomInput: false, sortOrder: 10 },
  { code: "VIDEO_PRODUCTION",   name: "영상 제작",         depth: 2, parentCode: "MEDIA_CONTENT", isAssignable: false, allowsCustomInput: false, sortOrder: 20 },
  { code: "CREATOR_SOCIAL",     name: "크리에이터·소셜",   depth: 2, parentCode: "MEDIA_CONTENT", isAssignable: false, allowsCustomInput: false, sortOrder: 30 },
  { code: "GAME_CONTENT",       name: "게임 콘텐츠",       depth: 2, parentCode: "MEDIA_CONTENT", isAssignable: false, allowsCustomInput: false, sortOrder: 40 },

  { code: "REPORTER",                  name: "기자",            depth: 3, parentCode: "EDITORIAL_WRITING", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "EDITOR",                    name: "에디터",          depth: 3, parentCode: "EDITORIAL_WRITING", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "WRITER",                    name: "작가",            depth: 3, parentCode: "EDITORIAL_WRITING", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "SCRIPT_WRITER",             name: "방송·영상 작가",  depth: 3, parentCode: "EDITORIAL_WRITING", isAssignable: true, allowsCustomInput: false, sortOrder: 40 },
  { code: "EDITORIAL_WRITING_OTHER",   name: "기타(직접입력)",  depth: 3, parentCode: "EDITORIAL_WRITING", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "PRODUCER_PD",            name: "PD",            depth: 3, parentCode: "VIDEO_PRODUCTION", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "CAMERA_OPERATOR",        name: "촬영",          depth: 3, parentCode: "VIDEO_PRODUCTION", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "VIDEO_EDITOR_CONTENT",   name: "영상 편집",     depth: 3, parentCode: "VIDEO_PRODUCTION", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "VIDEO_PRODUCTION_OTHER", name: "기타(직접입력)", depth: 3, parentCode: "VIDEO_PRODUCTION", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "CREATOR",              name: "크리에이터",      depth: 3, parentCode: "CREATOR_SOCIAL", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "STREAMER",             name: "스트리머",        depth: 3, parentCode: "CREATOR_SOCIAL", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "SOCIAL_MEDIA_MANAGER", name: "소셜미디어 운영", depth: 3, parentCode: "CREATOR_SOCIAL", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "CREATOR_SOCIAL_OTHER", name: "기타(직접입력)",  depth: 3, parentCode: "CREATOR_SOCIAL", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "GAME_PLANNER",            name: "게임 기획",     depth: 3, parentCode: "GAME_CONTENT", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "GAME_ARTIST",             name: "게임 아트",     depth: 3, parentCode: "GAME_CONTENT", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "GAME_OPERATIONS_MANAGER", name: "게임 운영",     depth: 3, parentCode: "GAME_CONTENT", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "GAME_CONTENT_OTHER",      name: "기타(직접입력)", depth: 3, parentCode: "GAME_CONTENT", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  // ── 교육 ────────────────────────────────────────────────────
  { code: "TEACHING_TUTORING",         name: "강의·튜터링",   depth: 2, parentCode: "EDUCATION", isAssignable: false, allowsCustomInput: false, sortOrder: 10 },
  { code: "LEARNING_DESIGN_OPERATIONS", name: "교육 기획·운영", depth: 2, parentCode: "EDUCATION", isAssignable: false, allowsCustomInput: false, sortOrder: 20 },
  { code: "CORPORATE_LD_HRD",          name: "기업 교육·HRD", depth: 2, parentCode: "EDUCATION", isAssignable: false, allowsCustomInput: false, sortOrder: 30 },

  { code: "INSTRUCTOR",                name: "강사",          depth: 3, parentCode: "TEACHING_TUTORING", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "TUTOR",                     name: "튜터",          depth: 3, parentCode: "TEACHING_TUTORING", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "CODING_INSTRUCTOR",         name: "코딩 강사",     depth: 3, parentCode: "TEACHING_TUTORING", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "TEACHING_TUTORING_OTHER",   name: "기타(직접입력)", depth: 3, parentCode: "TEACHING_TUTORING", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },

  { code: "CURRICULUM_PLANNER",            name: "커리큘럼 기획", depth: 3, parentCode: "LEARNING_DESIGN_OPERATIONS", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "EDUCATION_OPERATIONS_MANAGER",  name: "교육 운영",     depth: 3, parentCode: "LEARNING_DESIGN_OPERATIONS", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "INSTRUCTIONAL_DESIGNER",        name: "교수 설계",     depth: 3, parentCode: "LEARNING_DESIGN_OPERATIONS", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "LEARNING_DESIGN_OPERATIONS_OTHER", name: "기타(직접입력)", depth: 3, parentCode: "LEARNING_DESIGN_OPERATIONS", isAssignable: true, allowsCustomInput: true, sortOrder: 99 },

  { code: "HRD_MANAGER",                       name: "HRD",          depth: 3, parentCode: "CORPORATE_LD_HRD", isAssignable: true, allowsCustomInput: false, sortOrder: 10 },
  { code: "CORPORATE_TRAINER",                 name: "사내 강사",     depth: 3, parentCode: "CORPORATE_LD_HRD", isAssignable: true, allowsCustomInput: false, sortOrder: 20 },
  { code: "ORGANIZATION_DEVELOPMENT_FACILITATOR", name: "조직 개발", depth: 3, parentCode: "CORPORATE_LD_HRD", isAssignable: true, allowsCustomInput: false, sortOrder: 30 },
  { code: "CORPORATE_LD_HRD_OTHER",            name: "기타(직접입력)", depth: 3, parentCode: "CORPORATE_LD_HRD", isAssignable: true, allowsCustomInput: true,  sortOrder: 99 },
]
