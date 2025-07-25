import React from "react";
import "./App.css";

export default function TopBar({ darkMode, toggleDarkMode, onSignUpClick, onLoginClick, user, isAuthenticated, onLogout }) {
  return (
    <div className="top-bar">
      {!isAuthenticated ? (
        <>
          <button 
            onClick={onLoginClick}
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
            Log in
          </button>
          <button 
            onClick={onSignUpClick}
            style={{
              backgroundColor: 'var(--primary)',
              color: darkMode ? 'var(--border-dark)' : '#fff',
              border: 'none',
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
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text)', marginRight: '8px' }}>
            {user?.name}
          </span>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              padding: 0,
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Click to logout"
          >
            <img 
              src={user?.picture} 
              alt={user?.name}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{
              display: 'none',
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              borderRadius: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </button>
        </div>
      )}
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