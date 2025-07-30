import React, { useState, useEffect } from "react";
import "./LoadingScreen.css";

const LoadingScreen = ({ onOpenMira }) => {
  const [showMira, setShowMira] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [gradientActive, setGradientActive] = useState(false);
  const [gradientPaused, setGradientPaused] = useState(false);
  const [gradientKey, setGradientKey] = useState(0);

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

    // Pause gradient after 3 seconds
    setTimeout(() => {
      setGradientPaused(true);
    }, 3000);

    // Resume gradient after 2 seconds of black text (5 seconds total)
    setTimeout(() => {
      setGradientPaused(false);
      setGradientKey(prev => prev + 1);
    }, 5000);

    // Pause gradient again after 2 seconds of animation (7 seconds total)
    setTimeout(() => {
      setGradientPaused(true);
    }, 7000);

    // Resume gradient again after 2 seconds of black text (9 seconds total)
    setTimeout(() => {
      setGradientPaused(false);
      setGradientKey(prev => prev + 1);
    }, 9000);

    // Continue the cycle - pause after 2 seconds of animation (11 seconds total)
    setTimeout(() => {
      setGradientPaused(true);
    }, 11000);

    // Resume again after 2 seconds of black text (13 seconds total)
    setTimeout(() => {
      setGradientPaused(false);
      setGradientKey(prev => prev + 1);
    }, 13000);
  }, []);

  return (
    <div className="loading-screen">
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
              Turn your network from 0 to 1
            </span>
          </div>
        </div>
        
        {/* Call to action button */}
        <div className={`cta-container ${showButton ? 'fade-in' : ''}`}>
          <div className="cta-pill">
            <span className="demo-text">Try it yourself</span>
            <button className="open-mira-btn" onClick={onOpenMira}>
              Open Mira
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 