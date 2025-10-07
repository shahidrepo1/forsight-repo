import FixedInsetZeroDiv from "../../primitives/FixedInsetZeroDiv";
import { IoMdClose } from "react-icons/io";
import { useGetConfiguredProfile } from "../../../api/useGetConfiguredProfile";
import { useGetConfiguredKeyword } from "../../../api/useGetConfiguredKeyword";
import { useState, useEffect, type FormEvent } from "react";
import { useSelectedPlaylist } from "../../../stores/useSelectedPlaylist";
import useCreatePlaylist from "../../../api/useCreatePlaylist";
import { toast } from "react-toastify";
import useUpdatePlaylist from "../../../api/useUpdatePlaylist";
import { useQueryClient } from "@tanstack/react-query";
import { useClickAway } from "@uidotdev/usehooks";
import axios from "axios";

function UpdatePlaylistModal({
  setIsUpdatePlaylistModalOpen,
  playlistName,
  submitKey = "create",
  playlistId,
}: {
  setIsUpdatePlaylistModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  playlistName?: string;
  submitKey?: string;
  playlistId?: number;
}) {
  const ref = useClickAway(() => {
    setIsUpdatePlaylistModalOpen(false);
  });

  const { data, isLoading, error, isError } = useGetConfiguredProfile({
    enabled: true,
  });
  const { data: keywordData } = useGetConfiguredKeyword({ enabled: true });
  const [playlist, setPlaylist] = useState("");
  const [profileSearchQuery, setProfileSearchQuery] = useState("");
  const [keywordSearchQuery, setKeywordSearchQuery] = useState("");

  const { mutate: updatePlaylist } = useUpdatePlaylist();

  const profileData = data?.profiles;
  const keyword = keywordData?.keywords;

  const filteredProfiles = profileData?.filter((profile) =>
    profile.profileUrl.toLowerCase().includes(profileSearchQuery.toLowerCase())
  );

  const filteredKeywords = keyword?.filter((profile) =>
    profile.keyword.toLowerCase().includes(keywordSearchQuery.toLowerCase())
  );

  const {
    selectedProfiles,
    toggleProfile,
    clearProfiles,
    selectedKeywords,
    toggleKeyword,
    clearKeywords,
  } = useSelectedPlaylist();
  const { mutate, isPending } = useCreatePlaylist();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (playlistName) {
      setPlaylist(playlistName);
    }
  }, [playlistName]);

  const handleProfileChange = (id: number) => {
    toggleProfile(id);
  };
  const handleKeywordChange = (id: number) => {
    toggleKeyword(id);
  };

  if (isLoading) {
    return (
      <div>
        <h1>loading....</h1>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">{error.message}</div>;
  }
  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const profiles = selectedProfiles.join(",");
    const keywords = selectedKeywords.join(",");
    const playlistIdValue = playlistId ?? 0;

    if (!profiles && !keywords) {
      toast.error("Please select at least one keyword or one profile");
      return;
    }

    const commonSuccessHandler = () => {
      toast.success(
        submitKey === "create"
          ? "Playlist created successfully!"
          : "Playlist updated successfully!"
      );
      setPlaylist("");
      clearProfiles();
      clearKeywords();
      setIsUpdatePlaylistModalOpen(false);
    };

    const commonData = {
      playlistName: playlist,
      profiles: profiles ? profiles : null,
      keywords: keywords ? keywords : null,
    };

    if (submitKey === "create") {
      mutate(commonData, {
        onSuccess: () => {
          queryClient
            .invalidateQueries({ queryKey: ["playList"] })
            .catch(() => {
              console.error("error in invalidating query");
            });
          commonSuccessHandler();
        },
        onError: (error: unknown) => {
          if (
            axios.isAxiosError<{
              message: string;
            }>(error)
          ) {
            console.error("Axios error:", error.response?.data);
            toast.error(error.response?.data.message);
          } else {
            console.error("Unexpected error:", error);
          }
        },
      });
    } else {
      updatePlaylist(
        {
          ...commonData,
          name: playlist,
          playlistId: playlistIdValue,
        },
        {
          onSuccess: () => {
            queryClient
              .invalidateQueries({ queryKey: ["playList"] })
              .catch(() => {
                console.error("error in invalidating query");
              });
            commonSuccessHandler();
          },
          onError: (error: unknown) => {
            if (
              axios.isAxiosError<{
                message: string;
              }>(error)
            ) {
              console.error("Axios error:", error.response?.data);
              toast.error(error.response?.data.message);
            } else {
              console.error("Unexpected error:", error);
            }
          },
        }
      );
    }
  }

  return (
    <FixedInsetZeroDiv>
      <div
        className="w-full max-w-2xl max-h-full p-4 space-y-3 overflow-y-auto bg-white rounded-lg  dark:bg-dark-bg "
        ref={ref as React.RefObject<HTMLDivElement>}
      >
        <div className="flex justify-end">
          <button
            onClick={() => {
              setIsUpdatePlaylistModalOpen(false);
              clearProfiles();
              clearKeywords();
            }}
            className="dark:text-dark-text dark:bg-dark-bg"
          >
            <IoMdClose size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            <input
              type="search"
              id="default-search"
              className="w-full p-2 text-sm border rounded-lg outline-none text-aquagreen-900 border-aquagreen-700 bg-white-50 dark:text-dark-text dark:bg-dark-bg"
              placeholder="Playlist Name"
              required
              value={playlist}
              onChange={(e) => {
                setPlaylist(e.target.value);
              }}
              maxLength={40}
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-4 text-sm font-medium text-white rounded-lg bg-aquagreen-700 hover:bg-aquagreen-800 dark:bg-aquagreen-600 dark:hover:bg-aquagreen-700 dark:focus:ring-aquagreen-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitKey}
            </button>
          </div>
        </form>

        <h1 className="text-lg font-semibold text-aquagreen-700 dark:text-dark-text dark:bg-dark-bg">
          Profile
        </h1>
        <div className="flex flex-col p-3 space-y-2 overflow-y-scroll bg-white rounded-lg shadow-sm shadow-aquagreen-700 max-h-60 scrollbar-thin scrollbar-thumb-aquagreen-700 scrollbar-track-aquagreen-100 dark:bg-light-bg dark:scrollbar-thumb-aquagreen-500 dark:scrollbar-track-gray-700">
          <input
            type="search"
            id="default-search"
            className="block w-full p-1 text-sm border rounded-lg outline-none text-black-900 bg-white-50 dark:text-dark-text dark:bg-dark-bg"
            placeholder="Search"
            value={profileSearchQuery}
            onChange={(e) => {
              setProfileSearchQuery(e.target.value);
            }}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2  dark:bg-dark-bg dark:text-dark-text ">
            {filteredProfiles?.map((profile) => {
              const { targetProfileDbId, profileUrl } = profile;
              const isChecked = selectedProfiles.includes(targetProfileDbId);
              return (
                <div
                  key={targetProfileDbId}
                  className={`border border-gray-300 rounded p-2 inline-flex items-center space-x-3 cursor-pointer
                    ${isChecked ? "bg-aquagreen-200" : "bg-aquagreen-600"}
                    dark:border-gray-700
                    ${isChecked ? "dark:bg-aquagreen-800" : "dark:bg-dark-bg"}`}
                >
                  <input
                    id={`profile-checkbox-${String(targetProfileDbId)}`}
                    type="checkbox"
                    className={`bg-gray-100 border-gray-300 cursor-pointer text-aquagreen-200
                      dark:bg-dark-bg dark:border-gray-600 dark:checked:bg-aquagreen-600`}
                    checked={isChecked}
                    onChange={() => {
                      handleProfileChange(targetProfileDbId);
                    }}
                  />
                  <label
                    htmlFor={`profile-checkbox-${String(targetProfileDbId)}`}
                    className="text-sm break-words cursor-pointer  "
                    style={{ maxWidth: "calc(100% - 24px)" }}
                  >
                    {profileUrl}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        <h1 className="text-lg font-semibold text-aquagreen-700 dark:text-dark-text dark:bg-dark-bg">
          Keywords
        </h1>
        <div className="flex flex-col p-3 space-y-2 overflow-y-scroll bg-white rounded-lg shadow-sm shadow-aquagreen-700 max-h-60 scrollbar-thin scrollbar-thumb-aquagreen-700 scrollbar-track-aquagreen-100 dark:bg-light-bg dark:scrollbar-thumb-aquagreen-500 dark:scrollbar-track-gray-700">
          <input
            type="search"
            id="default-search"
            className="block w-full p-1 text-sm border rounded-lg outline-none text-black-900 border-black-300 bg-white-50 dark:text-dark-text dark:bg-dark-bg"
            placeholder="Search"
            value={keywordSearchQuery}
            onChange={(e) => {
              setKeywordSearchQuery(e.target.value);
            }}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 dark:bg-dark-bg">
            {filteredKeywords?.map((keywordItem) => {
              const { targetKeywordDbId, keyword } = keywordItem;
              const isChecked = selectedKeywords.includes(targetKeywordDbId);

              return (
                <div
                  key={targetKeywordDbId}
                  className={`border border-gray-300 rounded p-2 inline-flex items-center space-x-3 cursor-pointer
                    ${isChecked ? "bg-aquagreen-200" : "bg-aquagreen-600"}
                    dark:border-gray-700
                    ${isChecked ? "dark:bg-aquagreen-800" : "dark:bg-dark-bg"}`}
                >
                  <input
                    id={`keyword-checkbox-${String(targetKeywordDbId)}`}
                    type="checkbox"
                    className={`bg-gray-100 border-gray-300 cursor-pointer text-aquagreen-600
                      dark:bg-dark-bg dark:border-gray-600 dark:checked:bg-aquagreen-800`}
                    checked={selectedKeywords.includes(targetKeywordDbId)}
                    onChange={() => {
                      handleKeywordChange(targetKeywordDbId);
                    }}
                  />
                  <label
                    htmlFor={`keyword-checkbox-${String(targetKeywordDbId)}`}
                    className="text-sm break-words cursor-pointer "
                    style={{ maxWidth: "calc(100% - 24px)" }}
                  >
                    {keyword}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FixedInsetZeroDiv>
  );
}

export default UpdatePlaylistModal;
