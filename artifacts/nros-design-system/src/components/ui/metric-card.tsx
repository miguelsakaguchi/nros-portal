import * as React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '../../lib/utils';

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  description?: string;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  accent?: 'primary' | 'attention' | 'critical' | 'neutral';
}

const accentStyles = {
  primary: 'bg-primary',
  attention: 'bg-accent',
  critical: 'bg-destructive',
  neutral: 'bg-muted-foreground/40',
} as const;

export function MetricCard({
  label,
  value,
  description,
  trend,
  trendLabel,
  accent = 'primary',
  className,
  ...props
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card className={cn('relative overflow-hidden', className)} {...props}>
      <span className={cn('absolute inset-y-0 left-0 w-1', accentStyles[accent])} aria-hidden="true" />
      <CardHeader className="pb-2 pl-6">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pl-6">
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          {trend && trendLabel ? (
            <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <TrendIcon className="size-3.5" aria-hidden="true" />
              {trendLabel}
            </span>
          ) : null}
        </div>
        {description ? <p className="mt-2 text-xs text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );
}