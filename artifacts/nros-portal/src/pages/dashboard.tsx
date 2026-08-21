import { ArrowRight, ChevronRight, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useGetDashboard, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { AIInsightCard } from "@workspace/nros-design-system/components/ui/ai-insight-card";
import { MetricCard } from "@workspace/nros-design-system/components/ui/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/nros-design-system/components/ui/card";
import { RiskBadge } from "@workspace/nros-design-system/components/ui/risk-badge";
import { Skeleton } from "@workspace/nros-design-system/components/ui/skeleton";

export function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboard({ query: { queryKey: getGetDashboardQueryKey() } });
  if (isLoading) return <div className="space-y-6"><Skeleton className="h-24 w-2/3" /><div className="grid gap-4 md:grid-cols-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div><Skeleton className="h-72" /></div>;
  if (isError || !data) return <EmptyState title="Não foi possível carregar o ciclo" text="Tente novamente em alguns instantes." />;
  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-medium text-primary">{data.cycleLabel}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Olá, Mariana</h1><p className="mt-2 text-muted-foreground">Uma leitura clara para decisões responsáveis em {data.companyName}.</p></div><Link href="/relatorios" className="inline-flex items-center gap-2 text-sm font-semibold text-primary" data-testid="link-view-report">Ver relatório executivo <ArrowRight className="size-4" /></Link></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Índice psicossocial" value={`${data.overallScore}/100`} description="Percepção geral do ambiente" trend="up" trendLabel="4,2% vs. ciclo anterior" accent="primary" data-testid="metric-overall-score" />
      <MetricCard label="Taxa de resposta" value={`${data.responseRate}%`} description={`${data.employeesEvaluated} pessoas avaliadas`} trend="up" trendLabel="participação" accent="primary" data-testid="metric-response-rate" />
      <MetricCard label="Riscos críticos" value={String(data.criticalRisks)} description={`${data.sectorsEvaluated} setores mapeados`} accent="critical" data-testid="metric-critical-risks" />
      <MetricCard label="Ações pendentes" value={String(data.pendingActions)} description="Prioridades para este ciclo" accent="attention" data-testid="metric-pending-actions" />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
      <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle>Leitura do ciclo</CardTitle><p className="mt-1 text-sm text-muted-foreground">Evolução do índice psicossocial</p></div><span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">Últimos ciclos</span></div></CardHeader><CardContent><div className="flex h-48 items-end gap-3 border-b border-l px-3 pb-0 pt-6">{data.trend.map((point, i) => <div key={point.label} className="flex flex-1 flex-col items-center gap-2"><span className="text-xs font-semibold text-primary">{point.score}</span><div className="w-full max-w-12 rounded-t-md bg-primary/80 transition-all" style={{height: `${Math.max(point.score * 1.35, 12)}px`}} /><span className="text-[11px] text-muted-foreground">{point.label}</span></div>)}</div></CardContent></Card>
      <Card className="bg-primary text-primary-foreground"><CardHeader><div className="flex items-center gap-2 text-primary-foreground/70"><ShieldCheck className="size-4" /><span className="text-xs font-semibold uppercase tracking-wider">Confiança nos dados</span></div><CardTitle className="mt-2 text-2xl">Evidência para agir com segurança</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-primary-foreground/75">Resultados agregados e anônimos para apoiar o cuidado com as pessoas e a evolução da organização.</p><Link href="/riscos" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" data-testid="link-explore-risks">Explorar fatores de risco <ChevronRight className="size-4" /></Link></CardContent></Card>
    </div>
    <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-semibold">Prioridades de atenção</h2><p className="mt-1 text-sm text-muted-foreground">Sinais que merecem uma conversa estruturada.</p></div><Link href="/riscos" className="text-sm font-semibold text-primary" data-testid="link-all-insights">Ver todos</Link></div><div className="grid gap-5 lg:grid-cols-2">{(data.highlights ?? []).slice(0,2).map((item, i) => <AIInsightCard key={item.title} title={item.title} context={item.context} evidence={item.evidence} recommendation={item.recommendation} onAction={() => {}} data-testid={`card-insight-${i}`} />)}</div></section>
  </div>;
}
export function EmptyState({ title, text }: { title: string; text: string }) { return <Card><CardContent className="flex flex-col items-center justify-center py-20 text-center"><ShieldCheck className="mb-4 size-10 text-primary/50" /><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{text}</p></CardContent></Card>; }