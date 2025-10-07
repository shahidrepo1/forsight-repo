import { IoMdClose } from "react-icons/io";
import FixedInsetZeroDiv from "../../primitives/FixedInsetZeroDiv";
import SchedularLogsTable from "./SchedularLogsTable";
import { useClickAway } from "@uidotdev/usehooks";
import React from "react";

type LogsModal = {
  setOpen: (prevState: boolean) => void;
};

export default function SchedularLogsModal({ setOpen }: LogsModal) {
  function onClose() {
    setOpen(false);
  }

  const ref = useClickAway(onClose);
  return (
    <FixedInsetZeroDiv>
      <div
        className="bg-white rounded-lg p-4 w-full max-w-3xl space-y-3 dark:text-dark-text dark:bg-dark-bg min-w-[600px]"
        ref={ref as React.RefObject<HTMLDivElement>}
      >
        <div className="flex justify-between items-center p-2 ">
          <h1 className="font-bold text-aquagreen-600 dark:text-dark-text dark:bg-dark-bg ">
            Schedular Logs Overview
          </h1>
          <button
            className="m-2 hover:opacity-75"
            onClick={() => {
              setOpen(false);
            }}
          >
            <IoMdClose />
          </button>
        </div>

        <SchedularLogsTable />
      </div>
    </FixedInsetZeroDiv>
  );
}
