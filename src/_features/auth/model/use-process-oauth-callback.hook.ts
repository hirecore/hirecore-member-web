"use client";

import { z } from "zod";
import { useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { OAUTH_PROVIDERS_LIST } from "@/_shared/model";
import { useOAuthLoginMutation } from "@/_features/auth/model/use-oauth-login-mutation.hook";
import { USER_ROUTES } from "@/_shared/config";

const providerParamSchema = z
    .string()
    .toUpperCase()
    .pipe(z.enum(OAUTH_PROVIDERS_LIST));

export const useProcessOAuthCallback = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { mutate } = useOAuthLoginMutation();

    // React 18 Strict Mode 대응 (이중 호출 방지)
    const isRequestSent = useRef(false);

    useEffect(() => {
        // 이미 요청을 보냈다면 중단
        if (isRequestSent.current) return;

        const rawProvider = params.provider;
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        // 1. 에러 발생 시 (사용자가 취소했거나 소셜 로그인 실패)
        if (error) {
            isRequestSent.current = true;
            router.replace(USER_ROUTES.auth.loginError("social_auth_failed"));
            return;
        }

        // 2. 정상적인 코드 수신 시
        if (code && typeof rawProvider === "string") {
            const providerResult = providerParamSchema.safeParse(rawProvider);

            if (providerResult.success) {
                // 성공: 플래그를 true로 바꾸고 API 요청
                isRequestSent.current = true;
                mutate({
                    // provider: providerResult.data,
                    authorizationCode: code,
                });
            } else {
                // 실패: 유효하지 않은 Provider (예: /login/callback/invalid)
                router.replace(USER_ROUTES.auth.loginError("invalid_provider"));
            }
        }
    }, [params, searchParams, mutate, router]);
};