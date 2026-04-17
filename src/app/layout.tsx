import type { Metadata } from "next"
import './globals.css';
import { QueryProvider } from "./_providers/query.provider";

export const metadata: Metadata = {
  title: { default: "HireCore", template: "%s | HireCore" },
  description: "이력서·자기소개서·포트폴리오를 한 곳에서 관리하세요",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning={true}>
            <body>
                <QueryProvider>
                    {children}
                </QueryProvider>
            </body>
        </html>
    );
}