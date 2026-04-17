import { z } from 'zod';

// SSOT: 단일 진실 공급원
export const OAuthProviderSchema = z.enum(['KAKAO']);
export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;

export const OAUTH_PROVIDERS_LIST: readonly OAuthProvider[] = OAuthProviderSchema.options;

export const isValidOAuthProvider = (
    provider: string
): provider is OAuthProvider => {
    return OAuthProviderSchema.safeParse(provider).success;
};
