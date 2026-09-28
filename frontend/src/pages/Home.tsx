import React from 'react';

interface HomeProps {
  onOpenDashboard: () => void;
  onOpenLogin: () => void;
  isAuthenticated: boolean;
}

export const Home: React.FC<HomeProps> = ({
  onOpenDashboard,
  onOpenLogin,
  isAuthenticated,
}) => {
  return (
    <div style={{ background: '#060a12', minHeight: '100vh', color: '#f8fafc', paddingBottom: '60px' }}>
      {/* Navigation */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 48px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(6, 10, 18, 0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 800 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#090d16',
              fontWeight: 900,
            }}
          >
            ⟳
          </div>
          <span>ChronosMesh</span>
        </div>

        <div style={{ display: 'flex', gap: '28px', fontSize: '14px', color: '#94a3b8' }}>
          <a href="#problem" style={{ color: 'inherit', textDecoration: 'none' }}>The Problem</a>
          <a href="#solution" style={{ color: 'inherit', textDecoration: 'none' }}>Solution</a>
          <a href="#architecture" style={{ color: 'inherit', textDecoration: 'none' }}>Architecture</a>
          <a href="http://localhost:8000/api/docs" target="_blank" rel="noreferrer" style={{ color: '#00d4ff', textDecoration: 'none' }}>API Docs</a>
        </div>

        <div>
          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={onOpenDashboard}>
              🚀 Open Dashboard
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onOpenLogin}>
              🔐 Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '90px 24px 70px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            color: '#00d4ff',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '24px',
          }}
        >
          <span>●</span> Cloud Computing PE-5 Project · Distributed Causality Engine
        </div>

        <h1 style={{ fontSize: '56px', fontWeight: 900, lineHeight: 1.15, marginBottom: '20px', letterSpacing: '-1px' }}>
          Reconstructing Causality in<br />
          <span style={{ background: 'linear-gradient(90deg, #00d4ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Distributed Systems
          </span>
        </h1>

        <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '680px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Understand <strong>what</strong> happened. Understand <strong>when</strong> it happened. Understand <strong>why</strong> it happened.
          ChronosMesh transforms disordered event logs into the true causal execution DAG.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={onOpenDashboard}
            style={{ fontSize: '15px', padding: '12px 32px' }}
          >
            🚀 Open Live Dashboard
          </button>
          <a
            href="#architecture"
            className="btn btn-outline"
            style={{ fontSize: '15px', padding: '12px 28px', textDecoration: 'none' }}
          >
            Explore Architecture
          </a>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            The Distributed System Dilemma
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }}>
            Arrival Order ≠ Causal Order
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', alignItems: 'center', gap: '16px' }}>
          {/* Arrival */}
          <div style={{ background: '#0d1526', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '14px' }}>
              ❌ Traditional Logs (Arrival Order)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>5. STOCK_RESERVED</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>4. PAYMENT_SUCCESS</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>6. SHIPPING_START</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>1. ORDER_CREATED</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>3. STOCK_CHECK</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>2. PAYMENT_START</div>
            </div>
            <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '14px' }}>
              Network latency and asynchronous messaging scramble real events.
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '24px', color: '#00d4ff' }}>
            ⟶
          </div>

          {/* Causal */}
          <div style={{ background: '#0d1526', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ color: '#10b981', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '14px' }}>
              ✅ ChronosMesh Reconstructed Truth
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>1. ORDER_CREATED (Root)</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>2. PAYMENT_START (← E1)</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>3. STOCK_CHECK (← E1 ∥ E2)</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>4. PAYMENT_SUCCESS (← E2)</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>5. STOCK_RESERVED (← E3)</div>
              <div style={{ padding: '6px 10px', background: '#161f30', borderRadius: '4px' }}>6. SHIPPING_START (← E4, E5)</div>
            </div>
            <div style={{ color: '#10b981', fontSize: '11px', marginTop: '14px' }}>
              Causal DAG Builder resolves real execution and concurrency.
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Pipeline Section */}
      <section id="architecture" style={{ maxWidth: '1000px', margin: '40px auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '11px', color: '#00d4ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            System Architecture
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }}>
            End-to-End Distributed Pipeline
          </h2>
        </div>

        <div style={{ background: '#0d1526', border: '1px solid #1e293b', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {[
              { label: 'Mock Microservices', tech: 'Emits Events', color: '#3b82f6' },
              { label: 'Kafka / MSK', tech: 'Disordered Ingestion', color: '#8b5cf6' },
              { label: 'Flink Streams', tech: 'Windowing & State', color: '#ec4899' },
              { label: 'Clock Engines', tech: 'Lamport, Vector, HLC', color: '#f59e0b' },
              { label: 'Causal Engine', tech: 'DAG & Transitive Red.', color: '#10b981' },
              { label: 'Neo4j / Store', tech: 'Graph Persistence', color: '#00d4ff' },
              { label: 'Guru API & UI', tech: 'FastAPI + React Dashboard', color: '#a855f7' },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.label}>
                <div style={{ textAlign: 'center', minWidth: '110px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: `${step.color}15`,
                      border: `1px solid ${step.color}50`,
                      color: step.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      fontWeight: 800,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>{step.label}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{step.tech}</div>
                </div>
                {idx < arr.length - 1 && (
                  <div style={{ color: '#334155', fontSize: '18px' }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', maxWidth: '1000px', margin: '40px auto 0', padding: '24px', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px' }}>
        <div>ChronosMesh — Cloud Computing PE-5 Project</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Akshith (Core Engine)</span>
          <span>Surya (Data Layer)</span>
          <span style={{ color: '#00d4ff', fontWeight: 600 }}>Guru (API & Frontend)</span>
        </div>
      </footer>
    </div>
  );
};
