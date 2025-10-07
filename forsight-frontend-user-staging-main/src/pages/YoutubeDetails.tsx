import { useNavigate, useParams } from "react-router-dom";
import { formatDate, formatDuration, getPlatformLogo } from "../utils/helpers";
import { FaRegUser } from "react-icons/fa6";
import { AiOutlineShareAlt } from "react-icons/ai";
import GetYoutubeDetailsData from "../api/useGetYoutubeDetails";

export default function YoutubeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isError, isLoading } = GetYoutubeDetailsData(id ?? "");

  if (isLoading) {
    return <p className="p-8 text-center ">Loading...</p>;
  }
  if (isError) {
    return (
      <p className="p-8 text-center text-red-500">Something went wrong!</p>
    );
  }

  return (
    <main className="flex flex-col items-center p-10 dark:bg-slate-700  dark:text-dark-text">
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
          <div className="relative">
            <img
              className="w-full"
              src={data.originalVideoTumbnailUrl}
              alt="Video Thumbnail"
            />
            <img
              src={getPlatformLogo(data.platform)}
              alt="platform logo"
              className="absolute w-6 rounded-lg 2xl:w-8 aspect-square top-4 left-4"
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
                  {data.targetYoutubeProfile.channelName}
                </p>
                <p className="text-gray-600">
                  {formatDate(data.videoPublishedAt)}
                </p>
              </div>
            </div>
            <div className="mb-4 text-xl font-bold">{data.videoTitle}</div>
            {/* Profile Information Section */}
            <div className="my-4 text-sm text-gray-600 dark:text-dark-text">
              <p>
                <strong>Country:</strong>{" "}
                {data.targetYoutubeProfile.channelCountry}
              </p>

              <p>
                <strong>Joined:</strong>{" "}
                {formatDate(data.targetYoutubeProfile.channelPublishedAt)}
              </p>
              <p>
                <strong>Views:</strong>{" "}
                {data.targetYoutubeProfile.channelViewCount}
              </p>
            </div>

            {/* Video Information Section */}
            <div className="my-4 text-sm text-gray-600 dark:text-dark-text">
              <p>
                <strong>Video Views:</strong> {data.videoViewCount}
              </p>
              <p>
                <strong>Duration:</strong> {formatDuration(data.videoDuration)}
              </p>
              <p>
                <strong>Sentiment:</strong> {data.videoSentiment}
              </p>
              <p>
                <strong>Video Link:</strong>{" "}
                <a
                  href={data.originalVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Watch Video
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
