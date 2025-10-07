import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "../stores/useUser";
import { useManageCharts } from "../stores/useManageCharts";
import { useSelected } from "../stores/useSelected";

function useClearUserState() {
  const { clearUser } = useUser();
  const { clearChartsState } = useManageCharts();
  const { clearIds } = useSelected();
  const queryClient = useQueryClient();

  function clearUserState() {
    clearUser();
    clearChartsState();
    clearIds();
    queryClient.removeQueries();
  }

  return { clearUserState };
}

export default useClearUserState;
