"use client";

import { ComponentProps, ElementType } from "react";
import { OAuthProvider, ServiceTarget } from "@/_shared/model";
import { useOAuthRedirect } from "@/_features/auth/model/use-oauth-redirect.hook";
import { KakaoIcon } from "@/_shared/ui/icon";
import { Button, type ButtonVariant } from "@/_shared/ui/button";

const PROVIDER_CONTENT_MAP = {
    KAKAO: {
        variant: "kakao",
        Icon: KakaoIcon,
        label: "Kakao 로그인으로 시작하기",
    },
} as const satisfies Record<OAuthProvider, {
    label: string;
    Icon: ElementType;
    variant: ButtonVariant;
}>;

type OAuthLoginButtonProps = ComponentProps<"button"> & {
    target: ServiceTarget;
    provider: OAuthProvider;
};

export const OAuthLoginButton = ({
    target,
    provider,
    className,
    ...props
}: OAuthLoginButtonProps) => {

    const { redirect } = useOAuthRedirect();

    // 방어 코드: 맵에 없는 Provider가 들어오면 아무것도 렌더링하지 않음
    const providerContent = PROVIDER_CONTENT_MAP[provider];
    if (!providerContent) return null;

    const { Icon, label, variant } = providerContent;

    return (
        <Button
            type="button"
            variant={variant}
            size="lg"
            fullWidth
            onClick={() => redirect(provider)}
            className={className}
            {...props}
        >
            <Icon />
            <span>{label}</span>
        </Button>
    );
}