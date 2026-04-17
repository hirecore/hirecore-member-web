import { z } from "zod";

export const userEmailLoginRequestSchema = z.object({
    email: z.email({
        error: "올바른 이메일 형식이 아닙니다.",
    }),

    password: z.string().min(6, { error: "비밀번호는 최소 6자 이상이어야 합니다." }),
});
export type UserEmailLoginRequest = z.infer<typeof userEmailLoginRequestSchema>;
