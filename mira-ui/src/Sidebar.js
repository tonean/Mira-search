import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from 'react-router-dom';
import "./App.css";

export default function Sidebar({ isCollapsed, onToggleCollapse, chatHistory = [], onNavigateChat, onDeleteChat }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [showDeleteIdx, setShowDeleteIdx] = useState(null);
  const chatRefs = useRef([]);
  const [deleteBtnHovered, setDeleteBtnHovered] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (isCollapsed) {
      onToggleCollapse();
    }
  };

  const handleMouseLeave = () => {
    // Only collapse if not showing delete button and not hovering delete button
    if (!isCollapsed && showDeleteIdx === null && !deleteBtnHovered) {
      onToggleCollapse();
    }
  };

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-top-section">
        <div className="sidebar-icon-row">
          <span 
            className="sidebar-hamburger" 
            onClick={onToggleCollapse}
            style={{ cursor: 'pointer', marginRight: isCollapsed ? 6 : 20 }}
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="16" height="16" rx="3" stroke="var(--text-muted)" strokeWidth="1.5" fill="none"/>
              <line x1="7" y1="2" x2="7" y2="18" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </div>
        {isCollapsed && (
          <div className="collapsed-icons">
            {/* Only keep the hamburger/menu icon in collapsed state. Remove all other icons. */}
          </div>
        )}
        {!isCollapsed && (
          <>
          <button className="new-task-btn" onClick={() => {
            if (onNavigateChat) {
              onNavigateChat(""); // Go to home
            } else {
              navigate("/");
            }
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Plus icon */}
              <svg width="0.90rem" height="0.90rem" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span style={{ color: '#666', fontSize: '0.90rem' }}>New Chat</span>
            </span>
          </button>
          <button className="new-task-btn" onClick={() => {
            navigate("/connections");
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Magnifying glass icon */}
              <svg width="0.90rem" height="0.90rem" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span style={{ color: '#666', fontSize: '0.90rem' }}>Add Connection</span>
            </span>
          </button>
        <div className="create-task-hint">
          <div className="dotted-box" />
          <span>Add a new connection to get started</span>
        </div>
        {/* Your Chats section */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, marginLeft: 18 }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.92rem', letterSpacing: 0.2, userSelect: 'none' }}>Chats</span>
          </div>
          <div>
            {chatHistory.length === 0 && (
              <div
                className="sidebar-chat-item"
                style={{
                  color: '#333',
                  fontSize: '1.01rem',
                  padding: '7px 10px',
                  borderRadius: 7,
                  marginBottom: 2,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  marginLeft: 18,
                }}
                onClick={() => onNavigateChat && onNavigateChat("")}
                onMouseEnter={() => setHoveredIdx('new')}
                onMouseLeave={() => setHoveredIdx(null)}
                title="New Chat"
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>New Chat</span>
                {/* 3-dots button, only show on hover, but do not allow delete */}
                {hoveredIdx === 'new' && (
                  <button
                    className="sidebar-chat-dots"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      marginLeft: 6,
                      padding: 2,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    tabIndex={-1}
                    // No delete for this item
                    onClick={e => e.stopPropagation()}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="4" cy="10" r="1.5" fill="#888"/><circle cx="10" cy="10" r="1.5" fill="#888"/><circle cx="16" cy="10" r="1.5" fill="#888"/></svg>
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
                      left: rect.right + 12,
                      top: rect.top + window.scrollY,
                      background: '#fafafa',
                      color: '#aaa',
                      border: '1px solid #e0e0e0',
                      borderRadius: 7,
                      padding: '4px 16px',
                      fontSize: '0.98rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      marginLeft: 8,
                      boxShadow: '0 2px 8px #0001',
                      zIndex: 2000,
                      transition: 'background 0.15s, color 0.15s, border 0.15s',
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
                    color: '#333',
                    fontSize: '1.01rem',
                    padding: '7px 10px',
                    borderRadius: 7,
                    marginBottom: 2,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    marginLeft: 8,
                  }}
                  onClick={e => {
                    // Only trigger navigation if not clicking the 3-dots or delete
                    if (e.target.classList.contains('sidebar-chat-dots') || e.target.classList.contains('sidebar-chat-delete')) return;
                    onNavigateChat && onNavigateChat(chat);
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => {
                    setHoveredIdx(null);
                    // Only hide delete if not hovering delete button
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
                  {/* 3-dots button, only show on hover */}
                  {hoveredIdx === idx && showDeleteIdx !== idx && (
                    <button
                      className="sidebar-chat-dots"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        marginLeft: 6,
                        padding: 2,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      tabIndex={-1}
                      onClick={e => { e.stopPropagation(); setShowDeleteIdx(idx); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="4" cy="10" r="1.5" fill="#888"/><circle cx="10" cy="10" r="1.5" fill="#888"/><circle cx="16" cy="10" r="1.5" fill="#888"/></svg>
                    </button>
                  )}
                 {deleteBtn}
                </div>
              );
            })}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
} 