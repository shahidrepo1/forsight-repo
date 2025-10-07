import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { createPlayList } from "./apiConstants";

function useCreatePlaylist() {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["playlist"],
    mutationFn: ({
      playlistName,
      profiles,
      keywords,
    }: {
      playlistName: string;
      profiles: string | null;
      keywords: string | null;
    }) => {
      return axiosPrivate.post(createPlayList, {
        name: playlistName,
        profiles,
        keywords,
      });
    },
  });
}
export default useCreatePlaylist;
