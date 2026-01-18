import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas do painel ADM
 * Apenas usuários com role=admin podem acessar
 */
export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, role, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-slate-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, redireciona para login do admin
  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  // Se não é admin, redireciona para página de acesso negado do admin
  if (!isAdmin) {
    return <Navigate to="/admin/access-denied" replace />;
  }

  return <>{children}</>;
}
