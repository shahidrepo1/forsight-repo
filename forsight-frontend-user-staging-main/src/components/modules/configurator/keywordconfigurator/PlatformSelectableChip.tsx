import { twMerge } from "tailwind-merge";
import type { PlatformType } from "../../../../utils/typeDefinitions";
import { toast } from "react-toastify";

function PlatformSelectableChip({
  platformLabel,
  platformValue,
  isSelected,
  onClick,
  enabled,
  isDown,
}: {
  platformLabel: string;
  platformValue: PlatformType;
  isSelected: boolean;
  onClick: (platformValue: PlatformType) => void;
  enabled: boolean;
  isDown: boolean;
}) {
  function handleClick() {
    if (isDown && !isSelected) {
      toast.info(
        "This crawler is down right now but you can still see existing data"
      );
    }

    onClick(platformValue);
  }

  return (
    <button
      className={twMerge(
        // TODO: remove this px-2 if it does not fit width the total width
        "rounded-full py-0.5 px-2 bg-gray-200 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 text-sm",
        // Dark mode styles
        "dark:text-dark-text dark:bg-dark-bg dark:disabled:bg-dark-bg dark:disabled:text-gray-600",
        isSelected && "bg-aquagreen-500 text-white dark:bg-aquagreen-800",
        isDown && !isSelected && "bg-red-300 text-white"
      )}
      disabled={!enabled}
      onClick={handleClick}
    >
      {platformLabel}
    </button>
  );
}

export default PlatformSelectableChip;
