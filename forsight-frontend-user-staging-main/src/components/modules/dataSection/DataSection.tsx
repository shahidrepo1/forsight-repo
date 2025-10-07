import { useEffect } from "react";
import CurrentView from "./CurrentView";
import useGetData from "../../../api/useGetData";
import TopActionsbar from "./TopActionsbar";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { toast } from "react-toastify";

function DataSection() {
  const [ref, entry] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "0px",
    root: null,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetData();

  const flatMapData = data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().catch(() => {
        toast.error("Failed to fetch more data");
      });
    }
  }, [entry, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <p className="text-center">Loading...</p>;
  }

  if (isError) {
    return <p>{error.message}</p>;
  }

  return (
    <div className="space-y-4">
      <TopActionsbar dataList={flatMapData} />
      <CurrentView dataList={flatMapData} />

      <div className="h-10 mt-10" ref={ref}>
        {hasNextPage && isFetchingNextPage && (
          <div className="flex items-center justify-center w-full">
            <div className="w-12">loading</div>
          </div>
        )}
        {!hasNextPage && flatMapData.length !== 0 && !isFetchingNextPage && (
          <p className="my-5 text-center">No more data.</p>
        )}
      </div>
    </div>
  );
}

export default DataSection;
