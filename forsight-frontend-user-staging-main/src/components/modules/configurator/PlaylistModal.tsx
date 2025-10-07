import { useState } from "react";
import { useGetPlayList } from "../../../api/useGetPlayList";
import FixedInsetZeroDiv from "../../primitives/FixedInsetZeroDiv";
import { FaEdit } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import UpdatePlaylistModal from "./UpdatePlaylistModal";
import { useSelectedPlaylist } from "../../../stores/useSelectedPlaylist";
import { MdDelete } from "react-icons/md";
import useDeletePlaylist from "../../../api/useDeletePlaylist";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { SinglePlaylistType } from "../../../api/useGetPlayList.types";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
//import { useClickAway } from "@uidotdev/usehooks";

function PlaylistModal({
  setIsPlaylistModalOpen,
}: {
  setIsPlaylistModalOpen: (prevState: boolean) => void;
}) {
  // const ref = useClickAway(() => {
  //   setIsPlaylistModalOpen(false);
  // });
  const { data, isLoading, error, isError } = useGetPlayList();
  const playListData = data?.data;
  const { addKeywords, addProfiles } = useSelectedPlaylist();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistId, setPlaylistId] = useState(0);
  const { mutate: deletePlaylist, isPending: isPendingDelete } =
    useDeletePlaylist();
  const [, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

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
  function handleSetPlaylist(playlist: SinglePlaylistType) {
    const profiles = playlist.profiles.map(
      (profile) => profile.targetProfileDbId
    );

    const keywordsByPlatform: Record<string, Array<string>> = {};
    playlist.keywords.forEach((keyword) => {
      keyword.platforms.forEach((platform) => {
        if (platform.enabled) {
          if (!(platform.platform in keywordsByPlatform)) {
            keywordsByPlatform[platform.platform] = [];
          }
          keywordsByPlatform[platform.platform].push(
            keyword.targetKeywordDbId.toString()
          );
        }
      });
    });

    setSearchParams(() => {
      const newParams = new URLSearchParams();
      newParams.set("profiles", profiles.join(","));
      Object.entries(keywordsByPlatform).forEach(([platform, keywordIds]) => {
        newParams.set(platform, keywordIds.join(","));
      });
      return newParams;
    });
  }

  function handleRemovePlaylistParams(playlist: SinglePlaylistType) {
    playlist.profiles.map((profile) => profile.targetProfileDbId);

    const keywordsByPlatform: Record<string, Array<string>> = {};
    playlist.keywords.forEach((keyword) => {
      keyword.platforms.forEach((platform) => {
        if (platform.enabled) {
          if (!(platform.platform in keywordsByPlatform)) {
            keywordsByPlatform[platform.platform] = [];
          }
          keywordsByPlatform[platform.platform].push(
            keyword.targetKeywordDbId.toString()
          );
        }
      });
    });

    setSearchParams((currentParams) => {
      currentParams.delete("profiles");
      Object.keys(keywordsByPlatform).forEach((platform) => {
        currentParams.delete(platform);
      });

      return currentParams;
    });
  }

  return (
    <FixedInsetZeroDiv>
      <div>
        <div
          className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-full space-y-3 overflow-y-auto dark:text-dark-text dark:bg-dark-bg min-w-[600px]"
          // ref={ref as React.RefObject<HTMLDivElement>}
        >
          <div className="flex justify-between items-center p-2 overflow-y-auto">
            <h1 className="font-bold text-aquagreen-600 dark:text-dark-text dark:bg-dark-bg ">
              PlayLists
            </h1>
            <button
              className="m-2 opacity-35"
              onClick={() => {
                setIsPlaylistModalOpen(false);
              }}
            >
              <IoMdClose />
            </button>
          </div>
          {playListData?.length === 0 && <p>There is no playlist yet.</p>}
          <div className="p-2 ">
            {playListData && playListData.length > 0 && (
              <div className="relative overflow-scroll overflow-x-auto shadow-md sm:rounded-lg h-60 scrollbar-thin scrollbar-thumb-aquagreen-700 scrollbar-track-aquagreen-100">
                <table className="w-full text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400 ">
                  <tbody>
                    {playListData.map((playlist) => (
                      <tr
                        key={playlist.id}
                        className="border dark:border-gray-700 hover:bg-aquagreen-100 dark:hover:bg-gray-600 bg-aquagreen-50 dark:text-dark-text dark:bg-dark-bg "
                      >
                        <td
                          className="px-6 py-4 font-semibold text-aquagreen-600 cursor-pointer dark:text-dark-text dark:bg-dark-bg"
                          onClick={() => {
                            handleSetPlaylist(playlist);
                            setIsPlaylistModalOpen(false);
                          }}
                        >
                          {playlist.name}
                        </td>
                        <td className="px-6 py-4 font-semibold ">
                          Profiles: {playlist.profiles.length}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          Keywords: {playlist.keywords.length}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="font-medium text-aquagreen-600 dark:text-aquagreen-500 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditModalOpen(true);
                              setPlaylistName(playlist.name);
                              setPlaylistId(playlist.id);
                              const keywordIds = playlist.keywords.map(
                                (keyword) => keyword.targetKeywordDbId
                              );

                              const profileIds = playlist.profiles.map(
                                (profile) => profile.targetProfileDbId
                              );

                              addProfiles(profileIds);
                              addKeywords(keywordIds);
                            }}
                          >
                            <FaEdit size={15} />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="font-medium text-aquagreen-600 dark:text-aquagreen-500 hover:underline disabled:cursor-not-allowed"
                            disabled={isPendingDelete}
                            onClick={() => {
                              handleRemovePlaylistParams(playlist);

                              deletePlaylist(playlist.id, {
                                onSuccess: () => {
                                  queryClient
                                    .invalidateQueries({
                                      queryKey: ["playList"],
                                    })
                                    .catch((error: unknown) => {
                                      if (axios.isAxiosError(error)) {
                                        toast.error(error.message);
                                      }
                                    });

                                  toast.success(
                                    "Playlist has been deleted successfully"
                                  );
                                },
                                onError: (error) => {
                                  toast.error(error.message);
                                },
                              });
                            }}
                          >
                            <MdDelete size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {isEditModalOpen && (
          <div>
            <UpdatePlaylistModal
              setIsUpdatePlaylistModalOpen={setIsEditModalOpen}
              playlistName={playlistName}
              submitKey="update"
              playlistId={playlistId}
            />
          </div>
        )}
      </div>
    </FixedInsetZeroDiv>
  );
}

export default PlaylistModal;
