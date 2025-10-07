import { FaRegUser } from "react-icons/fa6";
import { HiOutlineUsers } from "react-icons/hi2";

function ProfileInformationTwitterCard({
  profileName,
  followersCount,
}: {
  profileName: string;
  followersCount: string;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-4 text-xs bg-white rounded-full 2xl:w-6 aspect-square text-aquagreen-500 dark:text-dark-text dark:bg-dark-bg">
          <FaRegUser />
        </span>
        <p className="text-xs break-all 2xl:text-base ">{profileName}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-4 text-xs bg-white rounded-full 2xl:w-6 aspect-square text-aquagreen-500 dark:text-dark-text dark:bg-dark-bg">
          <HiOutlineUsers />
        </span>
        <p className="text-xs break-all 2xl:text-base">{followersCount}</p>
      </div>
    </div>
  );
}

export default ProfileInformationTwitterCard;
