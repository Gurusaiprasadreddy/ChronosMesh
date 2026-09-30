import React from 'react';
import { ServiceHealthItem } from '../types';

interface ServiceHealthMapProps {
  services: ServiceHealthItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ServiceHealthMap: React.FC<ServiceHealthMapProps> = ({
  services,
  loading = false,
  error = null,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className="cm-loading-box">
        <div className="cm-spinner" />
        <span>Evaluating deterministic service health metrics...</span>
      </div>
    );
  }

  if (error) {
    const isAuthError =
      error.toLowerCase().includes('authentication') ||
      error.toLowerCase().includes('log in') ||
      error.toLowerCase().includes('unauthorized') ||
      error.toLowerCase().includes('401');

    return (
      <div className="cm-error-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <span>Failed to load service health: {error}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isAuthError && (
            <button
              className="cm-btn cm-btn-primary"
              onClick={() => window.dispatchEvent(new CustomEvent('auth:open-login'))}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              🔐 Log In Now
            </button>
          )}
          {onRetry && (
            <button className="cm-btn" onClick={onRetry} style={{ fontSize: '12px', padding: '6px 14px' }}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="cm-empty-state">
        <h4>No Active Services Tracked</h4>
        <p>Load a scenario trace (e.g. TRACE-DEMO-001) to evaluate distributed service health.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
      {services.map((svc) => {
        const statusClass = svc.status.toLowerCase();
        return (
          <div
            key={svc.service_name}
            className="cm-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderLeft: `3px solid var(--cm-${statusClass === 'healthy' ? 'success' : statusClass === 'degraded' ? 'warning' : statusClass === 'critical' ? 'critical' : 'unavailable'})`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--cm-text-primary)' }}>
                {svc.service_name}
              </span>
              <span className={`cm-badge cm-badge-${statusClass}`}>
                <span className={`cm-status-dot ${statusClass}`} />
                {svc.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', color: 'var(--cm-text-muted)' }}>
              <div>
                Events: <strong style={{ color: 'var(--cm-text-secondary)' }}>{svc.event_count}</strong>
              </div>
              <div>
                Anomalies: <strong style={{ color: svc.anomaly_count > 0 ? 'var(--cm-critical)' : 'var(--cm-text-secondary)' }}>{svc.anomaly_count}</strong>
              </div>
              <div>
                Avg Latency: <strong style={{ color: 'var(--cm-text-secondary)' }}>{svc.avg_latency_ms !== null ? `${svc.avg_latency_ms} ms` : 'N/A'}</strong>
              </div>
              <div>
                Activity: <strong style={{ color: 'var(--cm-text-secondary)' }}>{svc.latest_activity_ms ? 'Active' : 'N/A'}</strong>
              </div>
            </div>

            <div style={{ fontSize: '10px', color: 'var(--cm-text-muted)', borderTop: '1px solid var(--cm-border-subtle)', paddingTop: '6px' }}>
              Deterministic status: {svc.details.critical_anomalies ? `${svc.details.critical_anomalies} critical issue(s)` : svc.details.warning_anomalies ? `${svc.details.warning_anomalies} warning(s)` : '0 anomalies detected'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
