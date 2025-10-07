import { useState } from "react";
import FixedInsetZeroDiv from "../../primitives/FixedInsetZeroDiv";
import { useClickAway } from "@uidotdev/usehooks";

const promptsText = [
  "Issue wise report",
  "Issue wise tabular report",
  "Platform wise report",
  "Platform wise tabular report",
];

type PromptsModalProps = {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isPending: boolean;
};

export default function PromptsModal({
  onClose,
  onSubmit,
  isPending,
}: PromptsModalProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const ref = useClickAway(() => {
    onClose();
  });

  const handleSubmitPromptData = (prompt: string) => {
    setActivePrompt(prompt);
    onSubmit(prompt);
  };

  return (
    <>
      <FixedInsetZeroDiv>
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl w-full max-w-lg p-6 space-y-6 transition-transform transform duration-300 animate-fadeInUp"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Send Custom Prompts
          </h1>

          {/* Custom Prompt Form */}
          <form
            className="flex gap-3 items-center"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitPromptData(customPrompt);
            }}
          >
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
              }}
              disabled={isPending}
              placeholder="Add custom prompt..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 
             dark:bg-gray-800 bg-white text-gray-800 dark:text-white 
             placeholder:text-gray-400 dark:placeholder:text-gray-500 
             focus:outline-none focus:ring-2 focus:ring-aquagreen-500 
             focus:border-aquagreen-500 shadow-sm transition-all duration-200"
            />
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-aquagreen-600 hover:bg-aquagreen-700 rounded-md transition duration-200 disabled:cursor-not-allowed"
              disabled={isPending}
            >
              {isPending ? "Loading..." : "Add"}
            </button>
          </form>

          {/* Predefined Prompts List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Quick Prompts
            </h2>
            <ul className="space-y-2">
              {promptsText.map((key) => (
                <li key={key}>
                  <button
                    onClick={() => {
                      handleSubmitPromptData(key);
                    }}
                    disabled={isPending}
                    className={`w-full px-4 py-2 text-left border rounded-md transition duration-200
                      ${isPending ? "cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500" : "hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700"}`}
                  >
                    {isPending && activePrompt === key && (
                      <span className="mr-2 inline-block animate-spin border-2 border-t-transparent border-gray-500 rounded-full w-4 h-4 align-middle" />
                    )}
                    {key}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FixedInsetZeroDiv>
    </>
  );
}
