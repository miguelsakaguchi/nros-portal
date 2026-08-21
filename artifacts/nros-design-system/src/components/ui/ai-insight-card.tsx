import * as React from 'react';
import { ArrowRight, BrainCircuit, Lightbulb } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { cn } from '../../lib/utils';

export interface AIInsightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  context: string;
  evidence: string;
  recommendation: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AIInsightCard({
  title,
  context,
  evidence,
  recommendation,
  actionLabel = 'Criar plano de ação',
  onAction,
  className,
  ...props
}: AIInsightCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card',
        className,
      )}
      {...props}
    >
      <CardHeader className="border-b border-primary/10 bg-primary/5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <BrainCircuit className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Insight de IA</p>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contexto</p>
          <p className="text-sm">{context}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidência</p>
          <p className="text-sm text-muted-foreground">{evidence}</p>
        </div>
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-3">
          <div className="flex gap-2">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">Recomendação</p>
              <p className="mt-1 text-sm">{recommendation}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3 border-t border-primary/10">
        <p className="text-xs text-muted-foreground">Apoio à decisão, não diagnóstico.</p>
        <Button size="sm" onClick={onAction}>
          {actionLabel}
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}