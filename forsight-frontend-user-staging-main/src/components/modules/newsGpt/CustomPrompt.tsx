import { useState } from "react";

type PromptDropdownProps = {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
};
export default function CustomPrompt({
  onSubmit,
  isLoading,
}: PromptDropdownProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  return (
    <form
      className="flex items-center space-x-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(customPrompt);
      }}
    >
      <input
        type="text"
        placeholder="Enter your prompt..."
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aquagreen-500 focus:border-aquagreen-500 transition-all w-full max-w-sm"
        required
        value={customPrompt}
        onChange={(e) => {
          setCustomPrompt(e.target.value);
        }}
      />
      <button
        type="submit"
        className="bg-aquagreen-500 hover:bg-aquagreen-600 text-white font-medium px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
