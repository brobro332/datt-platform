import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

type CustomAxiosRequestConfig =
    InternalAxiosRequestConfig & {
        _retry?: boolean;
    };

type ReissueTokenResponse = {
    accessToken: string;
};

type ApiResponse<T> = {
    success: boolean;
    data: T;
    message?: string;
};

export const apiClient = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

const authClient = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;

type PendingRequestCallback = {
    resolve: (token: string) => void;
    reject: (error: any) => void;
};

let pendingRequests: PendingRequestCallback[] = [];

apiClient.interceptors.request.use((config) => {
    if (typeof window === "undefined") {
        return config;
    }

    const accessToken =
        localStorage.getItem("accessToken");

    if (accessToken) {
        config.headers.Authorization =
            `Bearer ${accessToken}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest =
            error.config as
                | CustomAxiosRequestConfig
                | undefined;

        const status = error.response?.status;

        // 401 Unauthorized 또는 403 Forbidden인 경우 토큰 재발급/초기화 대상
        if (
            !originalRequest ||
            (status !== 401 && status !== 403)
        ) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            clearAuthAndRedirect();

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingRequests.push({
                    resolve: (token: string) => {
                        originalRequest.headers.Authorization =
                            `Bearer ${token}`;
                        resolve(apiClient(originalRequest));
                    },
                    reject: (err: any) => {
                        reject(err);
                    },
                });
            });
        }

        isRefreshing = true;

        try {
            const refreshToken =
                localStorage.getItem(
                    "refreshToken",
                );

            if (!refreshToken) {
                rejectPendingRequests(error);
                clearAuthAndRedirect();

                return Promise.reject(error);
            }

            const response =
                await authClient.post<
                    ApiResponse<ReissueTokenResponse>
                >("/api/auth/reissue", {
                    refreshToken,
                });

            const newAccessToken =
                response.data.data.accessToken;

            localStorage.setItem(
                "accessToken",
                newAccessToken,
            );

            // 대기 중인 모든 요청 성공 처리
            pendingRequests.forEach((cb) =>
                cb.resolve(newAccessToken),
            );
            pendingRequests = [];

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return apiClient(originalRequest);
        } catch (reissueError) {
            rejectPendingRequests(reissueError);
            clearAuthAndRedirect();

            return Promise.reject(reissueError);
        } finally {
            isRefreshing = false;
        }
    },
);

function rejectPendingRequests(error: any) {
    pendingRequests.forEach((cb) => cb.reject(error));
    pendingRequests = [];
}

function clearAuthAndRedirect() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("member");

    try {
        useAuthStore.getState().logout();
    } catch {
        // ignore if store not initialized
    }

    window.location.href = "/login";
}