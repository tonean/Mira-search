import React, { useEffect, useRef, useState } from "react";

export default function TypingParagraph({ text }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [paragraphs, setParagraphs] = useState([]);
  const [currentPara, setCurrentPara] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const typingRef = useRef();

  // Split text into paragraphs by double newlines or single newlines
  useEffect(() => {
    const paras = text.split(/\n+/g);
    setParagraphs(paras);
    setCurrentPara(0);
    setCurrentChar(0);
    setDisplayed("");
    setDone(false);
  }, [text]);

  useEffect(() => {
    if (!paragraphs.length || done) return;
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
      }, 1); // ~1ms per char for faster typing
    } else {
      // Pause briefly before next paragraph
      setTimeout(() => {
        setCurrentPara(p => p + 1);
        setCurrentChar(0);
      }, 120); // shorter pause between paragraphs
    }
    return () => clearTimeout(typingRef.current);
  }, [currentChar, currentPara, paragraphs, done]);

  // Fade-in effect for each paragraph
  const rendered = displayed.split("\n\n").map((para, idx) => (
    <p
      key={idx}
      style={{
        opacity: para.length > 0 ? 1 : 0,
        transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
        fontFamily: 'Georgia, serif',
        color: '#222',
        lineHeight: 1.7,
        fontSize: '1.05rem',
        margin: idx === 0 ? '0 0 18px 0' : '18px 0 0 0',
        maxWidth: 700,
        padding: '0 24px',
        marginLeft: 'auto',
        marginRight: 'auto',
        whiteSpace: 'pre-line',
      }}
    >
      {para}
      {(!done && idx === currentPara) ? <span className="typing-cursor">|</span> : null}
    </p>
  ));

  return (
    <div className="ai-trends-text fade-in-animated">
      {rendered}
    </div>
  );
} 