import { z } from "zod";

export const envSchema = z.object({
    NEXT_PUBLIC_KAKAO_CLIENT_ID: z.string().min(1, {error: "유효하지 않은 KAKAO_CLIENT_ID 형식입니다."}),
    NEXT_PUBLIC_KAKAO_REDIRECT_URL: z.url({error: "유효하지 않은 KAKAO_REDIRECT_URL 형식입니다."}),
    NEXT_PUBLIC_KAKAO_AUTH_CODE_URL: z.url({error: "유효하지 않은 KAKAO_AUTH_CODE_URL 형식입니다."}),
});

const processEnv = {
    NEXT_PUBLIC_KAKAO_CLIENT_ID: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
    NEXT_PUBLIC_KAKAO_REDIRECT_URL: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URL,
    NEXT_PUBLIC_KAKAO_AUTH_CODE_URL: process.env.NEXT_PUBLIC_KAKAO_AUTH_CODE_URL,
};

// 화이트리스트 방식
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
    console.error("❌ 환경 변수 설정 오류: (todo: 추가 동적 데이터 처리)");
    throw new Error("환경 변수 설정 오류로 인해 앱을 실행할 수 없습니다.");
}

export const env = parsed.data;