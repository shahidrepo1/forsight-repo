import { useClickAway } from "@uidotdev/usehooks";
import { type LegacyRef, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Import icons

type Sentiment = "positive" | "negative" | "neutral";

const sentimentOptions: Array<Sentiment> = ["positive", "negative", "neutral"];
type SentimentsDropdownProps = {
  onSentimentChange: (sentiments: Array<string>) => void;
  selectedSentiments: Array<string>;
};

function SelectSentimentsDropdown({
  onSentimentChange,
  selectedSentiments,
}: SentimentsDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const toggleSentiment = (sentiment: Sentiment) => {
    const updatedSentiments = selectedSentiments.includes(sentiment)
      ? selectedSentiments.filter((s) => s !== sentiment)
      : [...selectedSentiments, sentiment];

    onSentimentChange(updatedSentiments);
  };

  const selectAllSentiments = () => {
    if (selectedSentiments.length === sentimentOptions.length) {
      onSentimentChange([]); // Deselect all
    } else {
      onSentimentChange(sentimentOptions); // Select all
    }
  };

  const isSelected = (sentiment: Sentiment) =>
    selectedSentiments.includes(sentiment);

  const ref = useClickAway(() => {
    setIsDropdownOpen(false);
  });

  return (
    <div
      className="relative inline-block w-full"
      ref={ref as LegacyRef<HTMLDivElement> | undefined}
    >
      <button
        onClick={() => {
          setIsDropdownOpen(!isDropdownOpen);
        }}
        className="flex items-center justify-between w-full h-8 px-4 text-sm border rounded-lg shadow focus:outline-none text-aquagreen-500 border-aquagreen-500 focus-within:border-aquagreen-600 dark:text-dark-text dark:bg-dark-bg"
      >
        {/* <span>
          {selectedSentiments.length > 0
            ? selectedSentiments.join(", ")
            : "Select Sentiments"}
        </span> */}
        <span>
          {selectedSentiments.length > 0
            ? `${selectedSentiments.length.toString()} selected`
            : "Select Sentiments"}
        </span>
        {isDropdownOpen ? (
          <FiChevronUp className="ml-2" />
        ) : (
          <FiChevronDown className="ml-2" />
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-md shadow-lg border-aquagreen-300 dark:text-dark-text dark:bg-dark-bg">
          <ul className="overflow-auto max-h-40">
            <li>
              <button
                onClick={selectAllSentiments}
                className={`flex items-center w-full px-4 py-2 text-left text-aquagreen-500 hover:bg-aquagreen-50 focus:outline-none 
                  dark:text-dark-text dark:hover:bg-aquagreen-800 dark:hover:text-aquagreen-50 text-xs`}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedSentiments.length === sentimentOptions.length
                  }
                  readOnly
                  className="mr-2 appearance-none w-4 h-4 border border-gray-700 bg-gray-50 rounded-sm relative checked:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 checked:before:content-['✔'] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2"
                />
                All
              </button>
            </li>
            {sentimentOptions.map((sentiment) => (
              <li key={sentiment}>
                <button
                  onClick={() => {
                    toggleSentiment(sentiment);
                  }}
                  className={`flex items-center w-full px-4 py-2 text-left text-aquagreen-500 hover:bg-aquagreen-50 focus:outline-none
                    dark:text-dark-text dark:hover:bg-aquagreen-800 dark:hover:text-aquagreen-50 text-xs`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected(sentiment)}
                    readOnly
                    className="mr-2 appearance-none w-4 h-4 border border-gray-700 bg-gray-100 rounded-sm relative checked:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 checked:before:content-['✔'] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 "
                  />
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SelectSentimentsDropdown;
