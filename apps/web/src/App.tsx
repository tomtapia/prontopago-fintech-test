import { AuthProvider, useAuth } from './auth-context.js';
import { LoginForm } from './components/LoginForm.js';
import { ScoreInquiry } from './components/ScoreInquiry.js';

function Shell() {
  const { token } = useAuth();
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-md space-y-4">
        <header className="text-center">
          <h1 className="text-xl font-bold">ProntoPago · Riesgo Financiero</h1>
          <p className="text-xs text-slate-500">MVP seguro con JWT + RBAC</p>
        </header>
        {token ? <ScoreInquiry /> : <LoginForm />}
      </div>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
