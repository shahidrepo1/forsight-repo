import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { youtubeDetailUrl } from "./apiConstants";
import type { YouTubeVideoDetail } from "./useGetYoutubeDetails.types";

function GetYoutubeDetailsData(id: string) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["youtubeDetail", id],
    queryFn: async () => {
      const response = await axiosPrivate.get<YouTubeVideoDetail>(
        youtubeDetailUrl + id
      );

      return response.data;
    },
  });
}
export default GetYoutubeDetailsData;
