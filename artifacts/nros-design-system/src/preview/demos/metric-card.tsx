import { MetricCard } from '../../components/ui/metric-card';

export function MetricCardDemo() {
  return (
    <div className="grid gap-4 rounded-xl border bg-card p-6 text-card-foreground sm:grid-cols-2">
      <MetricCard
        label="Índice Psicossocial Geral"
        value="72,4"
        description="Evolução desde o último ciclo"
        trend="up"
        trendLabel="+4,2%"
        accent="primary"
      />
      <MetricCard
        label="Funcionários avaliados"
        value="684"
        description="Meta de participação: 60%"
        trend="up"
        trendLabel="+12%"
        accent="primary"
      />
      <MetricCard
        label="Riscos em atenção"
        value="08"
        description="Requerem acompanhamento do gestor"
        trend="down"
        trendLabel="-2"
        accent="attention"
      />
      <MetricCard
        label="Riscos críticos"
        value="02"
        description="Prioridade de ação imediata"
        accent="critical"
      />
    </div>
  );
}