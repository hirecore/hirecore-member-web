import { httpClient } from "@/_shared/config";

export interface LoginCommand {
    authorizationCode: string;
}

export const oauthAxios = {
    login: async (data: LoginCommand) => {
        return await httpClient.post<void>("/api/auth/login/user/kakao", data);
    }
}