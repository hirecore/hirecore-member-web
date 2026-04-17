"use client";

import { OAuthProvider } from "@/_shared/model";
import { getSocialLoginUrl } from "@/_features/auth/lib/oauth";

export const useOAuthRedirect = () => {
    const redirect = (provider: OAuthProvider) => {
        window.location.href = getSocialLoginUrl(provider);
    };

    return { redirect };
};
