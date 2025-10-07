import { FaAngleLeft } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import { useLogoutUser } from "../../../api/useLogoutUser";
import axios from "axios";
import { toast } from "react-toastify";
import useClearUserState from "../../../hooks/useClearUserState";
import { useSessionStorage } from "@uidotdev/usehooks";
import { browserStorageKeys } from "../../../utils/constants";
import useTheme from "../../../hooks/useTheme";
import { MdDarkMode, MdLightMode } from "react-icons/md";

function Sidebar() {
  const [, setShowSideContainer] = useSessionStorage<boolean>(
    browserStorageKeys.isConfiguratorOpen,
    false
  );

  const { mutate: logout } = useLogoutUser();
  const { clearUserState } = useClearUserState();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess() {
        clearUserState();
        localStorage.clear();
      },
      onError(error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.statusText ?? "");
          return;
        } else if (error instanceof Error) {
          toast.error("Server error occurred");
          return;
        }

        toast.error("An error occurred");
      },
    });
  };

  const handleShowSideContainer = () => {
    setShowSideContainer(true);
  };

  const sidebarWidth = 70;

  return (
    <div className="p-1 dark:text-dark-text dark:bg-dark-bg">
      <div
        className="flex flex-col items-center justify-between h-full rounded-lg bg-aquagreen-600"
        style={{
          width: `${String(sidebarWidth)}px`,
        }}
      >
        <button
          type="button"
          onClick={handleShowSideContainer}
          className="flex items-center justify-center w-10 h-10 border-2 border-white rounded-full cursor-pointer bg-aquagreen-600"
          style={{
            transform: `translateX(${String(-sidebarWidth / 2)}px) translateY(50%) `,
          }}
        >
          <FaAngleLeft style={{ color: "white", fontSize: "20px" }} />
        </button>
        <div className="flex-grow"></div>
        <button onClick={toggleTheme} className="mb-4 mx-auto">
          {theme === "dark" ? (
            <MdLightMode className="text-3xl text-white" />
          ) : (
            <MdDarkMode className="text-3xl text-white" />
          )}
        </button>
        <div className="">
          <button className="mx-auto" onClick={handleLogout}>
            <IoIosLogOut className="text-3xl text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
