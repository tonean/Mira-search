import React from "react";
import "./App.css";

export default function TopBar({ darkMode, toggleDarkMode }) {
  return (
    <div className="top-bar">
      <button 
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-contrast)',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          marginRight: '8px'
        }}
      >
        Log in
      </button>
      <button 
        style={{
          backgroundColor: 'transparent',
          color: 'var(--primary)',
          border: '1px solid var(--border-dark)',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '0.9rem',
          fontWeight: '500',
          cursor: 'pointer',
          marginRight: '8px'
        }}
      >
        Sign up
      </button>
      <button
        onClick={toggleDarkMode}
        style={{
          background: 'none',
          border: 'none',
          borderRadius: '50%',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 20,
          color: 'var(--primary)'
        }}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          // Sun icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          // Moon icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
        )}
      </button>
    </div>
  );
} 