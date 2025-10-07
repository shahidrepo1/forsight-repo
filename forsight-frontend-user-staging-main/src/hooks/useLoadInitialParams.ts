import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetConfiguredProfile } from "../api/useGetConfiguredProfile";

function useLoadInitialParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { data } = useGetConfiguredProfile({ enabled: true });

  const profilesIds = data?.profiles.map(
    (profile) => profile.targetProfileDbId
  );

  useEffect(() => {
    const isAlreadySet = !!searchParams.get("profiles");

    if (!isAlreadySet) {
      setSearchParams((currentParams) => {
        if (profilesIds) {
          currentParams.set("profiles", profilesIds.join(","));
        }

        return currentParams;
      });
    }
  }, [setSearchParams, profilesIds, searchParams]);
}

export default useLoadInitialParams;
