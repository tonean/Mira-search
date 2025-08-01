import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from 'react-router-dom';
import "./App.css";

export default function Sidebar({ isCollapsed, onToggleCollapse, chatHistory = [], onNavigateChat, onDeleteChat, darkMode = false, connectedServices = [], starredUsers = [], onToggleStarUser }) {
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

  // --- New: Zoom level for Node View ---
  const [zoomLevel, setZoomLevel] = useState(1.0);



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
        background: 'var(--sidebar-bg)',
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
        {/* View Mode dropdown right-aligned */}
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
            {selectedView === 'Regular View' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h18v18H3V3z" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="2" fill="none"/>
                <path d="M7 7h10v4H7V7z" fill={darkMode ? 'var(--text)' : '#222'}/>
                <path d="M7 13h6v3H7v-3z" fill={darkMode ? 'var(--text)' : '#222'}/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="2" fill="none"/>
                <circle cx="6" cy="6" r="2" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="2" fill="none"/>
                <circle cx="18" cy="6" r="2" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="2" fill="none"/>
                <circle cx="6" cy="18" r="2" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="2" fill="none"/>
                <circle cx="18" cy="18" r="2" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="2" fill="none"/>
                <line x1="12" y1="9" x2="6" y2="6" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.5"/>
                <line x1="12" y1="9" x2="18" y2="6" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.5"/>
                <line x1="12" y1="15" x2="6" y2="18" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.5"/>
                <line x1="12" y1="15" x2="18" y2="18" stroke={darkMode ? 'var(--text)' : '#222'} strokeWidth="1.5"/>
              </svg>
            )}
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
              borderRadius: 12, 
              boxShadow: darkMode ? '0 4px 16px #0004' : '0 4px 16px #0002', 
              minWidth: 220, 
              zIndex: 10, 
              padding: 8 
            }}>
              {/* Regular View Option */}
              <div 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px', 
                  color: darkMode ? 'var(--text)' : '#222', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer', 
                  fontWeight: selectedView === 'Regular View' ? 600 : 500,
                  borderRadius: 8,
                  background: selectedView === 'Regular View' ? (darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5') : 'transparent',
                  transition: 'background 0.15s ease'
                }} 
                onClick={() => { setSelectedView('Regular View'); setPlayDropdownOpen(false); }}
                onMouseEnter={(e) => e.target.style.background = darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = selectedView === 'Regular View' ? (darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5') : 'transparent'}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3h18v18H3V3z" stroke="#fff" strokeWidth="2" fill="none"/>
                    <path d="M7 7h10v4H7V7z" fill="#fff"/>
                    <path d="M7 13h6v3H7v-3z" fill="#fff"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: selectedView === 'Regular View' ? 600 : 500, color: darkMode ? 'var(--text)' : '#222' }}>
                    Regular View
                  </span>
                  <span style={{ fontSize: '0.75rem', color: darkMode ? 'var(--text-muted)' : '#888', marginTop: '2px', fontWeight: 400 }}>
                    Standard interface
                  </span>
                </div>
              </div>
              
              {/* Node View Option */}
              <div 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px', 
                  color: darkMode ? 'var(--text)' : '#222', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer', 
                  fontWeight: selectedView === 'Node View' ? 600 : 500,
                  borderRadius: 8,
                  background: selectedView === 'Node View' ? (darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5') : 'transparent',
                  transition: 'background 0.15s ease'
                }} 
                onClick={() => { setSelectedView('Node View'); setPlayDropdownOpen(false); }}
                onMouseEnter={(e) => e.target.style.background = darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = selectedView === 'Node View' ? (darkMode ? 'var(--input-action-active-bg)' : '#f5f5f5') : 'transparent'}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" fill="#fff"/>
                    <circle cx="6" cy="6" r="2" fill="#fff"/>
                    <circle cx="18" cy="6" r="2" fill="#fff"/>
                    <circle cx="6" cy="18" r="2" fill="#fff"/>
                    <circle cx="18" cy="18" r="2" fill="#fff"/>
                    <line x1="12" y1="9" x2="6" y2="6" stroke="#fff" strokeWidth="1.5"/>
                    <line x1="12" y1="9" x2="18" y2="6" stroke="#fff" strokeWidth="1.5"/>
                    <line x1="12" y1="15" x2="6" y2="18" stroke="#fff" strokeWidth="1.5"/>
                    <line x1="12" y1="15" x2="18" y2="18" stroke="#fff" strokeWidth="1.5"/>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: selectedView === 'Node View' ? 600 : 500, color: darkMode ? 'var(--text)' : '#222' }}>
                    Node View
                  </span>
                  <span style={{ fontSize: '0.75rem', color: darkMode ? 'var(--text-muted)' : '#888', marginTop: '2px', fontWeight: 400 }}>
                    Network visualization
                  </span>
                </div>
              </div>
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
            background: darkMode ? 'var(--input-action-active-bg)' : '#111', 
            color: darkMode ? 'var(--text)' : '#fff', 
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={darkMode ? 'var(--text-muted)' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
          {/* Connected Services or Add Connection Hint */}
          {connectedServices.length > 0 ? (
            <div style={{ 
              margin: '36px 0 22px 0'
            }}>
              {connectedServices.map((service) => {
                const serviceConfig = {
                  Gmail: {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73l-6.545 4.527-6.545-4.527v9.273H1.636C.732 21.002 0 20.27 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.818L12 10.09l9.546-6.269h.818c.904 0 1.636.732 1.636 1.636z" fill="#EA4335"/>
                        <path d="M0 5.457c0-.904.732-1.636 1.636-1.636h.818L12 10.09 21.546 3.82h.818c.904 0 1.636.732 1.636 1.636l-10.909 7.633L2.182 5.457z" fill="#FBBC04"/>
                        <path d="M0 5.457v13.909c0 .904.732 1.636 1.636 1.636h3.819V11.73z" fill="#EA4335"/>
                        <path d="M18.545 11.73v9.273h3.819c.904 0 1.636-.732 1.636-1.636V5.457z" fill="#34A853"/>
                      </svg>
                    )
                  },
                  LinkedIn: {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    )
                  },
                  Twitter: {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DA1F2">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    )
                  }
                };

                const config = serviceConfig[service];
                if (!config) return null;

                return (
                  <div key={service} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    padding: '8px',
                    background: 'transparent',
                    border: `1px solid #f0f0f0`,
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}>
                    {config.icon}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        marginBottom: '2px'
                      }}>
                        <span style={{ 
                          fontWeight: '600', 
                          color: darkMode ? 'var(--text)' : '#222',
                          fontSize: '0.9rem'
                        }}>
                          {service}
                        </span>
                        <span style={{
                          color: '#4caf50',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: '#e8f5e8',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Active
                        </span>
                      </div>
                      <div style={{
                        color: darkMode ? 'var(--text-muted)' : '#888',
                        fontSize: '0.75rem'
                      }}>
                        Your {service} is connected.
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
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
          )}
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 12px' }}>
        </div>
      )}

      {/* BOTTOM: grid area for Node View */}
      <div style={{ marginTop: 'auto', width: '100%' }}>
        {selectedView === 'Node View' && (
          <div 
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: 300, 
              position: 'relative', 
              overflow: 'hidden',
              margin: '12px 12px 120px 12px',
              borderRadius: 12,
              background: '#f5f5f5',
              cursor: 'grab'
            }}
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
            }}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gridTemplateRows: 'repeat(10, 1fr)', 
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.1s ease',
              pointerEvents: 'none',
              position: 'relative'
            }}>
              {gridDots.map((dot, index) => (
                <div key={index} style={{ 
                  width: 4, 
                  height: 4, 
                  borderRadius: '50%', 
                  background: darkMode ? 'var(--text-muted)' : '#cfd2d6', 
                  opacity: darkMode ? 0.4 : 0.6, 
                  margin: 18,
                  transition: 'all 0.1s ease'
                }} />
              ))}
              
              {/* Starred User Names */}
              {starredUsers.map((user, index) => (
                <div 
                  key={user.name}
                  style={{
                    position: 'absolute',
                    left: `${20 + (index * 60)}%`,
                    top: `${30 + (index * 40)}%`,
                    background: '#333',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: 16,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.background = '#444';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.background = '#333';
                  }}
                >
                  {user.name}
                </div>
              ))}
            </div>
            
            {/* Zoom Controls - Bottom Right */}
            <div style={{ 
              position: 'absolute', 
              bottom: 64, 
              right: 12, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 6 
            }}>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
                style={{ 
                  background: darkMode ? 'var(--card-bg)' : '#fff', 
                  border: `1px solid ${darkMode ? 'var(--card-border)' : '#ddd'}`, 
                  borderRadius: 6, 
                  width: 28, 
                  height: 28, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: darkMode ? 'var(--text)' : '#333', 
                  fontSize: 14, 
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.target.style.background = darkMode ? 'var(--input-action-active-bg)' : '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.background = darkMode ? 'var(--card-bg)' : '#fff'}
              >+</button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
                style={{ 
                  background: darkMode ? 'var(--card-bg)' : '#fff', 
                  border: `1px solid ${darkMode ? 'var(--card-border)' : '#ddd'}`, 
                  borderRadius: 6, 
                  width: 28, 
                  height: 28, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: darkMode ? 'var(--text)' : '#333', 
                  fontSize: 14, 
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => e.target.style.background = darkMode ? 'var(--input-action-active-bg)' : '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.background = darkMode ? 'var(--card-bg)' : '#fff'}
              >−</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 