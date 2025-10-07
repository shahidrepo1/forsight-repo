import Input from "../../primitives/Input";
import { FaSearch } from "react-icons/fa";
import DateRangePicker from "../../uiComponents/DatePicker";
import { useSearchParams } from "react-router-dom";
import { RiFilterOffFill } from "react-icons/ri";
import useGetParamState from "../../../hooks/useGetParamsState";
import type { DateValueType } from "react-tailwindcss-datepicker";
import SelectSentimentsDropdown from "../../uiComponents/SelectSentimentsDropdown";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import useGetData from "../../../api/useGetData";
import useSendGptPrompts from "../../../api/useSendGptPrompts";
import { useSelected } from "../../../stores/useSelected";
import type { DataUnionType } from "../../../api/useGetData.types";
import { toast } from "react-toastify";
import NewsGptEditableDataModal from "../newsGpt/NewsGptEditableDataModal";
import PlaylistDropdown from "../filters/PlaylistDropdown";
import PlatformsDropdown from "../filters/PlatformsDropdown";
// import twitterBg from "../../../assets/images/twitter-bg.png";
import webBg from "../../../assets/images/web-bg.png";
import ytBg from "../../../assets/images/YT-bg.png";
import PromptsModal from "../newsGpt/PromptsModal";

function formatDateToLocalYMD(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function FiltersHeader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { query, startDate, endDate, sentiments, platforms } =
    useGetParamState();

  const [isUrdu, setIsUrdu] = useState(false);
  const [mkData, setMkData] = useState("");
  const [editableModal, setEditableModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [promptModal, setPromptModal] = useState(false);

  const { mutate, isPending } = useSendGptPrompts();
  const { selectedIds, clearIds } = useSelected();
  const { data } = useGetData();
  const flatMapData = data?.pages.flatMap((page) => page.data) ?? [];
  const filteredData: Array<DataUnionType> = flatMapData.filter((item) =>
    selectedIds.includes(item.uniqueIdentifier)
  );

  const handleSubmitPromptData = (prompt: string) => {
    const formattedData = (
      filteredData.length ? filteredData : flatMapData
    ).map((item) => {
      switch (item.platform) {
        case "x":
          return {
            text: item.tweetText,
            platform: item.platform,
            profile_name: item.targetXProfile.targetProfileScreenName
              ? item.targetXProfile.targetProfileScreenName
              : "",
            image: item.tweetImageLink
              ? item.tweetImageLink
              : "http://192.168.11.60:30151/src/assets/images/twitter-bg.png",
            favorite: item.tweetFavoriteCount,
            view: item.tweetViews ? item.tweetViews : "",
            replies: item.tweetReplies,
            re_share: item.retweetCount,
            comment: item.tweetReplies,
            date: item.tweetCreatedAt,
          };
        case "web":
          return {
            text: item.articleDescription,
            platform: item.platform,
            image: item.originalThumbnail ? item.originalThumbnail : webBg,
            date: item.articlePublishedAt,
          };
        case "youtube":
          return {
            text: item.videoTitle,
            platform: item.platform,
            profile_name: item.targetYoutubeProfile.channelName
              ? item.targetYoutubeProfile.channelName
              : "",
            image: item.originalVideoTumbnailUrl
              ? item.originalVideoTumbnailUrl
              : ytBg,
            view: item.videoViewCount ? item.videoViewCount : "",
            date: item.videoPublishedAt,
          };
        default:
          throw new Error(`Unhandled platform`);
      }
    });
    mutate(
      { prompt, data: formattedData },
      {
        onSuccess: (data) => {
          setPromptModal(false);
          setPrompt(prompt);
          setMkData(data.result);
          setIsUrdu(data.isUrdu);
          setEditableModal(true);
        },
        onError: () => {
          toast.error("Something went wrong.");
        },
      }
    );
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    if (value === "") {
      setSearchParams((currentParams) => {
        currentParams.delete(name);

        return currentParams;
      });
      return;
    }

    setSearchParams((currentParams) => {
      currentParams.set(name, value);
      return currentParams;
    });
    clearIds();
  }

  function handleDateChange(value: DateValueType) {
    setSearchParams((currentParams) => {
      if (value === null) {
        currentParams.delete("startDate");
        currentParams.delete("endDate");
      } else {
        const { startDate, endDate } = value;

        if (startDate) {
          currentParams.set("startDate", formatDateToLocalYMD(startDate));
        } else {
          currentParams.delete("startDate");
        }

        if (endDate) {
          currentParams.set("endDate", formatDateToLocalYMD(endDate));
        } else {
          currentParams.delete("endDate");
        }
      }

      return currentParams;
    });
    clearIds();
  }

  function handleSentimentChange(selectedSentiments: Array<string>) {
    setSearchParams((currentParams) => {
      if (selectedSentiments.length === 0) {
        currentParams.delete("sentiments");
      } else {
        currentParams.set("sentiments", selectedSentiments.join(","));
      }
      return currentParams;
    });
    clearIds();
  }
  const selectedPlaylists = searchParams.get("playlists")?.split(",") ?? [];
  function handleClearFilters() {
    setSearchParams((currentParams) => {
      currentParams.delete("query");
      currentParams.delete("startDate");
      currentParams.delete("endDate");
      currentParams.delete("sentiments");
      currentParams.delete("platforms");
      currentParams.delete("playlists");
      currentParams.delete("web");
      currentParams.delete("youtube");
      currentParams.delete("x");
      currentParams.delete("profiles");

      return currentParams;
    });
    clearIds();
  }

  const areFiltersApplied =
    query !== null ||
    startDate !== null ||
    endDate !== null ||
    sentiments.length > 0 ||
    platforms.length > 0 ||
    selectedPlaylists.length;

  function closePromptModal() {
    setPromptModal(false);
  }

  return (
    <>
      <div className="flex items-center gap-4 dark:text-dark-text dark:bg-dark-bg pb-4 px-4 border-b-aquagreen-500 border-b">
        <Input
          placeholder="Search"
          icon={<FaSearch />}
          type="search"
          name="query"
          value={query ?? ""}
          onChange={handleChange}
        />
        <DateRangePicker
          value={{
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
          }}
          onChange={handleDateChange}
          placeholder="Select Date Range"
        />
        <SelectSentimentsDropdown
          onSentimentChange={handleSentimentChange}
          selectedSentiments={sentiments}
        />
        <PlaylistDropdown />
        <PlatformsDropdown />
        <button
          onClick={() => {
            setPromptModal(true);
          }}
          className="rounded-lg disabled:bg-aquagreen-400 bg-aquagreen-600 hover:bg-aquagreen-700 px-4 py-2 text-center text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={flatMapData.length === 0}
        >
          GPT
        </button>

        <button
          onClick={handleClearFilters}
          className={twMerge(
            "flex items-center justify-center w-8 h-8 rounded-full aspect-square hover:bg-aquagreen-600 text-white bg-aquagreen-500",
            !areFiltersApplied && "invisible"
          )}
          disabled={!areFiltersApplied}
          title="Clear filters"
        >
          <RiFilterOffFill />
        </button>
      </div>
      {promptModal && (
        <PromptsModal
          onClose={closePromptModal}
          onSubmit={handleSubmitPromptData}
          isPending={isPending}
        />
      )}
      {editableModal && (
        <NewsGptEditableDataModal
          onClose={setEditableModal}
          mkData={mkData}
          isUrdu={isUrdu}
          prompt={prompt}
        />
      )}
    </>
  );
}
