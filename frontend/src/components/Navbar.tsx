import React from 'react';
import { User } from '../types';

interface NavbarProps {
  title: string;
  subtitle?: string;
  user: User | null;
  currentScenario: string | null;
  onRefresh?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  sseStatus?: 'connecting' | 'connected' | 'disconnected';
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  user,
  currentScenario,
  onRefresh,
  onOpenLogin,
  onLogout,
  sseStatus = 'connected',
}) => {
  return (
    <header className="top-bar">
      <div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>

      <div className="top-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* SSE Stream status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            className="status-dot"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor:
                sseStatus === 'connected'
                  ? '#10b981'
                  : sseStatus === 'connecting'
                  ? '#f59e0b'
                  : '#ef4444',
              boxShadow:
                sseStatus === 'connected'
                  ? '0 0 8px #10b981'
                  : 'none',
            }}
            title={`Stream: ${sseStatus}`}
          />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {sseStatus === 'connected' ? 'Live SSE' : sseStatus === 'connecting' ? 'Connecting' : 'Offline'}
          </span>
        </div>

        {currentScenario && (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            Trace: {currentScenario.replace(/_/g, ' ')}
          </span>
        )}

        {onRefresh && (
          <button className="btn btn-ghost btn-sm" onClick={onRefresh}>
            ↻ Refresh
          </button>
        )}

        <a
          href="http://localhost:8000/api/docs"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline btn-sm"
        >
          API Docs
        </a>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>
              {user.username}
            </span>
            {onLogout && (
              <button
                className="logout-btn"
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'none',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                }}
              >
                ⏻
              </button>
            )}
          </div>
        ) : (
          onOpenLogin && (
            <button className="btn btn-primary btn-sm" onClick={onOpenLogin}>
              🔐 Sign In
            </button>
          )
        )}
      </div>
    </header>
  );
};
