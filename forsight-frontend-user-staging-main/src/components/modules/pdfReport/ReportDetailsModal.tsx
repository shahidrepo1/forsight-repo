import { useClickAway } from "@uidotdev/usehooks";
import useGeneratePdfReport from "../../../api/useGeneratePdfReport";
import FixedInsetZeroDiv from "../../primitives/FixedInsetZeroDiv";
import { useState } from "react";
import Input from "../login/Input";

function ReportDetailsModal({ closerFn }: { closerFn: () => void }) {
  const { isFetching, isError, error, refetch } = useGeneratePdfReport();
  const ref = useClickAway(closerFn);
  const [{ title, summary }, setFormDetails] = useState({
    title: "",
    summary: "",
  });

  function handleGenerateReport() {
    refetch()
      .then(({ data }) => {
        const blob = new Blob([data?.data], {
          type: "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        const fileName =
          typeof data?.headers["x-filename"] === "string"
            ? data.headers["x-filename"]
            : "report.pdf";

        a.download = fileName;
        a.click();
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  function generateReportButtonText() {
    if (isFetching) {
      return "Generating Report...";
    }

    if (!title && !summary) {
      return "Generate Report without title and summary";
    }

    return "Generate Report";
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setFormDetails((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }

  return (
    <FixedInsetZeroDiv>
      <form
        ref={ref as React.RefObject<HTMLFormElement>}
        className="py-4 space-y-4 bg-white dark:bg-gray-900 min-w-[500px] px-3 rounded-xl shadow-lg"
        onSubmit={(event) => {
          event.preventDefault();
          handleGenerateReport();
        }}
      >
        {isError && (
          <p className="m-4 text-center text-red-500">{error.message}</p>
        )}
        <div className="space-y-1">
          <label
            htmlFor="title"
            className="block font-medium text-left text-gray-700 dark:text-gray-300"
          >
            Report Title (optional):
          </label>
          <Input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={handleChange}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="summary"
            className="block font-medium text-left text-gray-700 dark:text-gray-300"
          >
            Report Summary (optional):
          </label>
          <textarea
            id="summary"
            name="summary"
            className="flex items-center w-full px-3 py-3 border rounded-lg shadow border-gray-300 focus:border-teal-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            rows={5}
            value={summary}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={closerFn}
            className="px-2 py-1 text-gray-700 bg-gray-300 rounded hover:bg-gray-400 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            disabled={isFetching}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-2 py-1 text-white rounded bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
            disabled={isFetching}
          >
            {generateReportButtonText()}
          </button>
        </div>
      </form>
    </FixedInsetZeroDiv>
  );
}

export default ReportDetailsModal;
