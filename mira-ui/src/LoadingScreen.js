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
  const [searchHeadingVisible, setSearchHeadingVisible] = useState(false);
  const [searchHeadingGradient, setSearchHeadingGradient] = useState(false);
  const [networkHeadingVisible, setNetworkHeadingVisible] = useState(false);
  const [networkHeadingGradient, setNetworkHeadingGradient] = useState(false);
  const [integrationHeadingVisible, setIntegrationHeadingVisible] = useState(false);
  const [integrationHeadingGradient, setIntegrationHeadingGradient] = useState(false);
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [integrationCardsVisible, setIntegrationCardsVisible] = useState(false);
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const handleOpenMira = () => {
    if (onOpenMira) {
      onOpenMira();
    } else {
      navigate('/app');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };

    const searchObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setSearchHeadingVisible(true);
          setSearchHeadingGradient(true);
          // Stop gradient after 3 seconds and make it black
          setTimeout(() => {
            setSearchHeadingGradient(false);
          }, 3000);
          searchObserver.disconnect();
        }
      });
    }, observerOptions);

    const networkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setNetworkHeadingVisible(true);
          setNetworkHeadingGradient(true);
          // Stop gradient after 3 seconds and make it black
          setTimeout(() => {
            setNetworkHeadingGradient(false);
          }, 3000);
          networkObserver.disconnect();
        }
      });
    }, observerOptions);

    const integrationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIntegrationHeadingVisible(true);
          setIntegrationHeadingGradient(true);
          // Stop gradient after 3 seconds and make it black
          setTimeout(() => {
            setIntegrationHeadingGradient(false);
          }, 3000);
          integrationObserver.disconnect();
        }
      });
    }, observerOptions);

    const searchBarObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setSearchBarVisible(true);
          searchBarObserver.disconnect();
        }
      });
    }, observerOptions);

    const integrationCardsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIntegrationCardsVisible(true);
          integrationCardsObserver.disconnect();
        }
      });
    }, observerOptions);

    const quoteObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setQuoteVisible(true);
          quoteObserver.disconnect();
        }
      });
    }, observerOptions);

    // Observe the headings
    const searchHeading = document.querySelector('.search-heading');
    const networkHeading = document.querySelector('.network-heading');
    const integrationHeading = document.querySelector('.integration-heading');
    const searchBar = document.querySelector('.search-bar-container');
    const integrationCards = document.querySelector('.integration-cards-container');
    const quoteSection = document.querySelector('.quote-section');

    if (searchHeading) searchObserver.observe(searchHeading);
    if (networkHeading) networkObserver.observe(networkHeading);
    if (integrationHeading) integrationObserver.observe(integrationHeading);
    if (searchBar) searchBarObserver.observe(searchBar);
    if (integrationCards) integrationCardsObserver.observe(integrationCards);
    if (quoteSection) quoteObserver.observe(quoteSection);

    return () => {
      searchObserver.disconnect();
      networkObserver.disconnect();
      integrationObserver.disconnect();
      searchBarObserver.disconnect();
      integrationCardsObserver.disconnect();
      quoteObserver.disconnect();
    };
  }, []);

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
      <nav className={`nav-bar ${showNavBar ? 'fade-in' : ''}`} style={{ justifyContent: 'center' }}>
        <div className="nav-links" style={{ justifyContent: 'center', width: '100%', display: 'flex' }}>
          <a href="#" className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={() => handlePageChange('home')}>
            <span className="nav-dot"></span>
            Home
          </a>
          <a href="#" className={`nav-link ${currentPage === 'mission' ? 'active' : ''}`} onClick={() => handlePageChange('mission')}>
            Mission
          </a>
          <a href="#" className={`nav-link ${currentPage === 'use-cases' ? 'active' : ''}`} onClick={() => handlePageChange('use-cases')}>
            Use Cases
          </a>
        </div>
      </nav>

      {currentPage === 'home' ? (
        <>
      <div className="loading-content">
        {/* Mira text */}
        <div className={`mira-text ${showMira ? 'fade-in' : ''}`}>
          Mira
        </div>
        
        {/* Subtitle with gradient wave effect */}
        <div className={`subtitle-container ${showSubtitle ? 'fade-in blur-in' : ''}`}>
          <div className="subtitle-text" style={{ fontSize: '2.4rem' }}>
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
            <button className="open-mira-btn" onClick={handleOpenMira} style={{ marginLeft: '20px' }}>
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
        <h2 className={`screenshot-heading thin-heading search-heading ${searchHeadingVisible ? 'fade-in' : ''} ${searchHeadingGradient ? 'gradient-animation' : ''}`}>
          Natural language search, just talk normal
        </h2>
        <div className="screenshot-subtitle">
          Search your network in plain English—just ask.
        </div>
        <div className={`search-bar-container ${searchBarVisible ? 'fade-in' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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
        <h2 className={`screenshot-heading thin-heading network-heading ${networkHeadingVisible ? 'fade-in' : ''} ${networkHeadingGradient ? 'gradient-animation' : ''}`}>
          Grow your network through your people
        </h2>
        <div className="screenshot-subtitle">
          Find connections through your network and their network—grow smarter.
        </div>
        <PeopleCardList people={[
          {
            name: 'Vinoth Ragunathan',
            followers: '13.7K',
            platform: 'twitter',
            username: 'vinothrag',
            avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
            scores: [
              { label: 'Engineering', color: 'green' },
              { label: 'Open Source', color: 'green' },
              { label: 'Recent Activity', color: 'yellow' }
            ],
            quote: 'Just shipped a new React component library that makes UI development 10x faster. Open source is the way forward!'
          },
          {
            name: 'Priya Patel',
            followers: '12.4K',
            platform: 'twitter',
            username: 'priya_builds',
            avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
            scores: [
              { label: 'Engineering', color: 'yellow' },
              { label: 'Open Source', color: 'green' },
              { label: 'Recent Activity', color: 'green' }
            ],
            quote: 'Accessibility in open source is my passion. Every user deserves software that works for them.'
          },
        ]} />
      </section>

      {/* Quote Section */}
      <section className={`quote-section ${quoteVisible ? 'fade-in' : ''}`} style={{ 
        padding: '0px 20px 70px 20px', 
        background: '#f7f7f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Top separator line */}
        <div style={{ 
          width: '60%', 
          height: '1px', 
          background: '#e5e5e5', 
          marginBottom: '30px' 
        }}></div>
        
        {/* Quote content */}
        <div style={{ 
          background: 'transparent', 
          padding: '10px 20px', 
          borderRadius: '0',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: 'none'
        }}>
          <div style={{ 
            fontSize: '1rem', 
            color: '#555', 
            lineHeight: '1.5',
            marginBottom: '15px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            "Mira helped me find the perfect co-founder for my startup. <strong>It's like having a superpower for networking.</strong>"
          </div>
          
          {/* Author info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px'
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              background: '#f0f0f0'
            }}>
              <img 
                src="https://randomuser.me/api/portraits/men/45.jpg" 
                alt="Alex Chen" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                color: '#333',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                Alex Chen
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#666',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                Software Engineer
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom separator line */}
        <div style={{ 
          width: '60%', 
          height: '1px', 
          background: '#e5e5e5', 
          marginTop: '30px' 
        }}></div>
      </section>

      {/* Social Media Integration Section */}
      <section className="screenshot-section">
        <h2 className={`screenshot-heading thin-heading integration-heading ${integrationHeadingVisible ? 'fade-in' : ''} ${integrationHeadingGradient ? 'gradient-animation' : ''}`}>
          Integrate with your favorite platforms
        </h2>
        <div className="screenshot-subtitle">
          Search across all your platforms in one place.
        </div>
        <div className={`integration-cards-container ${integrationCardsVisible ? 'fade-in' : ''}`} style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', marginTop: 32 }}>
          {/* Twitter Card */}
          <div style={{ background: 'transparent', borderRadius: 20, boxShadow: 'none', width: 400, height: 290, display: 'flex', flexDirection: 'column', border: '2px solid #e5e5e5', overflow: 'hidden' }}>
            <div style={{ flex: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </div>
            <div style={{ background: 'transparent', padding: '20px 28px', borderTop: '1px solid #e5e5e5' }}>
              <div style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: 8, color: '#333' }}>Twitter</div>
              <div style={{ color: '#666', fontSize: '1rem', lineHeight: 1.4 }}>Connect your Twitter to search your followers and DMs.</div>
            </div>
          </div>
          {/* LinkedIn Card */}
          <div style={{ background: 'transparent', borderRadius: 20, boxShadow: 'none', width: 400, height: 290, display: 'flex', flexDirection: 'column', border: '2px solid #e5e5e5', overflow: 'hidden' }}>
            <div style={{ flex: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="#0077B5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </div>
            <div style={{ background: 'transparent', padding: '20px 28px', borderTop: '1px solid #e5e5e5' }}>
              <div style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: 8, color: '#333' }}>LinkedIn</div>
              <div style={{ color: '#666', fontSize: '1rem', lineHeight: 1.4 }}>Search your professional network and connections.</div>
            </div>
          </div>
        </div>
      </section>
        </>
      ) : currentPage === 'mission' ? (
        <MissionPage />
      ) : currentPage === 'use-cases' ? (
        <UseCasesPage />
      ) : null}
      
      {/* Footer */}
      <footer style={{ 
        background: '#f7f7f5', 
        padding: '60px 40px 40px 40px', 
        marginTop: 80,
        borderTop: '1px solid #e5e5e5'
      }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 40 
        }}>
          {/* Left Side - Brand/Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 24, 
              height: 24, 
              background: '#000', 
              borderRadius: 5, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: 6,
                height: 6,
                background: '#fff',
                borderRadius: 1
              }}></div>
            </div>
            <span style={{ 
              fontSize: '1.2rem', 
              fontWeight: 700, 
              color: '#000',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Mira
            </span>
          </div>
          
          {/* Right Side - Social Media Icons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              background: '#f1f3f4', 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#666">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <div style={{ 
              width: 40, 
              height: 40, 
              background: '#f1f3f4', 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#666">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </div>
            <div style={{ 
              width: 40, 
              height: 40, 
              background: '#f1f3f4', 
              borderRadius: 8, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#666">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Middle Section - Navigation Links */}
        <div style={{ 
          display: 'flex', 
          gap: 80, 
          marginBottom: 40 
        }}>
          {/* Left Column - Product */}
          <div>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: '#000', 
              marginBottom: 16,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Product
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Pricing', 'Demo', 'Features', 'Integrations', 'FAQ'].map((link) => (
                <a key={link} href="#" style={{ 
                  color: '#666', 
                  textDecoration: 'none', 
                  fontSize: '0.9rem',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {link}
                </a>
              ))}
            </div>
          </div>
          
          {/* Right Column - Company */}
          <div>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: '#000', 
              marginBottom: 16,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Company
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Careers', 'Contact us', 'Homepage', 'Privacy', 'Terms'].map((link) => (
                <a key={link} href="#" style={{ 
                  color: '#666', 
                  textDecoration: 'none', 
                  fontSize: '0.9rem',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: 20,
          borderTop: '1px solid #e5e5e5'
        }}>
          {/* Left Side - Copyright */}
          <div style={{ 
            color: '#666', 
            fontSize: '0.9rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            © 2025 Mira
          </div>
          
          {/* Right Side - Theme Toggle */}
          <div style={{ 
            width: 60, 
            height: 32, 
            background: '#f1f3f4', 
            borderRadius: 16, 
            display: 'flex', 
            alignItems: 'center', 
            padding: '4px',
            cursor: 'pointer'
          }}>
            <div style={{ 
              width: 24, 
              height: 24, 
              background: '#e5e7eb', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginLeft: 0
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#666">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
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

// Add PeopleCard and PeopleCardList components for use in the loading screen
function PeopleCard({ person, index, visible, totalCards }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [activeTooltip, setActiveTooltip] = React.useState(null);
  const baseDelay = totalCards <= 2 ? 0.3 : totalCards <= 4 ? 0.25 : 0.2;
  const animationDelay = index * baseDelay;
  return (
    <div
      style={{
        background: 'transparent',
        borderRadius: 12,
        padding: '20px 24px',
        color: '#232427',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        width: '100%',
        minHeight: 120,
        border: '1.2px solid #e5e5e5',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-40px)',
        transition: `background 0.18s, opacity 1s cubic-bezier(.4,0,.2,1) ${animationDelay}s, transform 1s cubic-bezier(.4,0,.2,1) ${animationDelay}s`,
        margin: 0,
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div style={{ 
        width: 80, 
        height: 80, 
        borderRadius: '50%', 
        overflow: 'hidden', 
        background: '#eee', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: 32, 
        color: '#fff', 
        fontWeight: 700,
        flexShrink: 0
      }}>
        <img src={person.avatarUrl} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: '1.25rem', 
          color: '#555', 
          marginBottom: 8, 
          lineHeight: 1.2,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {person.name}
        </div>
        {/* Followers */}
        <div style={{ 
          color: '#666', 
          fontSize: '0.85rem', 
          marginBottom: 10,
          fontWeight: 500,
          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {person.followers} followers
        </div>
        {/* Social Platform */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 12 
        }}>
          {person.platform === 'twitter' && (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>
                @{person.username}
              </span>
            </>
          )}
          {person.platform === 'github' && (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#333">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>
                {person.username}
              </span>
            </>
          )}
          {person.platform === 'linkedin' && (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077B5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>
                {person.username}
              </span>
            </>
          )}
        </div>
        {/* Accuracy Scores */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          marginBottom: 12,
          alignItems: 'center'
        }}>
          {person.scores.map((score, i) => (
            <span key={i} style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: score.color === 'green' ? '#90d7a7' : score.color === 'yellow' ? '#ffe066' : '#bbb',
              marginRight: 4,
              border: '1.5px solid #fff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }} title={score.label}></span>
          ))}
        </div>
        {/* Relevant Quote */}
        <div style={{ 
          color: '#999', 
          fontSize: '0.9rem', 
          lineHeight: 1.4,
          position: 'relative',
          paddingLeft: 12,
          borderLeft: '2px solid #e5e5e5',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          "{person.quote}"
        </div>
      </div>
    </div>
  );
}

function PeopleCardList({ people }) {
  const [visibleCards, setVisibleCards] = React.useState(Array(people.length).fill(false));
  const cardRefs = React.useRef([]);
  React.useEffect(() => {
    const observers = [];
    people.forEach((_, i) => {
      if (!cardRefs.current[i]) return;
      observers[i] = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const baseDelay = people.length <= 2 ? 300 : people.length <= 4 ? 250 : 200;
            const delay = i * baseDelay;
            setTimeout(() => {
              setVisibleCards((prev) => {
                if (prev[i]) return prev;
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, delay);
            observers[i].disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observers[i].observe(cardRefs.current[i]);
    });
    return () => observers.forEach(obs => obs && obs.disconnect());
  }, [people.length]);
  return (
    <div style={{
      maxWidth: 700,
      margin: '32px auto 0 auto',
      padding: '0 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      paddingBottom: 160,
    }}>
      {people.map((person, i) => (
        <div key={i} ref={el => cardRefs.current[i] = el}>
          <PeopleCard person={person} index={i} visible={visibleCards[i]} totalCards={people.length} />
        </div>
      ))}
    </div>
  );
} 

// Mission Page Component
function MissionPage() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '60px 40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Article Header */}
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          color: '#1a1a1a', 
          marginBottom: '20px',
          lineHeight: '1.2',
          letterSpacing: '-0.02em'
        }}>
          Our Mission
        </h1>
        <p style={{ 
          fontSize: '1.3rem', 
          color: '#666', 
          lineHeight: '1.6',
          marginBottom: '40px'
        }}>
          Building the future of human connection through intelligent networking
        </p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          color: '#888',
          fontSize: '0.9rem'
        }}>
          <span>Published on March 15, 2024</span>
          <span>•</span>
          <span>5 min read</span>
        </div>
      </div>
      
      {/* Article Content */}
      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
          In today's hyperconnected world, we're paradoxically more isolated than ever. While we have access to billions of people through social media, finding meaningful connections that drive our personal and professional growth remains a significant challenge.
        </p>
        
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: '600', 
          color: '#1a1a1a', 
          marginTop: '50px', 
          marginBottom: '25px'
        }}>
          The Problem We're Solving
        </h2>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
          Traditional networking is broken. It's time-consuming, often superficial, and rarely leads to the deep, meaningful connections that truly matter. LinkedIn connections become digital dust, Twitter follows fade into the noise, and email introductions get lost in overflowing inboxes.
        </p>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
          We're building Mira to solve this fundamental human need: the ability to find and connect with the right people at the right time, for the right reasons.
        </p>
        
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: '600', 
          color: '#1a1a1a', 
          marginTop: '50px', 
          marginBottom: '25px'
        }}>
          Our Vision
        </h2>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
          Imagine a world where finding your next co-founder, mentor, or collaborator is as simple as asking a question in plain English. Where your network isn't just a collection of contacts, but a living, breathing ecosystem of opportunities and relationships.
        </p>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
          Mira transforms how we discover and connect with people who share our passions, complement our skills, and align with our goals. We're not just building another social network—we're building the intelligence layer that makes every connection meaningful.
        </p>
        
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: '600', 
          color: '#1a1a1a', 
          marginTop: '50px', 
          marginBottom: '25px'
        }}>
          The Technology
        </h2>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
          At the heart of Mira is advanced natural language processing that understands not just what you're looking for, but why you're looking for it. Our AI analyzes your existing connections, their connections, and the broader network to surface the most relevant people for your specific needs.
        </p>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
          Whether you're searching for "AI researchers working on climate solutions" or "designers who've built products for healthcare," Mira understands context, intent, and nuance in ways that traditional search simply cannot.
        </p>
        
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: '600', 
          color: '#1a1a1a', 
          marginTop: '50px', 
          marginBottom: '25px'
        }}>
          Join Us
        </h2>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
          We're just getting started. The future of networking is intelligent, contextual, and human-centered. It's about quality over quantity, meaning over metrics, and genuine connections over superficial interactions.
        </p>
        
        <p style={{ fontSize: '1.1rem', marginBottom: '50px' }}>
          Join us in building a world where everyone can find their people, their purpose, and their potential through the power of intelligent networking.
        </p>
        
        <div style={{ 
          padding: '30px', 
          background: '#f8f9fa', 
          borderRadius: '12px', 
          border: '1px solid #e5e5e5',
          marginTop: '40px'
        }}>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#555', 
            fontStyle: 'italic',
            margin: 0
          }}>
            "The best way to predict the future is to invent it." — Alan Kay
          </p>
        </div>
      </div>
    </div>
  );
} 

// Use Cases Page Component
function UseCasesPage() {
  const [activeCategory, setActiveCategory] = useState('Featured');
  
  const categories = ['Featured', 'Research', 'Life', 'Data Analysis', 'Education', 'Productivity', 'WTF'];
  
  const useCases = [
    {
      title: "Trip to Japan in april",
      description: "Mira integrates comprehensive travel information to create personalized itineraries and produces a custom travel handbook tailored specifically for your Japanese adventure.",
      icon: "🧳",
      tag: "Maps & Key Locations",
      category: "Featured"
    },
    {
      title: "Interactive course on the momentum theorem",
      description: "Mira develops engaging video presentations for middle school educators, clearly explaining the momentum theorem through accessible and educational content.",
      icon: "⚙️",
      category: "Featured"
    },
    {
      title: "Comparative analysis of insurance policies",
      description: "Looking to compare insurance options? Mira generates clear, structured comparison tables highlighting key policy information with optimal recommendations tailored to your needs.",
      icon: "🔄",
      category: "Featured"
    }
  ];
  
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '60px 40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'transparent'
    }}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ 
          fontSize: '0.9rem', 
          color: '#666', 
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Use cases
        </div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#000', 
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Explore use cases from our official collection.
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#333', 
          lineHeight: '1.5',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Learn how Mira handles real-world tasks through step-by-step replays.
        </p>
      </div>
      
      {/* Category Tabs */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        marginBottom: '60px',
        flexWrap: 'wrap'
      }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{
              padding: '12px 20px',
              borderRadius: '25px',
              border: '1px solid #e5e5e5',
              background: activeCategory === category ? '#000' : 'transparent',
              color: activeCategory === category ? '#fff' : '#000',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Content Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {useCases.map((useCase, index) => (
          <div key={index} style={{ 
            background: 'transparent', 
            borderRadius: '12px', 
            border: '2px solid #e5e5e5',
            padding: '32px',
            boxShadow: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              background: 'transparent',
              borderRadius: '8px'
            }}>
              {useCase.icon}
            </div>
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              color: '#000', 
              marginBottom: '12px',
              lineHeight: '1.3'
            }}>
              {useCase.title}
            </h3>
            <p style={{ 
              fontSize: '0.9rem', 
              color: '#666', 
              lineHeight: '1.5',
              marginBottom: useCase.tag ? '12px' : '0'
            }}>
              {useCase.description}
            </p>
            {useCase.tag && (
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#999',
                marginTop: '8px'
              }}>
                {useCase.tag}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 