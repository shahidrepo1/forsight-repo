import { useSearchParams } from "react-router-dom";
import { useGetConfiguredProfile } from "../../../../api/useGetConfiguredProfile";
import SingleProfile from "./SingleProfile";
import AddNewProfileButton from "./AddNewProfileButton";
import useGetParamState from "../../../../hooks/useGetParamsState";
import { useSessionStorage } from "@uidotdev/usehooks";
import { browserStorageKeys } from "../../../../utils/constants";
import Input from "../../../primitives/Input";
import { useState } from "react";
import { useSelected } from "../../../../stores/useSelected";

function ProfileCrawlingData() {
  const [searchTerm, setSearchTerm] = useState("");
  const { active } = useGetParamState();
  const [showSideContainer] = useSessionStorage<boolean>(
    browserStorageKeys.isConfiguratorOpen,
    false
  );
  const enabled = showSideContainer && active === "profile";
  const { data, isLoading, error, isError } = useGetConfiguredProfile({
    enabled,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { clearIds } = useSelected();

  const profileData = data?.profiles;

  const filteredData = profileData?.filter((data) =>
    data.profileUrl.toLowerCase().includes(searchTerm.toLowerCase())
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

  const allProfileIds = profileData?.map((profile) =>
    profile.targetProfileDbId.toString()
  );

  const isAllChecked = allProfileIds?.every((profileId) => {
    return searchParams.get("profiles")?.split(",").includes(profileId);
  });

  function handleAllCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;

    if (isChecked) {
      setSearchParams((currentParams) => {
        currentParams.set("profiles", allProfileIds?.join(",") ?? "");
        return currentParams;
      });
    } else {
      setSearchParams((currentParams) => {
        currentParams.delete("profiles");
        return currentParams;
      });
    }
    clearIds();
  }

  const totalHits =
    profileData?.reduce((acc, profile) => {
      return acc + profile.dataCount;
    }, 0) ?? 0;

  return (
    <div>
      <div className="flex justify-between gap-4">
        <div className="w-full">
          <Input
            placeholder="search profile"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>

        <AddNewProfileButton />
      </div>

      <table className="w-full mt-4">
        <thead>
          <tr className="">
            <th>
              <input
                type="checkbox"
                name="selectAllProfiles"
                checked={isAllChecked}
                onChange={handleAllCheckboxChange}
              />
            </th>
            <th>Profile Links</th>
            <th className="">Platform</th>
            <th className="" title={`Total Hits: ${String(totalHits)}`}>
              Data Count
            </th>
            <th className="">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData?.map((profile) => {
            const { targetProfileDbId } = profile;

            return <SingleProfile key={targetProfileDbId} profile={profile} />;
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ProfileCrawlingData;
