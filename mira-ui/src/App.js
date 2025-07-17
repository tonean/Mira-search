import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MainContent from "./MainContent";
import LoadingScreen from "./LoadingScreen";
import SignInPanel from "./SignInPanel";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import "./App.css";
import ConnectionsPage from "./ConnectionsPage";

function SearchResults({ darkMode, isSidebarCollapsed }) {
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
  const mockupAnswer = (
    <div className="ai-trends-text fade-in-animated" style={{ fontFamily: 'Georgia, serif', color: '#222', lineHeight: 1.7, maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ marginBottom: 24 }}>
        The latest trends in <b>AI for 2025</b> center on several key shifts, impacting both technological development and real-world applications:
      </div>
      <ul style={{ paddingLeft: 24, marginBottom: 24 }}>
        <li style={{ marginBottom: 14 }}>
          <b>AI Reasoning &amp; Agentic AI:</b> Large language models (LLMs) and frontier models are moving beyond mere text generation to advanced reasoning—enabling tools that can interpret, decide, and act on complex tasks. The concept of <b>agentic AI</b> is gaining momentum, with AI agents working autonomously to simplify work and personal life, signaling a shift from passive tools to active collaborators.
        </li>
        <li style={{ marginBottom: 14 }}>
          <b>Custom Silicon and Efficiency:</b> As the demand for AI computational power rises, companies are turning to <b>custom silicon</b>—specialized processors designed for AI workloads—to optimize performance and manage energy use. AI is also becoming more resource-efficient, driven by innovations to manage costs and environmental concerns.
        </li>
        <li style={{ marginBottom: 14 }}>
          <b>Multimodal and Embodied AI:</b> AI is rapidly expanding past text into <b>multimodal models</b> that combine language, images, video, and audio, as seen in tools like OpenAI’s Sora. This enables more dynamic and versatile AI systems. Additionally, <b>embodied AI</b>—where AI powers robots and interacts with the physical world—is progressing, signaling improvements in robotics and automated systems.
        </li>
        <li style={{ marginBottom: 14 }}>
          <b>Beyond Chatbots:</b> The focus is shifting away from simple conversational interfaces. Instead, businesses are building software that leverages foundational AI models as back-end infrastructure, deploying generative AI for tasks such as summarizing, analyzing, or autonomously acting on unstructured data.
        </li>
        <li style={{ marginBottom: 14 }}>
          <b>AI in Scientific Discovery &amp; Healthcare:</b> AI-driven breakthroughs in science and medicine are accelerating, especially in fields like drug discovery, climate science, and materials engineering. AI-powered research is unlocking solutions to intricate challenges in biomedicine and sustainability.
        </li>
        <li style={{ marginBottom: 14 }}>
          <b>Mainstream Adoption &amp; Tangible Productivity Gains:</b> Usage of AI in business is skyrocketing, with 78% of organizations adopting AI in 2024 compared to 55% in 2023. The technology is driving productivity gains, skill gap narrowing, and new business models across industries.
        </li>
        <li style={{ marginBottom: 14 }}>
          <b>Measuring AI Efficacy and Responsible AI:</b> With increased adoption comes a greater emphasis on <b>evaluating AI performance</b> and mitigating risks, including privacy, safety, and ethical concerns. Businesses and regulators are developing new benchmarks and metrics for AI effectiveness and trustworthiness.
        </li>
        <li style={{ marginBottom: 14 }}>
          <b>Cloud Migrations and AI Workloads:</b> Hyperscalers (cloud giants) are investing in infrastructure to accommodate surges in AI workloads, with a focus on secure, scalable cloud solutions integrated with advanced AI capabilities.
        </li>
        <li style={{ marginBottom: 14 }}>
          <b>Open-Weight Models &amp; Accessibility:</b> Open-source and open-weight AI models are narrowing the gap with proprietary systems, making high-quality AI more accessible and affordable for wider use cases.
        </li>
        <li style={{ marginBottom: 14 }}>
          <b>Diversification and Benchmark Saturation:</b> As LLMs and foundational models saturate traditional benchmarks, attention is turning toward new domain-specific models and diverse architectures to push the next stage of progress.
        </li>
      </ul>
      <div style={{ marginBottom: 0 }}>
        These trends reflect a broader movement from <b>AI as hype</b> to <b>AI as practical, integrated technology</b>—delivering measurable value, automating complex workflows, and reshaping economic and social systems.
      </div>
    </div>
  );

  return (
    <div style={{ color: 'var(--text-light)', background: 'var(--bg)', minHeight: '100vh', padding: '48px 0' }}>
      {/* Sticky bar for research question */}
      {query.trim() === 'Research the latest trends in AI' && showStickyBar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000, background: 'var(--bg)', borderBottom: '2px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 62 }}>
          <div style={{ fontWeight: 500, fontSize: '1.3rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60vw', marginLeft: 300 }}>
            Research the latest trends in AI
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              style={{ backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--border-dark)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', marginRight: '8px' }}
            >
              Log in
            </button>
            <button 
              style={{ backgroundColor: 'var(--primary)', color: darkMode ? 'var(--border-dark)' : '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}
            >
              Sign up
            </button>
          </div>
        </div>
      )}
      {/* Query row */}
      <div
        ref={questionRef}
        style={{ position: 'relative', marginTop: -20, marginBottom: 38, maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
            <h1 style={{ fontSize: '1.7rem', fontWeight: 500, color: 'var(--text)', margin: 0, paddingRight: 120, marginLeft: 150, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{query}</h1>
            {hovered && (
              <div style={{ position: 'absolute', top: 0, right: 140, display: 'flex', alignItems: 'center', gap: 4 }}>
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
          </>
        )}
      </div>
      <hr className="ai-divider" />
      {/* Follow-up input fixed at the bottom, overlaying the answer text */}
      <div 
        className={
          !isSidebarCollapsed ? 'followup-bar-sidebar-expanded' : ''
        }
        style={{ position: 'fixed', left: 80, right: 0, bottom: 40, display: 'flex', justifyContent: 'center', zIndex: 100 }}
      >
        <div className="input-box" style={{ minWidth: 300, maxWidth: 700, width: '100%', margin: 0, padding: 0, boxShadow: '0 2px 8px var(--input-box-shadow)', border: '1.5px solid var(--input-border)', borderRadius: 14, background: 'var(--input-bg)', display: 'flex', flexDirection: 'column', gap: 0, minHeight: selectedFiles.length > 0 ? 120 : undefined, paddingTop: selectedFiles.length > 0 ? 18 : undefined }}>
          {/* File preview inside follow-up search bar, above textarea */}
          {selectedFiles.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              margin: '0 0 10px 0',
              padding: '8px 16px 8px 8px',
              background: '#f5f5f3',
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
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" fill="#fff"/><path d="M6 6l8 8M14 6l-8 8" stroke="#111" strokeWidth="2.2" strokeLinecap="round"/></svg>
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
              padding: '22px 20px 22px 20px',
              borderRadius: 14,
              minHeight: 56,
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
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

  const handleNavigateChat = (query) => {
    if (!query || !query.trim()) {
      navigate("/");
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        chatHistory={chatHistory}
        onNavigateChat={handleNavigateChat}
        onDeleteChat={onDeleteChat}
      />
      <div className={`main-area ${isSidebarCollapsed ? 'main-area-expanded' : ''}`}>
        <TopBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Routes>
          <Route path="/" element={<MainContent darkMode={darkMode} />} />
          <Route path="/search" element={<SearchResultsWithHistory onAddChat={onAddChat} darkMode={darkMode} isSidebarCollapsed={isSidebarCollapsed} />} />
          <Route path="/connections" element={<ConnectionsPage isSidebarCollapsed={isSidebarCollapsed} />} />
        </Routes>
      </div>
      {showSignIn && <SignInPanel onClose={() => setShowSignIn(false)} />}
    </div>
  );
}

// Wrap SearchResults to add to chat history
function SearchResultsWithHistory({ onAddChat, darkMode, isSidebarCollapsed }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';
  useEffect(() => {
    if (query) onAddChat(query);
  }, [query, onAddChat]);
  return <SearchResults darkMode={darkMode} isSidebarCollapsed={isSidebarCollapsed} />;
}

export default App;
