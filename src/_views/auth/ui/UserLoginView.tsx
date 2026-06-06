"use client"

// _views/auth/ui | 로그인 뷰 — 이메일 로그인 + 소셜 OAuth 로그인 버튼 조합
// 이미 로그인된 사용자가 진입하면 useGuestGuard 가 홈으로 즉시 리다이렉트한다.
import { EmailLoginWidget } from "@/_widgets/auth"
import { OAuthLoginButtonList, useGuestGuard } from "@/_features/auth"
import "./user-login-view.scss";

export default function UserLoginView() {
    const { isLoading, user } = useGuestGuard()

    // 인증 확인 중이거나 이미 로그인된 상태(리다이렉트 직전) 에는 폼을 그리지 않는다 —
    // 깜빡임 방지
    if (isLoading || user) return null

    return (
        <main className="ulp-root">
            <div className="ulp-panel">

                {/* 1. 헤더 */}
                <div className="ulp-header">
                    <h1 className="ulp-title">HireCore 로그인 서비스</h1>
                </div>

                {/* 2. 이메일 로그인 */}
                <EmailLoginWidget />

                {/* 3. 구분선 (또는) */}
                <div className="ulp-divider">
                    <div className="ulp-divider__line"><span /></div>
                    <div className="ulp-divider__label"><span>또는</span></div>
                </div>

                {/* 4. 소셜 로그인 (카카오만 나옴) */}
                <section className="w-full">
                  <OAuthLoginButtonList target="USER" />
                </section>

            </div>
        </main>
    );
}
