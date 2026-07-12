"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const setAuth =
        useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const accessToken =
            localStorage.getItem("accessToken");

        const refreshToken =
            localStorage.getItem("refreshToken");

        const memberString =
            localStorage.getItem("member");

        if (
            !accessToken ||
            !refreshToken ||
            !memberString
        ) {
            return;
        }

        const member = JSON.parse(memberString);

        setAuth(
            accessToken,
            refreshToken,
            member,
        );
    }, [setAuth]);

    return children;
}