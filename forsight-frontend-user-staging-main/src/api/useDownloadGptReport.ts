import { useMutation } from "@tanstack/react-query";
import { gptPdfReportUrl } from "./apiConstants";
import { useAxiosPrivate } from "./useAxiosPrivate";

const useDownloadGptPdfReport = () => {
  const axiosPrivate = useAxiosPrivate();
  return useMutation({
    mutationKey: ["downloadPdfReportOfNewsGptData"],
    mutationFn: async ({
      payload,
      isSave,
      prompt,
    }: {
      payload: {
        result: string;
        // source: string;
        isUrdu: boolean;
      };
      isSave: boolean;
      prompt: string;
    }) => {
      const response = await axiosPrivate.post<Blob>(
        gptPdfReportUrl,
        { payload, isSave, title: prompt },
        { responseType: "blob" }
      );
      if (response.status !== 200) {
        throw new Error("Failed to fetch the report");
      }

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "PdfReport.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });
};

export default useDownloadGptPdfReport;
