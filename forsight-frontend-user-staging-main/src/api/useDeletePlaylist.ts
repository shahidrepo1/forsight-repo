import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { deletePlayListUrl } from "./apiConstants";

function useDeletePlaylist() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["deletePlaylist"],
    mutationFn: (id: number) => {
      return axiosPrivate.delete(`${deletePlayListUrl}${id.toString()}/`);
    },
  });
}
export default useDeletePlaylist;
