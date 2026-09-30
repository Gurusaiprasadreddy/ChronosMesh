import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ViewTab } from './components/Sidebar';
import { Timeline } from './components/Timeline';
import { Home } from './pages/Home';
import { DashboardPage } from './pages/Dashboard';
import { TracePage } from './pages/Trace';
import { AnomaliesPage } from './pages/Anomalies';
import { WhatIfPage } from './pages/WhatIf';
import { BenchmarkPage } from './pages/Benchmark';
import { AnalyticsPage } from './pages/Analytics';
import { GraphDiffPage } from './pages/GraphDiff';
import { useAuth } from './hooks/useAuth';
import { useSSE } from './hooks/useSSE';
import api from './services/api';
import {
  DAGData,
  Event,
  Scenario,
  SystemMetrics,
  AnomalyReport,
} from './types';

export const App: React.FC = () => {
  const { user, isAuthenticated, login, logout, loading: authLoading } = useAuth();
  const { events: liveEvents, status: sseStatus } = useSSE(isAuthenticated);

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewTab>('overview');
  const [showLanding, setShowLanding] = useState<boolean>(!isAuthenticated);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginUsername, setLoginUsername] = useState('guru');
  const [loginPassword, setLoginPassword] = useState('chronosmesh');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Application Data State
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [dagData, setDagData] = useState<DAGData | null>(null);
  const [arrivalEvents, setArrivalEvents] = useState<Event[]>([]);
  const [causalEvents, setCausalEvents] = useState<Event[]>([]);
  const [anomalyReport, setAnomalyReport] = useState<AnomalyReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Fetch initial metadata
  const refreshMetrics = useCallback(async () => {
    try {
      const m = await api.getMetrics();
      setMetrics(m);
      if (m.current_scenario) {
        setCurrentScenario(m.current_scenario);
      }
    } catch (e) {
      console.warn('Metrics unavailable:', e);
    }
  }, []);

  const refreshScenarios = useCallback(async () => {
    try {
      const list = await api.getScenarios();
      setScenarios(list);
    } catch (e) {
      console.warn('Scenarios unavailable:', e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setShowLanding(false);
      refreshMetrics();
      refreshScenarios();
    }
  }, [isAuthenticated, refreshMetrics, refreshScenarios]);

  // Load a scenario / trace
  const handleLoadScenario = async (nameOrTraceId: string) => {
    setLoading(true);
    try {
      const res = await api.loadScenario(nameOrTraceId);
      setDagData(res.dag);
      setArrivalEvents(res.arrival_order || []);
      setCausalEvents(res.causal_order || []);
      setCurrentScenario(res.scenario.id);
      showToast(`Reconstructed ${res.event_count} events for ${res.scenario.name}`);

      // Fetch anomalies for this scenario
      const anoms = await api.getAnomalies();
      setAnomalyReport(anoms);
      refreshMetrics();
    } catch (err: any) {
      showToast(err.message || 'Failed to load scenario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      setShowLoginModal(false);
      setShowLanding(true);
      showToast('Authentication expired. Please sign in again.');
    };
    const handleOpenLogin = () => {
      setShowLoginModal(true);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    window.addEventListener('auth:open-login', handleOpenLogin);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      window.removeEventListener('auth:open-login', handleOpenLogin);
    };
  }, [showToast]);

  const handleLogout = useCallback(() => {
    logout();
    setShowLoginModal(false);
    setShowLanding(true);
    showToast('Logged out of ChronosMesh');
  }, [logout, showToast]);

  const handleOpenDashboardDirectly = async () => {
    if (!isAuthenticated) {
      try {
        await login('guru', 'chronosmesh');
        setShowLanding(false);
        showToast('Logged in as Guru (Admin) — Welcome to ChronosMesh!');
      } catch (err: any) {
        setShowLoginModal(true);
      }
    } else {
      setShowLanding(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await login(loginUsername, loginPassword);
      setShowLoginModal(false);
      setShowLanding(false);
      refreshMetrics();
      refreshScenarios();
      showToast('Logged in successfully as ' + loginUsername);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const renderLoginModal = () => {
    if (!showLoginModal) return null;
    return (
      <div
        className="modal-overlay active"
        style={{
          display: 'flex',
          opacity: 1,
          pointerEvents: 'all',
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(6, 11, 24, 0.85)',
          backdropFilter: 'blur(8px)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowLoginModal(false);
        }}
      >
        <div
          className="modal-card"
          style={{
            background: '#0d1526',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '36px',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            position: 'relative',
            transform: 'none',
          }}
        >
          <button
            className="modal-close"
            onClick={() => setShowLoginModal(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '20px',
            }}
          >
            ✕
          </button>
          <div className="modal-logo" style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#00d4ff' }}>⟳ ChronosMesh</span>
          </div>
          <h2 className="modal-title" style={{ textAlign: 'center', margin: 0, fontSize: '20px', fontWeight: 700 }}>
            Sign In
          </h2>
          <p className="modal-sub" style={{ textAlign: 'center', marginBottom: '16px', color: '#94a3b8', fontSize: '13px' }}>
            Access the distributed causality dashboard
          </p>

          {loginError && (
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                borderRadius: '6px',
                fontSize: '12px',
                marginBottom: '12px',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Username
              </label>
              <input
                type="text"
                className="form-input"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#060a12',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                className="form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#060a12',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  color: '#f8fafc',
                  fontSize: '14px',
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px', fontSize: '14px', fontWeight: 700 }}
              disabled={authLoading}
            >
              {authLoading ? 'Signing in…' : '🔐 Sign In'}
            </button>
          </form>

          <div
            style={{
              marginTop: '16px',
              fontSize: '12px',
              color: '#64748b',
              textAlign: 'center',
              background: '#090d16',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #1e293b',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '8px', color: '#94a3b8' }}>Quick Demo Access:</div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setLoginUsername('guru');
                  setLoginPassword('chronosmesh');
                  login('guru', 'chronosmesh')
                    .then(() => {
                      setShowLoginModal(false);
                      setShowLanding(false);
                      refreshMetrics();
                      refreshScenarios();
                      showToast('Logged in as Guru (Admin)');
                    })
                    .catch((err) => setLoginError(err.message));
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid #00d4ff',
                  color: '#00d4ff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                👑 Admin (guru)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginUsername('demo');
                  setLoginPassword('demo123');
                  login('demo', 'demo123')
                    .then(() => {
                      setShowLoginModal(false);
                      setShowLanding(false);
                      refreshMetrics();
                      refreshScenarios();
                      showToast('Logged in as Demo (Viewer)');
                    })
                    .catch((err) => setLoginError(err.message));
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  background: 'rgba(148, 163, 184, 0.1)',
                  border: '1px solid #64748b',
                  color: '#cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                👤 Viewer (demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (showLanding && !isAuthenticated) {
    return (
      <>
        <Home
          onOpenDashboard={handleOpenDashboardDirectly}
          onOpenLogin={() => setShowLoginModal(true)}
          isAuthenticated={isAuthenticated}
        />
        {renderLoginModal()}
      </>
    );
  }

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: '#060a12', color: '#f8fafc' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#0d1526',
            border: '1px solid #00d4ff',
            color: '#f8fafc',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,212,255,0.25)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        user={user}
        currentScenario={currentScenario}
        anomalyCount={anomalyReport?.total || 0}
        onLogout={handleLogout}
        onOpenLogin={() => setShowLoginModal(true)}
        onSelectTrace={(t) => handleLoadScenario(t)}
      />

      {/* Main Container */}
      <div
        className="main-area"
        style={{
          marginLeft: 'var(--sidebar-w, 240px)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
          width: 'calc(100% - var(--sidebar-w, 240px))',
        }}
      >
        <Navbar
          title={
            currentView === 'overview'
              ? 'Cluster Overview'
              : currentView === 'dag'
              ? 'Reconstructed Causal Graph'
              : currentView === 'timeline'
              ? 'Timeline Replay & Verification'
              : currentView === 'anomaly'
              ? 'Anomaly Detection Center'
              : currentView === 'whatif'
              ? 'What-If Blast Radius Lab'
              : currentView === 'benchmark'
              ? 'Clock Strategy Benchmarks'
              : currentView === 'analytics'
              ? 'Latency, Topology & Causal Replay Analytics'
              : currentView === 'diff'
              ? 'Causal Graph Diff & Behavioral Drift'
              : 'Architecture Documentation'
          }
          subtitle={
            currentScenario
              ? `Active Workflow: ${currentScenario.replace(/_/g, ' ')}`
              : 'Select a scenario to reconstruct causality'
          }
          user={user}
          currentScenario={currentScenario}
          onRefresh={refreshMetrics}
          onOpenLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          sseStatus={sseStatus}
        />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {currentView === 'overview' && (
            <DashboardPage
              metrics={metrics}
              scenarios={scenarios}
              currentScenario={currentScenario}
              events={arrivalEvents}
              liveEvents={liveEvents}
              onLoadScenario={handleLoadScenario}
              onNavigateToDag={() => setCurrentView('dag')}
              loading={loading}
              anomalyReport={anomalyReport}
            />
          )}

          {currentView === 'dag' && (
            <TracePage
              dagData={dagData}
              anomalies={anomalyReport?.anomalies || []}
              currentTrace={currentScenario}
              onRunWhatIf={() => setCurrentView('whatif')}
              onTraceRootCause={() => setCurrentView('anomaly')}
            />
          )}

          {currentView === 'timeline' && (
            <Timeline
              arrivalEvents={arrivalEvents}
              causalEvents={causalEvents}
            />
          )}

          {currentView === 'anomaly' && (
            <AnomaliesPage
              anomalyReport={anomalyReport}
              nodes={dagData?.nodes || []}
              onSelectAnomalyEvent={() => setCurrentView('dag')}
              onTraceRootCause={(eventId) => api.getRootCause(eventId)}
            />
          )}

          {currentView === 'whatif' && (
            <WhatIfPage
              dagData={dagData}
              nodes={dagData?.nodes || []}
              onRunWhatIfSimulation={(eventId) => api.runWhatIf(eventId)}
            />
          )}

          {currentView === 'benchmark' && <BenchmarkPage />}

          {currentView === 'analytics' && <AnalyticsPage />}

          {currentView === 'diff' && <GraphDiffPage />}

          {currentView === 'docs' && (
            <div className="card" style={{ padding: '28px', lineHeight: 1.6 }}>
              <div className="card-header">
                <div className="card-title">ChronosMesh Architectural Contracts</div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px' }}>
                Stage 2 interface and schema contracts establish the verified integration boundary between
                the Core Engine (Akshith), Data Pipeline (Surya), and the API / Dashboard (Guru).
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px' }}>
                {[
                  { name: 'API_CONTRACT.md', desc: 'REST API endpoints, JWT auth, and error schemas' },
                  { name: 'EVENT_SCHEMA.md', desc: 'JSON, Avro, Protobuf event models & Kafka topics' },
                  { name: 'CAUSAL_DAG_SCHEMA.md', desc: 'NetworkX DiGraph & D3.js node/edge definitions' },
                  { name: 'NEO4J_SCHEMA.md', desc: 'Cypher DDL, relationships, indexes, and queries' },
                  { name: 'STAGE1_TO_API_MAPPING.md', desc: 'Direct class-to-endpoint traceability matrix' },
                  { name: 'FRONTEND_DATA_CONTRACT.md', desc: 'Component contracts, D3 layouts, and SSE specs' },
                ].map((d) => (
                  <div key={d.name} style={{ background: '#0d1526', padding: '14px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                    <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: '13px' }}>📄 {d.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>{d.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      {renderLoginModal()}
    </div>
  );
};

export default App;
