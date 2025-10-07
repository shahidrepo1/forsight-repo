import { AiOutlineShareAlt } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
import useDeleteMultipleData from "../../../../api/useDeleteMultipleData";
import { useSelected } from "../../../../stores/useSelected";

function GridCardHeader({
  dataId,
  platformLogo,
}: {
  dataId: string;
  platformLogo: string;
}) {
  const { selectedIds, addSelectedId, removeSelectedId, clearIds } =
    useSelected();
  const { mutate: deleteData, isPending } = useDeleteMultipleData();

  const handleCheckboxChange = (tweetDbId: string) => {
    if (selectedIds.includes(tweetDbId)) {
      removeSelectedId(tweetDbId);
    } else {
      addSelectedId(tweetDbId);
    }
  };

  function handleDeleteData() {
    deleteData(
      { ids: [dataId] },
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
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-center gap-4">
        <input
          type="checkbox"
          className="w-3 2xl:w-4 aspect-square accent-aquagreen-400"
          onChange={() => {
            handleCheckboxChange(dataId);
          }}
          checked={selectedIds.includes(dataId)}
        />
        <button
          type="button"
          className={twMerge(
            "text-lg 2xl:text-2xl text-aquagreen-500 hover:text-aquagreen-400",
            isPending && "animate-pulse"
          )}
          onClick={handleDeleteData}
          disabled={isPending}
        >
          <MdDeleteForever />
        </button>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          className="flex items-center justify-center w-4 text-sm transition-all bg-white rounded-full 2xl:w-6 2xl:text-lg text-aquagreen-500 aspect-square hover:bg-aquagreen-500 hover:text-white dark:text-dark-text dark:bg-dark-bg"
        >
          <AiOutlineShareAlt />
        </button>

        <img
          src={platformLogo}
          alt="platform logo"
          className="w-6 rounded-lg 2xl:w-8 aspect-square"
        />
      </div>
    </div>
  );
}

export default GridCardHeader;
