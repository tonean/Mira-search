import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MainContent from "./MainContent";
import LoadingScreen from "./LoadingScreen";
import SignInPanel from "./SignInPanel";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import "./App.css";
import ConnectionsPage from "./ConnectionsPage";
import TypingParagraph from "./TypingParagraph";
import { supabaseAuth, supabaseDB } from './supabase';

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

// Supabase configuration
// TODO: Replace with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function SearchResults({ darkMode, isSidebarCollapsed, onSignUpClick, user, isAuthenticated }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(query);
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  // Follow-up search bar state and handlers
  const [followupValue, setFollowupValue] = useState("");
  const [networkOnly, setNetworkOnly] = useState(false);
  const followupRef = useRef();
  const editTextRef = useRef();

  const navigate = useNavigate();
  // Share button state
  const [shareCopied, setShareCopied] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const questionRef = useRef();
  const hiddenDivRef = useRef();
  const [showPeopleCards, setShowPeopleCards] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [thinkingDots, setThinkingDots] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showConnectDropdown, setShowConnectDropdown] = useState(false);
  const [animationsCompleted, setAnimationsCompleted] = useState(false);
  const [profileAnimated, setProfileAnimated] = useState({
    header: false,
    overview: false,
    workExperience: false,
    contact: false
  });
  const [connectButtonRef, setConnectButtonRef] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [hoveredPattern, setHoveredPattern] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Effect to show sticky bar when question is out of view
  useEffect(() => {
    const handleScroll = () => {
      if (!questionRef.current) return;
      const rect = questionRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (editing && editTextRef.current) {
      const len = editTextRef.current.value.length;
      editTextRef.current.setSelectionRange(len, len);
      editTextRef.current.focus();
    }
  }, [editing]);

  // Keep editValue in sync with query when query changes (for sidebar switching)
  useEffect(() => {
    setEditValue(query);
  }, [query]);

  // Sync textarea height to hidden div
  useEffect(() => {
    if (editing && editTextRef.current && hiddenDivRef.current) {
      const hiddenDiv = hiddenDivRef.current;
      const textarea = editTextRef.current;
      // Set textarea height to match hidden div
      textarea.style.height = hiddenDiv.offsetHeight + 'px';
    }
  }, [editValue, editing]);

  // Show AI response and people cards with proper timing
  useEffect(() => {
    if (query.trim() === 'Engineers who have contributed to open source projects') {
      // Don't start animations if we're currently viewing a profile
      if (selectedPerson !== null) {
        return;
      }
      
      // If animations were already completed, show everything immediately (returning from profile)
      if (animationsCompleted) {
        setShowAIResponse(true);
        setShowPeopleCards(true);
        setThinkingDots('');
        return;
      }
      
      // Start fresh animations only on first visit
      setShowAIResponse(false);
      setShowPeopleCards(false);
      setThinkingDots('');
      
      let dotCount = 0;
      const dotsInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        setThinkingDots('.'.repeat(dotCount));
      }, 400);
      
      // Show AI response after thinking
      const aiTimer = setTimeout(() => {
        setShowAIResponse(true);
        clearInterval(dotsInterval);
      }, 3200);
      
      // Show people cards after typing animation completes (3.2s thinking + ~3.25s typing + 0.4s buffer)
      const cardsTimer = setTimeout(() => {
        setShowPeopleCards(true);
        setAnimationsCompleted(true); // Mark animations as completed
      }, 6850);
      
      return () => {
        clearTimeout(aiTimer);
        clearTimeout(cardsTimer);
        clearInterval(dotsInterval);
      };
    } else {
      setShowAIResponse(false);
      setShowPeopleCards(false);
      setThinkingDots('');
      setAnimationsCompleted(false); // Reset for other queries
    }
  }, [query, selectedPerson, animationsCompleted]);

  // Trigger profile fade-down animation with staggered timing
  useEffect(() => {
    if (selectedPerson) {
      // Reset all sections
      setProfileAnimated({
        header: false,
        overview: false,
        workExperience: false,
        contact: false
      });
      
      // Stagger each section with delays
      const timers = [
        setTimeout(() => setProfileAnimated(prev => ({ ...prev, header: true })), 100),
        setTimeout(() => setProfileAnimated(prev => ({ ...prev, overview: true })), 300),
        setTimeout(() => setProfileAnimated(prev => ({ ...prev, workExperience: true })), 500),
        setTimeout(() => setProfileAnimated(prev => ({ ...prev, contact: true })), 700)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    } else {
      setProfileAnimated({
        header: false,
        overview: false,
        workExperience: false,
        contact: false
      });
    }
  }, [selectedPerson]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showConnectDropdown && !event.target.closest('.connect-dropdown-container')) {
        setShowConnectDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showConnectDropdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  const handleEdit = () => {
    setEditValue(query);
    setEditing(true);
  };
  const handleEditConfirm = () => {
    // If you want to update the URL/query, do it here (not implemented)
    setEditing(false);
  };
  const handleEditCancel = () => {
    setEditing(false);
    setEditValue(query);
  };
  const handleFollowupInput = (e) => {
    setFollowupValue(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleFollowupKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Implement search or follow-up action here
    }
  };


  // Share button handler
  const handleShare = () => {
    const url = `${window.location.origin}/search?q=${encodeURIComponent(query)}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1200);
  };

  // Related click handler
  const handleRelatedClick = (text) => {
    navigate(`/search?q=${encodeURIComponent(text)}`);
    setEditValue(text);
    setFollowupValue("");
  };

  // --- MOCKUP TEXT ---
  const aiTrendsText = `The latest trends in AI for 2025 center on several key shifts, impacting both technological development and real-world applications:\nAI Reasoning & Agentic AI: Large language models (LLMs) and frontier models are moving beyond mere text generation to advanced reasoning—enabling tools that can interpret, decide, and act on complex tasks. The concept of agentic AI is gaining momentum, with AI agents working autonomously to simplify work and personal life, signaling a shift from passive tools to active collaborators.\nCustom Silicon and Efficiency: As the demand for AI computational power rises, companies are turning to custom silicon—specialized processors designed for AI workloads—to optimize performance and manage energy use. AI is also becoming more resource-efficient, driven by innovations to manage costs and environmental concerns.\nMultimodal and Embodied AI: AI is rapidly expanding past text into multimodal models that combine language, images, video, and audio, as seen in tools like OpenAI's Sora. This enables more dynamic and versatile AI systems. Additionally, embodied AI—where AI powers robots and interacts with the physical world—is progressing, signaling improvements in robotics and automated systems.\nBeyond Chatbots: The focus is shifting away from simple conversational interfaces. Instead, businesses are building software that leverages foundational AI models as back-end infrastructure, deploying generative AI for tasks such as summarizing, analyzing, or autonomously acting on unstructured data.\nAI in Scientific Discovery & Healthcare: AI-driven breakthroughs in science and medicine are accelerating, especially in fields like drug discovery, climate science, and materials engineering. AI-powered research is unlocking solutions to intricate challenges in biomedicine and sustainability.\nMainstream Adoption & Tangible Productivity Gains: Usage of AI in business is skyrocketing, with 78% of organizations adopting AI in 2024 compared to 55% in 2023. The technology is driving productivity gains, skill gap narrowing, and new business models across industries.\nMeasuring AI Efficacy and Responsible AI: With increased adoption comes a greater emphasis on evaluating AI performance and mitigating risks, including privacy, safety, and ethical concerns. Businesses and regulators are developing new benchmarks and metrics for AI effectiveness and trustworthiness.\nCloud Migrations and AI Workloads: Hyperscalers (cloud giants) are investing in infrastructure to accommodate surges in AI workloads, with a focus on secure, scalable cloud solutions integrated with advanced AI capabilities.\nOpen-Weight Models & Accessibility: Open-source and open-weight AI models are narrowing the gap with proprietary systems, making high-quality AI more accessible and affordable for wider use cases.\nDiversification and Benchmark Saturation: As LLMs and foundational models saturate traditional benchmarks, attention is turning toward new domain-specific models and diverse architectures to push the next stage of progress.\nThese trends reflect a broader movement from AI as hype to AI as practical, integrated technology—delivering measurable value, automating complex workflows, and reshaping economic and social systems.`;

  const mockupAnswer = (
    <TypingParagraph text={aiTrendsText} />
  );

  return (
    <div style={{ color: 'var(--text-light)', background: 'var(--bg)', minHeight: '100vh', padding: '48px 0' }}>
      {/* Sticky bar for research question */}
      {query.trim() === 'Research the latest trends in AI' && showStickyBar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000, background: 'var(--bg)', borderBottom: '2px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 62 }}>
          <div style={{ fontWeight: 500, fontSize: '1.3rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60vw', marginLeft: 300 }}>
            Research the latest trends in AI
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!isAuthenticated ? (
              <>
                <button 
                  style={{ backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--border-dark)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', marginRight: '8px' }}
                >
                  Log in
                </button>
                <button 
                  onClick={onSignUpClick}
                  style={{ backgroundColor: 'var(--primary)', color: darkMode ? 'var(--border-dark)' : '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text)', marginRight: '8px' }}>
                  {user?.name}
                </span>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  <img 
                    src={user?.picture} 
                    alt={user?.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span style={{ display: 'none' }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Query row */}
      <div
        ref={questionRef}
        style={{ 
          position: 'relative', 
          marginTop: -20, 
          marginBottom: 38, 
          maxWidth: 1000, 
          marginLeft: 'auto', 
          marginRight: 'auto',
          display: selectedPerson ? 'none' : 'block'
        }}
      >
        {editing ? (
          <div style={{ position: 'relative', width: '100%' }}>
            {/* Hidden div for measuring height */}
            <div
              ref={hiddenDivRef}
              style={{
                position: 'absolute',
                visibility: 'hidden',
                zIndex: -1,
                top: 0,
                left: 0,
                width: '100%',
                fontSize: '1.7rem',
                fontWeight: 500,
                color: 'var(--text)',
                fontFamily: 'inherit',
                border: 'none',
                borderRadius: 0,
                padding: 0,
                background: 'transparent',
                outline: 'none',
                marginRight: 0,
                marginLeft: 150,
                paddingRight: 120,
                boxSizing: 'border-box',
                lineHeight: 1.2,
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
              }}
            >
              {editValue || '\u200b'}
            </div>
            <textarea
              ref={el => {
                editTextRef.current = el;
                if (followupRef) followupRef.current = el;
              }}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              style={{
                fontSize: '1.7rem',
                fontWeight: 500,
                color: 'var(--text)',
                fontFamily: 'inherit',
                border: 'none',
                borderRadius: 0,
                padding: 0,
                background: 'transparent',
                outline: 'none',
                width: '100%',
                minHeight: '2.2em',
                maxHeight: '8em',
                marginRight: 0,
                marginLeft: 150,
                paddingRight: 120,
                boxSizing: 'border-box',
                lineHeight: 1.2,
                overflow: 'auto',
                resize: 'none',
                whiteSpace: 'pre-line',
              }}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditConfirm(); }
                if (e.key === 'Escape') handleEditCancel();
              }}
              rows={1}
            />
            <div style={{ position: 'absolute', top: 0, right: 140, display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={handleEditConfirm}
                style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                title="Confirm"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 10.5l4 4 6-7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button
                onClick={handleEditCancel}
                style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                title="Cancel"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <h1 
                style={{ fontSize: '1.7rem', fontWeight: 500, color: 'var(--text)', margin: 0, paddingRight: 120, marginLeft: 150, whiteSpace: 'pre-line', wordBreak: 'break-word', display: 'inline-block' }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {query}
              </h1>
              {hovered && (
                <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={handleEdit}
                      style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      title="Edit Query"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 13.5V16h2.5l7.1-7.1-2.5-2.5L4 13.5zM15.7 6.04a1 1 0 0 0 0-1.41l-1.3-1.3a1 1 0 0 0-1.41 0l-1.13 1.13 2.5 2.5 1.13-1.13z" fill="#fff"/></svg>
                      <span style={{
                        marginLeft: 6,
                        fontSize: '0.98rem',
                        display: 'none',
                        background: 'var(--primary)',
                        color: 'var(--primary-contrast)',
                        borderRadius: 4,
                        padding: '2px 8px',
                        position: 'absolute',
                        left: '110%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                      }}
                      className="edit-tooltip"
                      >Edit Query</span>
                    </button>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={handleCopy}
                      style={{ background: 'var(--primary)', color: 'var(--primary-contrast)', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', fontSize: '0.98rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      title="Copy Query"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="7" y="7" width="9" height="9" rx="2" stroke="#fff" strokeWidth="1.5"/><rect x="4" y="4" width="9" height="9" rx="2" fill="none" stroke="#fff" strokeWidth="1.5"/></svg>
                      <span style={{
                        marginLeft: 6,
                        fontSize: '0.98rem',
                        display: 'none',
                        background: 'var(--primary)',
                        color: 'var(--primary-contrast)',
                        borderRadius: 4,
                        padding: '2px 8px',
                        position: 'absolute',
                        left: '110%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                      }}
                      className="copy-tooltip"
                      >{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <hr className="ai-divider" />
          </>
        )}
      </div>
            {query.trim() === 'Engineers who have contributed to open source projects' && (
              !showAIResponse ? (
                <div style={{
                  maxWidth: 700,
                  margin: '20px auto 24px auto',
                  padding: '0 24px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  minHeight: 60,
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: darkMode ? 'var(--card-bg)' : '#fff',
                    border: `1.5px solid #f0f0f0`,
                  display: 'flex',
                  alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="10" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.8" fill={darkMode ? 'var(--card-bg)' : '#fff'}/>
                      <circle cx="14" cy="14" r="4.5" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.8" fill={darkMode ? 'var(--card-bg)' : '#fff'}/>
                    </svg>
                  </div>
                  <div style={{
                    flex: 1,
                    color: 'var(--text-muted)',
                    fontSize: '1.05rem',
                    lineHeight: 1.6,
                    marginTop: '12px'
                }}>
                  <span className="thinking-shimmer"><span className="shimmer-text">Finding engineers with recent open source activity{thinkingDots}</span></span>
                  </div>
                </div>
              ) : null
            )}
            {/* AI Response */}
            {query.trim() === 'Engineers who have contributed to open source projects' && showAIResponse && !selectedPerson && (
              <div style={{
                maxWidth: 700,
                margin: '0 auto 24px auto',
                padding: '0 24px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                minHeight: 60,
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: darkMode ? 'var(--card-bg)' : '#fff',
                  border: `1.5px solid #f0f0f0`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="10" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.8" fill={darkMode ? 'var(--card-bg)' : '#fff'}/>
                    <circle cx="14" cy="14" r="4.5" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.8" fill={darkMode ? 'var(--card-bg)' : '#fff'}/>
                  </svg>
                </div>
                <div style={{
                  flex: 1,
                  color: 'var(--text)',
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                  marginTop: '4px'
                }}>
                                        <TypingParagraph text="There are countless engineers who have made significant contributions to open-source projects. Here are a few notable examples:" speed={25} instant={animationsCompleted} />
                </div>
              </div>
            )}

            {/* People Cards */}
            {query.trim() === 'Engineers who have contributed to open source projects' && showPeopleCards && !selectedPerson && (
              <PeopleCardList 
                people={[
                  {
                    name: 'Vinoth Ragunathan',
                    followers: '13.7K',
                    platform: 'twitter',
                    username: 'vinothrag',
                    avatarBg: 'linear-gradient(135deg, #3a8dde 0%, #b388ff 100%)',
                    scores: [
                      { label: 'Engineering', color: 'green' },
                      { label: 'Open Source', color: 'green' },
                      { label: 'Recent Activity', color: 'yellow' }
                    ],
                    quote: 'Just shipped a new React component library that makes UI development 10x faster. Open source is the way forward!'
                  },
                  {
                    name: 'michael shillingburg',
                    followers: '8.2K',
                    platform: 'github',
                    username: 'shillingburger',
                    avatarBg: '#7c3aed',
                    avatarIcon: (
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#7c3aed"/><path d="M32 32c0-4.418-3.582-8-8-8s-8 3.582-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="24" cy="20" r="4" fill="#fff"/></svg>
                    ),
                    scores: [
                      { label: 'Engineering', color: 'green' },
                      { label: 'Open Source', color: 'green' },
                      { label: 'Recent Activity', color: 'green' }
                    ],
                    quote: 'Contributing to 15+ open source projects this year. Code should be accessible to everyone, not just big tech.'
                  },
                  {
                    name: 'Alex Kim',
                    followers: '5.1K',
                    platform: 'linkedin',
                    username: 'alex-kim-dev',
                    avatarBg: 'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)',
                    scores: [
                      { label: 'Engineering', color: 'green' },
                      { label: 'Open Source', color: 'yellow' },
                      { label: 'Recent Activity', color: 'green' }
                    ],
                    quote: 'Built a ML framework that handles distributed training across multiple GPUs. Performance gains are incredible.'
                  },
                  {
                    name: 'Priya Patel',
                    followers: '12.4K',
                    platform: 'twitter',
                    username: 'priya_builds',
                    avatarBg: 'linear-gradient(135deg, #ff6a88 0%, #ff99ac 100%)',
                    scores: [
                      { label: 'Engineering', color: 'yellow' },
                      { label: 'Open Source', color: 'green' },
                      { label: 'Recent Activity', color: 'green' }
                    ],
                    quote: 'Accessibility in open source is my passion. Every user deserves software that works for them.'
                  },
                ]}
                darkMode={darkMode}
                animationsCompleted={animationsCompleted}
                onCardClick={person => {
                  if (person.name === 'Vinoth Ragunathan') setSelectedPerson(person);
                }}
              />
            )}
            {selectedPerson && (
              <div style={{ position: 'relative', minHeight: 60 }}>
                <button onClick={() => setSelectedPerson(null)} style={{ position: 'absolute', left: 80, top: -40, background: 'none', border: 'none', color: darkMode ? '#fff' : '#222', fontWeight: 500, fontSize: '0.98rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, zIndex: 10 }}>
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M13 16l-5-6 5-6" stroke={darkMode ? '#fff' : '#222'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Back
                </button>
                <div style={{ 
                  maxWidth: 700, 
                  margin: '0 auto 0 auto', 
                  color: darkMode ? '#fff' : '#232427', 
                  padding: '0 8px', 
                  paddingBottom: 200
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginTop: 0, 
                    marginBottom: 26,
                    opacity: profileAnimated.header ? 1 : 0,
                    transform: profileAnimated.header ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', background: selectedPerson.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fff', fontWeight: 700 }}>
                      <span style={{ fontSize: 26 }}>{selectedPerson.name[0]}</span>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.02em' }}>{selectedPerson.name}</div>
                        <div style={{ fontSize: '1rem', color: darkMode ? '#bbb' : '#666', fontWeight: 400, marginTop: 6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Senior Software Engineer</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1da1f2">
                            <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                          </svg>
                          <span style={{ fontSize: '0.9rem', color: '#1da1f2', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>@vinoth_ragunathan</span>
                        </div>
                    </div>
                  </div>
                    <div style={{ position: 'relative' }} className="connect-dropdown-container">
                      <button 
                        ref={setConnectButtonRef}
                        onClick={(e) => {
                          if (!showConnectDropdown) {
                            const rect = e.target.getBoundingClientRect();
                            setDropdownPosition({
                              top: rect.bottom + 8,
                              right: window.innerWidth - rect.right
                            });
                          }
                          setShowConnectDropdown(!showConnectDropdown);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 16px',
                          backgroundColor: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: 20,
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: '#333',
                          cursor: 'pointer',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f0f0f0';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        Connect
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2 }}>
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      
                      
                      {/* Connect Dropdown */}
                      {showConnectDropdown && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: 8,
                          backgroundColor: '#ffffff',
                          border: '1px solid #e0e0e0',
                          borderRadius: 12,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          padding: '8px 0',
                          minWidth: 200,
                          zIndex: 9999,
                          isolation: 'isolate'
                        }}>
                          <div style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500, color: '#666', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                            Connect via:
                          </div>
                          
                          {/* Website */}
                          <a href="#" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '0.9rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="#666" strokeWidth="1.5"/>
                              <path d="M8 12h8M12 8c2.5 0 4 1.5 4 4s-1.5 4-4 4M12 16c-2.5 0-4-1.5-4-4s1.5-4 4-4" stroke="#666" strokeWidth="1.5"/>
                            </svg>
                            vinothragunathan.com
                          </a>
                          
                          {/* LinkedIn */}
                          <a href="#" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '0.9rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077B5">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </a>
                          
                          {/* Twitter */}
                          <a href="#" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '0.9rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            Twitter
                          </a>
                          
                          {/* AngelList */}
                          <a href="#" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '0.9rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                              <path d="M8.5 21L12 3l3.5 18L12 18z"/>
                              <circle cx="6" cy="8" r="2" fill="#000"/>
                              <circle cx="18" cy="8" r="2" fill="#000"/>
                            </svg>
                            AngelList
                          </a>
                          
                          {/* Crunchbase */}
                          <a href="#" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '0.9rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <div style={{
                              width: 16,
                              height: 16,
                              backgroundColor: '#0288d1',
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: '#fff'
                            }}>
                              cb
                            </div>
                            Crunchbase
                          </a>
                          
                          {/* Medium */}
                          <a href="#" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '0.9rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                              <circle cx="7" cy="12" r="5"/>
                              <circle cx="18" cy="12" r="3"/>
                            </svg>
                            Medium
                          </a>
                          
                          {/* Substack */}
                          <a href="#" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            textDecoration: 'none',
                            color: '#333',
                            fontSize: '0.9rem',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF6719">
                              <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                            </svg>
                            Substack
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {/* Pattern Tooltip */}
                    {hoveredPattern && (
                      <div style={{
                        position: 'fixed',
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: 4,
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 10000,
                        width: 300,
                        fontSize: '0.85rem',
                        color: darkMode ? '#d1d5db' : '#374151',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        lineHeight: 1.4
                      }}>
                        {hoveredPattern === 'opensource' && (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: darkMode ? '#fbbf24' : '#d97706' }}>Pattern Analysis</div>
                            <div>Open Source Contributors → React Enthusiasts</div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                              Based on data from similar profiles, open source contributors often gravitate toward React ecosystem development.
                            </div>
                          </div>
                        )}
                        {hoveredPattern === 'react' && (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: darkMode ? '#fbbf24' : '#d97706' }}>Pattern Analysis</div>
                            <div>React Devs → Performance Optimization</div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                              React developers frequently develop expertise in performance optimization as they scale applications.
                            </div>
                          </div>
                        )}
                        {hoveredPattern === 'community' && (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: darkMode ? '#fbbf24' : '#d97706' }}>Pattern Analysis</div>
                            <div>Node.js Users → Community Leaders</div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                              Node.js developers often become community mentors due to the collaborative nature of the ecosystem.
                            </div>
                          </div>
                        )}
                        {hoveredPattern === 'performance' && (
                          <div>
                            <div style={{ fontWeight: 600, marginBottom: 4, color: darkMode ? '#fbbf24' : '#d97706' }}>Pattern Analysis</div>
                            <div>Performance Devs → System Architects</div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? '#9ca3af' : '#6b7280', marginTop: 4 }}>
                              Performance optimization specialists often evolve into system architecture roles as they gain experience.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    opacity: profileAnimated.overview ? 1 : 0,
                    transform: profileAnimated.overview ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 32, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>Overview</div>
                    <div style={{ fontSize: '0.95rem', color: darkMode ? '#d1d5db' : '#555', marginBottom: 28, lineHeight: 1.6, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}>
                    Vinoth Ragunathan is a senior software engineer with extensive experience in open source development. He has contributed to major projects like React, Node.js, and various developer tools. His expertise spans full-stack development, system architecture, and developer experience optimization. Vinoth is known for his thoughtful code reviews and mentorship in the open source community.
                  </div>
                  </div>
                  <div style={{ 
                    opacity: profileAnimated.workExperience ? 1 : 0,
                    transform: profileAnimated.workExperience ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                                        <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>Why we think you're a good match</div>
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                    </div>
                                                <span 
                          style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', fontWeight: 500, fontFamily: 'Georgia, "Times New Roman", serif', cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('opensource');
                            setTooltipPosition({ x: e.target.getBoundingClientRect().right + 20, y: e.target.getBoundingClientRect().top });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          Open Source Contributor
                        </span>
                        <svg 
                          width="14" height="14" viewBox="0 0 24 24" fill="none" 
                          style={{ marginLeft: 4, cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('opensource');
                            setTooltipPosition({ x: e.target.getBoundingClientRect().right + 20, y: e.target.getBoundingClientRect().top });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5"/>
                          <path d="M12 16v-4M12 8h.01" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <span 
                          style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', fontWeight: 500, fontFamily: 'Georgia, "Times New Roman", serif', cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('react');
                            setTooltipPosition({ x: e.target.getBoundingClientRect().right + 20, y: e.target.getBoundingClientRect().top });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          React & Node.js Expert
                        </span>
                        <svg 
                          width="14" height="14" viewBox="0 0 24 24" fill="none" 
                          style={{ marginLeft: 4, cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('react');
                            setTooltipPosition({ x: e.target.getBoundingClientRect().right + 20, y: e.target.getBoundingClientRect().top });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5"/>
                          <path d="M12 16v-4M12 8h.01" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <span 
                          style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', fontWeight: 500, fontFamily: 'Georgia, "Times New Roman", serif', cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('community');
                            setTooltipPosition({ x: e.target.getBoundingClientRect().right + 20, y: e.target.getBoundingClientRect().top });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          Community Mentor
                        </span>
                        <svg 
                          width="14" height="14" viewBox="0 0 24 24" fill="none" 
                          style={{ marginLeft: 4, cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('community');
                            setTooltipPosition({ x: e.target.getBoundingClientRect().right + 20, y: e.target.getBoundingClientRect().top });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5"/>
                          <path d="M12 16v-4M12 8h.01" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <span 
                          style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', fontWeight: 500, fontFamily: 'Georgia, "Times New Roman", serif', cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('performance');
                            setTooltipPosition({ x: e.target.getBoundingClientRect().right + 20, y: e.target.getBoundingClientRect().top });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          Performance Optimization Specialist
                        </span>
                        <svg 
                          width="14" height="14" viewBox="0 0 24 24" fill="none" 
                          style={{ marginLeft: 4, cursor: 'pointer' }}
                          onMouseEnter={(e) => {
                            setHoveredPattern('performance');
                            setTooltipPosition({ x: e.target.getBoundingClientRect().top });
                          }}
                          onMouseLeave={() => setHoveredPattern(null)}
                        >
                          <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.5"/>
                          <path d="M12 16v-4M12 8h.01" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    opacity: profileAnimated.workExperience ? 1 : 0,
                    transform: profileAnimated.workExperience ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>What can you say to them</div>
                    <div style={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#f8fafc', 
                      border: `1px solid ${darkMode ? '#374151' : '#e2e8f0'}`, 
                      borderRadius: 12, 
                      padding: '16px', 
                      marginBottom: 28 
                    }}>
                      <div style={{ fontSize: '0.9rem', color: darkMode ? '#9ca3af' : '#64748b', marginBottom: 8, fontWeight: 500 }}>Based on similar conversations:</div>
                      <div style={{ fontSize: '0.95rem', color: darkMode ? '#d1d5db' : '#334155', lineHeight: 1.5, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}>
                        "Hi Vinoth! I was impressed by your contributions to React and Node.js. Your work on developer experience optimization really caught my attention. I'd love to discuss potential collaboration opportunities or learn more about your approach to open source development. Would you be interested in connecting?"
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    opacity: profileAnimated.workExperience ? 1 : 0,
                    transform: profileAnimated.workExperience ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>Timeline</div>
                                         <div style={{ marginBottom: 24 }}>
                       {/* Timeline Item 1 - Tweet */}
                       <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                         <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#1da1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                             <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                           </svg>
                         </div>
                         <div style={{ flex: 1 }}>
                           <div style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', marginBottom: 4, fontWeight: 500 }}>Vinoth tweeted</div>
                           <div style={{ fontSize: '0.85rem', color: darkMode ? '#9ca3af' : '#666' }}>"Just merged a major performance optimization to React's concurrent features. The bundle size reduction is incredible! 🚀 #React #OpenSource #Performance"</div>
                           <div style={{ fontSize: '0.8rem', color: darkMode ? '#6b7280' : '#888', marginTop: 4 }}>2 days ago</div>
                         </div>
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                           <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" stroke="#9ca3af" strokeWidth="1.5"/>
                         </svg>
                       </div>
                       
                       {/* Timeline Item 2 - Retweet */}
                       <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                         <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#17bf63', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                             <path d="M23 4v6.67A4 4 0 0 1 17.67 15H15M1 20v-6.67A4 4 0 0 1 6.33 9H9"/>
                           </svg>
                         </div>
                         <div style={{ flex: 1 }}>
                           <div style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', marginBottom: 4, fontWeight: 500 }}>Vinoth retweeted @ReactTeam</div>
                           <div style={{ fontSize: '0.85rem', color: darkMode ? '#9ca3af' : '#666' }}>"React 18.3 is now available with improved concurrent features and better developer experience. Check out the release notes!"</div>
                           <div style={{ fontSize: '0.8rem', color: darkMode ? '#6b7280' : '#888', marginTop: 4 }}>3 days ago</div>
                         </div>
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                           <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" stroke="#9ca3af" strokeWidth="1.5"/>
                         </svg>
                       </div>
                       
                       {/* Timeline Item 3 - Like */}
                       <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                         <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#e0245e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                             <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                           </svg>
                         </div>
                         <div style={{ flex: 1 }}>
                           <div style={{ fontSize: '0.9rem', color: darkMode ? '#d1d5db' : '#333', marginBottom: 4, fontWeight: 500 }}>Vinoth liked @NodeJS</div>
                           <div style={{ fontSize: '0.85rem', color: darkMode ? '#9ca3af' : '#666' }}>"Node.js 20.10.0 is now available with security updates and performance improvements. Upgrade your applications!"</div>
                           <div style={{ fontSize: '0.8rem', color: darkMode ? '#6b7280' : '#888', marginTop: 4 }}>1 week ago</div>
                         </div>
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2 }}>
                           <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6z" stroke="#9ca3af" strokeWidth="1.5"/>
                         </svg>
                       </div>
                      
                      {/* Show more button */}
                      <div style={{ 
                        border: '1px solid #8b5cf6', 
                        borderRadius: 8, 
                        padding: '8px 12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff">
                            <path d="M7 14l5-5 5 5"/>
                          </svg>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#8b5cf6', fontWeight: 500 }}>2 more interactions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    opacity: profileAnimated.workExperience ? 1 : 0,
                    transform: profileAnimated.workExperience ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 16, marginTop: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>Predicted Interests</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                      <div style={{ 
                        backgroundColor: darkMode ? '#374151' : '#f3f4f6', 
                        color: darkMode ? '#d1d5db' : '#374151',
                        padding: '6px 12px', 
                        borderRadius: 16, 
                        fontSize: '0.85rem', 
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'}
                      >
                        React
                      </div>
                      <div style={{ 
                        backgroundColor: darkMode ? '#374151' : '#f3f4f6', 
                        color: darkMode ? '#d1d5db' : '#374151',
                        padding: '6px 12px', 
                        borderRadius: 16, 
                        fontSize: '0.85rem', 
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'}
                      >
                        Node.js
                      </div>
                      <div style={{ 
                        backgroundColor: darkMode ? '#374151' : '#f3f4f6', 
                        color: darkMode ? '#d1d5db' : '#374151',
                        padding: '6px 12px', 
                        borderRadius: 16, 
                        fontSize: '0.85rem', 
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'}
                      >
                        Open Source
                      </div>
                      <div style={{ 
                        backgroundColor: darkMode ? '#374151' : '#f3f4f6', 
                        color: darkMode ? '#d1d5db' : '#374151',
                        padding: '6px 12px', 
                        borderRadius: 16, 
                        fontSize: '0.85rem', 
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'}
                      >
                        Performance
                      </div>
                      <div style={{ 
                        backgroundColor: darkMode ? '#374151' : '#f3f4f6', 
                        color: darkMode ? '#d1d5db' : '#374151',
                        padding: '6px 12px', 
                        borderRadius: 16, 
                        fontSize: '0.85rem', 
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'}
                      >
                        Architecture
                      </div>
                      <div style={{ 
                        backgroundColor: darkMode ? '#374151' : '#f3f4f6', 
                        color: darkMode ? '#d1d5db' : '#374151',
                        padding: '6px 12px', 
                        borderRadius: 16, 
                        fontSize: '0.85rem', 
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#4b5563' : '#e5e7eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = darkMode ? '#374151' : '#f3f4f6'}
                      >
                        Mentorship
                      </div>
                    </div>
                </div>
                  <div style={{ 
                    opacity: profileAnimated.contact ? 1 : 0,
                    transform: profileAnimated.contact ? 'translateY(0)' : 'translateY(-20px)',
                    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 12, marginTop: 20, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#111' }}>Contact</div>
                    <div style={{ fontSize: '0.95rem', color: darkMode ? '#bbb' : '#666', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', fontWeight: 400 }}>vinoth@duffgardens.com</div>
              </div>
      </div>
              </div>
            )}
      {/* Follow-up input fixed at the bottom, overlaying the answer text */}
      <div 
        className={
          !isSidebarCollapsed ? 'followup-bar-sidebar-expanded' : ''
        }
        style={{ position: 'fixed', left: 80, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', zIndex: 100 }}
      >
        <div className="input-box" style={{ minWidth: 300, maxWidth: 700, width: '100%', margin: 0, padding: 0, boxShadow: '0 2px 8px var(--input-box-shadow)', border: '1.5px solid var(--input-border)', borderRadius: 14, background: 'var(--input-bg)', display: 'flex', flexDirection: 'column', gap: 0, minHeight: 38 }}>
          <textarea
            ref={followupRef}
            className="search-input"
            placeholder="Ask a follow-up..."
            value={followupValue}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              width: '100%',
              minWidth: '300px',
              background: 'transparent',
              resize: 'none',
              overflow: 'hidden',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              padding: '10px 14px 10px 14px',
              borderRadius: 14,
              minHeight: 38,
              boxSizing: 'border-box',
              color: '#222',
            }}
            onInput={handleFollowupInput}
            onKeyDown={handleFollowupKeyDown}
            rows="1"
          />
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 0, paddingTop: 4, marginBottom: 10 }}>
            <NetworkDot enabled={networkOnly} onToggle={setNetworkOnly} />
            <div style={{ flex: 1 }} />
            <button 
              className={`input-action-btn ${followupValue.trim() ? 'input-action-btn-active' : ''}`} 
              title="Go"
              disabled={!followupValue.trim()}
              style={{
                backgroundColor: followupValue.trim() ? '#232427' : '#232427',
                borderColor: followupValue.trim() ? '#232427' : '#232427',
                color: '#fafaf8',
                transition: 'all 0.2s ease',
                cursor: followupValue.trim() ? 'pointer' : 'default',
                marginRight: 8,
                marginTop: -8
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M5 13l5-5 5 5" 
                  stroke={'#fafaf8'} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Answer text (no card, no background) */}
      {query.trim() === 'Research the latest trends in AI' && (
        <div style={{ marginTop: 0, paddingBottom: 200 }}>
          {mockupAnswer}
          {/* Share button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 700, margin: '32px auto 0 auto', padding: '0 24px' }}>
            <button
              className="share-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '5px 12px', fontWeight: 500, fontSize: '0.95rem', color: '#222', cursor: 'pointer', boxShadow: 'none', transition: 'background 0.18s' }}
              onClick={handleShare}
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ marginRight: 3 }}><path d="M15 8.5V6.5C15 4.567 13.433 3 11.5 3C9.567 3 8 4.567 8 6.5V8.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/><path d="M11.5 13.5V6.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/><path d="M5 10.5V13.5C5 15.433 6.567 17 8.5 17C10.433 17 12 15.433 12 13.5V10.5" stroke="#222" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {shareCopied ? 'Copied!' : 'Share'}
            </button>
          </div>
          {/* Related section */}
          <div className="related-section" style={{ maxWidth: 700, margin: '48px auto 0 auto', padding: '0 24px' }}>
            <div style={{ fontWeight: 600, fontSize: '1.18rem', color: '#222', marginBottom: 18 }}>Similar Questions</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li className="related-item" style={{ padding: '12px 0', borderBottom: '1px solid #ececec', color: '#234', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 7 }} onClick={() => handleRelatedClick('How is agentic AI changing the workplace?')}>
                How is agentic AI changing the workplace?
              </li>
              <li className="related-item" style={{ padding: '12px 0', borderBottom: '1px solid #ececec', color: '#234', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 7 }} onClick={() => handleRelatedClick('What are the top open-source AI models in 2024?')}>
                What are the top open-source AI models in 2024?
              </li>
              <li className="related-item" style={{ padding: '12px 0', borderBottom: '1px solid #ececec', color: '#234', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 7 }} onClick={() => handleRelatedClick('AI trends in healthcare and medicine')}>
                AI trends in healthcare and medicine
              </li>
              <li className="related-item" style={{ padding: '12px 0', borderBottom: '1px solid #ececec', color: '#234', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.15s', borderRadius: 7 }} onClick={() => handleRelatedClick('What is multimodal AI and why does it matter?')}>
                What is multimodal AI and why does it matter?
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [showSignIn, setShowSignIn] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // Add chat history state

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleOpenMira = () => {
    setShowLoadingScreen(false);
  };

  const toggleDarkMode = () => setDarkMode((d) => !d);

  // Handler to add a chat/search to history
  const handleAddChat = useCallback((query) => {
    console.log("Adding chat to history:", query);
    setChatHistory((prev) => {
      if (!query.trim() || prev.includes(query)) {
        console.log("Query already exists or is empty, skipping");
        return prev;
      }
      const newHistory = [query, ...prev].slice(0, 20); // keep max 20
      console.log("New chat history:", newHistory);
      
      // Save to localStorage if user is authenticated
      const savedUser = localStorage.getItem('mira_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          localStorage.setItem(`mira_chat_history_${userData.id}`, JSON.stringify(newHistory));
          console.log("Saved chat history to localStorage for user:", userData.id);
        } catch (error) {
          console.error("Error saving chat history:", error);
        }
      } else {
        console.log("No authenticated user found, not saving to localStorage");
      }
      
      return newHistory;
    });
  }, []);

  // Handler to delete a chat by index
  const handleDeleteChat = useCallback((idx) => {
    console.log("Deleting chat at index:", idx);
    setChatHistory((prev) => {
      const newHistory = prev.filter((_, i) => i !== idx);
      console.log("Updated chat history after deletion:", newHistory);
      
      // Save to localStorage if user is authenticated
      const savedUser = localStorage.getItem('mira_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          localStorage.setItem(`mira_chat_history_${userData.id}`, JSON.stringify(newHistory));
          console.log("Saved updated chat history to localStorage for user:", userData.id);
        } catch (error) {
          console.error("Error saving chat history:", error);
        }
      } else {
        console.log("No authenticated user found, not saving to localStorage");
      }
      
      return newHistory;
    });
  }, []);

  // Function to clear chat history (called on logout)
  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  // Function to restore chat history for a specific user
  const restoreChatHistory = useCallback((userId) => {
    console.log("Attempting to restore chat history for user:", userId);
    const savedChatHistory = localStorage.getItem(`mira_chat_history_${userId}`);
    console.log("Found saved chat history:", savedChatHistory);
    
    if (savedChatHistory) {
      try {
        const chatHistory = JSON.parse(savedChatHistory);
        setChatHistory(chatHistory);
        console.log("Successfully restored chat history for user:", userId, chatHistory);
      } catch (error) {
        console.error("Error parsing saved chat history:", error);
        setChatHistory([]);
      }
    } else {
      console.log("No saved chat history found for user:", userId);
      setChatHistory([]);
    }
  }, []);

  if (showLoadingScreen) {
    return <LoadingScreen onOpenMira={handleOpenMira} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="*" element={<AppWithRouter
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          showSignIn={showSignIn}
          setShowSignIn={setShowSignIn}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          chatHistory={chatHistory}
          onAddChat={handleAddChat}
          onDeleteChat={handleDeleteChat}
          setChatHistory={setChatHistory}
          clearChatHistory={clearChatHistory}
          restoreChatHistory={restoreChatHistory}
        />} />
      </Routes>
    </Router>
  );
}

// AppWithRouter is a wrapper to get useNavigate and pass it up
function AppWithRouter({ isSidebarCollapsed, onToggleSidebar, showSignIn, setShowSignIn, darkMode, toggleDarkMode, chatHistory, onAddChat, onDeleteChat, setChatHistory, clearChatHistory, restoreChatHistory }) {
  const navigate = useNavigate();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectedServices, setConnectedServices] = useState([]);

  const handleNavigateChat = (query) => {
    if (!query || !query.trim()) {
      navigate("/");
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Email validation function
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Google Authentication - Redirect Flow
  useEffect(() => {
    // Check for Google OAuth response on page load
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    console.log("OAuth useEffect triggered:", { code: !!code, state: !!state, currentUrl: window.location.href });
    
    if (code && state) {
      // Handle the OAuth response
      handleGoogleOAuthResponse(code, state);
    }
  }, []);

  // Restore authentication state from localStorage on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('mira_user');
    const savedAuth = localStorage.getItem('mira_authenticated');
    
    if (savedUser && savedAuth === 'true') {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log("Restored authentication state from localStorage:", userData);
        
        // Load user-specific data
        restoreChatHistory(userData.id);
        setConnectedServices([]);
        
        const savedConnections = localStorage.getItem(`mira_connections_${userData.id}`);
        
        if (savedConnections) {
          try {
            const connections = JSON.parse(savedConnections);
            setConnectedServices(connections);
            console.log("Loaded user connections:", connections);
          } catch (error) {
            console.error("Error parsing saved connections:", error);
          }
        } else if (userData.provider === 'demo') {
          // Auto-connect demo user if no saved connections
          const demoConnections = ['Twitter', 'LinkedIn'];
          setConnectedServices(demoConnections);
          localStorage.setItem(`mira_connections_${userData.id}`, JSON.stringify(demoConnections));
          console.log("Auto-connected demo user to:", demoConnections);
        }
        
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        // Clear invalid data
        localStorage.removeItem('mira_user');
        localStorage.removeItem('mira_authenticated');
        clearChatHistory();
        setConnectedServices([]);
      }
    } else {
      // No authenticated user, clear all data
      clearChatHistory();
      setConnectedServices([]);
    }
  }, [clearChatHistory, restoreChatHistory]);

  // Debug function to check localStorage (can be called from console)
  window.debugChatHistory = () => {
    const savedUser = localStorage.getItem('mira_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const savedChatHistory = localStorage.getItem(`mira_chat_history_${userData.id}`);
      console.log("Current user:", userData);
      console.log("Saved chat history:", savedChatHistory);
      if (savedChatHistory) {
        console.log("Parsed chat history:", JSON.parse(savedChatHistory));
      }
    } else {
      console.log("No authenticated user found");
    }
  };

  // Test function to add demo chat history (can be called from console)
  window.addDemoChats = () => {
    const demoChats = [
      "Engineers who have contributed to open source projects",
      "Find developers with React experience",
      "Search for Python developers in San Francisco",
      "Find designers who work with Figma"
    ];
    
    const savedUser = localStorage.getItem('mira_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      localStorage.setItem(`mira_chat_history_${userData.id}`, JSON.stringify(demoChats));
      console.log("Added demo chats for user:", userData.id, demoChats);
      
      // If user is currently logged in, update the state
      if (userData.id === "demo_user") {
        setChatHistory(demoChats);
        console.log("Updated current chat history state");
      }
    } else {
      console.log("No authenticated user found");
    }
  };

  const handleGoogleOAuthResponse = async (code, state) => {
    console.log("Received Google OAuth response:", { code, state });
    
    // Parse the state to get modal type and saved page state
    try {
      const stateData = JSON.parse(decodeURIComponent(state));
      const { modalType } = stateData;
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code,
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || '302037822597-jsac8r6ugd6um4igmfvmuu2bsaquttpq.apps.googleusercontent.com',
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET', // Use environment variable
          redirect_uri: window.location.origin,
          grant_type: 'authorization_code',
        }),
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      // Fetch user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const googleUserData = await userResponse.json();
      
      // Transform Google user data to our format
      const userData = {
        id: `google_${googleUserData.id}`,
        email: googleUserData.email,
        name: googleUserData.name,
        given_name: googleUserData.given_name,
        family_name: googleUserData.family_name,
        picture: googleUserData.picture,
        provider: 'google',
        access_token: accessToken
      };
      
      // Set user data and authentication state
      setUser(userData);
      setIsAuthenticated(true);
      
      // Persist authentication state to localStorage
      localStorage.setItem('mira_user', JSON.stringify(userData));
      localStorage.setItem('mira_authenticated', 'true');
      
      // Clear current chat history and load user-specific data
      clearChatHistory();
      setConnectedServices([]);
      
      // Load user-specific data
      restoreChatHistory(userData.id);
      
      const savedConnections = localStorage.getItem(`mira_connections_${userData.id}`);
      
      if (savedConnections) {
        try {
          const connections = JSON.parse(savedConnections);
          setConnectedServices(connections);
          console.log("Loaded user connections:", connections);
        } catch (error) {
          console.error("Error parsing saved connections:", error);
        }
      }
      
      // Close the appropriate modal
      if (modalType === 'signup') {
        setShowSignUpModal(false);
        setSignUpEmail("");
      } else if (modalType === 'login') {
        setShowLoginModal(false);
        setLoginEmail("");
      }
      
      console.log("Authentication successful for:", modalType);
      console.log("User data:", userData);
      
      // Always redirect to homepage after authentication
      setTimeout(() => {
        console.log("Redirecting to homepage after authentication");
        navigate('/');
        // Clean up OAuth params from URL
        window.history.replaceState({}, document.title, '/');
      }, 100);
      
    } catch (error) {
      console.error("Error in OAuth flow:", error);
      
      // Fallback to mock data for development
      const mockUserData = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        email: 'morgant11@montclair.edu',
        name: 'Morgan T',
        given_name: 'Morgan',
        family_name: 'T',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'google'
      };
      
      setUser(mockUserData);
      setIsAuthenticated(true);
      localStorage.setItem('mira_user', JSON.stringify(mockUserData));
      localStorage.setItem('mira_authenticated', 'true');
      
      // Clear current chat history and load user-specific data
      clearChatHistory();
      setConnectedServices([]);
      
      // Load user-specific data
      restoreChatHistory(mockUserData.id);
      
      const savedConnections = localStorage.getItem(`mira_connections_${mockUserData.id}`);
      
      if (savedConnections) {
        try {
          const connections = JSON.parse(savedConnections);
          setConnectedServices(connections);
          console.log("Loaded user connections:", connections);
        } catch (error) {
          console.error("Error parsing saved connections:", error);
        }
      }
      
      // Always redirect to homepage after authentication
      setTimeout(() => {
        navigate('/');
        window.history.replaceState({}, document.title, '/');
      }, 100);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Redirecting to Google Sign Up...");
    
    // Save current page state to restore after authentication
    const currentState = {
      modalType: 'signup',
      currentPath: window.location.pathname,
      currentSearch: window.location.search,
      timestamp: Date.now()
    };
    
    // Create state parameter with current page info
    const state = encodeURIComponent(JSON.stringify(currentState));
    
    // Use base domain as redirect URI (Google OAuth requirement)
    const redirectUri = window.location.origin;
    console.log("Redirect URI:", redirectUri);
    
    // Construct Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID || '302037822597-jsac8r6ugd6um4igmfvmuu2bsaquttpq.apps.googleusercontent.com'}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log("Full Google Auth URL:", googleAuthUrl);
    
    // Redirect current page to Google Auth
    window.location.href = googleAuthUrl;
  };

  const handleGoogleLogin = () => {
    console.log("Redirecting to Google Login...");
    
    // Save current page state to restore after authentication
    const currentState = {
      modalType: 'login',
      currentPath: window.location.pathname,
      currentSearch: window.location.search,
      timestamp: Date.now()
    };
    
    // Create state parameter with current page info
    const state = encodeURIComponent(JSON.stringify(currentState));
    
    // Use base domain as redirect URI (Google OAuth requirement)
    const redirectUri = window.location.origin;
    
    // Construct Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID || '302037822597-jsac8r6ugd6um4igmfvmuu2bsaquttpq.apps.googleusercontent.com'}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    // Redirect current page to Google Auth
    window.location.href = googleAuthUrl;
  };

  const handleLogout = () => {
    // Clear user-specific data from localStorage (but keep chat history)
    if (user) {
      localStorage.removeItem(`mira_connections_${user.id}`);
    }
    
    setUser(null);
    setIsAuthenticated(false);
    // Clear localStorage
    localStorage.removeItem('mira_user');
    localStorage.removeItem('mira_authenticated');
    // Clear chat history state when logging out (but keep in localStorage)
    clearChatHistory();
    console.log("User logged out");
  };

  const handleDemoLogin = () => {
    setEmailError("");
    setPasswordError("");
    
    if (loginEmail === "demo@mira.com") {
      // Show password modal
      setShowLoginModal(false);
      setShowPasswordModal(true);
    } else {
      // Show error for invalid email
      setEmailError("Please sign up or use demo@mira.com");
      // Add shake animation by temporarily adding a class
      const emailInput = document.getElementById('login-email-input');
      if (emailInput) {
        emailInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          emailInput.style.animation = '';
        }, 500);
      }
    }
  };

  const handleDemoPassword = () => {
    setPasswordError("");
    
    if (loginPassword === "demo") {
      // Create demo user data
      const demoUserData = {
        id: "demo_user",
        email: "demo@mira.com",
        name: "Demo User",
        given_name: "Demo",
        family_name: "User",
        picture: "https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff&size=40",
        provider: 'demo'
      };
      
      // Set user data and authentication state
      setUser(demoUserData);
      setIsAuthenticated(true);
      
      // Persist authentication state to localStorage
      localStorage.setItem('mira_user', JSON.stringify(demoUserData));
      localStorage.setItem('mira_authenticated', 'true');
      
      // Load user-specific data
      console.log("Demo login: About to restore chat history for:", demoUserData.id);
      restoreChatHistory(demoUserData.id);
      setConnectedServices([]);
      
      // Auto-connect Twitter and LinkedIn for demo user
      const demoConnections = ['Twitter', 'LinkedIn'];
      setConnectedServices(demoConnections);
      localStorage.setItem(`mira_connections_${demoUserData.id}`, JSON.stringify(demoConnections));
      console.log("Auto-connected demo user to:", demoConnections);
      
      // Close modals
      setShowPasswordModal(false);
      setLoginEmail("");
      setLoginPassword("");
      
      console.log("Demo user logged in:", demoUserData);
    } else {
      // Show error for invalid password
      setPasswordError("Incorrect password. Use 'demo'");
      // Add shake animation
      const passwordInput = document.getElementById('login-password-input');
      if (passwordInput) {
        passwordInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          passwordInput.style.animation = '';
        }, 500);
      }
    }
  };

  const handleConnectionUpdate = (service, connected) => {
    setConnectedServices(prev => {
      let newConnections;
      if (connected) {
        newConnections = prev.includes(service) ? prev : [...prev, service];
      } else {
        newConnections = prev.filter(s => s !== service);
      }
      
      // Save to localStorage if user is authenticated
      if (user && isAuthenticated) {
        localStorage.setItem(`mira_connections_${user.id}`, JSON.stringify(newConnections));
      }
      
      return newConnections;
    });
  };



  return (
    <div className="app-container">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        chatHistory={chatHistory}
        onNavigateChat={handleNavigateChat}
        onDeleteChat={onDeleteChat}
        darkMode={darkMode}
        connectedServices={connectedServices}
      />
      <div className={`main-area ${isSidebarCollapsed ? 'main-area-expanded' : ''}`}>
        <TopBar 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          onSignUpClick={() => setShowSignUpModal(true)} 
          onLoginClick={() => setShowLoginModal(true)}
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<MainContent darkMode={darkMode} />} />
          <Route path="/search" element={<SearchResultsWithHistory onAddChat={onAddChat} darkMode={darkMode} isSidebarCollapsed={isSidebarCollapsed} onSignUpClick={() => setShowSignUpModal(true)} user={user} isAuthenticated={isAuthenticated} />} />
          <Route path="/connections" element={<ConnectionsPage isSidebarCollapsed={isSidebarCollapsed} onConnectionUpdate={handleConnectionUpdate} user={user} isAuthenticated={isAuthenticated} />} />
        </Routes>
      </div>
      {showSignIn && <SignInPanel onClose={() => setShowSignIn(false)} />}
      
      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <button
              onClick={() => { setShowSignUpModal(false); setSignUpEmail(""); }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
            <div style={{ marginTop: '8px' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: '600', color: '#222', textAlign: 'center' }}>
                Sign Up to Mira
              </h2>
              {/* Email Input Field */}
              <input
                type="email"
                placeholder="Enter your email"
                value={signUpEmail}
                onChange={e => setSignUpEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f8f8f8',
                  color: '#333',
                  marginBottom: '16px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              {/* Continue with email button */}
              <button
                disabled={!isValidEmail(signUpEmail)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: isValidEmail(signUpEmail) ? '#111' : '#f0f0f0',
                  color: isValidEmail(signUpEmail) ? '#fff' : '#555',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isValidEmail(signUpEmail) ? 'pointer' : 'not-allowed',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s, color 0.2s'
                }}
              >
                Continue with email
              </button>
              {/* Or separator */}
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>or</span>
              </div>
              {/* Sign up with Google button */}
              <button
                onClick={handleGoogleSignUp}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f8f8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <button
              onClick={() => { setShowLoginModal(false); setLoginEmail(""); }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
            <div style={{ marginTop: '8px' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: '600', color: '#222', textAlign: 'center' }}>
                Log in to Mira
              </h2>
              {/* Email Input Field */}
              <input
                id="login-email-input"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && isValidEmail(loginEmail) && handleDemoLogin()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: emailError ? '1px solid #ff4444' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f8f8f8',
                  color: '#333',
                  marginBottom: emailError ? '8px' : '16px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              {/* Error message */}
              {emailError && (
                <div style={{
                  color: '#ff4444',
                  fontSize: '0.875rem',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  {emailError}
                </div>
              )}
              {/* Continue with email button */}
              <button
                onClick={handleDemoLogin}
                disabled={!isValidEmail(loginEmail)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: isValidEmail(loginEmail) ? '#111' : '#f0f0f0',
                  color: isValidEmail(loginEmail) ? '#fff' : '#555',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isValidEmail(loginEmail) ? 'pointer' : 'not-allowed',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s, color 0.2s'
                }}
              >
                Continue with email
              </button>
              {/* Or separator */}
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>or</span>
              </div>
              {/* Log in with Google button */}
              <button
                onClick={handleGoogleLogin}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: '#fff',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f8f8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Log in with Google
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <button
              onClick={() => { 
                setShowPasswordModal(false); 
                setLoginPassword(""); 
                setPasswordError("");
                setShowLoginModal(true);
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
            <div style={{ marginTop: '8px' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: '600', color: '#222', textAlign: 'center' }}>
                Enter your password
              </h2>
              <p style={{ 
                margin: '0 0 16px 0', 
                fontSize: '0.875rem', 
                color: '#888', 
                textAlign: 'center', 
                fontStyle: 'italic',
                animation: 'passwordHint 2s ease-in-out infinite',
                opacity: 0.7,
                transition: 'color 0.3s ease'
              }}>
                Password: demo
              </p>
              {/* Password Input Field */}
              <input
                id="login-password-input"
                type="password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDemoPassword()}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  border: passwordError ? '1px solid #ff4444' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#f8f8f8',
                  color: '#333',
                  marginBottom: passwordError ? '8px' : '16px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
              {/* Error message */}
              {passwordError && (
                <div style={{
                  color: '#ff4444',
                  fontSize: '0.875rem',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  {passwordError}
                </div>
              )}
              {/* Continue button */}
              <button
                onClick={handleDemoPassword}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  transition: 'background-color 0.2s'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap SearchResults to add to chat history
function SearchResultsWithHistory({ onAddChat, darkMode, isSidebarCollapsed, onSignUpClick, user, isAuthenticated }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  useEffect(() => {
    if (query) onAddChat(query);
  }, [query, onAddChat]);
  return <SearchResults darkMode={darkMode} isSidebarCollapsed={isSidebarCollapsed} onSignUpClick={onSignUpClick} user={user} isAuthenticated={isAuthenticated} />;
}

function AccuracyDot({ score, person, darkMode, isActive, onHover, onLeave }) {
  const getTooltipContent = () => {
    switch(score.label) {
      case 'Engineering':
        return {
          question: 'Is this person a software engineer?',
          answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Likely' : 'No',
          details: score.color === 'green' ? 'Strong engineering background with technical contributions' : 
                  score.color === 'yellow' ? 'Some technical experience, mixed background' : 
                  'Limited engineering experience found'
        };
      case 'Open Source':
        return {
          question: 'Has contributed to open source?',
          answer: score.color === 'green' ? 'Yes' : score.color === 'yellow' ? 'Some' : 'Minimal',
          details: score.color === 'green' ? 'Active open source contributor with multiple projects' : 
                  score.color === 'yellow' ? 'Some open source activity, occasional contributions' : 
                  'Very limited open source involvement'
        };
      case 'Recent Activity':
        return {
          question: 'Recent technical activity?',
          answer: score.color === 'green' ? 'Very Active' : score.color === 'yellow' ? 'Moderate' : 'Low',
          details: score.color === 'green' ? 'High recent activity in past 6 months' : 
                  score.color === 'yellow' ? 'Some activity, but less frequent' : 
                  'Limited recent technical activity'
        };
      default:
        return { question: '', answer: '', details: '' };
    }
  };

  const tooltipContent = getTooltipContent();
  
  return (
    <div 
      style={{ 
        position: 'relative', 
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.8rem',
        color: darkMode ? '#ccc' : '#666',
        cursor: 'pointer',
        borderRadius: 4,
        padding: '2px 4px',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div 
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: score.color === 'green' ? '#22c55e' : 
                          score.color === 'yellow' ? '#eab308' : '#ef4444'
        }}
      />
      <span>{score.label}</span>
      
      {isActive && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          padding: '12px 16px',
          minWidth: 280,
          maxWidth: 320,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontSize: '0.9rem',
          lineHeight: 1.4
        }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: '#666', fontWeight: 500 }}>
              {tooltipContent.question}
            </span>
            <span style={{ 
              color: score.color === 'green' ? '#22c55e' : 
                    score.color === 'yellow' ? '#eab308' : '#ef4444',
              fontWeight: 600,
              marginLeft: 6
            }}>
              {tooltipContent.answer}
            </span>
          </div>
          
          <div style={{ 
            color: '#888', 
            fontSize: '0.85rem',
            borderTop: '1px solid #f0f0f0',
            paddingTop: 8,
            marginTop: 8
          }}>
            {tooltipContent.details}
          </div>
          
          {/* Tooltip arrow */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #fff'
          }} />
        </div>
      )}
    </div>
  );
}

function PeopleCard({ person, index, visible, darkMode, totalCards }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [activeTooltip, setActiveTooltip] = React.useState(null);
  
  // Calculate delay based on total cards for better pacing
  const baseDelay = totalCards <= 2 ? 0.3 : totalCards <= 4 ? 0.25 : 0.2;
  const animationDelay = index * baseDelay;
  
  return (
    <div
      style={{
        background: 'transparent',
        borderRadius: 12,
        padding: '20px 24px',
        color: darkMode ? '#fff' : '#232427',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        width: '100%',
        minHeight: 120,
        border: darkMode ? '1.2px solid #444' : '1.2px solid #e5e5e5',
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
        background: person.avatarBg, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: 32, 
        color: '#fff', 
        fontWeight: 700,
        flexShrink: 0
      }}>
        {person.avatarIcon ? person.avatarIcon : <span style={{ fontSize: 32 }}>{person.name[0]}</span>}
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: '1.25rem', 
          color: darkMode ? '#fff' : '#555', 
          marginBottom: 8, 
          lineHeight: 1.2,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {person.name}
        </div>
        
        {/* Followers */}
        <div style={{ 
          color: darkMode ? '#bbb' : '#666', 
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
              <span style={{ 
                color: darkMode ? '#bbb' : '#666', 
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                @{person.username}
              </span>
            </>
          )}
          {person.platform === 'github' && (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={darkMode ? '#fff' : '#333'}>
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span style={{ 
                color: darkMode ? '#bbb' : '#666', 
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                {person.username}
              </span>
            </>
          )}
          {person.platform === 'linkedin' && (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077B5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span style={{ 
                color: darkMode ? '#bbb' : '#666', 
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
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
            <AccuracyDot 
              key={i}
              score={score} 
              person={person} 
              darkMode={darkMode} 
              isActive={activeTooltip === i}
              onHover={() => setActiveTooltip(i)}
              onLeave={() => setActiveTooltip(null)}
            />
          ))}
        </div>
        
        {/* Relevant Quote */}
        <div style={{ 
          color: darkMode ? '#bbb' : '#999', 
          fontSize: '0.9rem', 
          lineHeight: 1.4,
          position: 'relative',
          paddingLeft: 12,
          borderLeft: `2px solid ${darkMode ? '#444' : '#e5e5e5'}`,
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

function PeopleCardList({ people, darkMode, animationsCompleted, onCardClick }) {
  const [visibleCards, setVisibleCards] = React.useState(Array(people.length).fill(false));
  const cardRefs = React.useRef([]);
  
  React.useEffect(() => {
    // If animations were already completed, show all cards immediately
    if (animationsCompleted) {
      setVisibleCards(Array(people.length).fill(true));
      return;
    }
    
    const observers = [];
    people.forEach((_, i) => {
      if (!cardRefs.current[i]) return;
      observers[i] = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Calculate delay based on total cards for better pacing
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
  }, [people.length, animationsCompleted]);

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
          <div onClick={() => onCardClick && onCardClick(person)}>
            <PeopleCard person={person} index={i} visible={visibleCards[i]} darkMode={darkMode} totalCards={people.length} />
          </div>
        </div>
      ))}
    </div>
  );
}



export default App;
