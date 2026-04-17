"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginCommand, oauthAxios } from "@/_features/auth/api/oauth.api";
import { USER_ROUTES } from "@/_shared/config";

export const useOAuthLoginMutation = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: LoginCommand) => oauthAxios.login(data),

        onSuccess: () => {
            router.replace(USER_ROUTES.home);
        },

        onError: () => {
            router.push(USER_ROUTES.auth.login);
        }
    });
};