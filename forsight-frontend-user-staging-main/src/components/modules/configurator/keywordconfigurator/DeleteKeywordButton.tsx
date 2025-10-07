import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useGetParamState from "../../../../hooks/useGetParamsState";
import useDeleteKeyword from "../../../../api/useDeleteKeyword";

function DeleteKeywordButton({ keywordId }: { keywordId: number }) {
  const { mutate: deleteProfile } = useDeleteKeyword();

  const { queryKeysToInvalidateTogether } = useGetParamState();

  const queryClient = useQueryClient();

  function handleDeleteProfile() {
    deleteProfile(keywordId, {
      onSuccess: () => {
        toast.success("Keyword deleted successfully");

        queryClient
          .invalidateQueries({
            predicate: (query) => {
              return queryKeysToInvalidateTogether.some((key) =>
                query.queryKey.includes(key)
              );
            },
          })

          .catch((err: unknown) => {
            console.error(err);
          });

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
            toast.error("An error occurred while deleting keyword");
          });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }
  return (
    <button
      type="button"
      onClick={handleDeleteProfile}
      title="Delete keyword"
      className="hover:bg-aquagreen-200 p-1 rounded-full"
    >
      <AiFillDelete />
    </button>
  );
}

export default DeleteKeywordButton;
