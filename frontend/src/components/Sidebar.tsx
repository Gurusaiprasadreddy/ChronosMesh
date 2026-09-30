import React from 'react';
import { User } from '../types';

export type ViewTab = 'overview' | 'dag' | 'timeline' | 'anomaly' | 'whatif' | 'benchmark' | 'analytics' | 'diff' | 'docs';

interface SidebarProps {
  currentView: ViewTab;
  onSelectView: (view: ViewTab) => void;
  user: User | null;
  currentScenario: string | null;
  anomalyCount: number;
  onLogout: () => void;
  onOpenLogin?: () => void;
  onSelectTrace?: (traceId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  user,
  currentScenario,
  anomalyCount,
  onLogout,
  onOpenLogin,
  onSelectTrace,
}) => {
  const userInitials = (user?.full_name || user?.username || 'G')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">⟳</div>
          ChronosMesh
        </div>
      </div>

      {/* Trace / Scenario Selector */}
      <div className="sidebar-scenario">
        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Active Trace
        </div>
        <div style={{ marginTop: '6px' }}>
          <select
            value={currentScenario || ''}
            onChange={(e) => onSelectTrace && onSelectTrace(e.target.value)}
            style={{
              width: '100%',
              background: '#0d1526',
              border: '1px solid #334155',
              color: '#e2e8f0',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            <option value="" disabled>-- Select Trace --</option>
            <option value="ecommerce_demo">⚡ TRACE-DEMO-001 (E-Commerce)</option>
            <option value="order_payment_flow">T-1001: Order Flow (Chain)</option>
            <option value="concurrent_branches">T-1002: Concurrent Pay/Inv (Fork)</option>
            <option value="diamond_pattern">T-1003: Diamond (Fork-Join)</option>
          </select>
        </div>
        {currentScenario ? (
          <div className="scenario-badge" style={{ marginTop: '8px', display: 'flex' }}>
            <span>●</span>
            <span>{currentScenario.replace(/_/g, ' ')}</span>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>None loaded</div>
        )}
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Views</div>
        <button
          className={`nav-item ${currentView === 'overview' ? 'active' : ''}`}
          onClick={() => onSelectView('overview')}
        >
          <span className="nav-icon">📊</span> Overview
        </button>
        <button
          className={`nav-item ${currentView === 'dag' ? 'active' : ''}`}
          onClick={() => onSelectView('dag')}
        >
          <span className="nav-icon">🔗</span> Causal DAG
        </button>
        <button
          className={`nav-item ${currentView === 'timeline' ? 'active' : ''}`}
          onClick={() => onSelectView('timeline')}
        >
          <span className="nav-icon">⏱</span> Timeline Replay
        </button>

        <div className="nav-section-label" style={{ marginTop: '16px' }}>
          Causal Analysis
        </div>
        <button
          className={`nav-item ${currentView === 'anomaly' ? 'active' : ''}`}
          onClick={() => onSelectView('anomaly')}
        >
          <span className="nav-icon">⚡</span> Anomaly Center
          {anomalyCount > 0 && (
            <span className="nav-badge" style={{ background: '#ef4444' }}>
              {anomalyCount}
            </span>
          )}
        </button>
        <button
          className={`nav-item ${currentView === 'whatif' ? 'active' : ''}`}
          onClick={() => onSelectView('whatif')}
        >
          <span className="nav-icon">🎯</span> What-If Lab
        </button>
        <button
          className={`nav-item ${currentView === 'benchmark' ? 'active' : ''}`}
          onClick={() => onSelectView('benchmark')}
        >
          <span className="nav-icon">📈</span> Clock Benchmark
        </button>
        <button
          className={`nav-item ${currentView === 'analytics' ? 'active' : ''}`}
          onClick={() => onSelectView('analytics')}
        >
          <span className="nav-icon">🔬</span> Analytics
        </button>
        <button
          className={`nav-item ${currentView === 'diff' ? 'active' : ''}`}
          onClick={() => onSelectView('diff')}
        >
          <span className="nav-icon">⚖️</span> Graph Diff
        </button>

        <div className="nav-section-label" style={{ marginTop: '16px' }}>
          Architecture
        </div>
        <button
          className={`nav-item ${currentView === 'docs' ? 'active' : ''}`}
          onClick={() => onSelectView('docs')}
        >
          <span className="nav-icon">📖</span> System Contracts
        </button>
      </nav>

      <div className="sidebar-footer">
        <div
          className="user-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '10px 12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
            <div className="user-avatar" style={{ flexShrink: 0 }}>{userInitials}</div>
            <div className="user-info" style={{ minWidth: 0, overflow: 'hidden' }}>
              <div
                className="user-name"
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#f8fafc',
                }}
              >
                {user?.full_name || user?.username || 'Guest'}
              </div>
              <div className="user-role" style={{ fontSize: '10px', color: '#64748b' }}>
                {user ? (user.role || 'operator') : 'viewer (guest)'}
              </div>
            </div>
          </div>
          {user ? (
            <button
              className="btn btn-outline btn-sm"
              onClick={onLogout}
              title="Log out of ChronosMesh"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                borderColor: '#334155',
                color: '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              <span>🚪</span> Log Out
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={onOpenLogin || onLogout}
              title="Sign in to ChronosMesh"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>🔐</span> Log In
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
