import { MdOutlineCancel } from "react-icons/md";
import Portal from "../../primitives/Portal";
import React, { useEffect, useState } from "react";
import { HiOutlineSave, HiOutlineSaveAs } from "react-icons/hi";
import useDownloadGptPdfReport from "../../../api/useDownloadGptReport";
import { toast } from "react-toastify";
import NewsGptEditor from "./NewsGptEditor";
// import PromptDropdown from "./PromptDropdown";
import CustomPrompt from "./CustomPrompt";
import useSendGptPromptsUpdate from "../../../api/useSendGptPromptUpdate";

type ModalProps = {
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  mkData: string;
  isUrdu: boolean;
  prompt: string;
};

export default function NewsGptEditableDataModal({
  onClose,
  mkData,
  isUrdu,
  prompt,
}: ModalProps) {
  const [data, setData] = useState("");
  // const [isTyping, setIsTyping] = useState(true);
  const { mutate } = useDownloadGptPdfReport();
  const { mutate: sendPrompt, isPending } = useSendGptPromptsUpdate();

  const handleDownloadReport = ({ isSave }: { isSave: boolean }) => {
    const payload = {
      result: data,
      isUrdu,
    };

    mutate(
      { payload, isSave, prompt },
      {
        onSuccess: () => {
          toast.success("Report downloaded successfully.");
        },
        onError: () => {
          toast.error("Something went wrong during downloading report.");
        },
      }
    );
  };

  const handleSubmitPrompt = (prompt: string) => {
    // console.log({ prompt });
    sendPrompt(
      { prompt, data },
      {
        onSuccess: (data) => {
          setData(data.result);
        },
        onError: () => {
          toast.error("Something went wrong.");
        },
      }
    );
  };

  useEffect(() => {
    setData(mkData);
    // setIsTyping(true);
  }, [mkData]);

  return (
    <Portal>
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="relative h-auto w-11/12 rounded-md bg-white px-4 py-2"
        >
          <div className="flex justify-between items-center">
            <p className="w-full text-start text-2xl font-semibold text-lavender-600">
              Markdown Editor
            </p>
            <MdOutlineCancel
              onClick={() => {
                onClose(false);
              }}
              size={24}
              className="cursor-pointer hover:text-slate-500"
            />
          </div>
          <header className=" gap-2 flex items-center justify-end">
            <button
              className="bg-aquagreen-600 rounded-md  px-2 py-2 text-white hover:bg-aquagreen-700 disabled:bg-aquagreen-400 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              onClick={() => {
                handleDownloadReport({ isSave: false });
              }}
              // disabled={isTyping}
              title="Download Report"
            >
              <HiOutlineSave />
            </button>
            <button
              className="bg-aquagreen-600 rounded-md px-2 py-2 text-white hover:bg-aquagreen-700 disabled:bg-aquagreen-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download and save"
              // disabled={isTyping}
              onClick={() => {
                handleDownloadReport({ isSave: true });
              }}
            >
              <HiOutlineSaveAs />
            </button>
            {/* <PromptDropdown
              onSubmit={handleSubmitPrompt}
              isLoading={isPending}
            /> */}
            <CustomPrompt onSubmit={handleSubmitPrompt} isLoading={isPending} />
          </header>
          <main className="mt-4">
            {/* <TypewriterEffect
              onUpdate={setData}
              text={mkData}
              onComplete={() => {
                setIsTyping(false);
              }}
            /> */}
            <NewsGptEditor data={data} setData={setData} isUrdu={isUrdu} />
          </main>
        </div>
      </div>
    </Portal>
  );
}
