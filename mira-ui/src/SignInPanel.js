import React, { useState } from "react";

export default function SignInPanel() {
  const [email, setEmail] = useState("");
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 2000,
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          padding: '10px 22px',
          fontWeight: 500,
          fontSize: '1rem',
          color: '#234',
          cursor: 'pointer',
        }}
        aria-label="Expand sign in panel"
      >
        Connect an account to get started!
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      width: 340,
      background: '#fff',
      borderRadius: 18,
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      padding: '28px 24px 20px 24px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      fontFamily: 'inherit',
    }}>
      <button
        onClick={() => setMinimized(true)}
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          background: 'none',
          border: 'none',
          fontSize: 22,
          color: '#888',
          cursor: 'pointer',
        }}
        aria-label="Minimize sign in panel"
      >
        –
      </button>
      <div style={{ marginBottom: 10, marginTop: 8, fontWeight: 600, fontSize: '1.15rem', color: '#234', textAlign: 'left' }}>
      Connect an account to get started!
      </div>
      <div style={{ color: '#888', fontSize: '0.98rem', marginBottom: 18 }}>
        Unlock Pro Search and History
      </div>
      <button style={{
        background: '#4E342E',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '12px 0',
        fontWeight: 500,
        fontSize: '1rem',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
      }}>
        <span style={{ fontSize: 18 }}>G</span> Continue with Google
      </button>
      <button style={{
        background: '#f5f5f5',
        color: '#222',
        border: 'none',
        borderRadius: 8,
        padding: '12px 0',
        fontWeight: 500,
        fontSize: '1rem',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
      }}>
        <span style={{ fontSize: 18 }}></span> Continue with Apple
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <button
          style={{
            background: email ? '#222' : '#eee',
            color: email ? '#fff' : '#aaa',
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            fontWeight: 500,
            fontSize: '1rem',
            cursor: email ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
          disabled={!email}
        >
          Continue with email
        </button>
      </div>
      <div style={{ color: '#888', fontSize: '0.92rem', textAlign: 'center', marginTop: 6 }}>
        Single sign-on (SSO)
      </div>
    </div>
  );
} 