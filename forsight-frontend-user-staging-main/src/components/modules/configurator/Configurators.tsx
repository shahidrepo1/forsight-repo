import Accordion from "../../primitives/Accordion";
import KeywordCrawlingData from "./keywordconfigurator/KeywordCrawlingData";
import ProfileCrawlingData from "./profileconfigurator/ProfileCrawlingData";
import type { ConfiguratorSectionsType } from "../../../utils/typeDefinitions";
import { useSearchParams } from "react-router-dom";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { MdOutlineEditNote } from "react-icons/md";
import { useState } from "react";
import PlaylistModal from "./PlaylistModal";
import UpdatePlaylistModal from "./UpdatePlaylistModal";
import LogsModal from "../crawlerLogs/LogsModal";
import SchedularLogsModal from "../crawlerLogs/SchedularLogsModal";

function Configurator() {
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isUpdatePlaylistModal, setIsUpdatePlaylistModalOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [schedularLogsOpen, setSchedularLogsOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const active: ConfiguratorSectionsType =
    (searchParams.get("active") as ConfiguratorSectionsType | null) ??
    "profile";

  function setIsOpen(domain: ConfiguratorSectionsType) {
    if (domain === active) {
      setSearchParams((currentParams) => {
        currentParams.set(
          "active",
          active === "profile" ? "keyword" : "profile"
        );

        return currentParams;
      });
      return;
    }

    setSearchParams((currentParams) => {
      currentParams.set("active", domain);

      return currentParams;
    });
  }

  return (
    <>
      <div className="w-full h-full px-3 py-3 space-y-4 grid grid-rows-[auto_1fr] gap-2 overflow-y-scroll scrollbar-thumb-aquagreen-400 scrollbar-thin scrollbar-track-gray-200">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-lg font-semibold text-aquagreen-600 dark:text-dark-text dark:bg-dark-bg">
            Add Keyword/Profile Link
          </h1>
          <div className="flex justify-end space-x-2 ">
            <button
              className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-aquagreen-600 hover:bg-gray-100 dark:text-dark-text dark:bg-dark-bg"
              onClick={() => {
                setSchedularLogsOpen(true);
              }}
            >
              Schedular Logs
            </button>
            <button
              className="px-4 py-2 text-sm font-medium bg-white border rounded-lg text-aquagreen-600 hover:bg-gray-100 dark:text-dark-text dark:bg-dark-bg"
              onClick={() => {
                setIsLogsOpen(true);
              }}
            >
              Logs
            </button>
            <button
              type="button"
              className="flex items-center px-4 py-2 text-sm font-medium bg-white border rounded-lg text-aquagreen-600 hover:bg-gray-100 dark:text-dark-text dark:bg-dark-bg"
              onClick={() => {
                setIsUpdatePlaylistModalOpen(true);
              }}
            >
              <MdOutlinePlaylistAdd className="mr-2" /> Create Playlist
            </button>
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-aquagreen-700 hover:bg-aquagreen-800"
              onClick={() => {
                setIsPlaylistModalOpen(true);
              }}
            >
              <MdOutlineEditNote className="mr-2" /> Playlists
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Accordion
            title="Profile Crawling"
            isOpen={active === "profile"}
            setIsOpen={setIsOpen}
            domain="profile"
          >
            <ProfileCrawlingData />
          </Accordion>
          <Accordion
            title="Keyword Crawling"
            isOpen={active === "keyword"}
            setIsOpen={setIsOpen}
            domain="keyword"
          >
            <KeywordCrawlingData />
          </Accordion>
        </div>
      </div>
      {isUpdatePlaylistModal && (
        <UpdatePlaylistModal
          setIsUpdatePlaylistModalOpen={setIsUpdatePlaylistModalOpen}
        />
      )}
      {isPlaylistModalOpen && (
        <PlaylistModal setIsPlaylistModalOpen={setIsPlaylistModalOpen} />
      )}
      {isLogsOpen && (
        <LogsModal
          setOpen={setIsLogsOpen}
          onClose={() => {
            setIsLogsOpen(false);
          }}
        />
      )}
      {schedularLogsOpen && (
        <SchedularLogsModal setOpen={setSchedularLogsOpen} />
      )}
    </>
  );
}

export default Configurator;
