import React, { useState, useEffect } from "react";
import "./App.css";

function ConnectionToggle({ label }) {
  const [enabled, setEnabled] = useState(false);
  const [thumbActive, setThumbActive] = useState(false);

  // Animate thumb scale on toggle
  const handleToggle = () => {
    setEnabled(e => !e);
    setThumbActive(true);
    setTimeout(() => setThumbActive(false), 180); // 180ms scale effect
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 2 }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleToggle}
          style={{ display: 'none' }}
        />
        <span
          style={{
            width: 30,
            height: 16,
            background: enabled ? '#444' : 'var(--input-border)',
            borderRadius: 10,
            position: 'relative',
            transition: 'background 0.25s cubic-bezier(.4,1.6,.6,1)',
            display: 'inline-block',
            boxShadow: enabled ? '0 0 2px var(--primary)' : 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: enabled ? 16 : 2,
              top: 1,
              width: 12,
              height: 12,
              background: 'var(--bg)',
              borderRadius: '50%',
              boxShadow: '0 1px 2px #0001',
              transition: 'left 0.22s cubic-bezier(.4,1.6,.6,1), transform 0.18s cubic-bezier(.4,1.6,.6,1)',
              border: '1px solid var(--input-border)',
              transform: thumbActive ? 'scale(1.18)' : 'scale(1)',
            }}
          />
        </span>
      </label>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.93rem', marginTop: 2, fontWeight: 500, letterSpacing: 0.1 }}>{enabled ? 'Connected' : 'Connect'}</span>
    </div>
  );
}

// Accept isSidebarCollapsed as a prop
export default function ConnectionsPage({ isSidebarCollapsed = false }) {
  const [contentStyle, setContentStyle] = useState({
    maxWidth: 700,
    margin: '0 auto',
    padding: '0 24px',
  });

  useEffect(() => {
    function handleResize() {
      // If window is wide, use a larger maxWidth; if narrow, use more full width
      if (window.innerWidth < 900) {
        setContentStyle({ maxWidth: '98vw', margin: isSidebarCollapsed ? '8px 0 0 2vw' : '0 0', padding: '0 8px' });
      } else if (window.innerWidth < 1200) {
        setContentStyle({ maxWidth: 540, margin: isSidebarCollapsed ? '8px 0 0 4vw' : '0 auto', padding: '0 16px' });
      } else {
        setContentStyle({ maxWidth: 900, margin: isSidebarCollapsed ? '12px 0 0 6vw' : '0 auto', padding: '0 32px' });
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  // Move the whole page up if sidebar is collapsed
  const pageStyle = isSidebarCollapsed
    ? { background: 'var(--bg)', minHeight: '100vh', padding: '8px 0 0 0' }
    : { background: 'var(--bg)', minHeight: '100vh', padding: '48px 0' };

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 600, color: '#222', marginBottom: 24 }}>Connections</h1>
        <div style={{ color: '#444', fontSize: '1.13rem', marginBottom: 18 }}>
          Make your network searchable to you, your friends, and groups you're in. We never share, sell, or use your data to train AI models.
        </div>
        <div style={{ color: '#888', fontSize: '1.01rem', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ marginRight: 4 }}><circle cx="10" cy="10" r="9" stroke="#bbb" strokeWidth="1.5"/><path d="M10 6v4l2.5 2.5" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/></svg>
          We'll email you when processing is complete.
        </div>
        <div style={{ background: '#eafbe7', color: '#1a7f37', borderRadius: 8, padding: '20px 18px', fontSize: '1.13rem', fontWeight: 500, marginBottom: 38 }}>
          Looks like you haven't connected any accounts. Connect an account below!
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 12, marginBottom: 32, display: 'flex', alignItems: 'center', padding: '28px 24px', gap: 18 }}>
          <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" alt="Gmail" style={{ width: 38, height: 38, marginRight: 8 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '1.13rem', color: '#222', marginBottom: 4 }}>Gmail</div>
            <div style={{ color: '#444', fontSize: '1.01rem' }}>Add your Gmail contacts.</div>
          </div>
          <ConnectionToggle label="Gmail" />
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 12, marginBottom: 32, display: 'flex', alignItems: 'center', padding: '28px 24px', gap: 18 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" style={{ width: 38, height: 38, marginRight: 8 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '1.13rem', color: '#222', marginBottom: 4 }}>LinkedIn</div>
            <div style={{ color: '#444', fontSize: '1.01rem' }}>Add your LinkedIn connections.</div>
          </div>
          <ConnectionToggle label="LinkedIn" />
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 12, marginBottom: 32, display: 'flex', alignItems: 'center', padding: '28px 24px', gap: 18 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" style={{ width: 38, height: 38, marginRight: 8 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '1.13rem', color: '#222', marginBottom: 4 }}>Twitter</div>
            <div style={{ color: '#444', fontSize: '1.01rem' }}>Add your Twitter followers.</div>
          </div>
          <ConnectionToggle label="Twitter" />
        </div>
        {/* Add extra space at the bottom for scrolling comfort */}
        <div style={{ height: 120 }} />
      </div>
    </div>
  );
} 