import { useState } from 'react';
import { MobileAssessment } from '../../components/ui/mobile-assessment';

export function MobileAssessmentDemo() {
  const [selected, setSelected] = useState<string>();

  return (
    <div className="rounded-xl border bg-muted/30 p-6">
      <MobileAssessment
        title="Percepção no trabalho"
        question="Tenho autonomia para organizar minhas tarefas."
        options={['Discordo', 'Nem concordo, nem discordo', 'Concordo']}
        current={7}
        total={12}
        selected={selected}
        onOptionSelect={setSelected}
      />
    </div>
  );
}