import { type InputHTMLAttributes } from "react";

type SearchInputProps = {
  icon?: React.ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

function Input({ icon, ...props }: SearchInputProps) {
  return (
    <div className="flex items-center w-full px-3 border rounded-lg shadow border-aquagreen-500 h-fit focus-within:border-teal-600 dark:text-dark-text dark:bg-dark-bg">
      {icon && <span className="mr-2 text-teal-600">{icon}</span>}

      <input
        {...props}
        className="w-full h-8 placeholder-teal-600 focus:outline-none dark:text-dark-text dark:bg-dark-bg"
      />
    </div>
  );
}

export default Input;
