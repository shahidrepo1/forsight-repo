import React, { type MutableRefObject, useState } from "react";
import FixedInsetZeroDiv from "../../../primitives/FixedInsetZeroDiv";
import { useClickAway } from "@uidotdev/usehooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";
import { MdAddLink } from "react-icons/md";
import Input from "../../login/Input";
import { twMerge } from "tailwind-merge";
import useAddNewKeyword from "../../../../api/useAddNewKeyword";
import type { PlatformType } from "../../../../utils/typeDefinitions";

function AddKeywordModal({ closeModal }: { closeModal: () => void }) {
  const [keyword, setKeyword] = useState("");
  const [platforms, setPlatforms] = useState<Record<PlatformType, boolean>>({
    facebook: false,
    x: false,
    web: false,
    youtube: false,
  });
  const { mutate: addNewKeyword } = useAddNewKeyword();
  const ref = useClickAway(() => {
    closeModal();
  });
  const queryClient = useQueryClient();

  const [errMessage, setErrMessage] = useState("none");

  function ifAnyPlatformSelected() {
    return Object.values(platforms).some((val) => val);
  }

  function handlePlatformChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target;

    if (name === "facebook") {
      toast.error("Facebook platform can't be selected right now");
      return;
    }

    setPlatforms((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }

  function onSubmitSuccess() {
    toast.success("Keyword Added Successfully");
    queryClient
      .invalidateQueries({
        queryKey: ["keywords"],
      })
      .catch(() => {
        toast.error("Failed to fetch keywords");
      });
    closeModal();
  }

  function onSubmitError(error: unknown) {
    if (
      axios.isAxiosError<{
        message: string;
      }>(error)
    ) {
      const errMsg = error.response?.data.message ?? "Failed to add keyword";

      toast.error(errMsg);
      setErrMessage(errMsg);
      return;
    }

    setErrMessage("Failed to add keyword");
    toast.error("Failed to add keyword");
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrMessage("none");

    if (!keyword.trim()) {
      toast.error("Keyword cannot be empty");
      setErrMessage("Keyword cannot be empty");
      return;
    }

    if (!ifAnyPlatformSelected()) {
      toast.error("Select at least one platform");
      setErrMessage("Select at least one platform");
      return;
    }

    // const selectedPlatforms = Object.keys(platforms).filter(
    //   (platform) => platforms[platform]
    // );

    const selectedPlatforms: Array<PlatformType> = [];

    for (const platform in platforms) {
      if (platforms[platform as PlatformType]) {
        selectedPlatforms.push(platform as PlatformType);
      }
    }

    addNewKeyword(
      { keyword, platforms: selectedPlatforms },
      {
        onSuccess: onSubmitSuccess,
        onError: onSubmitError,
      }
    );
  }

  return (
    <FixedInsetZeroDiv>
      <div
        className="w-[500px] bg-white rounded-md space-y-4 px-3 py-3 dark:text-dark-text dark:bg-dark-bg"
        ref={ref as MutableRefObject<HTMLDivElement>}
      >
        <h3 className="flex items-center gap-2 text-lg font-semibold text-aquagreen-500">
          <span>
            <MdAddLink />
          </span>{" "}
          Add New Keyword
        </h3>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Keyword"
            icon={<MdAddLink />}
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
            }}
            autoFocus
          />
          <div className="grid grid-cols-4 gap-4">
            <PlatformCheckbox
              slug="facebook"
              platform="Facebook"
              isChecked={platforms.facebook}
              onChange={handlePlatformChange}
            />
            <PlatformCheckbox
              slug="x"
              platform="X"
              isChecked={platforms.x}
              onChange={handlePlatformChange}
            />
            <PlatformCheckbox
              slug="youtube"
              platform="Youtube"
              isChecked={platforms.youtube}
              onChange={handlePlatformChange}
            />
            <PlatformCheckbox
              slug="web"
              platform="Web"
              isChecked={platforms.web}
              onChange={handlePlatformChange}
            />
          </div>
          <button
            type="submit"
            className="w-full h-6 px-3 text-sm text-white rounded-md bg-aquagreen-500"
          >
            Add Keyword
          </button>
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

export default AddKeywordModal;

function PlatformCheckbox({
  platform,
  slug,
  onChange,
  isChecked,
}: {
  platform: string;
  slug: PlatformType;
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label htmlFor={slug} className="flex items-center justify-center gap-2">
      <input
        type="checkbox"
        name={slug}
        id={slug}
        checked={isChecked}
        onChange={onChange}
      />
      <p>{platform}</p>
    </label>
  );
}
