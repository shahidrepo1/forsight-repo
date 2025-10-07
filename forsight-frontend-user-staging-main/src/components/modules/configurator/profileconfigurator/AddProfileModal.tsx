import FixedInsetZeroDiv from "../../../primitives/FixedInsetZeroDiv";
import Input from "../../login/Input";
import { MdAddLink } from "react-icons/md";
import { type MutableRefObject, useState } from "react";
import { useClickAway } from "@uidotdev/usehooks";
import useAddNewProfile from "../../../../api/useAddNewProfile";
import { toast } from "react-toastify";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import useUrlUtils from "../../../../hooks/useUrlUtils";

function AddProfileModal({ closeModal }: { closeModal: () => void }) {
  const [profileLink, setProfileLink] = useState("");
  const { mutate: addNewProfile } = useAddNewProfile();
  const ref = useClickAway(() => {
    closeModal();
  });
  const queryClient = useQueryClient();
  const { normalizeURL } = useUrlUtils();

  const [errMessage, setErrMessage] = useState("none");
  const [selectedModels, setSelectedModels] = useState<Array<string>>([]);

  console.log({ selectedModels });

  const handleModelChange = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  function onSubmitSuccess() {
    toast.success("Profile Added Successfully");
    queryClient
      .invalidateQueries({
        queryKey: ["profiles"],
      })
      .catch(() => {
        toast.error("Failed to fetch profiles");
      });
    closeModal();
  }

  function onSubmitError(error: unknown) {
    if (
      axios.isAxiosError<{
        message: string;
      }>(error)
    ) {
      const errMsg = error.response?.data.message ?? "Failed to add profile";

      toast.error(errMsg);
      setErrMessage(errMsg);
      return;
    }

    setErrMessage("Failed to add profile");
    toast.error("Failed to add profile");
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrMessage("none");
    const isValidUrl = normalizeURL(profileLink);

    if (isValidUrl) {
      addNewProfile(
        { profile: isValidUrl },
        {
          onSuccess: onSubmitSuccess,
          onError: onSubmitError,
        }
      );
    } else {
      toast.error("Invalid URL");
      setErrMessage("Invalid URL");
    }
  }

  return (
    <FixedInsetZeroDiv>
      <div
        className="w-[500px] bg-white rounded-md space-y-4 px-4 py-4 dark:text-dark-text dark:bg-dark-bg"
        ref={ref as MutableRefObject<HTMLDivElement>}
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-aquagreen-500">
          <span>
            <MdAddLink />
          </span>
          Add New Profile
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Profile Link Input */}
          <Input
            type="text"
            placeholder="Profile Link"
            icon={<MdAddLink />}
            value={profileLink}
            onChange={(e) => {
              setProfileLink(e.target.value);
            }}
            autoFocus
            required
          />

          {/* Model Checkboxes */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-aquagreen-500">
              Select Models
            </p>
            <div className="flex flex-wrap gap-4">
              {["stt", "fr", "sr", "ocr"].map((model) => (
                <label key={model} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={model}
                    checked={selectedModels.includes(model)}
                    onChange={() => {
                      handleModelChange(model);
                    }}
                    className="accent-aquagreen-500"
                  />
                  <span className="capitalize">{model}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-9 px-3 text-sm text-white rounded-md bg-aquagreen-500"
          >
            Add Profile
          </button>

          {/* Error Message */}
          <p
            className={twMerge(
              "text-xs text-red-500 invisible",
              errMessage !== "none" && "visible"
            )}
          >
            {errMessage}
          </p>
        </form>
      </div>
    </FixedInsetZeroDiv>
  );
}

export default AddProfileModal;
