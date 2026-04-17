import type { NextConfig } from "next";

const nextConfig: NextConfig = {

    /**
     *  Rewrites는 URL 프록시 역할을 하며, 목적지 경로를 마스킹하여 사용자가 사이트의 위치가 변경되지 않은 것처럼 보이게 합니다.
     *
     *  @see [next-properties-js/rewrites](https://nextjs-ko.org/docs/app/api-reference/next-config-js/rewrites)
     * */
    async rewrites() {

        const hirecoreMemberServerUrl = process.env.HIRECORE_MEMBER_SERVER_URL || "http://localhost:8080";

        return [
            {
                source: "/api/:path*", // 프론트엔드에서 /api/... 로 요청이 오면
                destination: `${hirecoreMemberServerUrl}/api/:path*`, // 백엔드 8080포트로 그대로 전달 (Proxy)
            },
        ];
    },
};

export default nextConfig;