import React from "react";
import type { SingleProfileRecordType } from "../../../../api/useGetConfiguredProfile.types";
import { useSearchParams } from "react-router-dom";
import useGetParamState from "../../../../hooks/useGetParamsState";
import DeleteProfileButton from "./DeleteProfileButton";

function SingleProfile({ profile }: { profile: SingleProfileRecordType }) {
  const { targetProfileDbId, platform, profileUrl, dataCount } = profile;

  const { activeProfiles } = useGetParamState();

  const [, setSearchParams] = useSearchParams();

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.target.checked;

    setSearchParams((currentParams) => {
      if (isChecked) {
        currentParams.set(
          "profiles",
          [...activeProfiles, targetProfileDbId.toString()].join(",")
        );
      } else {
        const newActiveProfiles = activeProfiles.filter(
          (profileId) => profileId !== targetProfileDbId.toString()
        );

        if (newActiveProfiles.length === 0) {
          currentParams.delete("profiles");
        } else {
          currentParams.set("profiles", newActiveProfiles.join(","));
        }
      }

      return currentParams;
    });
  }

  const isThisProfileActive = activeProfiles.includes(
    targetProfileDbId.toString()
  );

  return (
    <tr className="text-center">
      <td className="px-3">
        <input
          type="checkbox"
          checked={isThisProfileActive}
          onChange={handleCheckboxChange}
        />
      </td>
      <td className="text-left">{profileUrl}</td>
      <td className="">{platform}</td>
      <td className="">{dataCount}</td>
      <td className="flex items-center justify-center">
        <DeleteProfileButton profileId={targetProfileDbId} />
      </td>
    </tr>
  );
}

export default SingleProfile;
