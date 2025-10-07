import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import TopNotch from "../../uiComponents/TopNotch";
import MainAppLoader from "../../uiComponents/MainAppLoader";
import ConfiguratorContainer from "../configurator/ConfiguratorContainer";
import useAuthLoader from "../../../hooks/useAuthLoader";

function AuthComponent() {
  const { loading, userName } = useAuthLoader();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-aquagreen-800">
        <MainAppLoader />
      </div>
    );
  }

  if (!userName) {
    return <Navigate to="/login" />;
  }
  return (
    <div className="relative grid grid-cols-[1fr_auto] h-screen text-black overflow-hidden">
      <div className="grid grid-rows-[auto_1fr] gap-4 overflow-hidden dark:text-dark-text dark:bg-dark-bg">
        <TopNotch />
        <Outlet />
      </div>
      <Sidebar />
      {/* absolute */}
      <ConfiguratorContainer />
    </div>
  );
}
export default AuthComponent;
