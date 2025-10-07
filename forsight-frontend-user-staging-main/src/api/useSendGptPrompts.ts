import { useMutation } from "@tanstack/react-query";
import { useAxiosPrivate } from "./useAxiosPrivate";

type GptResponse = {
  result: string;
  isUrdu: false;
};

export default function useSendGptPrompts() {
  const axiosPrivate = useAxiosPrivate();
  const baseServiceUrl = import.meta.env.VITE_NEWS_GPT_SERVICE_URL as string;

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
