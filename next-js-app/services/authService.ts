import { apiClient } from "@/lib/apiClient";

import type { ApiResponse } from "@/types/api";

import type {
    LoginRequest,
    LoginResponse,
    SignupRequest,
    SignupResponse,
    ReissueTokenResponse,
} from "@/types/auth";
import axios from "axios";
import { env } from "process";

export async function signup(
    request: SignupRequest,
): Promise<SignupResponse> {
    const response = await apiClient.post<
        ApiResponse<SignupResponse>
    >("/api/auth/signup", request);

    return response.data.data;
}

export async function login(
    request: LoginRequest,
): Promise<LoginResponse> {
    const response = await apiClient.post<
        ApiResponse<LoginResponse>
    >("/api/auth/login", request);

    return response.data.data;
}

export async function reissueToken(): Promise<ReissueTokenResponse> {
    const refreshToken =
        localStorage.getItem("refreshToken");

    const response = await apiClient.post<
        ApiResponse<ReissueTokenResponse>
    >("/api/auth/reissue", {
        refreshToken,
    });

    return response.data.data;
}

const authClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    await authClient.post("/api/auth/logout", {
      refreshToken,
    });
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("member");
  }
}