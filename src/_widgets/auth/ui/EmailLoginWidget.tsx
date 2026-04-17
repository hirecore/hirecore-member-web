import Link from "next/link";
import { EmailLoginForm, EmailLoginRecoveryLinks } from "@/_features/auth";

export const EmailLoginWidget = () => {
    return (
        <section className="flex flex-col gap-6 w-full">
            {/* 1. 로그인 폼 + 복구 링크 주입 */}
            <EmailLoginForm
                recoveryContent={<EmailLoginRecoveryLinks />}
            />

            {/* 2. 회원가입 링크 (이메일 인증의 연장선) */}
            <div className="flex items-center gap-1 text-[13px] text-gray-500 leading-tight">
                <span className="text-gray-500 transition-colors">
                    아직 회원이 아니신가요?
                </span>
                <Link
                    href="#"
                    className="text-gray-500 underline underline-offset-2 hover:text-black transition-colors"
                >
                    회원가입 하기
                </Link>
            </div>
        </section>
    );
};
