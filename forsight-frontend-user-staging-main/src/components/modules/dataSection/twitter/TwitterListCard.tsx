import { FaRegUser } from "react-icons/fa6";
import twitterBG from "../../../../assets/images/twitter3.png";
import { HiOutlineUsers } from "react-icons/hi2";
import { MdDeleteForever } from "react-icons/md";
import { LuThumbsUp } from "react-icons/lu";
import { SlShareAlt } from "react-icons/sl";
import { FiMessageSquare } from "react-icons/fi";
import { CiBookmark } from "react-icons/ci";
import type { SingleTweetRecordType } from "../../../../api/useGetData.types";
import {
  formatDate,
  getPlatformLogo,
  verifyResourceUrl,
} from "../../../../utils/helpers";
import { useSelected } from "../../../../stores/useSelected";
import useDeleteMultipleData from "../../../../api/useDeleteMultipleData";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
import LinksbarGridCard from "./LinksbarGridCard";

function TwitterListCard({ profile }: { profile: SingleTweetRecordType }) {
  const { selectedIds, addSelectedId, removeSelectedId, clearIds } =
    useSelected();

  function handleCheckboxChange(tweetDbId: string) {
    if (selectedIds.includes(tweetDbId)) {
      removeSelectedId(tweetDbId);
    } else {
      addSelectedId(tweetDbId);
    }
  }

  const { mutate: deleteData, isPending } = useDeleteMultipleData();

  function handleDeleteData() {
    deleteData(
      { ids: [profile.uniqueIdentifier] },
      {
        onSuccess: () => {
          clearIds();
          toast.success("Deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete");
        },
      }
    );
  }

  return (
    <div className="mt-5">
      <div className="w-full mb-4 bg-white rounded-3xl dark:bg-dark-bg">
        <div className="flex justify-between">
          <div className="flex gap-12 w-[80%] dark:text-dark-text dark:bg-dark-bg ">
            <img
              src={verifyResourceUrl(profile.tweetImageLink, twitterBG)}
              alt=""
              className="bg-gray-500 w-72 aspect-square rounded-r-xl dark:bg-dark-bg "
            />
            <div className="py-10 dark:text-dark-text dark:bg-dark-bg">
              <p>{formatDate(profile.tweetCreatedAt)}</p>

              <div className="flex items-center gap-16 mt-3 dark:text-dark-text dark:bg-dark-bg">
                <div className="flex items-center gap-2 dark:text-dark-text dark:bg-dark-bg ">
                  <FaRegUser
                    style={{
                      backgroundColor: "white",
                      padding: "5px",
                      fontSize: "30px",
                      borderRadius: "100%",
                      color: "black",
                    }}
                  />
                  <p>{profile.targetXProfile.targetProfileScreenName}</p>
                </div>
                <div className="flex items-center gap-2 dark:text-dark-text dark:bg-dark-bg">
                  <HiOutlineUsers
                    style={{
                      backgroundColor: "#337e7b",
                      padding: "5px",
                      fontSize: "30px",
                      borderRadius: "100%",
                      color: "white",
                    }}
                  />
                  <p>{profile.targetXProfile.targetProfileFollowersCount}</p>
                </div>
              </div>
              <p
                className="mt-3 font-bold break-all line-clamp-2"
                style={{ fontSize: "30px" }}
              >
                {profile.tweetText}
              </p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 dark:text-dark-text dark:bg-dark-bg bg-white text-[#337e7b] p-3 font-[30px]">
                    <LuThumbsUp
                    // style={{
                    //   color: "#337e7b",
                    //   backgroundColor: "white",
                    //   padding: "5px",
                    //   fontSize: "30px",
                    //   borderRadius: "100%",
                    // }}
                    />
                    <p>{profile.tweetFavoriteCount}</p>
                  </div>
                  <div className="flex items-center gap-1 dark:text-dark-text dark:bg-dark-bg bg-white text-[#337e7b] p-3 font-[30px]">
                    <SlShareAlt
                    // style={{
                    //   color: "#337e7b",
                    //   backgroundColor: "white",
                    //   padding: "5px",
                    //   fontSize: "30px",
                    //   borderRadius: "100%",
                    // }}
                    />
                    <p>{profile.retweetCount}</p>
                  </div>
                  <div className="flex items-center justify-end gap-1 bg-white text-[#337e7b] p-3 font-[30px] dark:text-dark-text dark:bg-dark-bg">
                    <FiMessageSquare
                    // style={{
                    //   color: "#337e7b",
                    //   backgroundColor: "white",
                    //   padding: "5px",
                    //   fontSize: "30px",
                    //   borderRadius: "100%",
                    // }}
                    />
                    <p>{profile.tweetReplies}</p>
                  </div>
                  <div className="flex items-center gap-1 dark:text-dark-text dark:bg-dark-bg bg-white text-[#337e7b] p-3 font-[30px]">
                    <CiBookmark
                    // style={{
                    //   color: "#337e7b",
                    //   backgroundColor: "white",
                    //   padding: "5px",
                    //   fontSize: "30px",
                    //   borderRadius: "100%",
                    // }}
                    />
                    <p>{profile.tweetBookmarkCount}</p>
                  </div>
                </div>
                <div>
                  {/* <a
                    href={profile.tweetOriginalLink ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#337e7b] underline font-bold"
                  >
                    See Post
                  </a> */}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between items-end px-12 py-10 w-[20%] dark:text-dark-text dark:bg-dark-bg dark:rounded-full">
            <div className="flex items-center justify-center gap-5">
              <div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-center"
                  checked={selectedIds.includes(profile.uniqueIdentifier)}
                  onChange={() => {
                    handleCheckboxChange(profile.uniqueIdentifier);
                  }}
                />
              </div>
              <button
                type="button"
                className={twMerge(
                  "text-3xl text-aquagreen-500",
                  isPending && "animate-pulse"
                )}
                onClick={handleDeleteData}
                disabled={isPending}
              >
                <MdDeleteForever />
              </button>
              <img
                src={getPlatformLogo(profile.platform)}
                alt="platform logo"
                className="w-8 h-8 rounded-lg"
              />
            </div>
            {/* <div className="flex justify-end text-white">
              <Sentiment sentiment={profile.tweetSentiment} />
            </div> */}

            <LinksbarGridCard
              dataId={profile.uniqueIdentifier}
              dataLink={profile.tweetOriginalLink ?? ""}
              dataSentiment={profile.tweetSentiment}
              buttonLabel="tweet"
              platform="x"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwitterListCard;
