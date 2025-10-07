// PromptDropdown.tsx
import { useClickAway } from "@uidotdev/usehooks";
import { useState, type RefObject } from "react";
import { FaChevronDown, FaSpinner } from "react-icons/fa";

const promptsText = [
  "Issue wise report",
  "Issue wise tabular report",
  "Platform wise report",
  "Platform wise tabular report",
];

type PromptDropdownProps = {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
};

const PromptDropdown = ({ onSubmit, isLoading }: PromptDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const ref = useClickAway(() => {
    setIsOpen(false);
  });

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);

    setIsOpen(false);
    onSubmit(prompt);
  };

  return (
    <div className="relative w-64" ref={ref as RefObject<HTMLDivElement>}>
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className="w-full px-4 py-2 text-left border border-aquagreen-200 rounded-lg bg-white  hover:bg-gray-50 transition-all flex justify-between items-center disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        <span className="text-sm">
          {isLoading ? selectedPrompt : "Select a Prompt"}
        </span>

        {isLoading ? (
          <div className=" text-aquagreen-600 animate-spin">
            <FaSpinner />
          </div>
        ) : (
          <FaChevronDown
            className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border rounded-lg shadow-lg animate-fade-in">
          {promptsText.map((prompt) => (
            <div
              key={prompt}
              onClick={() => {
                handlePromptClick(prompt);
              }}
              className="px-4 py-2 hover:bg-aquagreen-100 hover:text-aquagreen-800 cursor-pointer transition-colors"
            >
              {prompt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptDropdown;
