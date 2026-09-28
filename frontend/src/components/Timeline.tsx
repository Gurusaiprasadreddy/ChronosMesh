import React, { useState, useEffect, useRef } from 'react';
import { Event } from '../types';
import { ArrivalTimeline } from './ArrivalTimeline';
import { CausalTimeline } from './CausalTimeline';

interface TimelineProps {
  arrivalEvents: Event[];
  causalEvents: Event[];
  selectedEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
  onStepChange?: (step: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  arrivalEvents,
  causalEvents,
  selectedEventId,
  onSelectEvent,
  onStepChange,
}) => {
  const totalEvents = Math.max(arrivalEvents.length, causalEvents.length);
  const [currentStep, setCurrentStep] = useState<number>(totalEvents);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setCurrentStep(totalEvents);
  }, [totalEvents]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, onStepChange]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalEvents) {
            setIsPlaying(false);
            return totalEvents;
          }
          return prev + 1;
        });
      }, 800);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalEvents]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStep >= totalEvents) {
        setCurrentStep(1);
      }
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(1);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="card-title">Causal Replay & Comparison</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Compare raw arrival order against reconstructed causality
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={handleReset}>
            ↺ Reset
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePlayPause}>
            {isPlaying ? '⏸ Pause' : '▶ Play Replay'}
          </button>
        </div>
      </div>

      {/* Scrub Slider */}
      <div style={{ padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
          <span>Replay Progress</span>
          <span style={{ fontWeight: 700, color: '#00d4ff' }}>
            Step {currentStep} of {totalEvents} ({totalEvents ? Math.round((currentStep / totalEvents) * 100) : 0}%)
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={totalEvents || 1}
          value={currentStep}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentStep(parseInt(e.target.value, 10));
          }}
          style={{
            width: '100%',
            accentColor: '#00d4ff',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Side-by-side comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '8px' }}>
        <ArrivalTimeline
          events={arrivalEvents}
          maxVisibleStep={currentStep}
          selectedEventId={selectedEventId}
          onSelectEvent={onSelectEvent}
        />
        <CausalTimeline
          events={causalEvents}
          maxVisibleStep={currentStep}
          selectedEventId={selectedEventId}
          onSelectEvent={onSelectEvent}
        />
      </div>
    </div>
  );
};
