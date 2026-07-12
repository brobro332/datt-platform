export type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
  verificationCode: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  nickname: string;
  isNewMember?: boolean;
};

export type SignupResponse = {
  memberId: number;
  email: string;
  nickname: string;
};

export type ReissueTokenResponse = {
    accessToken: string;
    refreshToken: string;
};