import { AIInsightCard } from '../../components/ui/ai-insight-card';

export function AIInsightCardDemo() {
  return (
    <div className="max-w-2xl rounded-xl border bg-card p-6">
      <AIInsightCard
        title="Autonomia e carga de trabalho pedem atenção"
        context="O fator subiu 14% no setor Operações no último ciclo."
        evidence="A participação foi de 86% e a tendência aparece em 3 dos 4 times do setor."
        recommendation="Revisar a distribuição de demandas com as lideranças e acompanhar a evolução em 30 dias."
      />
    </div>
  );
}