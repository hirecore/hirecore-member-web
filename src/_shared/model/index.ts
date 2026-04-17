export {
    OAuthProviderSchema,
    type OAuthProvider,
    OAUTH_PROVIDERS_LIST,
    isValidOAuthProvider,
} from "./oauth-provider.schema";

export {
    ServiceTargetSchema,
    type ServiceTarget,
    SERVICE_TARGET_LIST,
    isValidServiceTarget
} from "./service-target.schema"

export {
    env
} from "./env.schema"

// 브라우저 UI 부수효과 훅 — FSD §5: 상태·이벤트 구독 훅은 model 세그먼트
export { useBodyLock } from "./use-body-lock.hook"
export { useTheme } from "./use-theme.hook"

// 작성 흐름 공통 타입
export type { Visibility, StorageInfo, ManagedDocument } from "./authoring.schema"
