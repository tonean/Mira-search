import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from 'react-router-dom';
import "./App.css";

export default function Sidebar({ isCollapsed, onToggleCollapse, chatHistory = [], onNavigateChat, onDeleteChat, darkMode = false }) {
  // --- State for chat logic (keep as before) ---
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [showDeleteIdx, setShowDeleteIdx] = useState(null);
  const chatRefs = useRef([]);
  const [deleteBtnHovered, setDeleteBtnHovered] = useState(false);
  const navigate = useNavigate();

  // --- New: State for Node/Tree view toggle ---
  const [viewMode, setViewMode] = useState('node');



  // --- New: Play dropdown (not functional, just UI) ---
  const [playDropdownOpen, setPlayDropdownOpen] = useState(false);

  // --- New: Public Key (placeholder) ---
  const publicKey = "AkDNuaV...oFkPWT";

  // --- New: Main content area grid ---
  const gridDots = [];
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 7; x++) {
      gridDots.push(
        <div key={`dot-${x}-${y}`} style={{ 
          width: 4, 
          height: 4, 
          borderRadius: '50%', 
          background: darkMode ? 'var(--text-muted)' : '#cfd2d6', 
          opacity: darkMode ? 0.3 : 0.5, 
          margin: 18 
        }} />
      );
    }
  }

  // --- New: Track which view is selected in the dropdown ---
  const [selectedView, setSelectedView] = useState('Regular View');

  // --- Main Sidebar Card ---
  return (
    <div 
      className="sidebar sidebar-expanded"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 290,
        background: darkMode ? 'var(--sidebar-bg)' : '#fbfbfc',
        border: `1.5px solid ${darkMode ? 'var(--sidebar-border)' : '#ececec'}`,
        borderRadius: 16,
        margin: 8,
        boxShadow: darkMode ? '0 2px 12px #0003' : '0 2px 12px #0001',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 3000,
        padding: 0,
        minWidth: 220,
        maxWidth: 320,
      }}
    >
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px 0 12px' }}>
        {/* Logo icon */}
        <span style={{ fontSize: 22, color: darkMode ? 'var(--text)' : '#222', fontWeight: 700, marginRight: 6 }}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="12" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="2.2" fill={darkMode ? 'var(--card-bg)' : '#fff'}/><circle cx="14" cy="14" r="5.5" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="2.2" fill={darkMode ? 'var(--card-bg)' : '#fff'}/></svg>
        </span>
        {/* Regular View dropdown right-aligned */}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button
            style={{ 
              background: playDropdownOpen ? (darkMode ? 'var(--input-action-active-bg)' : '#ececec') : 'none', 
              border: 'none', 
              borderRadius: 7, 
              padding: '2px 8px', 
              fontWeight: 500, 
              fontSize: '1rem', 
              color: darkMode ? 'var(--text)' : '#222', 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer' 
            }}
            onClick={() => setPlayDropdownOpen(v => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="3" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.5" fill={darkMode ? 'var(--card-bg)' : '#fff'}/><rect x="7.5" y="6.5" width="5" height="7" rx="1.5" fill={darkMode ? 'var(--text)' : '#222'}/></svg>
            <span style={{ marginLeft: 5, marginRight: 2 }}>{selectedView}</span>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M7 8l3 3 3-3" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
                      {playDropdownOpen && (
              <div style={{ 
                position: 'absolute', 
                top: 28, 
                left: 0, 
                background: darkMode ? 'var(--card-bg)' : '#fff', 
                border: `1px solid ${darkMode ? 'var(--card-border)' : '#ececec'}`, 
                borderRadius: 7, 
                boxShadow: darkMode ? '0 2px 8px #0004' : '0 2px 8px #0002', 
                minWidth: 110, 
                zIndex: 10, 
                padding: 6 
              }}>
                <div style={{ 
                  padding: 4, 
                  color: darkMode ? 'var(--text)' : '#222', 
                  fontSize: '0.95rem', 
                  cursor: 'pointer', 
                  fontWeight: selectedView === 'Regular View' ? 600 : 400 
                }} onClick={() => { setSelectedView('Regular View'); setPlayDropdownOpen(false); }}>Regular View</div>
                <div style={{ 
                  padding: 4, 
                  color: darkMode ? 'var(--text)' : '#222', 
                  fontSize: '0.95rem', 
                  cursor: 'pointer', 
                  fontWeight: selectedView === 'Node View' ? 600 : 400 
                }} onClick={() => { setSelectedView('Node View'); setPlayDropdownOpen(false); }}>Node View</div>
                <div style={{ 
                  padding: 4, 
                  color: darkMode ? 'var(--text)' : '#222', 
                  fontSize: '0.95rem', 
                  cursor: 'pointer', 
                  fontWeight: selectedView === 'Tree View' ? 600 : 400 
                }} onClick={() => { setSelectedView('Tree View'); setPlayDropdownOpen(false); }}>Tree View</div>
              </div>
            )}
        </div>
          </div>

      {/* MAIN FUNCTIONAL ELEMENTS AT THE TOP (do not move) */}
      {selectedView === 'Regular View' && (
        <div style={{ padding: '0 12px 0 12px', marginTop: 32 }}>
          <button className="new-task-btn" style={{ 
            width: '100%', 
            margin: '0 0 14px 0', 
            padding: '7px 0 7px 12px', 
            fontSize: '0.93rem', 
            borderRadius: 8, 
            background: darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5', 
            color: darkMode ? 'var(--text)' : '#222', 
            border: 'none', 
            fontWeight: 500, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 7, 
            cursor: 'pointer' 
          }} onClick={() => {
            if (onNavigateChat) {
              onNavigateChat("");
            } else {
              navigate("/");
            }
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={darkMode ? 'var(--text-muted)' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New Chat</span>
          </button>
          <button className="new-task-btn" style={{ 
            width: '100%', 
            margin: '0 0 18px 0', 
            padding: '7px 0 7px 12px', 
            fontSize: '0.93rem', 
            borderRadius: 8, 
            background: darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5', 
            color: darkMode ? 'var(--text)' : '#222', 
            border: 'none', 
            fontWeight: 500, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 7, 
            cursor: 'pointer' 
          }} onClick={() => {
            navigate("/connections");
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={darkMode ? 'var(--text-muted)' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>Add Connection</span>
          </button>
          <div className="create-task-hint" style={{ 
            margin: '36px 0 22px 0', 
            color: darkMode ? 'var(--text-muted)' : '#888', 
            fontSize: '0.91rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 7 
          }}>
            <div className="dotted-box" style={{ 
              width: 13, 
              height: 13, 
              border: `2px dashed ${darkMode ? 'var(--border-dark)' : '#bbb'}`, 
              borderRadius: 3, 
              display: 'inline-block' 
            }} />
            <span>Add a new connection to get started</span>
          </div>
          {/* Chats section */}
          <div style={{ marginTop: 48 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6, marginLeft: 1 }}>
            <span style={{ 
              color: darkMode ? 'var(--text-muted)' : '#888', 
              fontWeight: 500, 
              fontSize: '0.91rem', 
              letterSpacing: 0.2, 
              userSelect: 'none' 
            }}>Chats</span>
          </div>
          <div>
            {chatHistory.length === 0 && (
              <div
                className="sidebar-chat-item"
                  style={{ 
                    color: darkMode ? 'var(--text)' : '#333', 
                    fontSize: '0.93rem', 
                    padding: '5px 7px', 
                    borderRadius: 6, 
                    marginBottom: 2, 
                    cursor: 'pointer', 
                    transition: 'background 0.15s', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    display: 'flex', 
                    alignItems: 'center', 
                    position: 'relative', 
                    marginLeft: 1 
                  }}
                onClick={() => onNavigateChat && onNavigateChat("")}
                onMouseEnter={() => setHoveredIdx('new')}
                onMouseLeave={() => setHoveredIdx(null)}
                title="New Chat"
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>New Chat...</span>
                {hoveredIdx === 'new' && (
                  <button
                    className="sidebar-chat-dots"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: darkMode ? 'var(--text-muted)' : '#888', 
                        cursor: 'pointer', 
                        marginLeft: 4, 
                        padding: 1, 
                        borderRadius: 3, 
                        display: 'flex', 
                        alignItems: 'center' 
                      }}
                    tabIndex={-1}
                    onClick={e => e.stopPropagation()}
                  >
                      <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><circle cx="4" cy="10" r="1.5" fill={darkMode ? 'var(--text-muted)' : '#888'}/><circle cx="10" cy="10" r="1.5" fill={darkMode ? 'var(--text-muted)' : '#888'}/><circle cx="16" cy="10" r="1.5" fill={darkMode ? 'var(--text-muted)' : '#888'}/></svg>
                  </button>
                )}
              </div>
            )}
              {chatHistory.map((chat, idx) => {
              let deleteBtn = null;
              if (showDeleteIdx === idx && chatRefs.current[idx]) {
                const rect = chatRefs.current[idx].getBoundingClientRect();
                deleteBtn = ReactDOM.createPortal(
                  <button
                    className="sidebar-chat-delete"
                      style={{ 
                        position: 'fixed', 
                        left: rect.right + 8, 
                        top: rect.top + window.scrollY, 
                        background: darkMode ? 'var(--card-bg)' : '#fafafa', 
                        color: darkMode ? 'var(--text-muted)' : '#aaa', 
                        border: `1px solid ${darkMode ? 'var(--card-border)' : '#e0e0e0'}`, 
                        borderRadius: 6, 
                        padding: '3px 10px', 
                        fontSize: '0.93rem', 
                        fontWeight: 500, 
                        cursor: 'pointer', 
                        marginLeft: 5, 
                        boxShadow: darkMode ? '0 2px 8px #0003' : '0 2px 8px #0001', 
                        zIndex: 2000, 
                        transition: 'background 0.15s, color 0.15s, border 0.15s' 
                      }}
                    onClick={e => { e.stopPropagation(); onDeleteChat && onDeleteChat(idx); setShowDeleteIdx(null); }}
                    onMouseEnter={() => setDeleteBtnHovered(true)}
                    onMouseLeave={() => { setDeleteBtnHovered(false); setShowDeleteIdx(null); }}
                  >
                    Delete
                  </button>,
                  document.body
                );
              }
              return (
                <div
                  key={chat + idx}
                  className="sidebar-chat-item"
                    style={{ 
                      color: darkMode ? 'var(--text)' : '#333', 
                      fontSize: '0.93rem', 
                      padding: '5px 7px', 
                      borderRadius: 6, 
                      marginBottom: 2, 
                      cursor: 'pointer', 
                      transition: 'background 0.15s', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: 'flex', 
                      alignItems: 'center', 
                      position: 'relative', 
                      marginLeft: 1 
                    }}
                  onClick={e => {
                    if (e.target.classList.contains('sidebar-chat-dots') || e.target.classList.contains('sidebar-chat-delete')) return;
                    onNavigateChat && onNavigateChat(chat);
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => {
                    setHoveredIdx(null);
                    setTimeout(() => {
                      if (!deleteBtnHovered) {
                        if (showDeleteIdx === idx) setShowDeleteIdx(null);
                      }
                    }, 120);
                  }}
                  title={chat}
                 ref={el => (chatRefs.current[idx] = el)}
                >
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat}</span>
                  {hoveredIdx === idx && showDeleteIdx !== idx && (
                    <button
                      className="sidebar-chat-dots"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: darkMode ? 'var(--text-muted)' : '#888', 
                          cursor: 'pointer', 
                          marginLeft: 4, 
                          padding: 1, 
                          borderRadius: 3, 
                          display: 'flex', 
                          alignItems: 'center' 
                        }}
                      tabIndex={-1}
                      onClick={e => { e.stopPropagation(); setShowDeleteIdx(idx); }}
                    >
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="none"><circle cx="4" cy="10" r="1.5" fill={darkMode ? 'var(--text-muted)' : '#888'}/><circle cx="10" cy="10" r="1.5" fill={darkMode ? 'var(--text-muted)' : '#888'}/><circle cx="16" cy="10" r="1.5" fill={darkMode ? 'var(--text-muted)' : '#888'}/></svg>
                    </button>
                  )}
                 {deleteBtn}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      )}
      {selectedView === 'Node View' && (
        <div style={{ padding: '0 12px 0 12px', marginTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <button
              style={{ 
                flex: 1, 
                background: darkMode ? 'var(--primary)' : '#222', 
                color: darkMode ? 'var(--primary-contrast)' : '#fff', 
                border: 'none', 
                borderRadius: 10, 
                padding: '7px 0', 
                fontWeight: 500, 
                fontSize: '0.97rem', 
                cursor: 'pointer', 
                transition: 'background 0.15s' 
              }}
            >Node View</button>
            <button
              style={{ 
                flex: 1, 
                background: darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5', 
                color: darkMode ? 'var(--text)' : '#222', 
                border: 'none', 
                borderRadius: 10, 
                padding: '7px 0', 
                fontWeight: 500, 
                fontSize: '0.97rem', 
                cursor: 'pointer', 
                transition: 'background 0.15s' 
              }}
            >Tree View</button>
            <button style={{ 
              background: darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5', 
              border: 'none', 
              borderRadius: 9, 
              width: 28, 
              height: 28, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginLeft: 6, 
              cursor: 'pointer', 
              fontSize: 18, 
              color: darkMode ? 'var(--text)' : '#222' 
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <button style={{ 
              background: darkMode ? 'var(--card-bg)' : '#fff', 
              border: `1px solid ${darkMode ? 'var(--card-border)' : '#ececec'}`, 
              borderRadius: 7, 
              width: 22, 
              height: 22, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: darkMode ? 'var(--text)' : '#222', 
              fontSize: 14, 
              marginBottom: 2, 
              cursor: 'pointer' 
            }}>+</button>
            <button style={{ 
              background: darkMode ? 'var(--card-bg)' : '#fff', 
              border: `1px solid ${darkMode ? 'var(--card-border)' : '#ececec'}`, 
              borderRadius: 7, 
              width: 22, 
              height: 22, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: darkMode ? 'var(--text)' : '#222', 
              fontSize: 14, 
              marginBottom: 2, 
              cursor: 'pointer' 
            }}>-</button>
            <button style={{ 
              background: darkMode ? 'var(--card-bg)' : '#fff', 
              border: `1px solid ${darkMode ? 'var(--card-border)' : '#ececec'}`, 
              borderRadius: 7, 
              width: 22, 
              height: 22, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: darkMode ? 'var(--text)' : '#222', 
              fontSize: 12, 
              cursor: 'pointer' 
            }}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M10 4v12" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button style={{ 
              background: darkMode ? 'var(--card-bg)' : '#fff', 
              border: `1px solid ${darkMode ? 'var(--card-border)' : '#ececec'}`, 
              borderRadius: 7, 
              width: 24, 
              height: 24, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: darkMode ? 'var(--text)' : '#222', 
              fontSize: 12, 
              cursor: 'pointer', 
              zIndex: 2 
            }}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M4 4h4M4 4v4M16 16h-4M16 16v-4" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          {/* Welcome card at the top */}
          <div style={{ 
            background: darkMode ? 'var(--card-bg)' : '#fff', 
            border: `2px solid ${darkMode ? 'var(--card-border)' : '#ececec'}`, 
            borderRadius: 10, 
            padding: '10px 10px', 
            fontSize: '1.05rem', 
            fontWeight: 600, 
            color: darkMode ? 'var(--text)' : '#222', 
            boxShadow: darkMode ? '0 2px 8px #0003' : '0 2px 8px #0001', 
            marginBottom: 4, 
            marginTop: 0, 
            textAlign: 'center' 
          }}>
            Welcome!
          </div>
        </div>
      )}

      {/* BOTTOM: grid area and controls, but only show controls in Node View */}
      <div style={{ marginTop: 'auto', width: '100%' }}>
        {selectedView === 'Node View' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: 80, position: 'relative', marginTop: 0, marginBottom: 0 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(10, 1fr)', pointerEvents: 'none', zIndex: 0 }}>
              {gridDots}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 