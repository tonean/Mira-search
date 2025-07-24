import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MainContent from "./MainContent";
import LoadingScreen from "./LoadingScreen";
import SignInPanel from "./SignInPanel";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import "./App.css";
import ConnectionsPage from "./ConnectionsPage";
import TypingParagraph from "./TypingParagraph";

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
  const [isMicActive, setIsMicActive] = useState(false);
  const followupRef = useRef();
  const editTextRef = useRef();
  // Add file input ref
  const fileInputRef = useRef();
  // State for selected files in follow-up bar
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();
  // Share button state
  const [shareCopied, setShareCopied] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const questionRef = useRef();
  const hiddenDivRef = useRef();
  const [showPeopleCards, setShowPeopleCards] = useState(false);
  const [thinkingDots, setThinkingDots] = useState('');

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

  // Show people cards after 2 seconds if query matches
  useEffect(() => {
    if (query.trim() === 'Engineers who have contributed to open source projects') {
      setShowPeopleCards(false);
      setThinkingDots('');
      let dotCount = 0;
      const dotsInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        setThinkingDots('.'.repeat(dotCount));
      }, 400);
      const timer = setTimeout(() => {
        setShowPeopleCards(true);
        clearInterval(dotsInterval);
      }, 3200);
      return () => {
        clearTimeout(timer);
        clearInterval(dotsInterval);
      };
    } else {
      setShowPeopleCards(false);
      setThinkingDots('');
    }
  }, [query]);

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
  const handleFollowupMicClick = () => {
    setIsMicActive(!isMicActive);
  };
  const handleFollowupKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Implement search or follow-up action here
    }
  };
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
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
    setSelectedFiles([]);
  };

  // --- MOCKUP TEXT ---
  const aiTrendsText = `The latest trends in AI for 2025 center on several key shifts, impacting both technological development and real-world applications:\nAI Reasoning & Agentic AI: Large language models (LLMs) and frontier models are moving beyond mere text generation to advanced reasoning—enabling tools that can interpret, decide, and act on complex tasks. The concept of agentic AI is gaining momentum, with AI agents working autonomously to simplify work and personal life, signaling a shift from passive tools to active collaborators.\nCustom Silicon and Efficiency: As the demand for AI computational power rises, companies are turning to custom silicon—specialized processors designed for AI workloads—to optimize performance and manage energy use. AI is also becoming more resource-efficient, driven by innovations to manage costs and environmental concerns.\nMultimodal and Embodied AI: AI is rapidly expanding past text into multimodal models that combine language, images, video, and audio, as seen in tools like OpenAI’s Sora. This enables more dynamic and versatile AI systems. Additionally, embodied AI—where AI powers robots and interacts with the physical world—is progressing, signaling improvements in robotics and automated systems.\nBeyond Chatbots: The focus is shifting away from simple conversational interfaces. Instead, businesses are building software that leverages foundational AI models as back-end infrastructure, deploying generative AI for tasks such as summarizing, analyzing, or autonomously acting on unstructured data.\nAI in Scientific Discovery & Healthcare: AI-driven breakthroughs in science and medicine are accelerating, especially in fields like drug discovery, climate science, and materials engineering. AI-powered research is unlocking solutions to intricate challenges in biomedicine and sustainability.\nMainstream Adoption & Tangible Productivity Gains: Usage of AI in business is skyrocketing, with 78% of organizations adopting AI in 2024 compared to 55% in 2023. The technology is driving productivity gains, skill gap narrowing, and new business models across industries.\nMeasuring AI Efficacy and Responsible AI: With increased adoption comes a greater emphasis on evaluating AI performance and mitigating risks, including privacy, safety, and ethical concerns. Businesses and regulators are developing new benchmarks and metrics for AI effectiveness and trustworthiness.\nCloud Migrations and AI Workloads: Hyperscalers (cloud giants) are investing in infrastructure to accommodate surges in AI workloads, with a focus on secure, scalable cloud solutions integrated with advanced AI capabilities.\nOpen-Weight Models & Accessibility: Open-source and open-weight AI models are narrowing the gap with proprietary systems, making high-quality AI more accessible and affordable for wider use cases.\nDiversification and Benchmark Saturation: As LLMs and foundational models saturate traditional benchmarks, attention is turning toward new domain-specific models and diverse architectures to push the next stage of progress.\nThese trends reflect a broader movement from AI as hype to AI as practical, integrated technology—delivering measurable value, automating complex workflows, and reshaping economic and social systems.`;

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
        style={{ position: 'relative', marginTop: -20, marginBottom: 38, maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}
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
            {query.trim() === 'Engineers who have contributed to open source projects' && (
              !showPeopleCards ? (
                <div style={{
                  maxWidth: 700,
                  margin: '0 auto 24px auto',
                  color: 'var(--text-muted)',
                  fontSize: '1.08rem',
                  textAlign: 'left',
                  lineHeight: 1.6,
                  minHeight: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  <span className="thinking-shimmer"><span className="shimmer-text">Finding engineers with recent open source activity{thinkingDots}</span></span>
                </div>
              ) : null
            )}
            {/* People card mockup below */}
            {query.trim() === 'Engineers who have contributed to open source projects' && showPeopleCards && (
              <PeopleCardList people={[
                {
                  name: '-` Vinoth Ragunathan `-',
                  followers: '13.7K',
                  meta: ['🏡 duff gardens', '🎲 insidesticker.com', 'helvetiica'],
                  description: 'interface designer',
                  avatarBg: 'linear-gradient(135deg, #3a8dde 0%, #b388ff 100%)',
                },
                {
                  name: 'michael shillingburg',
                  followers: '8.2K',
                  meta: ['🌐 shilly.co', 'shillingburger'],
                  description: '3D artist and interface designer ✨ designing @ https://t.co/hJOniBW62E photo editor: https://t.co/EKiGRBrUZ6 drawing site: https://t.co/uv3jbaB0q1 👋 michael@shilly.co',
                  avatarBg: '#7c3aed',
                  avatarIcon: (
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#7c3aed"/><path d="M32 32c0-4.418-3.582-8-8-8s-8 3.582-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="24" cy="20" r="4" fill="#fff"/></svg>
                  ),
                },
                {
                  name: 'Alex Kim',
                  followers: '5.1K',
                  meta: ['📍 San Francisco', 'alexkim.com'],
                  description: 'Full-stack engineer and open source contributor',
                  avatarBg: 'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)',
                },
                {
                  name: 'Priya Patel',
                  followers: '12.4K',
                  meta: ['🎨 Behance', 'priyapatel.art'],
                  description: 'Product designer passionate about accessibility',
                  avatarBg: 'linear-gradient(135deg, #ff6a88 0%, #ff99ac 100%)',
                },
                {
                  name: 'Jordan Lee',
                  followers: '9.8K',
                  meta: ['🧑‍💻 github.com/jordanlee', 'Medium'],
                  description: 'AI researcher and technical writer',
                  avatarBg: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
                },
                {
                  name: 'Sofia Garcia',
                  followers: '7.3K',
                  meta: ['🌎 Remote', 'sofiagarcia.dev'],
                  description: 'Frontend developer and mentor',
                  avatarBg: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
                },
                {
                  name: 'Chris Wang',
                  followers: '10.2K',
                  meta: ['📚 Academia.edu', 'Stanford'],
                  description: 'Professor in computer science and ML',
                  avatarBg: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
                },
              ]} darkMode={darkMode} />
            )}
          </>
        )}
      </div>
      {/* Follow-up input fixed at the bottom, overlaying the answer text */}
      <div 
        className={
          !isSidebarCollapsed ? 'followup-bar-sidebar-expanded' : ''
        }
        style={{ position: 'fixed', left: 80, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', zIndex: 100 }}
      >
        <div className="input-box" style={{ minWidth: 300, maxWidth: 700, width: '100%', margin: 0, padding: 0, boxShadow: '0 2px 8px var(--input-box-shadow)', border: '1.5px solid var(--input-border)', borderRadius: 14, background: 'var(--input-bg)', display: 'flex', flexDirection: 'column', gap: 0, minHeight: selectedFiles.length > 0 ? 120 : 38, paddingTop: selectedFiles.length > 0 ? 18 : 0 }}>
          {/* File preview inside follow-up search bar, above textarea */}
          {selectedFiles.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              margin: '0 0 10px 0',
              padding: '8px 16px 8px 8px',
              background: '#f8f8f8',
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
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />
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
            <button className="input-action-btn" title="Add" style={{ marginLeft: 12, background: '#f3f3f3', color: '#222' }} onClick={handleFileInputClick}>
              <span style={{fontWeight: 400, fontSize: '1.05rem', color: '#222'}}>+</span>
            </button>
            <button 
              className={`input-action-btn ${isMicActive ? 'mic-button-active' : ''}`} 
              title="Mic"
              onClick={handleFollowupMicClick}
              style={{ marginLeft: 12, background: isMicActive ? '#fff' : '#f3f3f3', color: isMicActive ? '#fff' : '#222', border: '1px solid #e0e0e0' }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="4" width="6" height="10" rx="3" fill={isMicActive ? '#fff' : '#222'}/>
                <rect x="9" y="15" width="2" height="3" rx="1" fill={isMicActive ? '#fff' : '#222'}/>
                <path d="M5 10V11C5 14 9 14 9 14H11C11 14 15 14 15 11V10" stroke={isMicActive ? '#fff' : '#222'} strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
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
        <div style={{ marginTop: 0, paddingBottom: 180 }}>
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
  const handleAddChat = (query) => {
    setChatHistory((prev) => {
      if (!query.trim() || prev.includes(query)) return prev;
      return [query, ...prev].slice(0, 20); // keep max 20
    });
  };

  // Handler to delete a chat by index
  const handleDeleteChat = (idx) => {
    setChatHistory((prev) => prev.filter((_, i) => i !== idx));
  };

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
        />} />
      </Routes>
    </Router>
  );
}

// AppWithRouter is a wrapper to get useNavigate and pass it up
function AppWithRouter({ isSidebarCollapsed, onToggleSidebar, showSignIn, setShowSignIn, darkMode, toggleDarkMode, chatHistory, onAddChat, onDeleteChat }) {
  const navigate = useNavigate();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    
    if (code && state) {
      // Handle the OAuth response
      handleGoogleOAuthResponse(code, state);
    }
  }, []);

  const handleGoogleOAuthResponse = (code, state) => {
    console.log("Received Google OAuth response:", { code, state });
    
    // Parse the state to determine which modal was open
    try {
      const stateData = JSON.parse(decodeURIComponent(state));
      const { modalType } = stateData;
      
      // Simulate getting user data from the authorization code
      // In a real app, you'd send this code to your backend
      const mockUserData = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        email: 'user@example.com',
        name: 'John Doe',
        picture: 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'google'
      };
      
      // Set user data and authentication state
      setUser(mockUserData);
      setIsAuthenticated(true);
      
      // Close the appropriate modal
      if (modalType === 'signup') {
        setShowSignUpModal(false);
        setSignUpEmail("");
      } else if (modalType === 'login') {
        setShowLoginModal(false);
        setLoginEmail("");
      }
      
      console.log("Authentication successful for:", modalType);
      console.log("User data:", mockUserData);
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
    } catch (error) {
      console.error("Error parsing OAuth state:", error);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Redirecting to Google Sign Up...");
    
    // Create state parameter to track which modal was open
    const state = encodeURIComponent(JSON.stringify({ modalType: 'signup' }));
    
    // Get the current origin for debugging
    const redirectUri = window.location.origin;
    console.log("Redirect URI:", redirectUri);
    
    // Construct Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=302037822597-jsac8r6ugd6um4igmfvmuu2bsaquttpq.apps.googleusercontent.com&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log("Full Google Auth URL:", googleAuthUrl);
    
    // Open in new window/tab
    window.open(googleAuthUrl, '_blank', 'width=500,height=600');
  };

  const handleGoogleLogin = () => {
    console.log("Redirecting to Google Login...");
    
    // Create state parameter to track which modal was open
    const state = encodeURIComponent(JSON.stringify({ modalType: 'login' }));
    
    // Construct Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=302037822597-jsac8r6ugd6um4igmfvmuu2bsaquttpq.apps.googleusercontent.com&` +
      `redirect_uri=${encodeURIComponent(window.location.origin)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${state}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    // Open in new window/tab
    window.open(googleAuthUrl, '_blank', 'width=500,height=600');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    console.log("User logged out");
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
          <Route path="/connections" element={<ConnectionsPage isSidebarCollapsed={isSidebarCollapsed} />} />
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
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
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

function PeopleCard({ person, index, visible, flip, darkMode }) {
  return (
    <div
      className={flip ? 'flip-animate' : ''}
      style={{
        background: darkMode ? 'none' : '#fff',
        borderRadius: 16,
        padding: '20px 20px 14px 20px',
        color: darkMode ? '#fff' : '#232427',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: 270,
        height: 180,
        border: darkMode ? '1.2px solid #444' : '1.2px solid #ececec',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s cubic-bezier(.4,0,.2,1) ${index * 0.18}s, transform 0.7s cubic-bezier(.4,0,.2,1) ${index * 0.18}s`,
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '1.08rem', color: darkMode ? '#fff' : '#232427', marginBottom: 6, lineHeight: 1.25 }}>{person.name}</div>
      <div style={{ color: darkMode ? '#d1d5db' : '#444', fontSize: '0.97rem', marginBottom: 10, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{person.description}</div>
      <div style={{ color: darkMode ? '#bbb' : '#888', fontSize: '0.91rem', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {person.meta.map((m, i) => <span key={i}>{m}</span>)}
      </div>
    </div>
  );
}

function PeopleCardList({ people, darkMode }) {
  const [visibleCards, setVisibleCards] = React.useState(Array(people.length).fill(false));
  const [flipIndex, setFlipIndex] = React.useState(null);
  const cardRefs = React.useRef([]);
  React.useEffect(() => {
    const observers = [];
    people.forEach((_, i) => {
      if (!cardRefs.current[i]) return;
      observers[i] = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleCards((prev) => {
                if (prev[i]) return prev;
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 120);
            observers[i].disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observers[i].observe(cardRefs.current[i]);
    });
    return () => observers.forEach(obs => obs && obs.disconnect());
  }, [people.length]);

  // Flip animation logic (auto, random, fast)
  React.useEffect(() => {
    // Only start flip animation after all cards have faded in
    if (!visibleCards.every(Boolean)) return;
    let timeout;
    function triggerFlip() {
      const visibleIdxs = visibleCards.map((v, i) => v ? i : null).filter(i => i !== null);
      if (visibleIdxs.length === 0) return;
      const randomIdx = visibleIdxs[Math.floor(Math.random() * visibleIdxs.length)];
      setFlipIndex(randomIdx);
      timeout = setTimeout(() => {
        setFlipIndex(null);
        timeout = setTimeout(triggerFlip, 1200);
      }, 500); // match animation duration
    }
    triggerFlip();
    return () => clearTimeout(timeout);
  }, [visibleCards]);

  React.useEffect(() => { injectFlipAnimStyle(darkMode); }, [darkMode]);

  return (
    <div style={{
      maxWidth: 900,
      margin: '32px 48px 0 48px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
      gridRowGap: 60,
      gridColumnGap: 27,
      alignItems: 'stretch',
      paddingBottom: 220,
    }}>
      {people.map((person, i) => (
        <div key={i} ref={el => cardRefs.current[i] = el}>
          <PeopleCard person={person} index={i} visible={visibleCards[i]} flip={flipIndex === i} darkMode={darkMode} />
        </div>
      ))}
    </div>
  );
}

// Add flip animation CSS to the file (inject into <style> for demo)
function injectFlipAnimStyle(darkMode) {
  if (typeof document === 'undefined') return;
  let style = document.getElementById('flip-anim-style');
  if (style) style.remove();
  style = document.createElement('style');
  style.id = 'flip-anim-style';
  style.innerHTML = `
    @keyframes flipY {
      0% { transform: rotateY(0deg); background: ${darkMode ? '#222' : '#fff'}; }
      40% { transform: rotateY(180deg); background: ${darkMode ? '#222' : '#e0e7ff'}; }
      60% { transform: rotateY(180deg); background: ${darkMode ? '#222' : '#e0e7ff'}; }
      100% { transform: rotateY(360deg); background: ${darkMode ? '#222' : '#fff'}; }
    }
    .flip-animate {
      animation: flipY 0.5s cubic-bezier(.4,0,.2,1);
      backface-visibility: hidden;
      perspective: 800px;
    }
  `;
  document.head.appendChild(style);
}

export default App;
