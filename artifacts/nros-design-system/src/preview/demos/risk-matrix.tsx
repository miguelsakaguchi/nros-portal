import { RiskMatrix, type RiskMatrixPoint } from '../../components/ui/risk-matrix';

const points: RiskMatrixPoint[] = [
  { id: 'r1', label: 'CA', probability: 5, severity: 4, level: 'critical' },
  { id: 'r2', label: 'AU', probability: 4, severity: 3, level: 'high' },
  { id: 'r3', label: 'RE', probability: 3, severity: 2, level: 'attention' },
  { id: 'r4', label: 'IN', probability: 2, severity: 1, level: 'healthy' },
];

export function RiskMatrixDemo() {
  return (
    <div className="max-w-xl rounded-xl border bg-card p-6 text-card-foreground">
      <div className="mb-5">
        <h2 className="font-semibold">Mapa de riscos psicossociais</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Selecione um ponto para acessar exposição, tendência e recomendação.
        </p>
      </div>
      <RiskMatrix points={points} />
      <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>CA · Carga</span>
        <span>AU · Autonomia</span>
        <span>RE · Relações</span>
        <span>IN · Incerteza</span>
      </div>
    </div>
  );
}