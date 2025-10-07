import { AiFillDelete } from "react-icons/ai";
import useDeleteProfile from "../../../../api/useDeleteProfile";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useGetParamState from "../../../../hooks/useGetParamsState";

function DeleteProfileButton({ profileId }: { profileId: number }) {
  const { mutate: deleteProfile } = useDeleteProfile();

  const { queryKeysToInvalidateTogether } = useGetParamState();

  const queryClient = useQueryClient();

  function handleDeleteProfile() {
    deleteProfile(profileId, {
      onSuccess: () => {
        toast.success("Profile deleted successfully");

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
            queryKey: ["profiles"],
          })
          .catch((error: unknown) => {
            if (
              axios.isAxiosError<{
                message: string;
              }>(error)
            ) {
              toast.error(error.response?.data.message);
            }
            toast.error("An error occurred while deleting profile");
          });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }
  return (
    <button type="button" onClick={handleDeleteProfile}>
      <AiFillDelete />
    </button>
  );
}

export default DeleteProfileButton;
