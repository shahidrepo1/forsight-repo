import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useGetPlayList } from "../../../api/useGetPlayList";
import { useClickAway } from "@uidotdev/usehooks";
import { useSearchParams } from "react-router-dom";
import { useSelected } from "../../../stores/useSelected";

export default function PlaylistDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { clearIds } = useSelected();

  const { data } = useGetPlayList();
  const playListData = data?.data ?? [];

  const ref = useClickAway(() => {
    setIsOpen(false);
  });

  // Convert playlist data to label-value pairs
  const playlistNames = playListData.map(({ name }) => ({
    label: name,
    value: name,
  }));

  // Get selected playlists from URL params
  const selectedPlaylists = searchParams.get("playlists")?.split(",") ?? [];
  const isAllSelected = selectedPlaylists.length === playlistNames.length;

  const updateSearchParams = (selectedPlaylists: Array<string>) => {
    const newParams = new URLSearchParams(searchParams);

    const selectedData = playListData.filter((p) =>
      selectedPlaylists.includes(p.name)
    );

    const profiles = new Set<number>();
    const keywordsByPlatform: Record<string, Set<string>> = {};

    selectedData.forEach(({ profiles: p, keywords }) => {
      p.forEach(({ targetProfileDbId }) => profiles.add(targetProfileDbId));

      keywords.forEach(({ platforms, targetKeywordDbId }) => {
        platforms.forEach(({ platform, enabled }) => {
          if (enabled) {
            if (!(platform in keywordsByPlatform)) {
              keywordsByPlatform[platform] = new Set();
            }
            keywordsByPlatform[platform].add(targetKeywordDbId.toString());
          }
        });
      });
    });

    // Update profiles in URL
    if (profiles.size) {
      newParams.set("profiles", Array.from(profiles).join(","));
    } else {
      newParams.delete("profiles");
    }

    // Remove previous keyword params before adding new ones
    playListData
      .flatMap(({ keywords }) =>
        keywords.flatMap(({ platforms }) =>
          platforms.map(({ platform }) => platform)
        )
      )
      .forEach((platform) => {
        newParams.delete(platform);
      });

    Object.entries(keywordsByPlatform).forEach(([platform, keywordIds]) => {
      newParams.set(platform, Array.from(keywordIds).join(","));
    });

    // Store selected playlists in URL
    if (selectedPlaylists.length > 0) {
      newParams.set("playlists", selectedPlaylists.join(","));
    } else {
      newParams.delete("playlists");
    }

    setSearchParams(newParams);
  };

  const toggleSelect = (value: string) => {
    const updatedSelection = selectedPlaylists.includes(value)
      ? selectedPlaylists.filter((v) => v !== value)
      : [...selectedPlaylists, value];

    updateSearchParams(updatedSelection);
    clearIds();
  };

  const toggleSelectAll = () => {
    const updatedSelection = isAllSelected
      ? []
      : playlistNames.map(({ value }) => value);
    updateSearchParams(updatedSelection);
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
          {selectedPlaylists.length > 0
            ? `${selectedPlaylists.length.toString()} selected`
            : "Select Playlist"}
        </span>
        {isOpen ? (
          <FiChevronUp className="text-gray-600" />
        ) : (
          <FiChevronDown className="text-gray-600" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-full bg-white border border-aquagreen-300 rounded-lg shadow-lg max-h-48 overflow-auto z-10 dark:text-dark-text dark:bg-dark-bg scrollbar-thumb-aquagreen-400 scrollbar-thin scrollbar-track-gray-200">
          {/* Select All Option */}
          {playListData.length === 0 && (
            <p className="text-gray-600 py-4 text-center">
              There is no playlist yet
            </p>
          )}
          {playListData.length > 0 && (
            <label className="flex items-center gap-2 px-4 py-2 cursor-pointer text-xs text-aquagreen-500 hover:bg-aquagreen-50 focus:outline-none dark:text-dark-text dark:hover:bg-aquagreen-800 dark:hover:text-aquagreen-50">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="appearance-none w-4 h-4 border border-gray-700 bg-gray-50 rounded-sm relative checked:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 checked:before:content-['✔'] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2"
              />
              Select All
            </label>
          )}

          {/* Options List */}
          {playListData.map(({ name }) => (
            <label
              key={name}
              className="flex items-center gap-2 px-4 py-2 cursor-pointer text-xs text-aquagreen-500 hover:bg-aquagreen-50 focus:outline-none dark:text-dark-text dark:hover:bg-aquagreen-800 dark:hover:text-aquagreen-50"
            >
              <input
                type="checkbox"
                checked={selectedPlaylists.includes(name)}
                onChange={() => {
                  toggleSelect(name);
                }}
                className="appearance-none w-4 h-4 flex-shrink-0 border border-gray-700 bg-gray-50 rounded-sm relative checked:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 checked:before:content-['✔'] checked:before:absolute checked:before:top-1/2 checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2"
              />
              {name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
