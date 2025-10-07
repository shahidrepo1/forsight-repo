import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useClickAway } from "@uidotdev/usehooks";
import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useSelected } from "../../../stores/useSelected";

const platforms = [
  { label: "Youtube", value: "youtube" },
  { label: "Web", value: "web" },
  { label: "X", value: "x" },
];

export default function PlatformsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { clearIds } = useSelected();

  const selected = useMemo(() => {
    return searchParams.get("platforms")?.split(",") ?? [];
  }, [searchParams]);

  const isAllSelected = selected.length === platforms.length;

  const ref = useClickAway(() => {
    setIsOpen(false);
  });

  const updateParams = (updatedSelection: Array<string>) => {
    const newParams = new URLSearchParams(searchParams);
    if (updatedSelection.length) {
      newParams.set("platforms", updatedSelection.join(","));
    } else {
      newParams.delete("platforms");
    }
    setSearchParams(newParams);
  };

  const toggleSelect = (value: string) => {
    const updatedSelection = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    updateParams(updatedSelection);
    clearIds();
  };

  const toggleSelectAll = () => {
    const updatedSelection = isAllSelected
      ? []
      : platforms.map(({ value }) => value);
    updateParams(updatedSelection);
    clearIds();
  };

  return (
    <div
      className="relative w-full"
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      {/* Dropdown Button */}
      <button
        className="flex items-center justify-between w-full h-8 px-4 text-sm border rounded-lg shadow focus:outline-none text-aquagreen-500 border-aquagreen-500 focus-within:border-aquagreen-600 dark:text-dark-text dark:bg-dark-bg"
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        <span className="text-sm text-aquagreen-500 dark:text-white">
          {selected.length > 0
            ? `${selected.length.toString()} selected`
            : "Select Platforms"}
        </span>
        {isOpen ? (
          <FiChevronUp className="text-gray-600" />
        ) : (
          <FiChevronDown className="text-gray-600" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-auto z-10 border-aquagreen-300 dark:text-dark-text dark:bg-dark-bg">
          {/* Select All Option */}
          <label className="flex items-center gap-2 px-4 py-2 cursor-pointer text-xs text-aquagreen-500 hover:bg-aquagreen-50 dark:text-dark-text dark:hover:bg-aquagreen-800 dark:hover:text-aquagreen-50">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="appearance-none w-4 h-4 border border-gray-700 bg-gray-50 rounded-sm relative checked:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 checked:before:content-['✔'] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2"
            />
            Select All
          </label>

          {/* Options List */}
          {platforms.map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2 px-4 py-2 cursor-pointer text-xs text-aquagreen-500 hover:bg-aquagreen-50 dark:text-dark-text dark:hover:bg-aquagreen-800 dark:hover:text-aquagreen-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => {
                  toggleSelect(value);
                }}
                className="appearance-none w-4 h-4 flex-shrink-0 border border-gray-700 bg-gray-50 rounded-sm relative checked:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 checked:before:content-['✔'] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2"
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
