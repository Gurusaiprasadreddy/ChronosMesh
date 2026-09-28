import React from 'react';
import { Event } from '../types';
import { getServiceColor, getServiceLabel } from '../utils/colors';

interface CausalTimelineProps {
  events: Event[];
  maxVisibleStep?: number;
  selectedEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
}

export const CausalTimeline: React.FC<CausalTimelineProps> = ({
  events,
  maxVisibleStep,
  selectedEventId,
  onSelectEvent,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          ✅ Reconstructed Causal Order
        </span>
        <span style={{ fontSize: '10px', color: '#10b981' }}>
          Topologically Verified
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {events.map((evt, idx) => {
          const isVisible = maxVisibleStep === undefined || idx < maxVisibleStep;
          const isSelected = selectedEventId === evt.event_id;
          const color = getServiceColor(evt.service_id);

          return (
            <div
              key={evt.event_id}
              onClick={() => onSelectEvent && onSelectEvent(evt.event_id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                background: isSelected ? 'rgba(16, 185, 129, 0.15)' : '#0d1526',
                border: `1px solid ${isSelected ? '#10b981' : '#1e293b'}`,
                borderLeft: `4px solid ${color}`,
                cursor: 'pointer',
                opacity: isVisible ? 1 : 0.25,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ width: '40px', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>
                #{idx + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {evt.event_type}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', gap: '8px' }}>
                  <span>{getServiceLabel(evt.service_id)}</span>
                  <span>•</span>
                  <span>L{evt.lamport_ts}</span>
                  {evt.parent_event_ids?.length > 0 && (
                    <span>• ← {evt.parent_event_ids.length} parent(s)</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
