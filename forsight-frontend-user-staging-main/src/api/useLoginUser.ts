import { useMutation } from "@tanstack/react-query";
import type { UserDetailType } from "./useLoginUser.types";
import { axiosInstance, loginUrl } from "./apiConstants";

export function useLoginUser() {
  return useMutation({
    mutationKey: ["loginUser"],
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await axiosInstance.post<UserDetailType>(loginUrl, {
        ...data,
        portal: "user",
      });

      return response.data;
    },
  });
}
