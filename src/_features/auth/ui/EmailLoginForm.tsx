"use client";

import { useForm } from "react-hook-form";
import { UserEmailLoginRequest, userEmailLoginRequestSchema } from "@/_features/auth/model/auth-by-email.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { Button } from "@/_shared/ui/button"
import { Form } from "@/_shared/ui/form"
import { Input } from "@/_shared/ui/input"
import { Label } from "@/_shared/ui/label"

interface EmailLoginFormProps {
    recoveryContent?: ReactNode;
}

export const EmailLoginForm = ({ recoveryContent }: EmailLoginFormProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UserEmailLoginRequest>({
        resolver: zodResolver(userEmailLoginRequestSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (data: UserEmailLoginRequest) => {
        // ... submit logic
    };

    return (
        <Form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">

            {/* 1. 입력 필드 영역 */}
            <div className="space-y-4">
                {/* 이메일 */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email" requiredMark className="text-base font-bold text-black">
                        이메일
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        // 타겟 이미지: 테두리가 뚜렷하고 각진 느낌 (rounded-none 또는 sm)
                        className="h-12 border-gray-400 rounded-sm"
                        hasError={!!errors.email}
                        {...register("email")}
                    />
                    <ErrorMessage message={errors.email?.message} />
                </div>

                {/* 비밀번호 */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password" requiredMark className="text-base font-bold text-black">
                        비밀번호
                    </Label>
                    <Input
                        id="password"
                        type="password"
                        className="h-12 border-gray-400 rounded-sm"
                        hasError={!!errors.password}
                        {...register("password")}
                    />
                    <ErrorMessage message={errors.password?.message} />

                    {/* [핵심] 복구 링크를 비밀번호 인풋 바로 밑에 위치시킴 */}
                    {recoveryContent}
                </div>
            </div>

            {/* 2. 로그인 버튼 */}
            {/* 타겟 이미지: 연한 보라색 배경, 흰색 글씨, 매우 큼 */}
            <Button
                type="submit"
                variant="softblue"
                size="lg"
                fullWidth
                disabled={isSubmitting}
                className="h-14 text-xl font-bold rounded-sm mt-4"
            >
                로그인
            </Button>

        </Form>
    );
};

const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <span className="text-xs font-medium text-red-500">{message}</span>;
};