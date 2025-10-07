import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { getPlayList } from "./apiConstants";
import type { PlayListType } from "./useGetPlayList.types";

export function useGetPlayList() {
  const axiosPrivate = useAxiosPrivate();

  return useQuery({
    queryKey: ["playList"],
    queryFn: () => {
      return axiosPrivate.get<PlayListType>(getPlayList);
    },
  });
}
