import * as React from 'react';
import { AlertTriangle, CheckCircle2, CircleAlert, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export type RiskLevel = 'healthy' | 'attention' | 'high' | 'critical' | 'neutral';

const riskConfig: Record<
  RiskLevel,
  { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  healthy: {
    label: 'Saudável',
    className: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-200',
    Icon: CheckCircle2,
  },
  attention: {
    label: 'Atenção',
    className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
    Icon: AlertTriangle,
  },
  high: {
    label: 'Alto',
    className: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200',
    Icon: CircleAlert,
  },
  critical: {
    label: 'Crítico',
    className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
    Icon: CircleAlert,
  },
  neutral: {
    label: 'Neutro',
    className: 'border-border bg-muted text-muted-foreground',
    Icon: Minus,
  },
};

export interface RiskBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: RiskLevel;
  label?: string;
}

export function RiskBadge({ level, label, className, ...props }: RiskBadgeProps) {
  const config = riskConfig[level];
  const Icon = config.Icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
        config.className,
        className,
      )}
      {...props}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label ?? config.label}
    </span>
  );
}