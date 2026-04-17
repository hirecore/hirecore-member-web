import { z } from "zod";

// SSOT: 단일 진실 공급원
export const ServiceTargetSchema = z.enum(['USER']);
export type ServiceTarget = z.infer<typeof ServiceTargetSchema>;

export const SERVICE_TARGET_LIST: readonly ServiceTarget[] = ServiceTargetSchema.options;

export const isValidServiceTarget = (
    target: string
): target is ServiceTarget => {
    return ServiceTargetSchema.safeParse(target).success;
}
