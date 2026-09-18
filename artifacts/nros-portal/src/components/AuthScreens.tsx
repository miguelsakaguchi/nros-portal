import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@workspace/nros-design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/nros-design-system/components/ui/card";
import { Skeleton } from "@workspace/nros-design-system/components/ui/skeleton";
import { useAuth } from "@/auth/AuthContext";

function authErrorMessage(): string | null {
  const code = new URLSearchParams(window.location.search).get("authError");
  if (!code) return null;
  if (code === "access_denied") {
    return "O acesso foi cancelado. Entre com o Google para continuar.";
  }
  if (code === "auth_not_configured") {
    return "O login com Google ainda não está configurado neste ambiente.";
  }
  if (code === "invalid_profile") {
    return "Sua conta Google não forneceu um nome e um e-mail verificado. Use outra conta ou revise seu perfil.";
  }
  return "Não foi possível concluir o acesso com Google. Tente novamente.";
}

export function SessionLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <Skeleton className="mx-auto size-14 rounded-2xl" />
        <Skeleton className="mx-auto h-7 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function SessionErrorScreen() {
  const { error, retry } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" />
          </div>
          <CardTitle>Sessão indisponível</CardTitle>
          <CardDescription>
            {error ??
              "Não foi possível verificar seu acesso neste momento."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={retry}>
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function SignInScreen() {
  const { signIn } = useAuth();
  const error = authErrorMessage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sidebar text-sidebar-foreground">
            <ShieldCheck className="size-6 text-sidebar-primary" />
          </span>
          <div>
            <p className="text-xl font-semibold tracking-tight">NROS</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Gestão psicossocial
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Acesse seu workspace</CardTitle>
            <CardDescription className="leading-relaxed">
              Entre com sua conta Google para consultar os indicadores e
              acompanhar os planos de ação da organização.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div
                role="alert"
                className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button
              className="w-full"
              onClick={() => signIn(window.location.pathname)}
              data-testid="button-sign-in-google"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-card text-xs font-bold text-foreground">
                G
              </span>
              Entrar com Google
              <ArrowRight className="ml-auto" />
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              O acesso à área de gestão é restrito a pessoas autorizadas pela
              organização.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}