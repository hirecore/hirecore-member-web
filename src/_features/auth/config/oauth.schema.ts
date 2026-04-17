import { z } from "zod";

export const oAuthAuthPropertiesSchema = z.object({
    authUrl: z.url({error: "유효하지 않은 AuthURL 형식입니다."}),
    clientId: z.string({error: "유효하지 않은 clientId 형식입니다."}),
    redirectUrl: z.url({error: "유효하지 않은 redirectUri 형식입니다."}),
})
export type OAuthAuthProperties = z.infer<typeof oAuthAuthPropertiesSchema>;