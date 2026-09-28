import React from 'react';

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
  subValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  label,
  value,
  color = '#00d4ff',
  subValue,
}) => {
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div
        className="stat-icon"
        style={{
          background: `${color}1a`,
          color,
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}
      >
        {icon}
      </div>
      <div>
        <div className="stat-value" style={{ color, fontSize: '22px', fontWeight: 800 }}>
          {value}
        </div>
        <div className="stat-label" style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
          {label}
        </div>
        {subValue && (
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};
