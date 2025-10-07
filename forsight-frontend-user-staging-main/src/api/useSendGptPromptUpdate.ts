import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";

type GptResponse = {
  result: string;
  isUrdu: false;
};

export default function useSendGptPromptsUpdate() {
  const axiosPrivate = useAxiosPrivate();
  const baseServiceUrl = "http://192.168.11.60:4444/";

  return useMutation({
    mutationKey: ["sendGptPrompts"],
    mutationFn: async ({ prompt, data }: { prompt: string; data: unknown }) => {
      const response = await axiosPrivate.post<GptResponse>(
        `${baseServiceUrl}process_task/`,
        {
          prompt,
          data,
        }
      );

      return response.data;
    },
  });
}
