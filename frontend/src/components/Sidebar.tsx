import React from 'react';
import { User } from '../types';

export type ViewTab = 'overview' | 'dag' | 'timeline' | 'anomaly' | 'whatif' | 'benchmark' | 'docs';

interface SidebarProps {
  currentView: ViewTab;
  onSelectView: (view: ViewTab) => void;
  user: User | null;
  currentScenario: string | null;
  anomalyCount: number;
  onLogout: () => void;
  onSelectTrace?: (traceId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  user,
  currentScenario,
  anomalyCount,
  onLogout,
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
        <div className="user-card">
          <div className="user-avatar">{userInitials}</div>
          <div className="user-info">
            <div className="user-name">{user?.full_name || user?.username || 'Guest'}</div>
            <div className="user-role">{user?.role || 'viewer'}</div>
          </div>
          {user && (
            <button className="logout-btn" onClick={onLogout} title="Logout">
              ⏻
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
