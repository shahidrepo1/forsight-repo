import React from "react";
import ViewSwitchButton from "../../uiComponents/ViewSwitchButton";
import { toast } from "react-toastify";
import useDeleteMultipleData from "../../../api/useDeleteMultipleData";
import { useSelected } from "../../../stores/useSelected";
import type { DataUnionType } from "../../../api/useGetData.types";

function TopActionsbar({ dataList }: { dataList: Array<DataUnionType> }) {
  const { selectedIds, clearIds, selectAll: toogleSelectedIds } = useSelected();
  const { mutate: deleteSelectedFiles, isPending } = useDeleteMultipleData();

  function handleDelete() {
    if (!selectedIds.length) {
      toast.error("Please select files to delete");
      return;
    }

    deleteSelectedFiles(
      { ids: selectedIds },
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

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      toogleSelectedIds(dataList.map((data) => data.uniqueIdentifier));
    } else {
      clearIds();
    }
  }

  const isAllSelected = selectedIds.length === dataList.length;

  return (
    <div className="grid grid-cols-3">
      <div className="flex items-center gap-4 px-2 py-1 rounded-md bg-gray-50 border border-aquagreen-200 text-sm text-gray-700 dark:bg-dark-bg dark:text-dark-text dark:border-aquagreen-400 ">
        {dataList.length !== 0 && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              className="w-4 h-4 accent-aquagreen-400"
              onChange={handleSelectAll}
            />
            <span>Select all</span>
          </label>
        )}
        <span className="ml-auto font-medium text-gray-600 dark:text-dark-text">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="flex justify-center">
        <ViewSwitchButton />
      </div>
      <div className="flex justify-end gap-3">
        <button
          className="flex items-center h-6 px-3 text-sm bg-aquagreen-500 text-white rounded-full 2xl:h-8 hover:bg-aquagreen-500 2xl:text-base dark:text-dark-text dark:bg-dark-bg dark:hover:bg-aquagreen-500 disabled:bg-aquagreen-300 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          onClick={handleDelete}
          disabled={!selectedIds.length}
        >
          {isPending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default TopActionsbar;
