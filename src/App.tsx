import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Viaturas from './pages/Viaturas';
import OrdensServico from './pages/OrdensServico';
import Financeiro from './pages/Financeiro';
import Estoque from './pages/Estoque';
import Agenda from './pages/Agenda';

import Funcionarios from './pages/Funcionarios';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Galeria from './pages/Galeria';
import MetaBusiness from './pages/MetaBusiness';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="viaturas" element={<Viaturas />} />
        <Route path="ordens" element={<OrdensServico />} />
        <Route path="financeiro" element={<Financeiro />} />

        <Route path="estoque" element={<Estoque />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="funcionarios" element={<Funcionarios />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="galeria" element={<Galeria />} />
        <Route path="meta-business" element={<MetaBusiness />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a2e', border: '1px solid #2a2a3e', color: '#e0e0e0' },
            duration: 3000,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
