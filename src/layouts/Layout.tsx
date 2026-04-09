import { NavLink, Outlet } from 'react-router-dom';
import {
  Car, Users, Wrench, Calendar, FileText, Package, DollarSign,
  BarChart3, Settings, LogOut, Bell, Search, Menu, X, UserCheck, Image,
  MessageCircle, GitBranch
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChangelogModal from '../components/ChangelogModal';
import BnaExchangeTicker from '../components/BnaExchangeTicker';

const menuSections = [
  {
    title: 'PRINCIPAL',
    items: [
      { icon: BarChart3, label: 'Dashboard', path: '/dashboard', end: true },
    ]
  },
  {
    title: 'OPERACIONAL',
    items: [
      { icon: FileText, label: 'Ordens de Serviço', path: '/dashboard/ordens' },
      { icon: Calendar, label: 'Agenda', path: '/dashboard/agenda' },
      { icon: DollarSign, label: 'Financeiro', path: '/dashboard/financeiro' },
    ]
  },
  {
    title: 'GESTÃO',
    items: [
      { icon: Users, label: 'Clientes', path: '/dashboard/clientes' },
      { icon: Car, label: 'Viaturas', path: '/dashboard/viaturas' },
      { icon: Wrench, label: 'Serviços', path: '/dashboard/ordens' },
      { icon: Package, label: 'Estoque', path: '/dashboard/estoque' },
    ]
  },
  {
    title: 'COMUNICAÇÃO',
    items: [
      { icon: MessageCircle, label: 'Meta Business', path: '/dashboard/meta-business', badge: true },
    ]
  },
  {
    title: 'EQUIPE',
    items: [
      { icon: UserCheck, label: 'Funcionários', path: '/dashboard/funcionarios' },
      { icon: BarChart3, label: 'Relatórios', path: '/dashboard/relatorios' },
      { icon: Image, label: 'Galeria', path: '/dashboard/galeria' },
      { icon: Settings, label: 'Configurações', path: '/dashboard/configuracoes' },
    ]
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 flex flex-col transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-gray-900">
              <img src="/images/logotipo.png" alt="Zuca Motors" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ZUCAMOTORS</h1>
              <p className="text-xs text-gold-400">ERP System</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="px-4 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.label + item.path}
                    to={item.path}
                    end={'end' in item ? (item as any).end : false}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {'badge' in item && (item as any).badge && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-1">
          <button
            onClick={() => setShowChangelog(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 hover:bg-gray-700 hover:text-gray-300 transition-all group"
          >
            <GitBranch className="w-4 h-4" />
            <span className="text-xs font-medium flex-1 text-left">Versão 1.4.0</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-gold-500/20 text-gold-400 rounded-full font-bold border border-gold-500/30 group-hover:bg-gold-500/30 transition-colors">
              LATEST
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <BnaExchangeTicker />
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-80 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{user?.nome}</p>
                <p className="text-xs text-gray-400">{user?.cargo}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );
}
