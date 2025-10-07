import { useNavigate, useParams } from "react-router-dom";
import { formatDate, getPlatformLogo } from "../utils/helpers";
import { FaRegUser } from "react-icons/fa6";
import { AiOutlineShareAlt } from "react-icons/ai";
import GetWebDetailsData from "../api/useGetWebDetails";
import webBg from "../assets/images/web1.png";

export default function WebDetails() {
  const { id } = useParams();

  const { data, isError, isLoading } = GetWebDetailsData(id ?? "");
  const navigate = useNavigate();

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
        <div className="max-w-xl rounded shadow-lg mx-auto bg-slate-200 overflow-auto h-[82vh] hide-scrollbar dark:bg-dark-bg">
          <div className="relative">
            <img
              className="w-full h-96"
              src={data.originalThumbnail || webBg}
              alt="Video Thumbnail"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = webBg;
              }}
            />
            <img
              src={getPlatformLogo(data.platform)}
              alt="platform logo"
              className="absolute w-6 rounded-lg 2xl:w-8 aspect-square top-4 left-4"
            />
            <button
              type="button"
              className="absolute flex items-center justify-center w-6 h-6 transition-all bg-white rounded-full 2xl:w-8 2xl:h-8 text-aquagreen-500 hover:bg-aquagreen-500 hover:text-white top-4 left-14  "
            >
              <AiOutlineShareAlt className="text-sm 2xl:text-lg" />
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-4 mr-4 text-xs bg-gray-400 rounded-full 2xl:w-6 aspect-square">
                <FaRegUser />
              </div>
              <div className="text-sm">
                <p className="leading-none text-gray-900 dark:text-dark-text">
                  {data.targetWebProfile.platformName}
                </p>
                <p className="text-gray-600">
                  {data.articlePublishedAt &&
                    formatDate(data.articlePublishedAt)}
                </p>
              </div>
            </div>
            <div className="mb-4 text-xl font-bold">{data.articleTitle}</div>

            <div className="my-4 text-sm text-gray-600 dark:text-gray-500">
              <p>
                <strong>Sentiment:</strong> {data.articleSentiment}
              </p>
              <p>
                <strong>Web Link:</strong>{" "}
                <a
                  href={data.originalArticleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  See the details
                </a>
              </p>
            </div>
            <p>{data.articleDescription}</p>
          </div>
        </div>
      )}
    </main>
  );
}
