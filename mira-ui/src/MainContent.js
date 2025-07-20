import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { useNavigate } from 'react-router-dom';

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
  const [isMicActive, setIsMicActive] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const typingTimeout = useRef();
  const fadeTimeout = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();
  // Add file input ref for main search bar
  const fileInputRef = useRef();
  // State for selected files
  const [selectedFiles, setSelectedFiles] = useState([]);
  const suggestionRef = useRef();
  
  const categorySuggestions = {
    Recommend: [
      'Recommend me interesting podcasts for my commute',
      'Recommend me some good sci-fi books to read',
      'Recommend me healthy snacks i can try',
      'Recommend me a movie that blends comedy with adventure',
    ],
    Research: [
      'Research the latest trends in AI',
      'Research climate change impacts in my area',
      'Research the history of the Silk Road',
      'Research effective study techniques',
    ],
    Travel: [
      'Travel destinations for solo adventurers',
      'Travel tips for visiting Japan',
      'Travel packing checklist for Europe',
      'Travel safety advice for first-time flyers',
    ],
    Dining: [
      'Dining options near me',
      'Dining etiquette in France',
      'Dining deals for students',
      'Dining experiences for foodies',
    ],
    Product: [
      'Product reviews for wireless earbuds',
      'Productivity tools for remote teams',
      'Product launch checklist',
      'Product comparison: iPhone vs Android',
    ],
    Fashion: [
      'Fashion trends for this summer',
      'Fashion tips for business casual',
      'Fashion brands that are sustainable',
      'Fashion inspiration for weddings',
    ],
    People: [
      'People who changed the world',
      'People to follow in tech',
      'People skills for leaders',
      'People management best practices',
    ],
  };

  const categoryPrefixes = {
    Recommend: 'Recommend me ',
    Research: 'Research ',
    Travel: 'Travel ',
    Dining: 'Dining ',
    Product: 'Product ',
    Fashion: 'Fashion ',
    People: 'People ',
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

  const handleMicClick = () => {
    setIsMicActive(!isMicActive);
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
    setInputValue(text);
    setActiveCategory(null);
    setHasUserTyped(true);
    setTimeout(() => {
      const textarea = document.querySelector('.search-input');
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(text.length, text.length);
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

  // File input handler for main search bar
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // reset so same file can be picked again
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files && files.length > 0) {
      setSelectedFiles(files);
    }
  };
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="main-content-center" style={{ justifyContent: 'flex-start', marginTop: '48px' }}>
      <div>
        <div className="greeting">
          <TypingGreeting shouldAnimate={!hasUserTyped} /><br />
          <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>How can I help today?</span>
        </div>
        <div className={showGlow ? `input-box-effect input-box-effect-glow${fadeGlow ? ' hide' : ''}` : undefined}>
          <div className="input-box" onClick={() => document.querySelector('.search-input').focus()} style={{ minWidth: "300px", width: "auto", minHeight: selectedFiles.length > 0 ? 120 : undefined, paddingTop: selectedFiles.length > 0 ? 18 : undefined, background: 'var(--input-bg)', border: '1.5px solid var(--input-border)', boxShadow: '0 2px 8px var(--input-box-shadow)' }}>
            {/* File preview inside search bar, above textarea */}
            {selectedFiles.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                margin: '0 0 10px 0',
                padding: '8px 16px 8px 8px',
                background: darkMode ? 'var(--file-bg)' : '#f8f8f8',
                borderRadius: 14,
                boxShadow: '0 1px 4px var(--file-box-shadow)',
                maxWidth: 300,
                minWidth: 220,
                position: 'relative',
              }}>
                <div style={{
                  width: 38,
                  height: 38,
                  background: 'var(--file-bg)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="3" fill="#2196f3"/><path d="M7 7h10M7 11h10M7 15h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '1.05rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{selectedFiles[0].name}</div>
                  <div style={{ color: 'var(--file-label)', fontSize: '0.95rem', marginTop: 2 }}>File</div>
                </div>
                <button
                  onClick={() => handleRemoveFile(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    fontSize: 16,
                    color: 'var(--text)',
                    zIndex: 2,
                  }}
                  title="Remove file"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="var(--text)" strokeWidth="2.2" strokeLinecap="round"/></svg>
                </button>
              </div>
            )}
            {/* Hidden file input for main search bar */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              multiple
            />
            <textarea
              className="search-input"
              placeholder="Search personalized for you..."
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
              <button className="input-action-btn" title="Add" onClick={handleFileInputClick}>
                <span style={{fontWeight: 400, fontSize: '1.05rem', color: '#888'}}>+</span>
              </button>
              <button 
                className={`input-action-btn ${isMicActive ? 'mic-button-active' : ''}`} 
                title="Mic"
                onClick={handleMicClick}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="7" y="4" width="6" height="10" rx="3" fill={isMicActive ? "#fff" : "#888"}/>
                  <rect x="9" y="15" width="2" height="3" rx="1" fill={isMicActive ? "#fff" : "#888"}/>
                  <path d="M5 10V11C5 14 9 14 9 14H11C11 14 15 14 15 11V10" stroke={isMicActive ? "#fff" : "#888"} strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
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
              onMouseEnter={() => setActiveCategory('Recommend')}
              onClick={() => handleCategoryClick('Recommend')}
            >Recommend</button>
            <button className="suggestion-btn" 
              onMouseEnter={() => setActiveCategory('Research')}
              onClick={() => handleCategoryClick('Research')}
            >Research</button>
            <button className="suggestion-btn" 
              onMouseEnter={() => setActiveCategory('Travel')}
              onClick={() => handleCategoryClick('Travel')}
            >Travel</button>
            <button className="suggestion-btn" 
              onMouseEnter={() => setActiveCategory('Dining')}
              onClick={() => handleCategoryClick('Dining')}
            >Dining</button>
            <button className="suggestion-btn" 
              onMouseEnter={() => setActiveCategory('Product')}
              onClick={() => handleCategoryClick('Product')}
            >Product</button>
            <button className="suggestion-btn" 
              onMouseEnter={() => setActiveCategory('Fashion')}
              onClick={() => handleCategoryClick('Fashion')}
            >Fashion</button>
            <button className="suggestion-btn" 
              onMouseEnter={() => setActiveCategory('People')}
              onClick={() => handleCategoryClick('People')}
            >People</button>
          </div>
          {activeCategory && (
            <ul className="recommendation-list fade-in-down">
              {categorySuggestions[activeCategory].map((suggestion, idx) => (
                <React.Fragment key={suggestion}>
                  <li className="recommendation-item" onClick={() => handleSuggestionClick(suggestion)}>
                    <span className="recommend-me-prefix">{categoryPrefixes[activeCategory]}</span>
                    <span className="recommend-me-suffix">{suggestion.replace(categoryPrefixes[activeCategory], '')}</span>
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