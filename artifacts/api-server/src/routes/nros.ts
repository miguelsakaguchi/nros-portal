import { Router, type IRouter } from "express";
import {
  CreateActionPlanBody,
  CreateActionPlanResponse,
  GetActionPlansResponse,
  GetAssessmentResponse,
  GetDashboardResponse,
  GetRisksResponse,
  SubmitAssessmentResponseBody,
  SubmitAssessmentResponseResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../auth";

const router: IRouter = Router();

const dashboard = {
  companyName: "Orbe Tecnologia",
  cycleLabel: "Ciclo 02 · Agosto 2026",
  overallScore: 72,
  responseRate: 68,
  employeesEvaluated: 684,
  sectorsEvaluated: 8,
  criticalRisks: 2,
  pendingActions: 6,
  trend: [
    { label: "Fev", score: 64 },
    { label: "Mar", score: 67 },
    { label: "Abr", score: 69 },
    { label: "Mai", score: 70 },
    { label: "Jun", score: 68 },
    { label: "Ago", score: 72 },
  ],
  highlights: [
    {
      title: "A sobrecarga de trabalho aumentou no setor de Operações",
      context: "O fator aparece como o principal sinal de atenção do ciclo atual.",
      evidence: "Índice do fator subiu 14 pontos em relação ao ciclo anterior.",
      recommendation: "Revisar distribuição de plantões e criar uma janela mensal de capacidade.",
      severity: "attention" as const,
    },
    {
      title: "Autonomia segue como um ponto forte da organização",
      context: "As equipes relatam clareza para decidir como executar suas atividades.",
      evidence: "82% das respostas indicam percepção saudável de autonomia.",
      recommendation: "Compartilhar práticas de gestão das equipes com melhor resultado.",
      severity: "healthy" as const,
    },
  ],
};

let risks = [
  { id: 1, factor: "Sobrecarga de trabalho", sector: "Operações", probability: 4, severity: 4, exposure: "72% da equipe", trend: "up" as const, status: "high" as const, recommendation: "Revisar distribuição de plantões e capacidade do time." },
  { id: 2, factor: "Clareza de papéis", sector: "Atendimento", probability: 3, severity: 4, exposure: "48% da equipe", trend: "stable" as const, status: "attention" as const, recommendation: "Atualizar acordos de responsabilidade e rituais de alinhamento." },
  { id: 3, factor: "Apoio da liderança", sector: "Produto", probability: 2, severity: 3, exposure: "31% da equipe", trend: "down" as const, status: "healthy" as const, recommendation: "Manter encontros de desenvolvimento e escuta ativa." },
  { id: 4, factor: "Assédio e conflitos", sector: "Administrativo", probability: 2, severity: 5, exposure: "18% da equipe", trend: "stable" as const, status: "critical" as const, recommendation: "Reforçar canais de confiança e treinamento de prevenção." },
  { id: 5, factor: "Autonomia", sector: "Engenharia", probability: 1, severity: 2, exposure: "12% da equipe", trend: "down" as const, status: "healthy" as const, recommendation: "Compartilhar práticas de delegação com outros setores." },
];

type ActionPlanRecord = {
  id: number;
  title: string;
  owner: string;
  dueDate: string;
  status: "planned" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  source: string;
};

let actionPlans: ActionPlanRecord[] = [
  { id: 1, title: "Revisar escala de plantões de Operações", owner: "Camila Rocha", dueDate: "30 ago 2026", status: "in_progress" as const, priority: "high" as const, source: "Sobrecarga de trabalho" },
  { id: 2, title: "Workshop de clareza de papéis", owner: "Rafael Lima", dueDate: "12 set 2026", status: "planned" as const, priority: "medium" as const, source: "Clareza de papéis" },
  { id: 3, title: "Ritual mensal de escuta com lideranças", owner: "Marina Alves", dueDate: "20 ago 2026", status: "done" as const, priority: "low" as const, source: "Apoio da liderança" },
];

const assessment = {
  id: 1,
  title: "Como está sendo trabalhar aqui?",
  description: "Suas respostas ajudam a identificar o que podemos melhorar no dia a dia. Não pedimos seu nome e o preenchimento leva menos de 5 minutos.",
  privacyNote: "Sua resposta é anônima e será analisada apenas em conjunto com outras respostas.",
  questions: [
    { id: 1, text: "Consigo realizar meu trabalho dentro do horário combinado.", options: ["Discordo", "Discordo parcialmente", "Concordo parcialmente", "Concordo"] },
    { id: 2, text: "Sei com clareza o que é esperado de mim.", options: ["Discordo", "Discordo parcialmente", "Concordo parcialmente", "Concordo"] },
    { id: 3, text: "Tenho apoio quando encontro uma dificuldade no trabalho.", options: ["Discordo", "Discordo parcialmente", "Concordo parcialmente", "Concordo"] },
    { id: 4, text: "Sinto que posso falar sobre problemas sem medo de retaliação.", options: ["Discordo", "Discordo parcialmente", "Concordo parcialmente", "Concordo"] },
  ],
};

router.get("/assessment", (_req, res) => {
  res.json(GetAssessmentResponse.parse(assessment));
});

router.post("/assessment/responses", (req, res) => {
  const input = SubmitAssessmentResponseBody.parse(req.body);
  req.log.info({ assessmentId: input.assessmentId }, "Anonymous assessment response accepted");
  res.status(201).json(
    SubmitAssessmentResponseResponse.parse({
      accepted: true,
      message: "Sua resposta foi registrada com segurança. Obrigado por contribuir.",
    }),
  );
});

router.use(requireAuth);

router.get("/dashboard", (_req, res) => {
  res.json(GetDashboardResponse.parse(dashboard));
});

router.get("/risks", (_req, res) => {
  res.json(GetRisksResponse.parse(risks));
});

router.get("/action-plans", (_req, res) => {
  res.json(GetActionPlansResponse.parse(actionPlans));
});

router.post("/action-plans", (req, res) => {
  const input = CreateActionPlanBody.parse(req.body);
  const created = {
    id: actionPlans.length + 1,
    ...input,
    status: "planned" as const,
  };
  actionPlans = [created, ...actionPlans];
  res.status(201).json(CreateActionPlanResponse.parse(created));
});

export default router;