"use client";

// _views/auth/ui | OAuth 콜백 처리 뷰 — 소셜 로그인 결과 수신 후 리다이렉트
import "./oauth-callback-view.scss";
import { useProcessOAuthCallback } from "@/_features/auth";

export function OAuthCallbackView() {
    useProcessOAuthCallback()

    return (
        <div className="soc-root">
            <p className="soc-text">로그인 처리 중입니다...</p>
        </div>
    );
}
