import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import {
  useGetAssessment,
  useSubmitAssessmentResponse,
  getGetAssessmentQueryKey,
} from "@workspace/api-client-react";
import { Badge } from "@workspace/nros-design-system/components/ui/badge";
import { Button } from "@workspace/nros-design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/nros-design-system/components/ui/card";
import { Progress } from "@workspace/nros-design-system/components/ui/progress";
import { Skeleton } from "@workspace/nros-design-system/components/ui/skeleton";
import { Textarea } from "@workspace/nros-design-system/components/ui/textarea";
import { EmptyState } from "./dashboard";

type Message = { role: "agent" | "collaborator"; text: string };

const conversationPrompts = [
  "Como você tem percebido seu cotidiano de trabalho neste momento?",
  "Em que situação isso aparece com mais força?",
  "Como essa experiência repercute no seu dia a dia?",
  "O que ajudaria a tornar essa experiência mais sustentável para você?",
];

const topicQuestions: Record<string, string> = {
  "carga de trabalho":
    "Entendi. O que, na sua rotina, mais pesa ou ajudaria a tornar essa carga mais sustentável?",
  "relações e apoio":
    "Entendi. Como as relações e o apoio no seu time influenciam essa experiência?",
  autonomia:
    "Entendi. Em quais situações você gostaria de ter mais autonomia ou clareza para decidir?",
  "segurança para falar":
    "Entendi. O que faria você se sentir mais seguro para falar sobre isso no trabalho?",
  outro:
    "Entendi. Tem algum contexto importante que você gostaria que fosse considerado nessa experiência?",
};

function detectTopic(text: string) {
  const value = text.toLocaleLowerCase();
  if (/prazo|demanda|volume|carga|hora|excesso|trabalho/.test(value)) {
    return "carga de trabalho";
  }
  if (/gestor|gestora|equipe|time|colega|apoio|relação|relacionamento/.test(value)) {
    return "relações e apoio";
  }
  if (/autonomia|decidir|decisão|controle|liberdade/.test(value)) {
    return "autonomia";
  }
  if (/medo|receio|falar|escuta|retalia|segurança|confiança/.test(value)) {
    return "segurança para falar";
  }
  return "outro";
}

export function AssessmentPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAssessment({
    query: { queryKey: getGetAssessmentQueryKey() },
  });
  const submit = useSubmitAssessmentResponse();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [followUp, setFollowUp] = useState(false);
  const [topic, setTopic] = useState("outro");
  const [done, setDone] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const totalSteps = conversationPrompts.length + 1;
  const progress = Math.min(
    100,
    Math.round((answeredCount / totalSteps) * 100),
  );
  const currentPrompt = followUp
    ? topicQuestions[topic]
    : conversationPrompts[step];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-lg">
        <EmptyState
          title="Avaliação indisponível"
          text="Não foi possível carregar esta conversa agora. Tente novamente em alguns instantes."
        />
        <Button
          className="mt-4 w-full"
          variant="outline"
          onClick={() => refetch()}
        >
          <RefreshCw className="size-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-3xl py-4 md:py-8">
        <Card>
          <CardContent className="flex flex-col items-center py-10 text-center md:py-12">
            <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
              <CheckCircle2 className="size-7" />
            </span>
            <Badge variant="secondary">Contribuição recebida</Badge>
            <h1 className="mt-4 text-2xl font-semibold">
              Obrigado por compartilhar
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Sua percepção foi registrada anonimamente. Ela ajuda a orientar
              uma leitura agregada do grupo, sem prometer diagnóstico.
            </p>
            <div className="mt-8 grid w-full gap-4 text-left md:grid-cols-2">
              <Card className="bg-muted/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <HeartHandshake className="size-4" />
                    <p className="font-semibold">Síntese da conversa</p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Você trouxe sinais sobre <strong>{topic}</strong>. Esse
                    contexto foi incluído na sua resposta para que o
                    acompanhamento possa evoluir com o tempo.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <UsersRound className="size-4" />
                    <p className="font-semibold">Próximo passo</p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Sua contribuição também será considerada de forma
                    agregada na leitura do grupo. Se quiser, procure os canais
                    de cuidado e acompanhamento individual disponíveis na sua
                    organização.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const send = () => {
    const text = draft.trim();
    if (!text || submit.isPending) return;

    const answerKey = followUp
      ? "context-follow-up"
      : `conversation-${step + 1}`;
    const nextAnswers = { ...answers, [answerKey]: text };
    setAnswers(nextAnswers);
    setMessages((current) => [
      ...(current.length === 0
        ? [{ role: "agent" as const, text: currentPrompt }]
        : []),
      ...current,
      { role: "collaborator", text },
    ]);
    setDraft("");

    if (step === 0 && !followUp) {
      const detected = detectTopic(text);
      setTopic(detected);
      setFollowUp(true);
      setMessages((current) => [
        ...current,
        { role: "agent", text: topicQuestions[detected] },
      ]);
      return;
    }

    if (followUp) {
      setFollowUp(false);
      setStep(1);
      setMessages((current) => [
        ...current,
        { role: "agent", text: conversationPrompts[1] },
      ]);
      return;
    }

    if (step < conversationPrompts.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      setMessages((current) => [
        ...current,
        { role: "agent", text: conversationPrompts[nextStep] },
      ]);
      return;
    }

    submit.mutate(
      {
        data: {
          assessmentId: data.id,
          answers: {
            ...nextAnswers,
            topic,
            assessmentMode: "conversational-adaptive",
          },
        },
      },
      { onSuccess: () => setDone(true) },
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" />
          <p className="text-sm font-medium text-primary">
            Uma conversa, não um formulário
          </p>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {data.title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Conte o que fizer sentido para você. O agente adapta a conversa a
          partir do seu contexto e registra apenas sinais para acompanhamento.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex gap-3 p-4">
          <LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold">
              Você está em um espaço anônimo e seguro
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {data.privacyNote} Suas respostas serão lidas como sinais de
              contexto, não como diagnóstico.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Seu percurso de escuta</span>
        <span className="text-muted-foreground">{progress}% concluído</span>
      </div>
      <Progress value={progress} aria-label={`${progress}% do percurso concluído`} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Agente de escuta NROS
          </div>
          <CardTitle className="text-xl leading-relaxed">
            Compartilhe no seu ritmo
          </CardTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Não existe resposta certa ou errada. Você pode ser breve ou contar
            mais detalhes.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="max-h-80 space-y-3 overflow-y-auto rounded-md bg-muted/40 p-3"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-md bg-card px-3 py-2 text-sm text-card-foreground shadow-sm">
                  {currentPrompt}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
                  message.role === "collaborator"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-md px-3 py-2 text-sm ${
                    message.role === "collaborator"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground shadow-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escreva com suas palavras..."
            rows={5}
            disabled={submit.isPending}
            aria-label="Sua resposta"
          />
          {submit.isError && (
            <p className="text-sm text-destructive">
              Não foi possível registrar sua resposta. Revise e tente enviar
              novamente.
            </p>
          )}
          <div className="flex justify-end">
            <Button
              onClick={send}
              disabled={!draft.trim() || submit.isPending}
              data-testid="button-send-response"
            >
              {submit.isPending
                ? "Registrando..."
                : step === conversationPrompts.length - 1 && !followUp
                  ? "Concluir conversa"
                  : "Continuar"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}