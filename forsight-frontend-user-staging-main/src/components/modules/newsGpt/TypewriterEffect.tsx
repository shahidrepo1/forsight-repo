import { useEffect, useState } from "react";

const TypewriterEffect = ({
  text,
  onUpdate,
  onComplete, // Callback when typing is finished
}: {
  text: string;
  onUpdate: (value: string) => void;
  onComplete?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCharIndex(0);
  }, [text]);

  useEffect(() => {
    if (charIndex < text.length) {
      const timeout = setTimeout(() => {
        const newText = displayedText + text[charIndex];
        setDisplayedText(newText);
        setCharIndex((prev) => prev + 1);
        onUpdate(newText);
      }, 10);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      onComplete?.(); // Call onComplete when typing is finished
    }
  }, [charIndex, text, displayedText, onUpdate, onComplete]);

  return null;
};

export default TypewriterEffect;
