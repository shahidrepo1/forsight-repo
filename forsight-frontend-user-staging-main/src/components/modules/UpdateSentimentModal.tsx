import FixedInsetZeroDiv from "../primitives/FixedInsetZeroDiv";
import { PiSmileyFill, PiSmileyMehFill, PiSmileySadFill } from "react-icons/pi";
import type { PlatformType } from "../../utils/typeDefinitions";
import useUpdateSentiment from "../../api/useUpdateSentiment";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
import useGetParamState from "../../hooks/useGetParamsState";
import { useClickAway } from "@uidotdev/usehooks";

function UpdateSentimentModal({
  platform,
  dataId,
  closeModal,
}: {
  platform: PlatformType;
  dataId: string;
  closeModal: () => void;
}) {
  const {
    isPending,
    isError,
    mutate: updateSentiment,
    error,
  } = useUpdateSentiment();
  const queryClient = useQueryClient();
  const { queryKeysToInvalidateTogether } = useGetParamState();
  const ref = useClickAway(() => {
    closeModal();
  });

  function handleUpdateSentiment(
    sentiment: "positive" | "neutral" | "negative"
  ) {
    updateSentiment(
      { platform, dataId, sentiment },
      {
        onSuccess: () => {
          console.log({ queryKey: queryKeysToInvalidateTogether });
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

          closeModal();

          toast.success("Sentiment updated successfully");
        },
        onError: (err) => {
          console.error(err);
          toast.error("Failed to update sentiment, please try again later");
        },
      }
    );
  }

  let errMessage = "";

  if (isError && axios.isAxiosError<{ message: string }>(error)) {
    errMessage = error.response?.data.message
      ? error.message
      : "An error occurred";
  }

  return (
    <FixedInsetZeroDiv>
      <div className="flex items-center justify-center w-full h-full">
        <div
          className="p-3 bg-white rounded-md w-[300px] relative overflow-hidden"
          ref={ref as React.RefObject<HTMLDivElement>}
        >
          <h3 className="text-xl border-b text-aquagreen-500">
            Update Sentiment
          </h3>
          <div
            style={{
              height: "0.75rem",
            }}
          />
          <div className="grid grid-cols-3 gap-2 justify-items-center">
            <button
              type="button"
              onClick={() => {
                handleUpdateSentiment("positive");
              }}
              className="flex items-center justify-center w-8 text-2xl text-green-700 bg-gray-300 rounded-md aspect-square"
              title="Positive"
            >
              <PiSmileyFill />
            </button>
            <button
              type="button"
              onClick={() => {
                handleUpdateSentiment("neutral");
              }}
              className="flex items-center justify-center w-8 text-2xl text-yellow-700 bg-gray-300 rounded-md aspect-square"
              title="Neutral"
            >
              <PiSmileyMehFill />
            </button>
            <button
              type="button"
              onClick={() => {
                handleUpdateSentiment("negative");
              }}
              className="flex items-center justify-center w-8 text-2xl text-red-700 bg-gray-300 rounded-md aspect-square"
              title="Negative"
            >
              <PiSmileySadFill />
            </button>
          </div>
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="w-8 border-2 border-transparent rounded-full border-t-gray-500 animate-spin aspect-square" />
            </div>
          )}
          <div
            style={{
              height: "0.25rem",
            }}
          />
          <div
            className={twMerge(
              "invisible text-red-500 text-sm",
              isError && "visible"
            )}
          >
            {errMessage}
          </div>
        </div>
      </div>
    </FixedInsetZeroDiv>
  );
}

export default UpdateSentimentModal;
