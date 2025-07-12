import React, { useEffect, useRef, useState } from "react";
import "./App.css";

// Typing animation component
const greetings = [
  "Hello,",
  "Bonjour,", // French
  "Hallo,",   // German
  "Hola,",    // Spanish
  "Ciao,",    // Italian
  "Olá,",     // Portuguese
  "Salve,",   // Latin
  "こんにちは,", // Japanese
  "안녕하세요,", // Korean
  "你好,",     // Chinese
  "Привет,",  // Russian
];

function TypingGreeting() {
  const [display, setDisplay] = useState("");
  const [greetIdx, setGreetIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [pause, setPause] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const timeoutRef = useRef();

  useEffect(() => {
    if (stopped) {
      // After 15 seconds, restart animation
      timeoutRef.current = setTimeout(() => {
        setStopped(false);
        setGreetIdx(0);
        setCharIdx(0);
        setDeleting(false);
        setPause(false);
        setCycleCount(0);
      }, 15000);
      return () => clearTimeout(timeoutRef.current);
    }
    if (pause) {
      timeoutRef.current = setTimeout(() => setPause(false), 1200);
      return () => clearTimeout(timeoutRef.current);
    }
    if (!deleting && charIdx < greetings[greetIdx].length) {
      timeoutRef.current = setTimeout(() => {
        setDisplay(greetings[greetIdx].slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, 180);
    } else if (!deleting && charIdx === greetings[greetIdx].length) {
      // If at the end of the last greeting, stop after typing 'Hello,'
      if (greetIdx === 0 && cycleCount > 0) {
        setStopped(true);
        setDisplay(greetings[0]);
        return;
      }
      timeoutRef.current = setTimeout(() => setDeleting(true), 1600);
    } else if (deleting && charIdx > 0) {
      timeoutRef.current = setTimeout(() => {
        setDisplay(greetings[greetIdx].slice(0, charIdx - 1));
        setCharIdx(charIdx - 1);
      }, 80);
    } else if (deleting && charIdx === 0) {
      timeoutRef.current = setTimeout(() => {
        const nextIdx = (greetIdx + 1) % greetings.length;
        setGreetIdx(nextIdx);
        setDeleting(false);
        setPause(true);
        if (nextIdx === 0) setCycleCount(cycleCount + 1);
      }, 500);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [charIdx, deleting, greetIdx, pause, stopped, cycleCount]);

  return (
    <span>
      {display}
      {!stopped && <span className="typing-cursor">|</span>}
    </span>
  );
}

export default function MainContent() {
  const [showGlow, setShowGlow] = useState(false);
  const [fadeGlow, setFadeGlow] = useState(false);
  const typingTimeout = useRef();
  const fadeTimeout = useRef();
  const handleInput = () => {
    setShowGlow(true);
    setFadeGlow(false);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setFadeGlow(true);
      fadeTimeout.current = setTimeout(() => setShowGlow(false), 700);
    }, 1200);
  };

  return (
    <div className="main-content-center" style={{ justifyContent: 'flex-start', marginTop: '48px' }}>
      <div>
        <div className="greeting">
          <TypingGreeting /><br />
          <span style={{ fontWeight: 400, color: "#888" }}>How can I help today?</span>
        </div>
        <div className={showGlow ? `input-box-effect input-box-effect-glow${fadeGlow ? ' hide' : ''}` : undefined}>
          <div className="input-box">
            <input
              type="text"
              placeholder="Assign a task or ask anything"
              style={{
                border: "none",
                outline: "none",
                fontSize: "1rem",
                width: "100%",
                background: "transparent"
              }}
              onInput={handleInput}
            />
            <div style={{ display: "flex", alignItems: "center", marginTop: 0, paddingTop: 12 }}>
              <button className="input-action-btn" title="Add">
                <span style={{fontWeight: 400, fontSize: '1.05rem', color: '#888'}}>+</span>
              </button>
              <button className="input-action-btn" title="Mic">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="7" y="4" width="6" height="10" rx="3" fill="#888"/>
                  <rect x="9" y="15" width="2" height="3" rx="1" fill="#888"/>
                  <path d="M5 10V11C5 14 9 14 9 14H11C11 14 15 14 15 11V10" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
              <div style={{ flex: 1 }} />
              <button className="input-action-btn" title="Go">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l5-5 5 5" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {/* Removed buttons: Slides, Image, Video, Audio, Webpage, Playbook */}
            </div>
          </div>
        </div>
        <div className="suggestion-buttons" style={{ marginBottom: 0 }}>
          <button className="suggestion-btn selected">Recommend</button>
          <button className="suggestion-btn">Featured</button>
          <button className="suggestion-btn">Research</button>
          <button className="suggestion-btn">Data</button>
          <button className="suggestion-btn">Edu</button>
          <button className="suggestion-btn">Productivity</button>
          <button className="suggestion-btn">Programming</button>
        </div>
      </div>
    </div>
  );
} 