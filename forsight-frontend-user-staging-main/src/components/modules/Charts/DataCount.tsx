import useGetDataCount from "../../../api/useGetDataCount";
import CloseChart from "./CloseChart";

function DataCount() {
  const { data, isLoading, isError, error } = useGetDataCount();

  if (isLoading) return <div className="text-center">Loading...</div>;

  if (isError) return <div className="text-center">{error.message}</div>;

  const totalCount = data?.totalCount ?? 0;

  return (
    <div className=" flex flex-col bg-white rounded-md overflow-hidden dark:text-dark-text dark:bg-dark-bg">
      <CloseChart chartName="DataCount" />
      <div className="flex items-center justify-center">
        <div className=" min-h-[323px] flex flex-col justify-center items-center">
          <p className="text-5xl font-bold text-center 2xl:text-7xl">
            {totalCount.toString().padStart(2, "0")}
          </p>
          <p className="text-lg font-bold text-center 2xl:text-2xl">
            Total Data
          </p>
        </div>
      </div>
    </div>
    //  <div className="flex flex-col bg-white rounded-md overflow-hidden dark:text-dark-text dark:bg-dark-bg">
    //  <CloseChart chartName="DataCount" />
    //  <div className="m-auto">
    //    <p className="text-5xl font-bold text-center 2xl:text-7xl">
    //      {totalCount.toString().padStart(2, "0")}
    //    </p>
    //    <p className="text-lg font-bold text-center 2xl:text-2xl">Total Data</p>
    //  </div>
    // </div>
  );
}

export default DataCount;
