import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { xDetailUrl } from "./apiConstants";
import type { Tweet } from "./useGetXDetails.types";

function GetXDetailsData(id: string) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["xDetails", id],
    queryFn: async () => {
      const response = await axiosPrivate.get<Tweet>(xDetailUrl + id);

      return response.data;
    },
  });
}
export default GetXDetailsData;
