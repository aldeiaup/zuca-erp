import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Settings, Building2, FileText, Shield, Bell, Save, Check, Coins } from 'lucide-react';

export default function Configuracoes() {
  const { config, updateConfig } = useStore();
  const [activeTab, setActiveTab] = useState('empresa');
  const [saved, setSaved] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: Building2 },
    { id: 'fiscal', label: 'Fiscal', icon: FileText },
    { id: 'cambio', label: 'Câmbio', icon: Coins },
    { id: 'sistema', label: 'Sistema', icon: Settings },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
  ];

  const { taxasCambio, updateTaxas } = useStore();
  const [localTaxas, setLocalTaxas] = useState(taxasCambio);

  const handleSave = () => {
    updateConfig(localConfig);
    updateTaxas(localTaxas);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Configurações</h1>
          <p className="text-gray-400">Definições do sistema e empresa</p>
        </div>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 min-w-[180px] justify-center">
          {saved ? <><Check className="w-5 h-5" /> Guardado!</> : <><Save className="w-5 h-5" /> Guardar Alterações</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden sticky top-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gold-500/10 text-gold-400 border-l-2 border-gold-500' 
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'empresa' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gold-400" />
                Dados da Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nome da Empresa</label>
                  <input
                    type="text"
                    value={localConfig.empresa.nome}
                    onChange={(e) => setLocalConfig({ ...localConfig, empresa: { ...localConfig.empresa, nome: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">NIF</label>
                  <input
                    type="text"
                    value={localConfig.empresa.nif}
                    onChange={(e) => setLocalConfig({ ...localConfig, empresa: { ...localConfig.empresa, nif: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={localConfig.empresa.endereco}
                    onChange={(e) => setLocalConfig({ ...localConfig, empresa: { ...localConfig.empresa, endereco: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={localConfig.empresa.telefone}
                    onChange={(e) => setLocalConfig({ ...localConfig, empresa: { ...localConfig.empresa, telefone: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={localConfig.empresa.email}
                    onChange={(e) => setLocalConfig({ ...localConfig, empresa: { ...localConfig.empresa, email: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fiscal' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold-400" />
                Configurações Fiscais (AGT Angola)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Série de Faturas</label>
                  <select
                    value={localConfig.fiscal.serie}
                    onChange={(e) => setLocalConfig({ ...localConfig, fiscal: { ...localConfig.fiscal, serie: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="A">Série A (Benfica)</option>
                    <option value="B">Série B (Alvalade)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Taxa IVA (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={localConfig.fiscal.taxaIva}
                      onChange={(e) => setLocalConfig({ ...localConfig, fiscal: { ...localConfig.fiscal, taxaIva: Number(e.target.value) } })}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Retenção IRT (%)</label>
                  <input
                    type="number"
                    value={6.5}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Taxa padrão de 6.5% para serviços (Lei Angolana)</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">INSS Funcionário (%)</label>
                  <input
                    type="number"
                    value={localConfig.fiscal.inssFuncionario}
                    onChange={(e) => setLocalConfig({ ...localConfig, fiscal: { ...localConfig.fiscal, inssFuncionario: Number(e.target.value) } })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cambio' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-gold-400" />
                Taxas de Câmbio (BNA Ref.)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/30 p-5 rounded-2xl border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">$</div>
                    <p className="text-white font-bold">Dólar Americano (USD)</p>
                  </div>
                  <label className="block text-xs text-gray-500 mb-1">1 USD equivale a:</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={localTaxas.USD}
                      onChange={(e) => setLocalTaxas({ ...localTaxas, USD: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">AOA</span>
                  </div>
                </div>

                <div className="bg-gray-900/30 p-5 rounded-2xl border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">€</div>
                    <p className="text-white font-bold">Euro (EUR)</p>
                  </div>
                  <label className="block text-xs text-gray-500 mb-1">1 EUR equivale a:</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={localTaxas.EUR}
                      onChange={(e) => setLocalTaxas({ ...localTaxas, EUR: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">AOA</span>
                  </div>
                </div>
              </div>
              <div className="bg-gold-500/10 border border-gold-500/20 p-4 rounded-xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed font-medium">As taxas de câmbio são utilizadas para converter orçamentos e despesas automáticas. Recomendamos atualizar estas taxas diariamente com base no BNA.</p>
              </div>
            </div>
          )}

          {activeTab === 'sistema' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-gold-400" />
                Configurações do Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Moeda</label>
                  <select
                    value={localConfig.sistema.moeda}
                    onChange={(e) => setLocalConfig({ ...localConfig, sistema: { ...localConfig.sistema, moeda: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="Kz">Kwanza (Kz)</option>
                    <option value="USD">Dólar (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Idioma</label>
                  <select
                    value={localConfig.sistema.idioma}
                    onChange={(e) => setLocalConfig({ ...localConfig, sistema: { ...localConfig.sistema, idioma: e.target.value } })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="pt-AO">Português (Angola)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-gold-400" />
                Notificações
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Novas ordens de serviço', desc: 'Receber notificação quando uma nova OS for criada' },
                  { label: 'Faturas pendentes', desc: 'Alerta quando houver faturas pendentes há mais de 7 dias' },
                  { label: 'Stock baixo', desc: 'Notificação quando produtos atingirem stock mínimo' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:ring-2 peer-focus:ring-gold-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold-400" />
                Segurança
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <p className="text-white font-medium mb-4">Alterar Palavra-passe</p>
                  <div className="space-y-3">
                    <input type="password" placeholder="Palavra-passe atual" className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500" />
                    <input type="password" placeholder="Nova palavra-passe" className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500" />
                    <button className="btn-primary w-full py-3 mt-2">Atualizar Palavra-passe</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
