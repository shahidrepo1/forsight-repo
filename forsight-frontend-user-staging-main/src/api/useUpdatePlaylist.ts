import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { updatePlayList } from "./apiConstants";

function useUpdatePlaylist() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["updatePlaylist"],
    mutationFn: ({
      name,
      profiles,
      keywords,
      playlistId,
    }: {
      name: string;
      profiles: string | null;
      keywords: string | null;
      playlistId: number;
    }) => {
      return axiosPrivate.patch(`${updatePlayList}${playlistId.toString()}/`, {
        name,
        profiles,
        keywords,
      });
    },
  });
}
export default useUpdatePlaylist;
