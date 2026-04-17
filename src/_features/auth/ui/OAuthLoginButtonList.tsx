import { tailwindUtils } from "@/_shared/lib";
import { OAUTH_PROVIDERS_LIST } from "@/_shared/model";
import { ServiceTarget } from "@/_shared/model";
import { OAuthLoginButton } from "./OAuthLoginButton";

interface OAuthLoginButtonListProps {
    target: ServiceTarget;
    className?: string;
}

export const OAuthLoginButtonList = ({ target, className }: OAuthLoginButtonListProps) => {
    return (
        <div className={tailwindUtils("flex w-full flex-col gap-y-3", className)}>
            {OAUTH_PROVIDERS_LIST.map((provider) => (
                <OAuthLoginButton
                    key={provider}
                    provider={provider}
                    target={target}
                />
            ))}
        </div>
    );
};