import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'operator' | 'viewer';
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, requiredRole = 'admin', fallback }: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const roles = {
    admin: 3,
    operator: 2,
    viewer: 1
  };

  const userRoleLevel = roles[user?.role as keyof typeof roles] || 0;
  const requiredLevel = roles[requiredRole];

  if (userRoleLevel < requiredLevel) {
    return fallback || (
      <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground gap-2">
        <ShieldAlert className="h-8 w-8 text-destructive" />
        <p className="font-medium">Acesso Restrito</p>
        <p className="text-sm">Você não tem permissão de {requiredRole} para visualizar este recurso.</p>
      </div>
    );
  }

  return <>{children}</>;
}