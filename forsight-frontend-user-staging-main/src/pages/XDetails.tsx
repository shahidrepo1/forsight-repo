import { useNavigate, useParams } from "react-router-dom";
import GetXDetailsData from "../api/useGetXDetails";
import {
  formatDate,
  getPlatformLogo,
  verifyResourceUrl,
} from "../utils/helpers";
import twitterBg from "../assets/images/twitter-bg.png";
import { FaRegUser } from "react-icons/fa6";
import { AiOutlineShareAlt } from "react-icons/ai";
import TweetStats from "../components/modules/dataSection/twitter/TweetStats";

export default function XDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isError, isLoading } = GetXDetailsData(id ?? "");
  if (isLoading) {
    return <p className="p-8 text-center ">Loading...</p>;
  }
  if (isError) {
    return (
      <p className="p-8 text-center text-red-500">Something went wrong!</p>
    );
  }

  return (
    <main className="flex flex-col items-center p-10 dark:bg-slate-700 dark:text-dark-text">
      <button
        onClick={() => {
          navigate(-1);
        }}
        className="mb-4 px-4 py-2 text-sm font-medium text-white bg-aquagreen-500 rounded hover:bg-aquagreen-600"
      >
        ← Back
      </button>
      {data && (
        <div className="max-w-md rounded shadow-lg mx-auto bg-slate-200 overflow-auto h-[80vh] hide-scrollbar dark:bg-dark-bg">
          <div className="relative dark:bg-dark-bg">
            <img
              className="w-full dark:bg-dark-bg"
              src={verifyResourceUrl(data.tweetImageLink, twitterBg)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = twitterBg;
              }}
              alt="Tweet image"
            />
            {/* <FaTwitter className="absolute text-3xl text-white top-4 left-4" /> */}
            <img
              src={getPlatformLogo("x")}
              alt="platform logo"
              className="absolute w-6 rounded-lg 2xl:w-8 aspect-square top-4 left-4 "
            />
            <button
              type="button"
              className="absolute flex items-center justify-center w-6 h-6 transition-all bg-white rounded-full 2xl:w-8 2xl:h-8 text-aquagreen-500 hover:bg-aquagreen-500 hover:text-white top-4 left-14"
            >
              <AiOutlineShareAlt className="text-sm 2xl:text-lg" />
            </button>
          </div>

          <div className="px-6 py-4 ">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-4 mr-4 text-xs bg-gray-400 rounded-full 2xl:w-6 aspect-square">
                <FaRegUser />
              </div>
              <div className="text-sm">
                <p className="leading-none text-gray-900 dark:text-dark-text">
                  {data.targetXProfile.targetProfileScreenName}
                </p>
                <p className="text-gray-600 dark:text-gray-500">
                  {formatDate(data.tweetCreatedAt)}
                </p>
              </div>
            </div>
            <div className="mb-4 text-xl font-bold">{data.tweetText}</div>
            {/* Profile Information Section */}
            <div className="my-4 text-sm text-gray-600 dark:text-dark-text">
              <p>
                <strong>Country:</strong>{" "}
                {data.targetXProfile.targetProfileGeographicalLocation}
              </p>

              <p>
                <strong>Joined:</strong>{" "}
                {formatDate(data.targetXProfile.targetProfileCreatedAt)}
              </p>
              <p>
                <strong>Followers:</strong>{" "}
                {data.targetXProfile.targetProfileFollowersCount}
              </p>
            </div>
            <TweetStats
              favoriteCount={data.tweetFavoriteCount}
              retweetCount={data.retweetCount}
              replyCount={data.tweetReplies}
              bookmarkCount={data.tweetBookmarkCount}
            />
          </div>
        </div>
      )}
    </main>
  );
}
