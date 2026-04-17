import Link from "next/link";

export const EmailLoginRecoveryLinks = () => {
    return (
        // [수정] items-start: 왼쪽 정렬
        // mt-2: 비밀번호 입력창과의 간격 확보
        <div className="mt-2 flex flex-col gap-1 text-[13px] text-gray-500 items-start leading-tight">
            <div className="flex items-center gap-1">
                <span>이메일을 잊어버리셨나요?</span>
                <Link
                    href="#"
                    className="text-gray-500 underline underline-offset-2 hover:text-black transition-colors"
                >
                    이메일 찾기
                </Link>
            </div>
            <div className="flex items-center gap-1">
                <span>비밀번호를 잊어버리셨나요?</span>
                <Link
                    href="#"
                    className="text-gray-500 underline underline-offset-2 hover:text-black transition-colors"
                >
                    비밀번호 찾기
                </Link>
            </div>
        </div>
    );
};