import { refreshUrl } from "./apiConstants";
import { useUser } from "../stores/useUser";
import axios from "axios";
import type { UserDetailType } from "./useLoginUser.types";

export const useRefreshToken = () => {
  const { refreshToken } = useUser();

  async function refresh() {
    return await axios.post<UserDetailType>(
      refreshUrl,
      {
        refreshToken: refreshToken || "",
      },
      {
        withCredentials: true,
      }
    );
  }

  return refresh;
};
