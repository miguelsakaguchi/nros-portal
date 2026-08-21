import * as React from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Button } from './button';
import { Progress } from './progress';
import { cn } from '../../lib/utils';

export interface MobileAssessmentProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  question: string;
  options: string[];
  current: number;
  total: number;
  selected?: string;
  onOptionSelect?: (option: string) => void;
  onNext?: () => void;
}

export function MobileAssessment({
  title,
  question,
  options,
  current,
  total,
  selected,
  onOptionSelect,
  onNext,
  className,
  ...props
}: MobileAssessmentProps) {
  const progress = Math.round((current / total) * 100);

  return (
    <div className={cn('mx-auto w-full max-w-sm rounded-[2rem] border bg-card p-5 shadow-sm', className)} {...props}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Avaliação NROS</p>
            <h2 className="mt-1 text-lg font-semibold">{title}</h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {current}/{total}
          </span>
        </div>
        <Progress value={progress} aria-label={`${progress}% concluído`} />
        <div className="space-y-2 pt-4">
          <p className="text-xs font-medium text-muted-foreground">Pergunta {current}</p>
          <p className="text-xl font-semibold leading-tight">{question}</p>
        </div>
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onOptionSelect?.(option)}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected === option
                  ? 'border-primary bg-secondary font-semibold text-secondary-foreground'
                  : 'bg-background hover:bg-muted',
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />
          Suas respostas são anônimas e protegidas.
        </div>
        <Button className="w-full" disabled={!selected} onClick={onNext}>
          Continuar
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}