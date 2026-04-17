import axios, { AxiosError, type AxiosInstance } from 'axios';
import { USER_ROUTES } from "./user-routes.constants";

// Axios 인스턴스 생성
export const httpClient: AxiosInstance = axios.create({
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

httpClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        if (error.response) {
            const { status } = error.response;

            if (status === 401) {
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                    window.location.href = USER_ROUTES.auth.login;
                }
            }

            if (status >= 500) {
                console.error('서버 에러가 발생했습니다.');
            }
        }

        return Promise.reject(error);
    }
);