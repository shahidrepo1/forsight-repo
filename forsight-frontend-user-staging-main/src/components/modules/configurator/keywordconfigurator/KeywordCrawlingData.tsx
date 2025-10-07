import { useGetConfiguredKeyword } from "../../../../api/useGetConfiguredKeyword";
import AddNewKeywordButton from "./AddNewKeywordButton";
import SingleKeyword from "./SingleKeyword";
import useGetParamState from "../../../../hooks/useGetParamsState";
import { useSessionStorage } from "@uidotdev/usehooks";
import { browserStorageKeys } from "../../../../utils/constants";
import SelectAllKeywordsForASinglePlatformButton from "./SelectAllKeywordsForASinglePlatformButton";
import Input from "../../../primitives/Input";
import { useState } from "react";

function KeywordCrawlingData() {
  const [searchTerm, setSearchTerm] = useState("");
  const { active } = useGetParamState();
  const [showSideContainer] = useSessionStorage<boolean>(
    browserStorageKeys.isConfiguratorOpen,
    false
  );
  const enabled = showSideContainer && active === "keyword";
  const { data, isLoading, error, isError } = useGetConfiguredKeyword({
    enabled,
  });

  const keywordData = data?.keywords;

  const filteredData = keywordData?.filter((data) =>
    data.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div>
        <h1>loading....</h1>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">{error.message}</div>;
  }

  const totalHits =
    keywordData?.reduce((acc, keyword) => {
      return acc + keyword.counts.totalDataCount;
    }, 0) ?? 0;

  return (
    <div>
      <div className="flex justify-between gap-4">
        <div className="w-full">
          <Input
            placeholder="Search keyword"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>

        <AddNewKeywordButton />
      </div>
      <table className="w-full">
        <thead>
          <tr className=" text-[#275e5b] dark:text-dark-text dark:bg-dark-bg">
            <th className="">Keyword</th>
            <th>
              <SelectAllKeywordsForASinglePlatformButton platform="x" />
            </th>
            <th>
              <SelectAllKeywordsForASinglePlatformButton platform="youtube" />
            </th>
            <th>
              <SelectAllKeywordsForASinglePlatformButton platform="facebook" />
            </th>
            <th>
              <SelectAllKeywordsForASinglePlatformButton platform="web" />
            </th>
            <th className="" title={`Total hits: ${String(totalHits)}`}>
              Data Count
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="">
          {filteredData?.map((keywordRecord) => {
            const { targetKeywordDbId } = keywordRecord;

            return (
              <SingleKeyword
                key={targetKeywordDbId}
                keywordRecord={keywordRecord}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default KeywordCrawlingData;
