import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { useNavigate } from 'react-router-dom';

// Network Dot Component
function NetworkDot({ enabled = false, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
      <button
        onClick={() => onToggle(!enabled)}
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: enabled ? '#4CAF50' : '#f44336',
          border: 'none',
          cursor: 'pointer',
          boxShadow: enabled ? '0 0 8px rgba(76, 175, 80, 0.6)' : '0 0 8px rgba(244, 67, 54, 0.6)',
          transition: 'background 0.2s ease',
        }}
        title={enabled ? "Network only (enabled)" : "Network only (disabled)"}
      />
      <span style={{ 
        color: '#999', 
        fontSize: '0.85rem',
        fontWeight: 400,
        letterSpacing: 0.05,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        Network only
      </span>
    </div>
  );
}

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

function TypingGreeting({ shouldAnimate = true }) {
  const [display, setDisplay] = useState("");
  const [greetIdx, setGreetIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [pause, setPause] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const timeoutRef = useRef();

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplay("Hello,");
      setStopped(true);
      return;
    }
    
    // If animation was stopped and shouldAnimate becomes true, restart immediately
    if (stopped && shouldAnimate) {
      setStopped(false);
      setGreetIdx(0);
      setCharIdx(5); // Start with "Hello," fully typed
      setDeleting(true); // Start in deleting mode
      setPause(false);
      setCycleCount(0);
      setDisplay("Hello,");
      return;
    }
    
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
  }, [charIdx, deleting, greetIdx, pause, stopped, cycleCount, shouldAnimate]);

  return (
    <span>
      {display}
      {!stopped && <span className="typing-cursor">|</span>}
    </span>
  );
}

// Model Dropdown Component
function ModelDropdown({ isOpen, onToggle }) {
  return (
    <div className="model-dropdown-container">
      <button 
        className="model-selector-btn" 
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: '#666',
          padding: '4px 8px',
          borderRadius: '6px',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <span>Gemini 1.5 Pro</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path 
            d="M5 7l5 5 5-5" 
            stroke="#666" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="model-dropdown-menu">
          <div className="model-option selected">
            <div className="model-info">
              <div className="model-name">Gemini 1.5 Pro</div>
              <div className="model-description">Smart, reasoning model for everyday</div>
            </div>
            <div className="model-checkmark">✓</div>
          </div>
          <div className="dropdown-divider"></div>
          <div className="coming-soon-text">More models coming soon</div>
        </div>
      )}
    </div>
  );
}

export default function MainContent({ darkMode }) {
  const [showGlow, setShowGlow] = useState(false);
  const [fadeGlow, setFadeGlow] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [networkOnly, setNetworkOnly] = useState(false);
  const typingTimeout = useRef();
  const fadeTimeout = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const suggestionRef = useRef();
  
  const categorySuggestions = {
    Engineers: [
      'have contributed to open source projects',
      'specialize in AI and machine learning',
      'have worked at top tech companies',
      'are available for freelance work',
    ],
    Designers: [
      'create stunning user interfaces',
      'with experience in branding and identity',
      'have won design awards',
      'open to remote opportunities',
    ],
    Creators: [
      'produce educational content',
      'with a large following on YouTube',
      'focus on technology topics',
      'collaborate with brands',
    ],
    Founders: [
      'of successful startups',
      'have raised venture capital',
      'with experience in SaaS businesses',
      'looking for co-founders',
    ],
    Academia: [
      'research artificial intelligence',
      'with published papers in top journals',
      'open to industry collaboration',
      'who teach at leading universities',
    ],
    Investors: [
      'interested in early-stage startups',
      'focus on climate tech',
      'with a background in engineering',
      'mentor founders',
    ],
    People: [
      'are thought leaders in their field',
      'speak at international conferences',
      'with interdisciplinary backgrounds',
      'are active in online communities',
    ],
  };

  const categoryPrefixes = {
    Engineers: 'Engineers who ',
    Designers: 'Designers who ',
    Creators: 'Creators who ',
    Founders: 'Founders who ',
    Academia: 'Academics who ',
    Investors: 'Investors who ',
    People: 'People who ',
  };

  const [activeCategory, setActiveCategory] = useState(null);

  // Handle clicking outside dropdown to close it and restart typing animation
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if click is outside dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsModelDropdownOpen(false);
      }
      
      // Check if click is outside search area and restart typing animation
      const searchArea = document.querySelector('.input-box');
      if (searchArea && !searchArea.contains(event.target) && hasUserTyped) {
        setHasUserTyped(false);
      }
      // Hide suggestions if click is outside suggestion buttons/options
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setActiveCategory(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModelDropdownOpen, hasUserTyped]);
  
  const handleInput = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setHasUserTyped(true);
    setShowGlow(true);
    setFadeGlow(false);
    // Hide suggestions if input doesn't match the prefix for the active category
    if (!activeCategory || value !== categoryPrefixes[activeCategory]) {
      setActiveCategory(null);
    }
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setFadeGlow(true);
      fadeTimeout.current = setTimeout(() => setShowGlow(false), 700);
    }, 1200);
  };



  const handleModelDropdownToggle = () => {
    setIsModelDropdownOpen(!isModelDropdownOpen);
  };

  const handleCategoryClick = (category) => {
    setInputValue(categoryPrefixes[category]);
    setHasUserTyped(true);
    setActiveCategory(category);
    setTimeout(() => {
      const textarea = document.querySelector('.search-input');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(categoryPrefixes[category].length, categoryPrefixes[category].length);
      }
    }, 0);
  };

  const handleSuggestionClick = (text) => {
    setInputValue(categoryPrefixes[activeCategory] + text);
    setActiveCategory(null);
    setHasUserTyped(true);
    setTimeout(() => {
      const textarea = document.querySelector('.search-input');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange((categoryPrefixes[activeCategory] + text).length, (categoryPrefixes[activeCategory] + text).length);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
      }
    }
  };



  return (
    <div className="main-content-center" style={{ justifyContent: 'flex-start', marginTop: '48px' }}>
      <div>
        <div className="greeting">
          <TypingGreeting shouldAnimate={!hasUserTyped} /><br />
          <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>Who are you looking for today?</span>
        </div>
        <div className={showGlow ? `input-box-effect input-box-effect-glow${fadeGlow ? ' hide' : ''}` : undefined}>
          <div className="input-box" onClick={() => document.querySelector('.search-input').focus()} style={{ minWidth: "300px", width: "auto", background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', boxShadow: '0 2px 8px var(--input-box-shadow)' }}>
            <textarea
              className="search-input"
              placeholder="Describe who you're looking for..."
              value={inputValue}
              style={{
                border: "none",
                outline: "none",
                fontSize: "1.1rem",
                width: "100%",
                minWidth: "300px",
                background: "transparent",
                resize: "none",
                overflow: "hidden",
                fontFamily: "inherit",
                lineHeight: "1.4"
              }}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              rows="1"
            />
            <div style={{ display: "flex", alignItems: "center", marginTop: 0, paddingTop: 12, marginBottom: -16 }}>
              <NetworkDot enabled={networkOnly} onToggle={setNetworkOnly} />
              <div style={{ flex: 1 }} />
              <div ref={dropdownRef}>
                <ModelDropdown 
                  isOpen={isModelDropdownOpen} 
                  onToggle={handleModelDropdownToggle} 
                />
              </div>
              <button 
                className={`input-action-btn ${inputValue.trim() ? 'input-action-btn-active' : ''}`} 
                title="Go"
                disabled
                style={{
                  backgroundColor: inputValue.trim() ? '#000' : '#fff',
                  borderColor: inputValue.trim() ? '#000' : '#e0e0e0',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M5 13l5-5 5 5" 
                    stroke={inputValue.trim() ? '#fff' : '#888'} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {/* Removed buttons: Slides, Image, Video, Audio, Webpage, Playbook */}
            </div>
          </div>
        </div>
        <div ref={suggestionRef}>
          <div className={`suggestion-buttons${activeCategory ? ' transparent' : ''}`} style={{ marginBottom: 40, marginTop: 40, position: 'relative', zIndex: 2 }}>
            <button className="suggestion-btn" 
              onClick={() => handleCategoryClick('Engineers')}
            >Engineers</button>
            <button className="suggestion-btn" 
              onClick={() => handleCategoryClick('Designers')}
            >Designers</button>
            <button className="suggestion-btn" 
              onClick={() => handleCategoryClick('Creators')}
            >Creators</button>
            <button className="suggestion-btn" 
              onClick={() => handleCategoryClick('Founders')}
            >Founders</button>
            <button className="suggestion-btn" 
              onClick={() => handleCategoryClick('Academia')}
            >Academia</button>
            <button className="suggestion-btn" 
              onClick={() => handleCategoryClick('Investors')}
            >Investors</button>
            <button className="suggestion-btn" 
              onClick={() => handleCategoryClick('People')}
            >People</button>
          </div>
          {activeCategory && (
            <ul className="recommendation-list fade-in-down">
              {categorySuggestions[activeCategory].map((suggestion, idx) => (
                <React.Fragment key={suggestion}>
                  <li className="recommendation-item" onClick={() => handleSuggestionClick(suggestion)}>
                    <span className="recommend-me-prefix">{categoryPrefixes[activeCategory]}</span>
                    <span className="recommend-me-suffix">{suggestion}</span>
                  </li>
                  {idx < categorySuggestions[activeCategory].length - 1 && <div className="recommendation-divider"></div>}
                </React.Fragment>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 