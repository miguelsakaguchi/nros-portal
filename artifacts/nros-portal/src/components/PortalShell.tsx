import type { ReactNode } from "react";
import { Activity, ClipboardCheck, FileText, LayoutDashboard, ListChecks, LogOut, Menu, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@workspace/nros-design-system/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@workspace/nros-design-system/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/nros-design-system/components/ui/avatar";
import { useAuth } from "@/auth/AuthContext";

const links = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/riscos", label: "Riscos psicossociais", icon: Activity },
  { href: "/plano-de-acao", label: "Plano de ação", icon: ListChecks },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return <nav className="space-y-1">{links.map(({ href, label, icon: Icon }) => (
    <Link key={href} href={href} onClick={onNavigate} data-testid={`link-${label.toLowerCase().replaceAll(" ", "-")}`}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${location === href ? "bg-sidebar-accent text-sidebar-foreground font-semibold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
      <Icon className="size-4" /><span>{label}</span>
    </Link>
  ))}</nav>;
}

export function PortalShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  if (!user) return null;

  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const account = (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <span className="block max-w-48 truncate text-sm font-medium">{user.name}</span>
        <span className="block max-w-48 truncate text-xs text-muted-foreground">{user.email}</span>
      </div>
      <Avatar className="size-9">
        {user.picture && <AvatarImage src={user.picture} alt="" />}
        <AvatarFallback className="bg-secondary text-sm font-semibold text-secondary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => void signOut()}
        aria-label="Sair"
        title="Sair"
        data-testid="button-sign-out"
      >
        <LogOut />
      </Button>
    </div>
  );

  return <div className="min-h-screen bg-background">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar px-5 py-6 text-sidebar-foreground md:flex">
      <Link href="/" className="mb-10 flex items-center gap-3" data-testid="link-logo">
        <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><ShieldCheck className="size-5" /></span>
        <span><span className="block text-xl font-semibold tracking-tight">NROS</span><span className="block text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/55">Gestão psicossocial</span></span>
      </Link>
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">Workspace</p>
      <NavItems />
      <div className="mt-auto rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-4">
        <p className="text-xs font-semibold">Ciclo ativo</p><p className="mt-1 text-xs text-sidebar-foreground/60">Percepção 2024 · Q4</p>
        <Link href="/avaliacao" className="mt-3 flex items-center gap-2 text-xs font-medium text-sidebar-primary" data-testid="link-avaliacao-sidebar"><ClipboardCheck className="size-3.5" />Abrir avaliação</Link>
      </div>
    </aside>
    <div className="md:pl-64">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-3 md:hidden"><Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" data-testid="button-open-menu"><Menu /></Button></SheetTrigger><SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground"><div className="mb-8 flex items-center gap-3 text-sidebar-foreground"><span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><ShieldCheck className="size-5" /></span><span className="text-xl font-semibold">NROS</span></div><NavItems /></SheetContent></Sheet><span className="font-semibold">NROS</span></div>
        <div className="hidden text-sm text-muted-foreground md:block">Inteligência em saúde organizacional</div>
         {account}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-7 md:px-8 md:py-10">{children}</main>
    </div>
  </div>;
}