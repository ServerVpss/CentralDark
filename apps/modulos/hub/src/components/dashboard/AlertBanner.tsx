import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  const visibleAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-2 mb-4">
      {visibleAlerts.map((alert) => {
        const bgColor =
          alert.type === 'critical'
            ? 'bg-red-900/50 border-red-500'
            : alert.type === 'warning'
            ? 'bg-yellow-900/50 border-yellow-500'
            : 'bg-blue-900/50 border-blue-500';

        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${bgColor}`}
          >
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0 text-current" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 hover:bg-black/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
