import { RiskBadge } from '../../components/ui/risk-badge';
import { Row } from '../parts';

export function RiskBadgeDemo() {
  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 text-card-foreground">
      <Row label="Níveis semânticos">
        <RiskBadge level="healthy" />
        <RiskBadge level="attention" />
        <RiskBadge level="high" />
        <RiskBadge level="critical" />
        <RiskBadge level="neutral" />
      </Row>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Use o badge para comunicar estado e prioridade. A cor nunca deve aparecer sem
        uma relação clara com o nível de risco.
      </p>
    </div>
  );
}