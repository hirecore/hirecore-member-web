import { Suspense } from "react";
import { OAuthCallbackView } from "@/_views/auth";

export default function SocialCallbackRouter() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OAuthCallbackView />
        </Suspense>
    );
}