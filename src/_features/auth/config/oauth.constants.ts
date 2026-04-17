import { OAuthProvider } from "@/_shared/model";
import { OAuthAuthProperties } from "./oauth.schema";
import { env } from "@/_shared/model";

type KakaoAuthProperties = OAuthAuthProperties & {
    responseType: "code";
}

export const KAKAO_AUTH_PROPERTIES = {
    authUrl: env.NEXT_PUBLIC_KAKAO_AUTH_CODE_URL,
    clientId: env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
    redirectUrl: env.NEXT_PUBLIC_KAKAO_REDIRECT_URL,
    responseType: "code",
} as const satisfies KakaoAuthProperties;

export type OAuthProperties = typeof KAKAO_AUTH_PROPERTIES;

export const OAUTH_PROPERTIES_MAP = {
    KAKAO: KAKAO_AUTH_PROPERTIES,
} as const satisfies Record<OAuthProvider, OAuthProperties>;
