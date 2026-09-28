/**
 * ChronosMesh — Color tokens and style helpers
 * Author: Guru Sai Prasad Reddy
 */

export const SERVICE_COLORS: Record<string, string> = {
  'order-svc': '#3b82f6',       // Blue
  'payment-svc': '#10b981',     // Emerald
  'inventory-svc': '#f59e0b',   // Amber
  'shipping-svc': '#8b5cf6',    // Violet
  'notification-svc': '#ec4899',// Pink
};

export function getServiceColor(serviceId?: string): string {
  if (!serviceId) return '#64748b';
  for (const [key, color] of Object.entries(SERVICE_COLORS)) {
    if (serviceId.toLowerCase().includes(key.split('-')[0])) {
      return color;
    }
  }
  return '#64748b';
}

export function getServiceLabel(serviceId?: string): string {
  if (!serviceId) return 'UNKNOWN';
  return serviceId.replace(/-svc$/i, '').toUpperCase();
}

export const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  CRITICAL: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#ef4444',
    border: 'rgba(239, 68, 68, 0.4)',
    icon: '🔴',
  },
  WARNING: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.4)',
    icon: '🟠',
  },
  INFO: {
    bg: 'rgba(0, 212, 255, 0.15)',
    text: '#00d4ff',
    border: 'rgba(0, 212, 255, 0.4)',
    icon: '🟡',
  },
};

export function getConfidenceBadge(confidence: number): { label: string; color: string; bg: string } {
  if (confidence >= 0.9) {
    return { label: 'High Confidence', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  }
  if (confidence >= 0.7) {
    return { label: 'Medium Confidence', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
  }
  return { label: 'Low Confidence (Uncertain)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
}
