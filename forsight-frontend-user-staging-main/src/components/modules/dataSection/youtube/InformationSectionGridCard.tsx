import React from "react";

function InformationSectionGridCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-1 space-y-2 text-sm text-black transition-all duration-500 rounded-md bg-white dark:text-dark-text dark:bg-dark-bg">
      {children}
    </div>
  );
}

export default InformationSectionGridCard;
