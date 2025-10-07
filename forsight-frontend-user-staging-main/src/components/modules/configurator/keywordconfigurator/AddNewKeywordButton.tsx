import { useState } from "react";
import AddProfileModal from "./AddKeywordModal";

function AddNewKeywordButton() {
  const [isAddProfileModalOpen, setIsAddProfileModalOpen] = useState(false);

  function handleAddProfileClick() {
    setIsAddProfileModalOpen(true);
  }

  function closeModal() {
    setIsAddProfileModalOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="px-3 py-0.5 text-sm border-2 rounded-md hover:bg-aquagreen-500 border-aquagreen-500 text-aquagreen-500 hover:text-white dark:text-dark-text dark:bg-dark-bg"
        onClick={handleAddProfileClick}
      >
        Add
      </button>
      {isAddProfileModalOpen && <AddProfileModal closeModal={closeModal} />}
    </>
  );
}

export default AddNewKeywordButton;
