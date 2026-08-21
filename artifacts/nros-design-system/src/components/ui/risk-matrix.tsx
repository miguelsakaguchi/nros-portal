import * as React from 'react';
import { cn } from '../../lib/utils';
import type { RiskLevel } from './risk-badge';

export interface RiskMatrixPoint {
  id: string;
  label: string;
  probability: 1 | 2 | 3 | 4 | 5;
  severity: 1 | 2 | 3 | 4 | 5;
  level: RiskLevel;
}

export interface RiskMatrixProps extends React.HTMLAttributes<HTMLDivElement> {
  points: RiskMatrixPoint[];
  selectedId?: string;
  onPointSelect?: (point: RiskMatrixPoint) => void;
}

const cellStyles: Record<RiskLevel, string> = {
  healthy: 'bg-teal-100/80 dark:bg-teal-900/60',
  attention: 'bg-amber-100/80 dark:bg-amber-900/60',
  high: 'bg-orange-200/80 dark:bg-orange-900/70',
  critical: 'bg-red-200/90 dark:bg-red-900/70',
  neutral: 'bg-muted',
};

export function RiskMatrix({ points, selectedId, onPointSelect, className, ...props }: RiskMatrixProps) {
  const pointByCell = new Map(points.map((point) => [`${point.probability}-${point.severity}`, point]));

  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="flex items-center justify-center px-1 [writing-mode:vertical-rl]">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Severidade</span>
        </div>
        <div>
          <div className="grid grid-cols-5 gap-1">
            {[5, 4, 3, 2, 1].map((severity) => (
              <span key={severity} className="pb-1 text-center text-[10px] font-medium text-muted-foreground">
                {severity}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[5, 4, 3, 2, 1].flatMap((probability) =>
              [5, 4, 3, 2, 1].map((severity) => {
                const point = pointByCell.get(`${probability}-${severity}`);
                return (
                  <button
                    key={`${probability}-${severity}`}
                    type="button"
                    aria-label={point ? `${point.label}, risco ${point.level}` : `Célula ${probability}, ${severity}`}
                    onClick={() => point && onPointSelect?.(point)}
                    className={cn(
                      'flex aspect-square items-center justify-center rounded-md border border-background/60 text-xs font-bold transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      point ? cellStyles[point.level] : 'bg-muted/50',
                      point?.id === selectedId && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    )}
                  >
                    {point ? point.label.slice(0, 2) : ''}
                  </button>
                );
              }),
            )}
          </div>
          <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Probabilidade</p>
        </div>
      </div>
    </div>
  );
}