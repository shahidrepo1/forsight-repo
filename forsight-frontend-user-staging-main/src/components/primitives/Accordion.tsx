import React from "react";
import { FaAngleDown } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

function Accordion<T>({
  title,
  children,
  isOpen,
  setIsOpen,
  domain,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (domain: T) => void;
  domain: T;
}) {
  function handleAccordionClick() {
    setIsOpen(domain);
  }

  return (
    <div className="">
      <div
        className={twMerge(
          "flex items-center justify-between w-full px-3 py-2 2xl:py-4 text-white cursor-pointer bg-aquagreen-600 rounded-t-lg 2xl:rounded-t-2xl transition-all",
          isOpen && "rounded-b-none",
          !isOpen && "rounded-b-lg 2xl:rounded-b-2xl"
        )}
        onClick={handleAccordionClick}
      >
        <span className="text-xs font-semibold text-white 2xl:text-base">
          {title}
        </span>
        <FaAngleDown
          className={twMerge(
            "text-white",
            isOpen && "rotate-180 transition-all"
          )}
        />
      </div>
      <div
        className={twMerge(
          "grid transition-all",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-3 bg-gray-100 rounded-b-2xl min-h-64 dark:bg-light-bg dark:text-light-text">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accordion;
