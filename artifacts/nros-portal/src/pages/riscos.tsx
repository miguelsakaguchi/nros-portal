import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search, SlidersHorizontal } from "lucide-react";
import { useGetRisks, getGetRisksQueryKey } from "@workspace/api-client-react";
import { Badge } from "@workspace/nros-design-system/components/ui/badge";
import { Button } from "@workspace/nros-design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/nros-design-system/components/ui/card";
import { Input } from "@workspace/nros-design-system/components/ui/input";
import { RiskBadge } from "@workspace/nros-design-system/components/ui/risk-badge";
import { Skeleton } from "@workspace/nros-design-system/components/ui/skeleton";
import { EmptyState } from "./dashboard";

export function RisksPage() {
  const { data, isLoading, isError } = useGetRisks({ query: { queryKey: getGetRisksQueryKey() } }); const [search, setSearch] = useState(""); const [sector, setSector] = useState("Todos");
  const sectors = useMemo(() => ["Todos", ...new Set((data ?? []).map(r => r.sector))], [data]);
  const risks = (data ?? []).filter(r => r.factor.toLowerCase().includes(search.toLowerCase()) && (sector === "Todos" || r.sector === sector));
  return <div className="space-y-7"><div><p className="text-sm font-medium text-primary">Mapa de exposição</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Riscos psicossociais</h1><p className="mt-2 text-muted-foreground">Inspecione os fatores por evidência, setor e prioridade de resposta.</p></div>
    <Card><CardContent className="flex flex-col gap-3 p-4 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar fator de risco" className="pl-9" data-testid="input-search-risk" /></div><div className="flex gap-2 overflow-x-auto">{sectors.map(s => <Button key={s} size="sm" variant={sector === s ? "secondary" : "ghost"} onClick={() => setSector(s)} data-testid={`button-sector-${s}`}>{s}</Button>)}</div><Button variant="outline" size="icon" data-testid="button-risk-filters"><SlidersHorizontal /></Button></CardContent></Card>
    {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div> : isError ? <EmptyState title="Não foi possível carregar os riscos" text="A lista estará disponível quando o ciclo for sincronizado." /> : risks.length === 0 ? <EmptyState title="Nenhum fator encontrado" text="Ajuste os filtros para ampliar sua busca." /> : <div className="space-y-3">{risks.map(r => <Card key={r.id} className="transition-shadow hover:shadow-md" data-testid={`card-risk-${r.id}`}><CardContent className="grid gap-4 p-5 md:grid-cols-[1.6fr_0.8fr_0.7fr_0.7fr_1.6fr] md:items-center"><div><div className="flex items-center gap-2"><h2 className="font-semibold">{r.factor}</h2><RiskBadge level={r.status} /></div><p className="mt-1 text-sm text-muted-foreground">{r.sector} · Exposição {r.exposure}</p></div><div><p className="text-xs text-muted-foreground">Probabilidade</p><p className="mt-1 font-semibold">{r.probability}/5</p></div><div><p className="text-xs text-muted-foreground">Severidade</p><p className="mt-1 font-semibold">{r.severity}/5</p></div><Badge variant="outline" className="w-fit">{r.trend === "up" ? <ArrowUp className="mr-1 size-3 text-destructive" /> : <ArrowDown className="mr-1 size-3 text-primary" />}{r.trend === "stable" ? "Estável" : r.trend === "up" ? "Em alta" : "Em queda"}</Badge><p className="text-sm text-muted-foreground md:border-l md:pl-4">{r.recommendation}</p></CardContent></Card>)}</div>}
  </div>;
}