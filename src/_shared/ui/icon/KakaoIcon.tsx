import { ComponentProps } from "react";
import { RiKakaoTalkFill } from "react-icons/ri";
import { tailwindUtils } from "@/_shared/lib";

export const KakaoIcon = ({ className, ...props }: ComponentProps<"svg">) => {
    return (
        <RiKakaoTalkFill
            className={tailwindUtils(
                "w-8 h-8 bg-transparent text-[#000000]",
                className
            )}
            {...props}
        />
    );
};