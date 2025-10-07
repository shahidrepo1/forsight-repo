import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useGetParamState from "../hooks/useGetParamsState";
import { reportingServiceApiUrl } from "./apiConstants";

export default function useGeneratePdfReport() {
  const { generalParams } = useGetParamState();

  return useQuery({
    queryKey: ["generatePdfReport"],
    queryFn: () => {
      return axios.get(reportingServiceApiUrl, {
        params: {
          ...generalParams,
        },
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
    },
    enabled: false,
  });
}
