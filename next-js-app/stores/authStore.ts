import { create } from "zustand";

type AuthMember = {
  memberId: number;
  nickname: string;
};

type AuthState = {
    isLoggedIn: boolean;

    accessToken: string | null;

    refreshToken: string | null;

    member: {
        memberId: number;
        nickname: string;
    } | null;

    setAuth: (
        accessToken: string,
        refreshToken: string,
        member: {
            memberId: number;
            nickname: string;
        },
    ) => void;

    logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  member: null,
  isLoggedIn: false,

  setAuth: (accessToken, refreshToken, member) =>
    set({
      accessToken,
      refreshToken,
      member,
      isLoggedIn: true,
    }),

  restoreAuth: () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const memberJson = localStorage.getItem("member");

    if (!accessToken || !refreshToken || !memberJson) {
      return;
    }

    set({
      accessToken,
      refreshToken,
      member: JSON.parse(memberJson) as AuthMember,
      isLoggedIn: true,
    });
  },

  clearAuth: () =>
    set({
      accessToken: null,
      refreshToken: null,
      member: null,
      isLoggedIn: false,
    }),

  logout: () =>
    set({
        isLoggedIn: false,
        accessToken: null,
        refreshToken: null,
        member: null,
    }),
}));