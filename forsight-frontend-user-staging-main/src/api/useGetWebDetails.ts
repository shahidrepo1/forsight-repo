import { useQuery } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { webDetailUrl } from "./apiConstants";
import type { SingleWebRecordType } from "./useGetData.types";

function GetWebDetailsData(id: string) {
  const axiosPrivate = useAxiosPrivate();
  return useQuery({
    queryKey: ["webDetail", id],
    queryFn: async () => {
      const response = await axiosPrivate.get<SingleWebRecordType>(
        webDetailUrl + id
      );

      return response.data;
    },
  });
}
export default GetWebDetailsData;
