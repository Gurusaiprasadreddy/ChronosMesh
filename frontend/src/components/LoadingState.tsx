import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading causal data…',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        color: '#94a3b8',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(0, 212, 255, 0.2)',
          borderTopColor: '#00d4ff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: '13px', margin: 0 }}>{message}</p>
    </div>
  );
};

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px',
        color: '#ef4444',
        textAlign: 'center',
        gap: '12px',
      }}
    >
      <div style={{ fontSize: '28px' }}>⚠️</div>
      <div style={{ fontWeight: 600, fontSize: '14px' }}>Error Loading Data</div>
      <p style={{ color: '#94a3b8', fontSize: '12px', maxWidth: '400px', margin: 0 }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-outline btn-sm"
          style={{ marginTop: '8px' }}
        >
          ↻ Retry
        </button>
      )}
    </div>
  );
};

export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}> = ({ icon = '📭', title, description, actionText, onAction }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        color: '#64748b',
        gap: '10px',
      }}
    >
      <div style={{ fontSize: '36px', marginBottom: '4px' }}>{icon}</div>
      <h3 style={{ fontSize: '15px', color: '#e2e8f0', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '380px', margin: 0 }}>
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn btn-primary btn-sm"
          style={{ marginTop: '12px' }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
