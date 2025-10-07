type PasswordToggleProps = {
  revealPassword: (checked: boolean) => void;
};

export function PasswordToggle({ revealPassword }: PasswordToggleProps) {
  return (
    <label
      htmlFor="showPassword"
      className="flex items-center gap-1 text-sm text-black dark:text-dark-text dark:bg-dark-bg"
    >
      <input
        type="checkbox"
        id="showPassword"
        className="appearance-none w-4 h-4 border border-gray-300 bg-gray-50 rounded-sm relative checked:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 
      checked:before:content-['✔'] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2"
        onChange={(e) => {
          revealPassword(e.target.checked);
        }}
      />
      Show password
    </label>
  );
}
