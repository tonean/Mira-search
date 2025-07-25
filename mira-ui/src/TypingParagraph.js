import React, { useEffect, useRef, useState } from "react";

export default function TypingParagraph({ text, speed = 1, instant = false }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [paragraphs, setParagraphs] = useState([]);
  const [currentPara, setCurrentPara] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const typingRef = useRef();

  // Treat as single paragraph (no line splitting)
  useEffect(() => {
    const paras = [text]; // Keep as single paragraph
    setParagraphs(paras);
    setCurrentPara(0);
    setCurrentChar(0);
    
    if (instant) {
      setDisplayed(text);
      setDone(true);
    } else {
      setDisplayed("");
      setDone(false);
    }
  }, [text, instant]);

  useEffect(() => {
    if (!paragraphs.length || done || instant) return;
    if (currentPara >= paragraphs.length) {
      setDone(true);
      return;
    }
    if (currentChar <= paragraphs[currentPara].length) {
      typingRef.current = setTimeout(() => {
        setDisplayed(prev => {
          const prevParas = prev.split("\n\n");
          prevParas[currentPara] = paragraphs[currentPara].slice(0, currentChar);
          return prevParas.join("\n\n");
        });
        setCurrentChar(c => c + 1);
      }, speed); // configurable typing speed
    } else {
      // Pause briefly before next paragraph
      setTimeout(() => {
        setCurrentPara(p => p + 1);
        setCurrentChar(0);
      }, 120); // shorter pause between paragraphs
    }
    return () => clearTimeout(typingRef.current);
  }, [currentChar, currentPara, paragraphs, done, instant]);

  // Render as single span without paragraph formatting
  return (
    <span style={{
      lineHeight: 1.6,
      fontSize: 'inherit',
      color: 'inherit',
    }}>
      {displayed}
      {!done ? <span className="typing-cursor">|</span> : null}
    </span>
  );
} 