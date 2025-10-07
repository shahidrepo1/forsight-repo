import { create } from "zustand";
import type { UserStateType } from "./useUser.types";
import type { UserDetailType } from "../api/useLoginUser.types";
import { browserStorageKeys } from "../utils/constants";

const initialUserState: UserDetailType = {
  accessToken: "",
  profileId: 0,
  profilePic: "",
  refreshToken: localStorage.getItem(browserStorageKeys.refreshToken) ?? "",
  userEmail: "",
  userName: "",
  userType: "user",
  uuid: 0,
};

export const useUser = create<UserStateType>()((set) => ({
  ...initialUserState,
  setUser(user) {
    set(user);
  },
  updateAccessToken(accessToken) {
    set({ accessToken });
  },
  clearUser() {
    set(initialUserState);
  },
}));

// if (import.meta.env.DEV) {
//   mountStoreDevtool("auth", useUser);
// }
