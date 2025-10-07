import { CiBookmark } from "react-icons/ci";
import { FiMessageSquare } from "react-icons/fi";
import { LuThumbsUp } from "react-icons/lu";
import { SlShareAlt } from "react-icons/sl";

function TweetStats({
  favoriteCount,
  retweetCount,
  replyCount,
  bookmarkCount,
}: {
  favoriteCount: string;
  retweetCount: string;
  replyCount: string;
  bookmarkCount: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-3 text-[0.6rem] 2xl:text-xs">
      <div className="flex items-center gap-1 dark:text-dark-text dark:bg-dark-bg">
        <span className="flex items-center justify-center w-4 bg-white rounded-full 2xl:w-6 aspect-square text-aquagreen-500 dark:text-dark-text dark:bg-dark-bg">
          <LuThumbsUp />
        </span>
        <p>{favoriteCount}</p>
      </div>
      <div className="flex items-center gap-1 dark:text-dark-text dark:bg-dark-bg">
        <span className="flex items-center justify-center w-4 bg-white rounded-full 2xl:w-6 aspect-square text-aquagreen-500 dark:text-dark-text dark:bg-dark-bg">
          <SlShareAlt />
        </span>
        <p>{retweetCount}</p>
      </div>
      <div className="flex items-center gap-1 dark:text-dark-text dark:bg-dark-bg">
        <span className="flex items-center justify-center w-4 bg-white rounded-full 2xl:w-6 aspect-square text-aquagreen-500 dark:text-dark-text dark:bg-dark-bg">
          <FiMessageSquare />
        </span>
        <p>{replyCount}</p>
      </div>
      <div className="flex items-center gap-1 dark:text-dark-text dark:bg-dark-bg">
        <span className="flex items-center justify-center w-4 bg-white rounded-full 2xl:w-6 aspect-square text-aquagreen-500 dark:text-dark-text dark:bg-dark-bg">
          <CiBookmark />
        </span>
        <p>{bookmarkCount}</p>
      </div>
    </div>
  );
}

export default TweetStats;
