import { redirect } from 'next/navigation';

export async function serverFetch(url: string, options: RequestInit = {}): Promise<unknown> {
    const API_BASE_URL = process.env.HIRECORE_MEMBER_SERVER_URL || 'http://localhost:8080';

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (response.status === 401) {
        // 서버 액션 전용 리다이렉트 (window.location 대신 사용)
        redirect('/login');
    }

    if (!response.ok) {
        throw new Error('서버 통신 중 에러가 발생했습니다.');
    }

    return response.json();
}