import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Bot,
  Users,
  Settings,
  CreditCard,
  Search,
  History,
  Wallet,
  Shield,
  Zap,
  FileText,
} from "lucide-react";

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", keywords: ["home", "início", "painel"] },
  { icon: Bot, label: "Meu Bot", path: "/bots", keywords: ["telegram", "configurar", "webhook"] },
  { icon: Users, label: "Usuários", path: "/telegram-users", keywords: ["assinantes", "clientes", "membros"] },
  { icon: CreditCard, label: "Planos", path: "/plans", keywords: ["preços", "assinatura", "valores"] },
  { icon: Wallet, label: "Transações PIX", path: "/pix", keywords: ["pagamentos", "financeiro", "receita"] },
  { icon: History, label: "Consultas", path: "/logs", keywords: ["histórico", "logs", "registros"] },
  { icon: Search, label: "Testar Consulta", path: "/consultas", keywords: ["cpf", "cnpj", "placa", "busca"] },
  { icon: Shield, label: "Segurança", path: "/security", keywords: ["proteção", "anti-spam", "anti-link"] },
  { icon: Settings, label: "Configurações", path: "/settings", keywords: ["perfil", "conta", "preferências"] },
];

const quickActions = [
  { icon: Zap, label: "Adicionar novo bot", path: "/bots", keywords: ["criar", "novo", "bot"] },
  { icon: FileText, label: "Exportar relatório", path: "/pix", keywords: ["pdf", "excel", "download"] },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar páginas, ações..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Navegação">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.path}
              value={`${item.label} ${item.keywords.join(" ")}`}
              onSelect={() => runCommand(() => navigate(item.path))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Ações Rápidas">
          {quickActions.map((item) => (
            <CommandItem
              key={item.label}
              value={`${item.label} ${item.keywords.join(" ")}`}
              onSelect={() => runCommand(() => navigate(item.path))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useGlobalSearch() {
  const [open, setOpen] = useState(false);
  
  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);
  
  return { open, setOpen, openSearch, closeSearch };
}
