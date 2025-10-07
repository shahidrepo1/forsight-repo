import { FaPlay } from "react-icons/fa6";
import useSuspendKeyword from "../../../../api/useSuspendKeyword";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { FaStop } from "react-icons/fa6";
import axios from "axios";
type SuspendedProps = {
  suspended: boolean;
  keywordId: number;
};

export default function SuspendKeywordButton({
  suspended,
  keywordId,
}: SuspendedProps) {
  const { mutate, isPending } = useSuspendKeyword();
  const queryClient = useQueryClient();
  const handleSuspendKeyword = () => {
    mutate(
      { suspended: !suspended, keywordId },
      {
        onSuccess: () => {
          toast.success("Keyword status changes successfully");

          queryClient
            .invalidateQueries({
              queryKey: ["keywords"],
            })
            .catch((error: unknown) => {
              if (
                axios.isAxiosError<{
                  message: string;
                }>(error)
              ) {
                toast.error(error.response?.data.message);
              }
              toast.error("An error occurred while updating keyword");
            });
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };
  return (
    <button
      title={suspended ? "Resume Keyword" : "Suspend Keyword"}
      className="hover:bg-aquagreen-200 p-1 rounded-full disabled:opacity-50"
      onClick={handleSuspendKeyword}
      disabled={isPending} // Disable button while mutation is pending
    >
      {isPending ? (
        <div className="animate-spin rounded-full border-2 border-gray-500 border-t-transparent w-5 h-5"></div>
      ) : suspended ? (
        <FaPlay />
      ) : (
        // <FaStop />
        <FaStop />
      )}
    </button>
  );
}
