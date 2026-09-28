import { describe, it, expect } from 'vitest';
import { getServiceColor, getServiceLabel, getConfidenceBadge } from '../utils/colors';

describe('Frontend Utility Tests', () => {
  it('correctly maps known microservice IDs to colors', () => {
    expect(getServiceColor('order-svc')).toBe('#3b82f6');
    expect(getServiceColor('payment-svc')).toBe('#10b981');
    expect(getServiceColor('inventory-svc')).toBe('#f59e0b');
    expect(getServiceColor('shipping-svc')).toBe('#8b5cf6');
    expect(getServiceColor('unknown-svc')).toBe('#64748b');
  });

  it('formats microservice display labels', () => {
    expect(getServiceLabel('order-svc')).toBe('ORDER');
    expect(getServiceLabel('payment-svc')).toBe('PAYMENT');
    expect(getServiceLabel('inventory-svc')).toBe('INVENTORY');
    expect(getServiceLabel('shipping-svc')).toBe('SHIPPING');
  });

  it('classifies confidence scores into High, Medium, and Low bands', () => {
    const high = getConfidenceBadge(0.95);
    expect(high.label).toBe('High Confidence');
    expect(high.color).toBe('#10b981');

    const med = getConfidenceBadge(0.78);
    expect(med.label).toBe('Medium Confidence');
    expect(med.color).toBe('#f59e0b');

    const low = getConfidenceBadge(0.42);
    expect(low.label).toContain('Low Confidence');
    expect(low.color).toBe('#ef4444');
  });
});

describe('API Service Contract Validation', () => {
  it('validates auth token storage', async () => {
    const { api } = await import('../services/api');
    api.setToken('test-jwt-token-123');
    expect(api.getToken()).toBe('test-jwt-token-123');

    api.logout();
    expect(api.getToken()).toBeNull();
  });
});
