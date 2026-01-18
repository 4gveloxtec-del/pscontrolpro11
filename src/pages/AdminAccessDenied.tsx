import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';

export default function AdminAccessDenied() {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center">
          <ShieldX className="h-10 w-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          Acesso Negado
        </h1>
        
        <p className="text-slate-400 mb-6">
          Esta área é exclusiva para administradores do sistema.
          {user && (
            <span className="block mt-2 text-sm">
              Você está logado como: <strong className="text-slate-300">{user.email}</strong>
            </span>
          )}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair e tentar outra conta
          </Button>
          
          <Link to="/auth">
            <Button
              variant="ghost"
              className="w-full text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir para área de Revendedores
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
