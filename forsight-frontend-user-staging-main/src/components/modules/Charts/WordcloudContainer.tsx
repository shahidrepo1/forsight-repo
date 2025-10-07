import WordCloud from "react-d3-cloud";
import useGetWordcloudData from "../../../api/useGetWordcloudData";
import { useCallback, useMemo } from "react";

type Word = {
  text: string;
  value: number;
};

function WordcloudContainer() {
  const { data, isLoading, isError, error } = useGetWordcloudData();

  const nounsData = useMemo(() => {
    return (
      data?.map((item) => {
        return {
          text: item.word,
          value: item.score,
        };
      }) ?? []
    );
  }, [data]);

  const fontSizeCallback = useCallback((word: Word) => {
    const minFont = 15; // smallest readable
    const maxFont = 80; // largest
    return minFont + (word.value / 100) * (maxFont - minFont);
  }, []);

  const randomCallback = useCallback(() => {
    return Math.random();
  }, []);

  if (isError) {
    return (
      <div className="w-full text-center text-red-500">{error.message}</div>
    );
  }

  // const handleMouseOver = useCallback(
  //   (event, word) => {
  //     const wordCount = data?.find((item) => item.word === word.text);

  //     setHoveredWord(wordCount?.count.toString() ?? "0");
  //     setCoords({
  //       x: event.clientX,
  //       y: event.clientY,
  //     });
  //     setIsHovered(true);
  //   },
  //   [data]
  // );

  // const handleMouseOut = useCallback(() => {
  //   setIsHovered(false);
  //   setCoords({
  //     x: 0,
  //     y: 0,
  //   });
  //   setHoveredWord(null);
  // }, []);

  const screenWidth = window.innerWidth;

  return (
    <div className="w-full py-10 bg-white rounded-md shadow-lg dark:text-dark-text dark:bg-dark-bg">
      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-t-4 border-transparent rounded-full border-t-gray-200 animate-spin"></div>
        </div>
      )}
      {!isLoading && (
        <WordCloud
          data={nounsData}
          width={screenWidth - 100}
          // font="times"
          font="sans-serif"
          fontSize={fontSizeCallback}
          fontWeight="bold"
          rotate={0}
          spiral="rectangular"
          padding={10}
          random={randomCallback}
          // onWordMouseOver={handleMouseOver}
          // onWordMouseOut={handleMouseOut}
        />
      )}

      {/* <div
        className={twMerge(
          "absolute z-10 px-6 py-2 text-xl bg-gray-300 rounded-sm shadow-md transition-all",
          isHovered ? "block" : "hidden"
        )}
        style={{ top: coords.y, left: coords.x }}
      >
        <p>{hoveredWord}</p>
      </div> */}
    </div>
  );
}

export default WordcloudContainer;
