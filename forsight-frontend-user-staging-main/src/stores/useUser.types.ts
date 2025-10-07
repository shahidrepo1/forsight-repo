import type { UserDetailType } from "../api/useLoginUser.types";

export type UserStateMethods = {
  setUser: (user: UserDetailType) => void;
  updateAccessToken: (accessToken: string) => void;
  clearUser: () => void;
};

export type UserStateType = UserDetailType & UserStateMethods;
