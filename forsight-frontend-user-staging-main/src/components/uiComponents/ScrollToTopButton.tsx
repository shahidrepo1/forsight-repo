import { useEffect, useState } from "react";
import { FaCircleArrowUp } from "react-icons/fa6";

type ScrollToTopButtonProps = {
  scrollableRef: React.RefObject<HTMLDivElement>;
};

function ScrollToTopButton({ scrollableRef }: ScrollToTopButtonProps) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableRef.current && scrollableRef.current.scrollTop > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    const scrollableDiv = scrollableRef.current;
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, [scrollableRef]);

  const scrollToTop = () => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      {showButton && (
        <button
          onClick={scrollToTop}
          className="fixed p-3 text-white transition-all rounded-full shadow-lg bottom-10 right-20 bg-aquagreen-500 hover:bg-aquagreen-700"
        >
          <FaCircleArrowUp />
        </button>
      )}
    </>
  );
}

export default ScrollToTopButton;
