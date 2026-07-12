import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/lib/env";

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

let pendingRequests: Array<
    (token: string) => void
> = [];

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

        if (
            !originalRequest ||
            error.response?.status !== 401
        ) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            clearAuthAndRedirect();

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve) => {
                pendingRequests.push(
                    (token: string) => {
                        originalRequest.headers.Authorization =
                            `Bearer ${token}`;

                        resolve(
                            apiClient(originalRequest),
                        );
                    },
                );
            });
        }

        isRefreshing = true;

        try {
            const refreshToken =
                localStorage.getItem(
                    "refreshToken",
                );

            if (!refreshToken) {
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

            pendingRequests.forEach(
                (callback) =>
                    callback(newAccessToken),
            );

            pendingRequests = [];

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return apiClient(originalRequest);
        } catch (reissueError) {
            clearAuthAndRedirect();

            return Promise.reject(reissueError);
        } finally {
            isRefreshing = false;
        }
    },
);

function clearAuthAndRedirect() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("member");

    window.location.href = "/login";
}