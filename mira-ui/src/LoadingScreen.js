import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoadingScreen.css";

const LoadingScreen = ({ onOpenMira }) => {
  const navigate = useNavigate();
  const [showMira, setShowMira] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showNavBar, setShowNavBar] = useState(false);
  const [gradientActive, setGradientActive] = useState(false);
  const [gradientPaused, setGradientPaused] = useState(false);
  const [gradientKey, setGradientKey] = useState(0);

  const handleOpenMira = () => {
    if (onOpenMira) {
      onOpenMira();
    } else {
      navigate('/app');
    }
  };

  useEffect(() => {
    // Animate "Mira" text
    setTimeout(() => setShowMira(true), 100);
    
    // Animate subtitle with blur and gradient
    setTimeout(() => {
      setShowSubtitle(true);
      setGradientActive(true);
    }, 300);
    
    // Animate button
    setTimeout(() => setShowButton(true), 600);

    // Animate navigation bar after everything else
    setTimeout(() => setShowNavBar(true), 1000);

    // Start the gradient pause/resume cycle
    const startGradientCycle = () => {
      // Pause after 6 seconds (2 cycles of 3s each)
      setTimeout(() => {
        setGradientPaused(true);
      }, 6000);

      // Resume after 3 seconds of pause (9 seconds total)
      setTimeout(() => {
        setGradientPaused(false);
        setGradientKey(prev => prev + 1);
      }, 9000);

      // Pause again after 6 seconds of animation (15 seconds total)
      setTimeout(() => {
        setGradientPaused(true);
      }, 15000);

      // Resume again after 3 seconds of pause (18 seconds total)
      setTimeout(() => {
        setGradientPaused(false);
        setGradientKey(prev => prev + 1);
      }, 18000);

      // Continue the cycle - pause after 6 seconds of animation (24 seconds total)
      setTimeout(() => {
        setGradientPaused(true);
      }, 24000);

      // Resume again after 3 seconds of pause (27 seconds total)
      setTimeout(() => {
        setGradientPaused(false);
        setGradientKey(prev => prev + 1);
      }, 27000);
    };

    // Start the cycle after the gradient becomes active
    setTimeout(startGradientCycle, 300);
  }, []);

  return (
    <div className="loading-screen">
      {/* Navigation Bar */}
      <nav className={`nav-bar ${showNavBar ? 'fade-in' : ''}`}>
        <div className="nav-logo">
          <div className="logo-icon"></div>
          <span className="logo-text">Mira</span>
        </div>
        
        <div className="nav-links">
          <a href="#" className="nav-link active">
            <span className="nav-dot"></span>
            Home
          </a>
          <a href="#" className="nav-link">
            Mission
          </a>
          <a href="#" className="nav-link">
            Use Cases
          </a>
        </div>
      </nav>

      <div className="loading-content">
        {/* Mira text */}
        <div className={`mira-text ${showMira ? 'fade-in' : ''}`}>
          Mira
        </div>
        
        {/* Subtitle with gradient wave effect */}
        <div className={`subtitle-container ${showSubtitle ? 'fade-in blur-in' : ''}`}>
          <div className="subtitle-text">
            <span 
              key={gradientKey}
              className={`gradient-text ${gradientActive ? 'active' : ''} ${gradientPaused ? 'paused' : ''}`}
            >
              Find your internet peeps
            </span>
          </div>
        </div>
        
        {/* Call to action button */}
        <div className={`cta-container ${showButton ? 'fade-in' : ''}`}>
          <div className="cta-pill">
            <span className="demo-text">Try it yourself</span>
            <button className="open-mira-btn" onClick={handleOpenMira}>
              Open Mira
            </button>
          </div>
          <div className={`launch-team-text ${showButton ? 'fade-in' : ''}`}>
            For Jason Calacanis and the Launch Team →
          </div>
        </div>
      </div>

      {/* Natural Language Search Section */}
      <section className="screenshot-section" style={{ marginBottom: 80 }}>
        <h2 className="screenshot-heading thin-heading">
          Natural language search, just talk normal
        </h2>
        <div className="screenshot-subtitle">
          Search your network in plain English—just ask.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div className="input-box" style={{ minWidth: 600, maxWidth: 900, width: '100%', margin: '0 auto', padding: 0, boxShadow: '0 2px 8px var(--input-box-shadow)', border: '1.5px solid var(--input-border)', borderRadius: 14, background: 'var(--input-bg)', display: 'flex', flexDirection: 'column', gap: 0, minHeight: 38 }}>
            <TypingDemoText />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px 18px 0' }}>
              <button className="input-action-btn" style={{ background: 'none', color: '#bbb', width: 32, height: 32, borderRadius: 16, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: 'none', padding: 0 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l5-5 5 5" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          <div className="suggestion-buttons" style={{ display: 'flex', gap: 24, marginTop: 32, justifyContent: 'center' }}>
            <button className="suggestion-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#4a90e2', fontSize: 20, display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="14" height="10" rx="3" fill="#4a90e2"/><rect x="7" y="8" width="6" height="4" rx="2" fill="#fff"/></svg></span>Startup Founders</button>
            <button className="suggestion-btn selected" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#f7931e', fontSize: 20, display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2l2.09 6.26H18l-5.18 3.76L14.18 18 10 13.47 5.82 18l1.36-5.98L2 8.26h5.91z" fill="#f7931e"/></svg></span>Software Engineers</button>
            <button className="suggestion-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#90d7a7', fontSize: 20, display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5A6.5 6.5 0 1110 3.5a6.5 6.5 0 010 13z" fill="#90d7a7"/></svg></span>VCs</button>
            <button className="suggestion-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#f7c873', fontSize: 20, display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" fill="#f7c873"/><rect x="7" y="7" width="6" height="6" rx="3" fill="#fff"/></svg></span>Product Designers</button>
            <button className="suggestion-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#f76c6c', fontSize: 20, display: 'flex', alignItems: 'center' }}><svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="12" height="12" rx="6" fill="#f76c6c"/><rect x="8" y="8" width="4" height="4" rx="2" fill="#fff"/></svg></span>Researchers</button>
          </div>
        </div>
      </section>

      {/* Network Growth Section */}
      <section className="screenshot-section">
        {/* Removed emoji icon */}
        <h2 className="screenshot-heading thin-heading">
          Grow your network by searching through everyone your people know
        </h2>
        <div className="screenshot-subtitle">
          Find connections through your network and their network—grow smarter.
        </div>
        <div className="screenshot-image-bg">
          <img className="screenshot-image" src="/img/network.png" alt="Network growth illustration" />
        </div>
      </section>

      {/* Social Media Integration Section */}
      <section className="screenshot-section">
        {/* Removed emoji icon */}
        <h2 className="screenshot-heading thin-heading">
          Integrate with your favorite platforms
        </h2>
        <div className="screenshot-subtitle">
          Connect Twitter, LinkedIn, Gmail, Hinge, and more. <b>Search across all your platforms in one place.</b>
        </div>
        <div className="screenshot-image-bg">
          <img className="screenshot-image" src="/img/integrations.png" alt="Social media integrations illustration" />
        </div>
      </section>
    </div>
  );
};

export default LoadingScreen; 

// Typing animation for the search bar demo text
function TypingDemoText() {
  const PHRASES = [
    "AI founders in SF, Stanford alum, pre-seed.",
    "Product designers at unicorn startups.",
    "Investors in climate tech, Series B+.",
  ];
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout;
    let i = 0;
    let backspacing = false;
    let currentPhrase = PHRASES[phraseIdx];

    function typeLoop() {
      if (!backspacing) {
        if (i <= currentPhrase.length) {
          setDisplayed(currentPhrase.slice(0, i));
          i++;
          timeout = setTimeout(typeLoop, 40);
        } else {
          backspacing = true;
          timeout = setTimeout(typeLoop, 1200); // Pause before backspacing
        }
      } else {
        if (i >= 0) {
          setDisplayed(currentPhrase.slice(0, i));
          i--;
          timeout = setTimeout(typeLoop, 20);
        } else {
          backspacing = false;
          setPhraseIdx((prev) => (prev + 1) % PHRASES.length);
        }
      }
    }
    typeLoop();
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [phraseIdx]);

  return (
    <textarea
      className="search-input"
      style={{
        border: 'none',
        outline: 'none',
        fontSize: '1.1rem',
        width: '100%',
        minWidth: '300px',
        background: 'transparent',
        resize: 'none',
        overflow: 'hidden',
        fontFamily: 'inherit',
        lineHeight: '1.4',
        color: '#aaa',
        padding: '24px 24px 24px 24px',
        boxSizing: 'border-box',
        borderRadius: 14,
        minHeight: 80,
        pointerEvents: 'none',
      }}
      rows="2"
      value={displayed}
      readOnly
    />
  );
} 