import { OAUTH_PROVIDERS_LIST, OAuthProvider } from "@/_shared/model";
import { SESSION_STORAGE_KEYS } from "@/_shared/config";
import { OAUTH_PROPERTIES_MAP } from "@/_features/auth/config/oauth.constants";

export const getAllOAuthProperties = () => {
    return OAUTH_PROVIDERS_LIST.map((provider) => {
        return {
            provider,
            properties: OAUTH_PROPERTIES_MAP[provider]
        };
    });
};

export const getSocialLoginUrl = (provider: OAuthProvider) => {
    const properties = OAUTH_PROPERTIES_MAP[provider];
    const url = new URL(properties.authUrl);

    url.searchParams.append("client_id", properties.clientId);
    url.searchParams.append("redirect_uri", properties.redirectUrl);

    if(provider === "KAKAO") {
        url.searchParams.append("response_type", properties.responseType);
        if (sessionStorage.getItem(SESSION_STORAGE_KEYS.KAKAO_FORCE_LOGIN) === "1") {
            sessionStorage.removeItem(SESSION_STORAGE_KEYS.KAKAO_FORCE_LOGIN)
            url.searchParams.append("prompt", "login")
        }
    }

    return url.toString();
};