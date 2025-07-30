import React, { useState, useEffect } from "react";
import "./LoadingScreen.css";

const EnhancedLandingPage = ({ onOpenMira }) => {
  const [showMira, setShowMira] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [gradientActive, setGradientActive] = useState(false);
  const [gradientPaused, setGradientPaused] = useState(false);
  const [gradientKey, setGradientKey] = useState(0);
  const [visibleFeatures, setVisibleFeatures] = useState([]);

  useEffect(() => {
    // Animate "Mira" text
    setTimeout(() => setShowMira(true), 100);
    
    // Animate subtitle with blur and gradient
    setTimeout(() => {
      setShowSubtitle(true);
      setGradientActive(true);
    }, 300);
    
    // Show features section
    setTimeout(() => setShowFeatures(true), 800);
    
    // Animate features one by one
    setTimeout(() => setVisibleFeatures([0]), 1200);
    setTimeout(() => setVisibleFeatures([0, 1]), 1600);
    setTimeout(() => setVisibleFeatures([0, 1, 2]), 2000);
    
    // Show CTA
    setTimeout(() => setShowCTA(true), 2400);

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

  const features = [
    {
      icon: "🔍",
      title: "Find anyone",
      subtitle: "Turn your network from 0 to 1",
      description: "Deep search across everyone you know."
    },
    {
      icon: "💬",
      title: "Just talk normal",
      subtitle: "No buzzwords, no complex queries",
      description: "Just ask for what you're looking for in plain English."
    },
    {
      icon: "⚡",
      title: "Instant results",
      subtitle: "Get answers in seconds",
      description: "AI-powered search that understands context and relationships."
    }
  ];

  return (
    <div className="enhanced-landing">
      <div className="landing-hero">
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
      </div>

      {/* Features Section */}
      <div className={`features-section ${showFeatures ? 'fade-in' : ''}`}>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`feature-card ${visibleFeatures.includes(index) ? 'slide-up' : ''}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-subtitle">{feature.subtitle}</p>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className={`enhanced-cta-section ${showCTA ? 'fade-in' : ''}`}>
        <div className="cta-content">
          <h2 className="cta-heading">Ready to discover your network?</h2>
          <p className="cta-subtext">Join thousands who've already transformed how they connect</p>
          <div className="cta-pill">
            <span className="demo-text">Try it yourself</span>
            <button className="open-mira-btn" onClick={onOpenMira}>
              Open Mira
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
        <div className="floating-square square-1"></div>
        <div className="floating-square square-2"></div>
      </div>
    </div>
  );
};

export default EnhancedLandingPage;