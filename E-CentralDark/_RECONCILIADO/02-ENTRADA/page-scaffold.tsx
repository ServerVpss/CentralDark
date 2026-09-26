import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Construction, Shield, ExternalLink } from "lucide-react";
import { useIsSuperAdmin } from "@/hooks/use-super-admin";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  adminHref?: string;
  children?: ReactNode;
  badge?: string;
};

export function PageScaffold({ title, description, icon: Icon, adminHref, children, badge = "Em construção" }: Props) {
  const { data: sa } = useIsSuperAdmin();
  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {sa?.isSuperAdmin && adminHref && (
          <Button asChild variant="outline" size="sm" className="w-full justify-center sm:w-auto">
            <Link to={adminHref as never}>
              <Shield className="mr-2 h-4 w-4 text-red-500" />
              <span>Painel Master</span>
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        )}
      </header>

      {children ?? (
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md text-center">
            <Construction className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">{description}</p>
            <span className="mt-3 inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{badge}</span>
          </div>
        </div>
      )}
    </div>
  );
}
