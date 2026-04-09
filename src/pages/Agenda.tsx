import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '../store';
import type { AgendaItem } from '../store';
import { Calendar, Clock, Plus, User, Car, ChevronLeft, ChevronRight, X, Trash2, Save, Edit2 } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { pt } from 'date-fns/locale';

const horas = Array.from({ length: 12 }, (_, i) => i + 8);

const tipoConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  consulta: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Consulta' },
  entrega: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Entrega' },
  revisao: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Revisão' },
  diagnostico: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Diagnóstico' },
};

type AgendaForm = {
  titulo: string;
  clienteId: string;
  viaturaId: string;
  tipo: string;
  status: string;
  dataStr: string;
  horaInicio: string;
  horaFim: string;
};

const emptyForm: AgendaForm = {
  titulo: '',
  clienteId: '',
  viaturaId: '',
  tipo: 'consulta',
  status: 'agendado',
  dataStr: new Date().toISOString().split('T')[0],
  horaInicio: '09:00',
  horaFim: '10:00',
};

export default function Agenda() {
  const { agenda, clientes, viaturas, addAgenda, updateAgenda, deleteAgenda } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AgendaForm>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const getClienteNome = (id?: string) => id ? clientes.find(c => c.id === id)?.nome : null;
  const getViatura = (id?: string) => id ? viaturas.find(v => v.id === id) : null;
  const viaturasByCliente = (clienteId: string) => viaturas.filter(v => v.clienteId === clienteId);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const getCompromissosDoDia = (date: Date) => agenda.filter(a => isSameDay(new Date(a.dataInicio), date));
  const getCompromissosDaHora = (date: Date, hora: number) => agenda.filter(a => {
    const data = new Date(a.dataInicio);
    return isSameDay(data, date) && data.getHours() === hora;
  });

  const agendaDoDia = getCompromissosDoDia(selectedDate);
  const totalCompromissos = agenda.length;
  const compromissosHoje = getCompromissosDoDia(new Date()).length;

  const openAdd = (date?: Date) => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      dataStr: (date || selectedDate).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEdit = (item: AgendaItem) => {
    const d = new Date(item.dataInicio);
    const df = item.dataFim ? new Date(item.dataFim) : null;
    setEditingId(item.id);
    setForm({
      titulo: item.titulo,
      clienteId: item.clienteId || '',
      viaturaId: item.viaturaId || '',
      tipo: item.tipo,
      status: item.status,
      dataStr: d.toISOString().split('T')[0],
      horaInicio: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
      horaFim: df ? `${df.getHours().toString().padStart(2, '0')}:${df.getMinutes().toString().padStart(2, '0')}` : '',
    });
    setShowModal(true);
  };

  const buildDate = (dateStr: string, timeStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [h, min] = timeStr.split(':').map(Number);
    return new Date(y, m - 1, d, h, min);
  };

  const handleSave = () => {
    if (!form.titulo || !form.dataStr) return;
    const dataInicio = buildDate(form.dataStr, form.horaInicio);
    const dataFim = form.horaFim ? buildDate(form.dataStr, form.horaFim) : undefined;
    const data: Omit<AgendaItem, 'id'> = {
      titulo: form.titulo,
      clienteId: form.clienteId || undefined,
      viaturaId: form.viaturaId || undefined,
      tipo: form.tipo,
      status: form.status,
      dataInicio,
      dataFim,
    };
    if (editingId) {
      updateAgenda(editingId, data);
      toast.success('Compromisso actualizado!');
    } else {
      addAgenda(data);
      toast.success('Compromisso agendado!');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteAgenda(id);
    setShowDeleteConfirm(null);
    toast.error('Compromisso removido');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Agenda</h1>
          <p className="text-gray-400">Gestão de compromissos e marcações</p>
        </div>
        <button onClick={() => openAdd()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Compromisso
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{totalCompromissos}</p>
          <p className="text-gray-400 text-sm">Total Compromissos</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{compromissosHoje}</p>
          <p className="text-gray-400 text-sm">Hoje</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3">
            <User className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{clientes.length}</p>
          <p className="text-gray-400 text-sm">Clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Semanal */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
            <button
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-white">
              {format(currentWeek, "dd MMM", { locale: pt })} - {format(addDays(currentWeek, 6), "dd MMM yyyy", { locale: pt })}
            </h3>
            <button
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-gray-700/50">
            {weekDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const count = getCompromissosDoDia(day).length;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`p-4 text-center border-r border-gray-700/50 last:border-r-0 transition-all ${
                    isSelected ? 'bg-gold-500/10' : 'hover:bg-gray-700/30'
                  }`}
                >
                  <p className="text-gray-400 text-xs uppercase">{format(day, 'EEE', { locale: pt })}</p>
                  <p className={`text-lg font-bold mt-1 ${
                    isToday ? 'text-gold-400' : isSelected ? 'text-white' : 'text-gray-300'
                  }`}>
                    {format(day, 'd')}
                  </p>
                  {count > 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {horas.map((hora) => {
              const compromissos = getCompromissosDaHora(selectedDate, hora);
              return (
                <div key={hora} className="flex border-b border-gray-700/30 min-h-[60px] group/hora">
                  <div className="w-20 p-3 flex-shrink-0 border-r border-gray-700/30">
                    <p className="text-gray-500 text-sm font-mono">{hora.toString().padStart(2, '0')}:00</p>
                  </div>
                  <div className="flex-1 p-2 space-y-2">
                    {compromissos.map((item) => {
                      const tipo = tipoConfig[item.tipo] || tipoConfig.consulta;
                      return (
                        <div
                          key={item.id}
                          className={`group p-3 rounded-xl border ${tipo.bg} ${tipo.border} hover:scale-[1.02] transition-transform cursor-pointer`}
                        >
                          <div className="flex items-center justify-between">
                            <p className={`font-medium ${tipo.text}`}>{item.titulo}</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                                className="p-1 text-gray-400 hover:text-white rounded"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item.id); }}
                                className="p-1 text-gray-400 hover:text-red-400 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(item.dataInicio), 'HH:mm')}
                              {item.dataFim && ` - ${format(new Date(item.dataFim), 'HH:mm')}`}
                            </span>
                            {getClienteNome(item.clienteId) && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {getClienteNome(item.clienteId)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {compromissos.length === 0 && (
                      <button
                        onClick={() => openAdd(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hora))}
                        className="w-full h-8 rounded-lg border border-dashed border-gray-700/50 text-gray-600 hover:border-gold-500/30 hover:text-gold-500/50 transition-colors text-xs opacity-0 group-hover/hora:opacity-100"
                      >
                        + Adicionar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel Lateral - Dia */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <p className="text-gray-400 text-sm">{format(selectedDate, "EEEE", { locale: pt })}</p>
            <p className="text-3xl font-bold text-white">{format(selectedDate, "d 'de' MMMM", { locale: pt })}</p>
            <p className="text-gold-400 text-sm mt-1">{agendaDoDia.length} compromissos</p>
          </div>

          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {agendaDoDia.length > 0 ? agendaDoDia.sort((a, b) =>
              new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
            ).map((item) => {
              const tipo = tipoConfig[item.tipo] || tipoConfig.consulta;
              const viatura = getViatura(item.viaturaId);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${tipo.bg} ${tipo.border} transition-all group`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${tipo.text} ${tipo.bg}`}>
                      {tipoConfig[item.tipo]?.label || item.tipo}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {format(new Date(item.dataInicio), 'HH:mm')}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(item)} className="p-1 text-gray-400 hover:text-gold-400 rounded">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(item.id)} className="p-1 text-gray-400 hover:text-red-400 rounded">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-white font-semibold">{item.titulo}</h4>

                  <div className="mt-3 space-y-2 text-sm text-gray-400">
                    {getClienteNome(item.clienteId) && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {getClienteNome(item.clienteId)}
                      </div>
                    )}
                    {viatura && (
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        {viatura.marca} {viatura.modelo}
                      </div>
                    )}
                    {item.dataFim && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Até {format(new Date(item.dataFim), 'HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-400">Sem compromissos</p>
                <button onClick={() => openAdd()} className="mt-4 text-gold-400 hover:text-gold-300 text-sm font-medium">
                  + Adicionar compromisso
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Adicionar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Compromisso' : 'Novo Compromisso'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ex: Revisão BMW X5"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {Object.entries(tipoConfig).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Data</label>
                <input
                  type="date"
                  value={form.dataStr}
                  onChange={(e) => setForm({ ...form, dataStr: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Hora Início</label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Hora Fim</label>
                  <input
                    type="time"
                    value={form.horaFim}
                    onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Cliente</label>
                <select
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value, viaturaId: '' })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">Sem cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {form.clienteId && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Viatura</label>
                  <select
                    value={form.viaturaId}
                    onChange={(e) => setForm({ ...form, viaturaId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">Sem viatura</option>
                    {viaturasByCliente(form.clienteId).map(v => (
                      <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.matricula}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.titulo || !form.dataStr}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Guardar' : 'Agendar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Remover Compromisso</h3>
                <p className="text-gray-400 text-sm">Esta acção não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
