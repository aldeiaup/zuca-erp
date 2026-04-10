import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tarefa } from '../components/kanban/types';
import { EstadoTarefa, PrioridadeTarefa } from '../components/kanban/types';

export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  tipo: 'master' | 'admin' | 'gerente' | 'funcionario';
  avatar?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  tipo: 'particular' | 'empresa';
  nif?: string;
  bi?: string;
  telefone: string;
  email?: string;
  endereco?: string;
  cidade: string;
}

export interface Viatura {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  ano: number;
  matricula: string;
  chassis?: string;
  cor?: string;
  combustivel?: string;
  kilometragem?: number;
}

export interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  viaturaId: string;
  tecnicoId?: string;
  dataEntrada: Date;
  dataPrevista?: Date;
  dataConclusao?: Date;
  status: 'pendente' | 'em_andamento' | 'aguardando_peca' | 'concluido' | 'entregue';
  descricao: string;
  servico: string;
  total: number;
}

export interface Fatura {
  id: string;
  numero: string;
  clienteId: string;
  osId?: string;
  dataEmissao: Date;
  dataVencimento?: Date;
  subtotal: number;
  iva: number;
  total: number;
  status: 'rascunho' | 'emitida' | 'paga' | 'cancelada';
  meioPagamento?: 'numerario' | 'transferencia' | 'multibanco';
}

export interface Servico {
  id: string;
  nome: string;
  categoria: string;
  precoBase: number;
  tempoEstimado: number;
}

export interface EstoqueItem {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  unidade: string;
  precoCusto: number;
  precoVenda: number;
  quantidade: number;
  quantidadeMinima: number;
}

export interface AgendaItem {
  id: string;
  titulo: string;
  clienteId?: string;
  viaturaId?: string;
  tecnicoId?: string;
  dataInicio: Date;
  dataFim?: Date;
  status: string;
  tipo: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  cargo: string;
  tipo: 'master' | 'admin' | 'gerente' | 'funcionario';
  email: string;
  telefone: string;
  dataAdmissao: Date;
  salario: number;
  nif: string;
  ativo: boolean;
}

export interface Message {
  id: string;
  conversaId: string;
  texto: string;
  remetente: 'cliente' | 'atendente';
  timestamp: Date;
  lido: boolean;
  tipo: 'texto' | 'imagem' | 'audio' | 'documento';
  nomeAtendente?: string;
}

export interface TarefaRecepcao {
  id: string;
  texto: string;
  estado: 'a_fazer' | 'em_atendimento' | 'finalizado';
  conversaId?: string;
  prioridade?: 'baixa' | 'normal' | 'alta';
  criadaEm: Date;
}

export interface Conversa {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail?: string;
  avatar?: string;
  canal: 'whatsapp' | 'instagram';
  status: 'ativa' | 'pendente' | 'resolvida' | 'arquivada';
  ultimaMensagem: string;
  ultimaHora: Date;
  naoLidas: number;
  fixada: boolean;
  tags: string[];
  clienteId?: string;
  viaturaId?: string;
  atendente?: string;
}

export interface ChatInternoMensagem {
  id: string;
  conversaId: string;
  texto: string;
  remetente: 'atendente' | 'sistema';
  nomeAtendente?: string;
  timestamp: Date;
  tipo: 'texto';
  lida: boolean;
}

export interface ChatInterno {
  id: string;
  titulo: string;
  tipo: 'geral' | 'setor';
  setor?: string;
  participantes: string[];
  ultimaMensagem: string;
  ultimaHora: Date;
  naoLidas: number;
}

export interface Fornecedor {
  id: string;
  nome: string;
  nif: string;
  telefone: string;
  email: string;
  categoria: string;
  endereco?: string;
}

export interface Transacao {
  id: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  valor: number;
  moeda: 'AOA' | 'USD' | 'EUR';
  taxaCambio: number; // Valor em Kz na data
  data: Date;
  descricao: string;
  fornecedorId?: string;
  clienteId?: string;
  osId?: string;
  contaId: string; // ID da Caixa/Conta
  metodoPagamento: 'numerario' | 'transferencia' | 'multibanco' | 'tpa' | 'multicaixa_express' | 'cheque';
  status: 'concluido' | 'pendente' | 'reconciliado';
  reciboGerado: boolean;
  iva?: number;
  retencao?: number;
}

export interface CaixaConta {
  id: string;
  nome: string;
  unidade: 'Benfica' | 'Alvalade';
  tipo: 'caixa_fisico' | 'banco';
  bancoNome?: string;
  iban?: string;
  saldoAOA: number;
  saldoUSD: number;
  saldoEUR: number;
  aberto: boolean;
  ultimaAbertura?: Date;
  ultimoFecho?: Date;
}

export interface FolhaPagamento {
  id: string;
  funcionarioId: string;
  mes: number;
  ano: number;
  salarioBase: number;
  subsidios: number;
  premios: number;
  irt: number;
  inss: number;
  faltas: number;
  adiantamentos: number;
  totalLiquido: number;
  status: 'pendente' | 'pago';
  dataPagamento?: Date;
}

export interface Adiantamento {
  id: string;
  funcionarioId: string;
  valor: number;
  data: Date;
  status: 'pendente' | 'descontado';
  motivo: string;
}

export interface Config {
  empresa: {
    nome: string;
    nif: string;
    endereco: string;
    telefone: string;
    email: string;
    website: string;
  };
  fiscal: {
    serie: string;
    taxaIva: number;
    inssFuncionario: number;
    inssEmpregador: number;
    retencaoFonte: number;
  };
  sistema: {
    moeda: string;
    idioma: string;
    fusoHorario: string;
  };
  meta: {
    whatsappToken: string;
    whatsappPhoneId: string;
    whatsappBusinessId: string;
    instagramToken: string;
    instagramBusinessId: string;
    verifyToken: string;
  };
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  clientes: Cliente[];
  viaturas: Viatura[];
  ordensServico: OrdemServico[];
  faturas: Fatura[];
  servicos: Servico[];
  estoque: EstoqueItem[];
  agenda: AgendaItem[];
  funcionarios: Funcionario[];
  fornecedores: Fornecedor[];
  transacoes: Transacao[];
  conversas: Conversa[];
  mensagens: Record<string, Message[]>;
  chatsInternos: ChatInterno[];
  mensagensChatInterno: Record<string, ChatInternoMensagem[]>;
  config: Config;
  
  // Financeiro Expandido
  caixasContas: CaixaConta[];
  folhasPagamento: FolhaPagamento[];
  adiantamentos: Adiantamento[];
  taxasCambio: { AOA: number; USD: number; EUR: number };

  addCliente: (cliente: Omit<Cliente, 'id'>) => void;
  updateCliente: (id: string, data: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;

  addViatura: (viatura: Omit<Viatura, 'id'>) => void;
  updateViatura: (id: string, data: Partial<Viatura>) => void;
  deleteViatura: (id: string) => void;

  addOrdemServico: (os: Omit<OrdemServico, 'id' | 'numero'>) => void;
  updateOrdemServico: (id: string, data: Partial<OrdemServico>) => void;
  deleteOrdemServico: (id: string) => void;

  addFatura: (fatura: Omit<Fatura, 'id' | 'numero'>) => void;
  updateFatura: (id: string, data: Partial<Fatura>) => void;
  deleteFatura: (id: string) => void;

  addEstoqueItem: (item: Omit<EstoqueItem, 'id'>) => void;
  updateEstoqueItem: (id: string, data: Partial<EstoqueItem>) => void;
  deleteEstoqueItem: (id: string) => void;

  addAgenda: (item: Omit<AgendaItem, 'id'>) => void;
  updateAgenda: (id: string, data: Partial<AgendaItem>) => void;
  deleteAgenda: (id: string) => void;

  addFuncionario: (funcionario: Omit<Funcionario, 'id'>) => void;
  updateFuncionario: (id: string, data: Partial<Funcionario>) => void;
  deleteFuncionario: (id: string) => void;

  addFornecedor: (fornecedor: Omit<Fornecedor, 'id'>) => void;
  updateFornecedor: (id: string, data: Partial<Fornecedor>) => void;
  deleteFornecedor: (id: string) => void;

  addTransacao: (transacao: Omit<Transacao, 'id'>) => void;
  updateTransacao: (id: string, data: Partial<Transacao>) => void;
  deleteTransacao: (id: string) => void;

  // Ações Caixa/Contas
  addCaixaConta: (conta: Omit<CaixaConta, 'id'>) => void;
  updateCaixaConta: (id: string, data: Partial<CaixaConta>) => void;
  toggleCaixa: (id: string) => void;

  // Ações Folha
  processarFolha: (mes: number, ano: number) => void;
  pagarFolha: (id: string, contaId: string) => void;
  addAdiantamento: (adiantamento: Omit<Adiantamento, 'id'>) => void;
  
  // Ações Config
  updateTaxas: (updated: { USD?: number; EUR?: number }) => void;

  // Kanban
  tarefasKanban: Tarefa[];
  addTarefaKanban: (tarefa: Omit<Tarefa, 'id'>) => void;
  updateTarefaKanban: (id: string, data: Partial<Tarefa>) => void;
  deleteTarefaKanban: (id: string) => void;

  sendMessage: (conversaId: string, texto: string, remetente: 'cliente' | 'atendente', nomeAtendente?: string) => void;
  togglePinConversa: (id: string) => void;
  updateConversaStatus: (id: string, status: Conversa['status']) => void;
  deleteConversa: (id: string) => void;

  sendChatInternoMessage: (chatId: string, texto: string, nomeAtendente: string) => void;

  updateConfig: (data: Partial<Config>) => void;

  // Recepção
  receptionOpen: boolean;
  setReceptionOpen: (v: boolean) => void;
  tarefasRecepcao: Record<'Benfica' | 'Alvalade', TarefaRecepcao[]>;
  addTarefaRecepcao: (unidade: 'Benfica' | 'Alvalade', tarefa: Omit<TarefaRecepcao, 'id' | 'criadaEm'>) => void;
  updateTarefaRecepcao: (unidade: 'Benfica' | 'Alvalade', id: string, data: Partial<TarefaRecepcao>) => void;
  deleteTarefaRecepcao: (unidade: 'Benfica' | 'Alvalade', id: string) => void;
}

const mockClientes: Cliente[] = [
  { id: '1', nome: 'João Manuel Pereira', tipo: 'particular', telefone: '+244 923 456 789', email: 'joao@email.com', cidade: 'Luanda' },
  { id: '2', nome: 'Maria da Conceição Silva', tipo: 'particular', telefone: '+244 921 234 567', email: 'maria@email.com', cidade: 'Luanda' },
  { id: '3', nome: 'Carlos Eduardo Sousa', tipo: 'particular', telefone: '+244 925 678 901', email: 'carlos@email.com', cidade: 'Benguela' },
  { id: '4', nome: 'Empresa Nacional de Transportes, Lda', tipo: 'empresa', nif: '5417042319', telefone: '+244 222 123 456', email: 'geral@entransportes.ao', cidade: 'Luanda' },
  { id: '5', nome: 'Ana Paula Fernando', tipo: 'particular', telefone: '+244 926 345 678', email: 'ana@email.com', cidade: 'Huambo' },
];

const mockViaturas: Viatura[] = [
  { id: '1', clienteId: '1', marca: 'BMW', modelo: 'X5 xDrive40i', ano: 2023, matricula: 'LD-01-23-AF', cor: 'Preto', combustivel: 'Gasolina', kilometragem: 15000 },
  { id: '2', clienteId: '2', marca: 'Mercedes-Benz', modelo: 'GLE 350d', ano: 2022, matricula: 'LD-45-67-CD', cor: 'Branco', combustivel: 'Diesel', kilometragem: 28000 },
  { id: '3', clienteId: '3', marca: 'Range Rover', modelo: 'Sport HSE', ano: 2021, matricula: 'LD-89-01-EF', cor: 'Preto', combustivel: 'Diesel', kilometragem: 42000 },
  { id: '4', clienteId: '4', marca: 'Toyota', modelo: 'Hilux Double Cab', ano: 2023, matricula: 'LU-12-34-GH', cor: 'Prata', combustivel: 'Diesel', kilometragem: 8500 },
  { id: '5', clienteId: '5', marca: 'Audi', modelo: 'Q7 50 TDI', ano: 2020, matricula: 'LD-56-78-IJ', cor: 'Cinza', combustivel: 'Diesel', kilometragem: 55000 },
];

const mockOrdens: OrdemServico[] = [
  { id: '1', numero: 'OS260001', clienteId: '1', viaturaId: '1', dataEntrada: new Date(), status: 'em_andamento', descricao: 'Revisão geral com troca de óleo', servico: 'Revisão Completa', total: 85000 },
  { id: '2', numero: 'OS260002', clienteId: '2', viaturaId: '2', dataEntrada: new Date(Date.now() - 86400000), status: 'pendente', descricao: 'Diagnóstico de ruído no motor', servico: 'Diagnóstico', total: 25000 },
  { id: '3', numero: 'OS260003', clienteId: '3', viaturaId: '3', dataEntrada: new Date(Date.now() - 172800000), status: 'concluido', descricao: 'Substituição de pastilhas de travão', servico: 'Travagem', total: 45000 },
  { id: '4', numero: 'OS260004', clienteId: '4', viaturaId: '4', dataEntrada: new Date(), status: 'aguardando_peca', descricao: 'Reparação elétrica', servico: 'Elétrica', total: 120000 },
];

const mockFaturas: Fatura[] = [
  { id: '1', numero: 'FT260001', clienteId: '1', dataEmissao: new Date(), subtotal: 74561, iva: 10439, total: 85000, status: 'emitida' },
  { id: '2', numero: 'FT260002', clienteId: '2', dataEmissao: new Date(Date.now() - 86400000), subtotal: 56578, iva: 7921, total: 64500, status: 'paga', meioPagamento: 'transferencia' },
  { id: '3', numero: 'FT260003', clienteId: '3', dataEmissao: new Date(Date.now() - 172800000), subtotal: 39474, iva: 5526, total: 45000, status: 'paga', meioPagamento: 'numerario' },
];

const mockServicos: Servico[] = [
  { id: '1', nome: 'Revisão Completa', categoria: 'Revisão', precoBase: 85000, tempoEstimado: 120 },
  { id: '2', nome: 'Mudança de Óleo', categoria: 'Manutenção', precoBase: 25000, tempoEstimado: 30 },
  { id: '3', nome: 'Substituição Pastilhas', categoria: 'Travagem', precoBase: 45000, tempoEstimado: 60 },
  { id: '4', nome: 'Diagnóstico Computadorizado', categoria: 'Diagnóstico', precoBase: 35000, tempoEstimado: 45 },
  { id: '5', nome: 'Reparação Elétrica', categoria: 'Elétrica', precoBase: 75000, tempoEstimado: 90 },
  { id: '6', nome: 'Alinhamento e Balanceamento', categoria: 'Suspensão', precoBase: 30000, tempoEstimado: 45 },
];

const mockEstoque: EstoqueItem[] = [
  { id: '1', codigo: 'OLEO-5W30-5L', nome: 'Óleo Mobil 5W-30 5L', categoria: 'Lubrificantes', unidade: 'un', precoCusto: 15000, precoVenda: 22000, quantidade: 24, quantidadeMinima: 10 },
  { id: '2', codigo: 'PAST-FRD-001', nome: 'Pastilhas Frontal Disc', categoria: 'Travagem', unidade: 'set', precoCusto: 18000, precoVenda: 35000, quantidade: 8, quantidadeMinima: 5 },
  { id: '3', codigo: 'FILT-OLE-001', nome: 'Filtro de Óleo Universal', categoria: 'Filtros', unidade: 'un', precoCusto: 3500, precoVenda: 6500, quantidade: 45, quantidadeMinima: 15 },
  { id: '4', codigo: 'VELA-IGN-001', nome: 'Vela de Ignição Iridium', categoria: 'Elétrica', unidade: 'un', precoCusto: 5500, precoVenda: 9500, quantidade: 32, quantidadeMinima: 10 },
  { id: '5', codigo: 'CORREIA-KIT', nome: 'Kit Correria Dentada', categoria: 'Motor', unidade: 'kit', precoCusto: 35000, precoVenda: 55000, quantidade: 3, quantidadeMinima: 2 },
];

const mockAgenda: AgendaItem[] = [
  { id: '1', titulo: 'Revisão BMW X5', clienteId: '1', viaturaId: '1', dataInicio: new Date(), status: 'agendado', tipo: 'consulta' },
  { id: '2', titulo: 'Diagnóstico Mercedes', clienteId: '2', viaturaId: '2', dataInicio: new Date(Date.now() + 7200000), status: 'agendado', tipo: 'consulta' },
  { id: '3', titulo: 'Entrega Range Rover', clienteId: '3', viaturaId: '3', dataInicio: new Date(Date.now() + 14400000), status: 'agendado', tipo: 'entrega' },
];

const mockFuncionarios: Funcionario[] = [
  { id: '1', nome: 'Mauro André', cargo: 'Administrador', tipo: 'admin', email: 'mauro@zucamotors.ao', telefone: '+244 923 456 789', dataAdmissao: new Date('2020-01-15'), salario: 350000, nif: '0012345678LA', ativo: true },
  { id: '2', nome: 'João Silva', cargo: 'Gerente de Oficina', tipo: 'gerente', email: 'joao.silva@zucamotors.ao', telefone: '+244 921 234 567', dataAdmissao: new Date('2021-03-10'), salario: 250000, nif: '0023456789LA', ativo: true },
  { id: '3', nome: 'Pedro Manuel', cargo: 'Técnico Mecânico', tipo: 'funcionario', email: 'pedro@zucamotors.ao', telefone: '+244 925 678 901', dataAdmissao: new Date('2022-06-01'), salario: 150000, nif: '0034567890LA', ativo: true },
  { id: '4', nome: 'Ana Costa', cargo: 'Rececionista', tipo: 'funcionario', email: 'ana@zucamotors.ao', telefone: '+244 926 345 678', dataAdmissao: new Date('2023-01-15'), salario: 120000, nif: '0045678901LA', ativo: true },
  { id: '5', nome: 'Miguel Santos', cargo: 'Técnico Eletricista', tipo: 'funcionario', email: 'miguel@zucamotors.ao', telefone: '+244 927 890 123', dataAdmissao: new Date('2022-09-01'), salario: 145000, nif: '0056789012LA', ativo: true },
  { id: '6', nome: 'Carlos Neto', cargo: 'Polidor / Estética', tipo: 'funcionario', email: 'carlos@zucamotors.ao', telefone: '+244 928 111 222', dataAdmissao: new Date('2023-03-20'), salario: 130000, nif: '0067890123LA', ativo: true },
];

const mockFornecedores: Fornecedor[] = [
  { id: '1', nome: 'Peças Expressa, Lda', nif: '5401234567', telefone: '+244 931 000 111', email: 'vendas@pecasexpressa.ao', categoria: 'Peças' },
  { id: '2', nome: 'Lubrificantes Angola', nif: '5409876543', telefone: '+244 932 222 333', email: 'geral@lubangola.ao', categoria: 'Lubrificantes' },
];

const mockTransacoes: Transacao[] = [
  { 
    id: '1', tipo: 'saida', categoria: 'Compra de Peças', valor: 150000, 
    moeda: 'AOA', taxaCambio: 1, data: new Date(), descricao: 'Compra de kits de suspensão', 
    fornecedorId: '1', contaId: '1', metodoPagamento: 'transferencia', status: 'concluido', reciboGerado: true 
  },
  { 
    id: '2', tipo: 'saida', categoria: 'Aluguer', valor: 450000, 
    moeda: 'AOA', taxaCambio: 1, data: new Date(Date.now() - 86400000 * 5), descricao: 'Aluguer das instalações - Abril', 
    contaId: '2', metodoPagamento: 'transferencia', status: 'concluido', reciboGerado: true 
  },
];

const mockCaixasContas: CaixaConta[] = [
  { id: '1', nome: 'Caixa Principal - Benfica', unidade: 'Benfica', tipo: 'caixa_fisico', saldoAOA: 250000, saldoUSD: 500, saldoEUR: 0, aberto: true },
  { id: '2', nome: 'Conta BFA Matriz', unidade: 'Benfica', tipo: 'banco', bancoNome: 'BFA', iban: 'AO06 0006 0000 1234 5678 1011 1', saldoAOA: 1500000, saldoUSD: 2500, saldoEUR: 1000, aberto: true },
  { id: '3', nome: 'Caixa Filial - Alvalade', unidade: 'Alvalade', tipo: 'caixa_fisico', saldoAOA: 75000, saldoUSD: 0, saldoEUR: 0, aberto: false },
];

const mockConversas: Conversa[] = [
  {
    id: '1', clienteNome: 'João Manuel Pereira', clienteTelefone: '+244 923 456 789',
    clienteEmail: 'joao@email.com', canal: 'whatsapp', status: 'ativa',
    ultimaMensagem: 'Bom dia! Gostaria de agendar uma revisão para o meu BMW X5.',
    ultimaHora: new Date(Date.now() - 300000), naoLidas: 3, fixada: true,
    tags: ['VIP', 'Revisão'], clienteId: '1', viaturaId: '1', atendente: 'Ana Costa'
  },
  {
    id: '2', clienteNome: 'Maria da Conceição', clienteTelefone: '+244 921 234 567',
    canal: 'instagram', status: 'ativa',
    ultimaMensagem: 'Olá! Vi o vosso trabalho no Instagram e quero fazer um orçamento.',
    ultimaHora: new Date(Date.now() - 900000), naoLidas: 1, fixada: false,
    tags: ['Orçamento'], clienteId: '2', viaturaId: '2'
  },
  {
    id: '3', clienteNome: 'Carlos Eduardo Sousa', clienteTelefone: '+244 925 678 901',
    canal: 'whatsapp', status: 'pendente',
    ultimaMensagem: 'A minha viatura já está pronta? Estou a aguardar desde segunda.',
    ultimaHora: new Date(Date.now() - 1800000), naoLidas: 2, fixada: false,
    tags: ['Urgente'], clienteId: '3', viaturaId: '3'
  },
];

const mockMensagens: Record<string, Message[]> = {
  '1': [
    { id: 'm1', conversaId: '1', texto: 'Bom dia! Sou o João Manuel. Gostaria de agendar uma revisão para o meu BMW X5 xDrive40i, matrícula LD-01-23-AF.', remetente: 'cliente', timestamp: new Date(Date.now() - 3600000), lido: true, tipo: 'texto' },
    { id: 'm2', conversaId: '1', texto: 'Bom dia Sr. João! 👋 Bem-vindo à Zuca Motors. Temos disponibilidade para esta semana. Que dia seria mais conveniente?', remetente: 'atendente', timestamp: new Date(Date.now() - 3300000), lido: true, tipo: 'texto', nomeAtendente: 'Ana Costa' },
  ],
};

const mockChatsInternos: ChatInterno[] = [
  {
    id: 'chat geral',
    titulo: 'Geral',
    tipo: 'geral',
    participantes: [],
    ultimaMensagem: 'Bem-vindo ao chat interno!',
    ultimaHora: new Date(Date.now() - 86400000),
    naoLidas: 0,
  },
  {
    id: 'chat recepcao',
    titulo: 'Recepção',
    tipo: 'setor',
    setor: 'recepcao',
    participantes: [],
    ultimaMensagem: '',
    ultimaHora: new Date(Date.now() - 86400000),
    naoLidas: 0,
  },
  {
    id: 'chat oficina',
    titulo: 'Oficina',
    tipo: 'setor',
    setor: 'oficina',
    participantes: [],
    ultimaMensagem: '',
    ultimaHora: new Date(Date.now() - 86400000),
    naoLidas: 0,
  },
  {
    id: 'chat financeiro',
    titulo: 'Financeiro',
    tipo: 'setor',
    setor: 'financeiro',
    participantes: [],
    ultimaMensagem: '',
    ultimaHora: new Date(Date.now() - 86400000),
    naoLidas: 0,
  },
];

const mockMensagensChatInterno: Record<string, ChatInternoMensagem[]> = {
  'chat geral': [
    { id: 'mi1', conversaId: 'chat geral', texto: 'Bem-vindo ao chat interno da Zuca Motors!', remetente: 'sistema', timestamp: new Date(Date.now() - 86400000), tipo: 'texto', lida: true },
  ],
};

const defaultConfig: Config = {
  empresa: {
    nome: 'Zucamotors Angola, Lda',
    nif: '00000000000000',
    endereco: 'Rua Comandante Gika, Nº 45, Maianga, Luanda',
    telefone: '+244 923 456 789',
    email: 'geral@zucamotors.ao',
    website: 'www.zucamotors.ao',
  },
  fiscal: {
    serie: 'A',
    taxaIva: 14,
    inssFuncionario: 3,
    inssEmpregador: 8,
    retencaoFonte: 10,
  },
  sistema: {
    moeda: 'Kz',
    idioma: 'pt-AO',
    fusoHorario: 'Africa/Luanda',
  },
  meta: {
    whatsappToken: '',
    whatsappPhoneId: '',
    whatsappBusinessId: '',
    instagramToken: '',
    instagramBusinessId: '',
    verifyToken: 'ZUCA_' + Math.random().toString(36).substring(7).toUpperCase(),
  },
};

const mockTarefasKanban: Tarefa[] = [
  {
    id: 'tk-1',
    titulo: 'Revisão Completa',
    matricula: 'LD-01-23-AF',
    servico: 'Revisão Completa',
    responsavel: 'Pedro Manuel',
    prioridade: PrioridadeTarefa.ALTA,
    estado: EstadoTarefa.EM_EXECUCAO,
    progresso: 45,
    prazo: '2026-04-10',
    classificacao: 'Mecânico',
    equipa: 'Mecânica',
    viaturaId: '1',
    ordemId: '1',
    gestorId: '2',
  },
  {
    id: 'tk-2',
    titulo: 'Diagnóstico Electrónico',
    matricula: 'LD-45-67-CD',
    servico: 'Diagnóstico',
    responsavel: 'Miguel Santos',
    prioridade: PrioridadeTarefa.NORMAL,
    estado: EstadoTarefa.POR_INICIAR,
    progresso: 0,
    prazo: '2026-04-11',
    classificacao: 'Electricista',
    equipa: 'Elétrica',
    viaturaId: '2',
    ordemId: '2',
    gestorId: '2',
  },
  {
    id: 'tk-3',
    titulo: 'Substituição Pastilhas',
    matricula: 'LD-89-01-EF',
    servico: 'Travagem',
    responsavel: 'Pedro Manuel',
    prioridade: PrioridadeTarefa.CRITICA,
    estado: EstadoTarefa.IMPEDIMENTO,
    progresso: 30,
    prazo: '2026-04-09',
    classificacao: 'Mecânico',
    equipa: 'Mecânica',
    resultado: 'Aguarda entrega da peça — kit pastilhas em falta no estoque.',
    viaturaId: '3',
    ordemId: '3',
  },
  {
    id: 'tk-4',
    titulo: 'Reparação Elétrica',
    matricula: 'LU-12-34-GH',
    servico: 'Elétrica',
    responsavel: 'Miguel Santos',
    prioridade: PrioridadeTarefa.ALTA,
    estado: EstadoTarefa.EM_REVISAO,
    progresso: 80,
    prazo: '2026-04-12',
    classificacao: 'Electricista',
    equipa: 'Elétrica',
    viaturaId: '4',
    ordemId: '4',
  },
  {
    id: 'tk-5',
    titulo: 'Polimento Completo',
    matricula: 'LD-56-78-IJ',
    servico: 'Estética',
    responsavel: 'Carlos Neto',
    prioridade: PrioridadeTarefa.NORMAL,
    estado: EstadoTarefa.CONCLUIDO,
    progresso: 100,
    prazo: '2026-04-08',
    classificacao: 'Polidor',
    equipa: 'Estética',
    resultado: 'Polimento concluído com acabamento premium. Cliente notificado.',
    viaturaId: '5',
  },
  // Tarefas adicionais para enriquecer métricas de desempenho
  {
    id: 'tk-6',
    titulo: 'Substituição Kit Distribuição',
    matricula: 'LD-22-44-KL',
    servico: 'Motor',
    responsavel: 'Pedro Manuel',
    prioridade: PrioridadeTarefa.ALTA,
    estado: EstadoTarefa.CONCLUIDO,
    progresso: 100,
    prazo: '2026-04-15',
    classificacao: 'Mecânico',
    equipa: 'Mecânica',
    resultado: 'Kit substituído. Verificação realizada com sucesso.',
  },
  {
    id: 'tk-7',
    titulo: 'Alinhamento e Balanceamento',
    matricula: 'LD-33-55-MN',
    servico: 'Suspensão',
    responsavel: 'Pedro Manuel',
    prioridade: PrioridadeTarefa.NORMAL,
    estado: EstadoTarefa.CONCLUIDO,
    progresso: 100,
    prazo: '2026-04-12',
    classificacao: 'Mecânico',
    equipa: 'Mecânica',
    resultado: 'Alinhamento corrigido. Teste de estrada positivo.',
  },
  {
    id: 'tk-8',
    titulo: 'Recepção e Check-in Viatura',
    matricula: 'LU-77-88-OP',
    servico: 'Recepção',
    responsavel: 'Ana Costa',
    prioridade: PrioridadeTarefa.NORMAL,
    estado: EstadoTarefa.CONCLUIDO,
    progresso: 100,
    prazo: '2026-04-10',
    classificacao: 'Rececionista',
    equipa: 'Recepção',
    resultado: 'Check-in concluído. Ficha do cliente atualizada.',
  },
  {
    id: 'tk-9',
    titulo: 'Seguimento de Orçamentos Pendentes',
    matricula: '—',
    servico: 'Administrativo',
    responsavel: 'Ana Costa',
    prioridade: PrioridadeTarefa.ALTA,
    estado: EstadoTarefa.EM_EXECUCAO,
    progresso: 55,
    prazo: '2026-04-20',
    classificacao: 'Rececionista',
    equipa: 'Recepção',
  },
  {
    id: 'tk-10',
    titulo: 'Revisão Procedimentos Oficina',
    matricula: '—',
    servico: 'Gestão',
    responsavel: 'João Silva',
    prioridade: PrioridadeTarefa.ALTA,
    estado: EstadoTarefa.CONCLUIDO,
    progresso: 100,
    prazo: '2026-04-16',
    classificacao: 'Gerente',
    equipa: 'Gestão',
    resultado: 'Procedimentos actualizados e comunicados à equipa.',
    gestorId: '1',
  },
  {
    id: 'tk-11',
    titulo: 'Avaliação Desempenho Trimestral',
    matricula: '—',
    servico: 'Gestão',
    responsavel: 'João Silva',
    prioridade: PrioridadeTarefa.NORMAL,
    estado: EstadoTarefa.EM_REVISAO,
    progresso: 75,
    prazo: '2026-04-25',
    classificacao: 'Gerente',
    equipa: 'Gestão',
    gestorId: '1',
  },
  {
    id: 'tk-12',
    titulo: 'Ceragem Interior Premium',
    matricula: 'LD-99-11-QR',
    servico: 'Estética',
    responsavel: 'Carlos Neto',
    prioridade: PrioridadeTarefa.NORMAL,
    estado: EstadoTarefa.EM_EXECUCAO,
    progresso: 35,
    prazo: '2026-04-05',
    classificacao: 'Polidor',
    equipa: 'Estética',
  },
  {
    id: 'tk-13',
    titulo: 'Diagnóstico Sistema Injeção',
    matricula: 'LU-44-22-ST',
    servico: 'Diagnóstico',
    responsavel: 'Miguel Santos',
    prioridade: PrioridadeTarefa.ALTA,
    estado: EstadoTarefa.CONCLUIDO,
    progresso: 100,
    prazo: '2026-04-11',
    classificacao: 'Electricista',
    equipa: 'Elétrica',
    resultado: 'Falha no sensor MAP identificada e corrigida.',
  },
  {
    id: 'tk-14',
    titulo: 'Supervisão Controlo de Qualidade',
    matricula: '—',
    servico: 'Gestão',
    responsavel: 'Mauro André',
    prioridade: PrioridadeTarefa.ALTA,
    estado: EstadoTarefa.CONCLUIDO,
    progresso: 100,
    prazo: '2026-04-15',
    classificacao: 'Administrador',
    equipa: 'Gestão',
    resultado: 'Auditoria interna concluída. 3 pontos de melhoria identificados.',
  },
  {
    id: 'tk-15',
    titulo: 'Plano Expansão Alvalade',
    matricula: '—',
    servico: 'Gestão',
    responsavel: 'Mauro André',
    prioridade: PrioridadeTarefa.CRITICA,
    estado: EstadoTarefa.EM_EXECUCAO,
    progresso: 60,
    prazo: '2026-04-30',
    classificacao: 'Administrador',
    equipa: 'Gestão',
  },
];

const mockTarefasRecepcao: Record<'Benfica' | 'Alvalade', TarefaRecepcao[]> = {
  Benfica: [
    { id: 'tr-1', texto: 'Confirmar orçamento BMW X5 com Sr. João', estado: 'a_fazer', conversaId: '1', prioridade: 'alta', criadaEm: new Date() },
    { id: 'tr-2', texto: 'Ligar à Mercedes para peça em falta (OS260002)', estado: 'em_atendimento', prioridade: 'normal', criadaEm: new Date(Date.now() - 3600000) },
    { id: 'tr-3', texto: 'Enviar recibo pagamento Range Rover', estado: 'finalizado', conversaId: '3', prioridade: 'baixa', criadaEm: new Date(Date.now() - 7200000) },
  ],
  Alvalade: [
    { id: 'tr-4', texto: 'Agendar visita técnica — Audi Q7 (Ana Paula)', estado: 'a_fazer', prioridade: 'normal', criadaEm: new Date() },
    { id: 'tr-5', texto: 'Responder Instagram DM sobre polimento', estado: 'em_atendimento', conversaId: '2', prioridade: 'alta', criadaEm: new Date(Date.now() - 1800000) },
  ],
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (email: string, password: string) => {
        if (email === 'admin@zucamotors.ao' && password === 'admin123') {
          set({
            user: { id: '1', nome: 'Mauro André', email: 'admin@zucamotors.ao', cargo: 'Administrador', tipo: 'master' },
            isAuthenticated: true,
          });
          return true;
        }
        if (email === 'gerente@zucamotors.ao' && password === 'gerente123') {
          set({
            user: { id: '2', nome: 'João Silva', email: 'gerente@zucamotors.ao', cargo: 'Gerente', tipo: 'gerente' },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      clientes: mockClientes,
      viaturas: mockViaturas,
      ordensServico: mockOrdens,
      faturas: mockFaturas,
      servicos: mockServicos,
      estoque: mockEstoque,
      agenda: mockAgenda,
      funcionarios: mockFuncionarios,
      fornecedores: mockFornecedores,
      transacoes: mockTransacoes,
      conversas: mockConversas,
      mensagens: mockMensagens,
      chatsInternos: mockChatsInternos,
      mensagensChatInterno: mockMensagensChatInterno,
      config: defaultConfig,
      
      caixasContas: mockCaixasContas,
      folhasPagamento: [],
      adiantamentos: [],
      taxasCambio: { AOA: 1, USD: 830, EUR: 910 },

      // Clientes
      addCliente: (cliente) => set((state) => ({
        clientes: [...state.clientes, { ...cliente, id: String(Date.now()) }]
      })),
      updateCliente: (id, data) => set((state) => ({
        clientes: state.clientes.map((c) => c.id === id ? { ...c, ...data } : c)
      })),
      deleteCliente: (id) => set((state) => ({
        clientes: state.clientes.filter((c) => c.id !== id)
      })),

      // Viaturas
      addViatura: (viatura) => set((state) => ({
        viaturas: [...state.viaturas, { ...viatura, id: String(Date.now()) }]
      })),
      updateViatura: (id, data) => set((state) => ({
        viaturas: state.viaturas.map((v) => v.id === id ? { ...v, ...data } : v)
      })),
      deleteViatura: (id) => set((state) => ({
        viaturas: state.viaturas.filter((v) => v.id !== id)
      })),

      // Ordens de Serviço
      addOrdemServico: (os) => set((state) => {
        const num = `OS${new Date().getFullYear().toString().slice(-2)}${String(state.ordensServico.length + 1).padStart(4, '0')}`;
        return { ordensServico: [...state.ordensServico, { ...os, id: String(Date.now()), numero: num }] };
      }),
      updateOrdemServico: (id, data) => set((state) => ({
        ordensServico: state.ordensServico.map((o) => o.id === id ? { ...o, ...data } : o)
      })),
      deleteOrdemServico: (id) => set((state) => ({
        ordensServico: state.ordensServico.filter((o) => o.id !== id)
      })),

      // Faturas
      addFatura: (fatura) => set((state) => {
        const serie = state.config?.fiscal?.serie || 'FT';
        const ano = new Date().getFullYear().toString().slice(-2);
        const seq = state.faturas.filter(f => f.numero.startsWith(serie)).length + 1;
        const num = `${serie}${ano}${String(seq).padStart(4, '0')}`;
        return { faturas: [...state.faturas, { ...fatura, id: String(Date.now()), numero: num }] };
      }),
      updateFatura: (id, data) => set((state) => ({
        faturas: state.faturas.map((f) => f.id === id ? { ...f, ...data } : f)
      })),
      deleteFatura: (id) => set((state) => ({
        faturas: state.faturas.filter((f) => f.id !== id)
      })),

      // Estoque
      addEstoqueItem: (item) => set((state) => ({
        estoque: [...state.estoque, { ...item, id: String(Date.now()) }]
      })),
      updateEstoqueItem: (id, data) => set((state) => ({
        estoque: state.estoque.map((e) => e.id === id ? { ...e, ...data } : e)
      })),
      deleteEstoqueItem: (id) => set((state) => ({
        estoque: state.estoque.filter((e) => e.id !== id)
      })),

      // Agenda
      addAgenda: (item) => set((state) => ({
        agenda: [...state.agenda, { ...item, id: String(Date.now()) }]
      })),
      updateAgenda: (id, data) => set((state) => ({
        agenda: state.agenda.map((a) => a.id === id ? { ...a, ...data } : a)
      })),
      deleteAgenda: (id) => set((state) => ({
        agenda: state.agenda.filter((a) => a.id !== id)
      })),

      // Funcionários
      addFuncionario: (funcionario) => set((state) => ({
        funcionarios: [...state.funcionarios, { ...funcionario, id: String(Date.now()) }]
      })),
      updateFuncionario: (id, data) => set((state) => ({
        funcionarios: state.funcionarios.map((f) => f.id === id ? { ...f, ...data } : f)
      })),
      deleteFuncionario: (id) => set((state) => ({
        funcionarios: state.funcionarios.map((f) => f.id === id ? { ...f, ativo: false } : f)
      })),

      // Fornecedores
      addFornecedor: (fornecedor) => set((state) => ({
        fornecedores: [...state.fornecedores, { ...fornecedor, id: String(Date.now()) }]
      })),
      updateFornecedor: (id, data) => set((state) => ({
        fornecedores: state.fornecedores.map((f) => f.id === id ? { ...f, ...data } : f)
      })),
      deleteFornecedor: (id) => set((state) => ({
        fornecedores: state.fornecedores.filter((f) => f.id !== id)
      })),

      // Transações
      addTransacao: (transacao) => set((state) => {
        const id = String(Date.now());
        const newTransacao = { ...transacao, id, reciboGerado: false };
        
        // Atualizar saldo da conta
        const updatedContas = state.caixasContas.map(conta => {
          if (conta.id === transacao.contaId) {
            const fator = transacao.tipo === 'entrada' ? 1 : -1;
            const field = transacao.moeda === 'AOA' ? 'saldoAOA' : transacao.moeda === 'USD' ? 'saldoUSD' : 'saldoEUR';
            return { ...conta, [field]: conta[field] + (transacao.valor * fator) };
          }
          return conta;
        });

        return { 
          transacoes: [...state.transacoes, newTransacao],
          caixasContas: updatedContas
        };
      }),
      updateTransacao: (id, data) => set((state) => ({
        transacoes: state.transacoes.map((t) => t.id === id ? { ...t, ...data } : t)
      })),
      deleteTransacao: (id) => set((state) => {
        const transacao = state.transacoes.find(t => t.id === id);
        if (!transacao) return state;

        // Reverter saldo da conta
        const updatedContas = state.caixasContas.map(conta => {
          if (conta.id === transacao.contaId) {
            const fator = transacao.tipo === 'entrada' ? -1 : 1;
            const field = transacao.moeda === 'AOA' ? 'saldoAOA' : transacao.moeda === 'USD' ? 'saldoUSD' : 'saldoEUR';
            return { ...conta, [field]: conta[field] + (transacao.valor * fator) };
          }
          return conta;
        });

        return {
          transacoes: state.transacoes.filter((t) => t.id !== id),
          caixasContas: updatedContas
        };
      }),

      // Caixas/Contas
      addCaixaConta: (conta) => set((state) => ({
        caixasContas: [...state.caixasContas, { ...conta, id: String(Date.now()) }]
      })),
      updateCaixaConta: (id, data) => set((state) => ({
        caixasContas: state.caixasContas.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      toggleCaixa: (id) => set((state) => ({
        caixasContas: state.caixasContas.map(c => 
          c.id === id ? { ...c, aberto: !c.aberto, [!c.aberto ? 'ultimaAbertura' : 'ultimoFecho']: new Date() } : c
        )
      })),

      // Folha de Pagamento
      processarFolha: (mes, ano) => set((state) => {
        const novasFolhas: FolhaPagamento[] = state.funcionarios.filter(f => f.ativo).map(f => {
          const adiantamentosFunc = state.adiantamentos
            .filter(a => a.funcionarioId === f.id && a.status === 'pendente')
            .reduce((acc, curr) => acc + curr.valor, 0);
          
          const inss = f.salario * (state.config.fiscal.inssFuncionario / 100);
          // Cálculo de IRT (Angola - Tabela progressiva)
          const calcularIrt = (salario: number): number => {
            if (salario <= 100000) return 0;
            if (salario <= 200000) return (salario - 100000) * 0.13;
            return (100000 * 0.13) + ((salario - 200000) * 0.07);
          };
          const irt = calcularIrt(f.salario);

          return {
            id: `FP-${f.id}-${mes}-${ano}`,
            funcionarioId: f.id,
            mes, ano,
            salarioBase: f.salario,
            subsidios: 0,
            premios: 0,
            irt, inss,
            faltas: 0,
            adiantamentos: adiantamentosFunc,
            totalLiquido: f.salario - inss - irt - adiantamentosFunc,
            status: 'pendente'
          };
        });

        return { folhasPagamento: [...state.folhasPagamento, ...novasFolhas] };
      }),

      pagarFolha: (id, contaId) => set((state) => {
        const folha = state.folhasPagamento.find(f => f.id === id);
        if (!folha) return state;

        const funcionario = state.funcionarios.find(f => f.id === folha.funcionarioId);
        
        // Criar transação de saída
        const transacaoId = String(Date.now());
        const novaTransacao: Transacao = {
          id: transacaoId,
          tipo: 'saida',
          categoria: 'Salários',
          valor: folha.totalLiquido,
          moeda: 'AOA',
          taxaCambio: 1,
          data: new Date(),
          descricao: `Pagamento Salário - ${funcionario?.nome} - ${folha.mes}/${folha.ano}`,
          contaId,
          metodoPagamento: 'transferencia',
          status: 'concluido',
          reciboGerado: true
        };

        const updatedContas = state.caixasContas.map(c => 
          c.id === contaId ? { ...c, saldoAOA: c.saldoAOA - folha.totalLiquido } : c
        );

        return {
          folhasPagamento: state.folhasPagamento.map(f => f.id === id ? { ...f, status: 'pago', dataPagamento: new Date() } : f),
          transacoes: [...state.transacoes, novaTransacao],
          caixasContas: updatedContas
        };
      }),

      addAdiantamento: (adiantamento) => set((state) => ({
        adiantamentos: [...state.adiantamentos, { ...adiantamento, id: String(Date.now()) }]
      })),

      // Kanban
      tarefasKanban: mockTarefasKanban,
      addTarefaKanban: (tarefa) => set((state) => ({
        tarefasKanban: [...state.tarefasKanban, { ...tarefa, id: `tk-${Date.now()}` }]
      })),
      updateTarefaKanban: (id, data) => set((state) => ({
        tarefasKanban: state.tarefasKanban.map((t) => t.id === id ? { ...t, ...data } : t)
      })),
      deleteTarefaKanban: (id) => set((state) => ({
        tarefasKanban: state.tarefasKanban.filter((t) => t.id !== id)
      })),

      updateTaxas: (updated) => set((state) => ({
        taxasCambio: { ...state.taxasCambio, ...updated }
      })),

      // Config
      updateConfig: (data) => set((state) => ({
        config: {
          ...state.config,
          ...data,
          empresa: { ...state.config.empresa, ...(data.empresa || {}) },
          fiscal: { ...state.config.fiscal, ...(data.fiscal || {}) },
          sistema: { ...state.config.sistema, ...(data.sistema || {}) },
          meta: { ...state.config.meta, ...(data.meta || {}) },
        }
      })),

      // Meta Business
      sendMessage: (conversaId, texto, remetente, nomeAtendente) => set((state) => {
        const msg: Message = {
          id: String(Date.now()),
          conversaId,
          texto,
          remetente,
          timestamp: new Date(),
          lido: remetente === 'atendente',
          tipo: 'texto',
          nomeAtendente
        };
        const updatedMensagens = {
          ...state.mensagens,
          [conversaId]: [...(state.mensagens[conversaId] || []), msg]
        };
        const updatedConversas = state.conversas.map(c => 
          c.id === conversaId 
            ? { ...c, ultimaMensagem: texto, ultimaHora: new Date(), naoLidas: remetente === 'cliente' ? c.naoLidas + 1 : 0 }
            : c
        );
        return { mensagens: updatedMensagens, conversas: updatedConversas };
      }),
      togglePinConversa: (id) => set((state) => ({
        conversas: state.conversas.map(c => c.id === id ? { ...c, fixada: !c.fixada } : c)
      })),
      updateConversaStatus: (id, status) => set((state) => ({
        conversas: state.conversas.map(c => c.id === id ? { ...c, status } : c)
      })),
      deleteConversa: (id) => set((state) => ({
        conversas: state.conversas.filter(c => c.id !== id)
      })),

      sendChatInternoMessage: (chatId, texto, nomeAtendente) => set((state) => {
        const msg: ChatInternoMensagem = {
          id: String(Date.now()),
          conversaId: chatId,
          texto,
          remetente: 'atendente',
          nomeAtendente,
          timestamp: new Date(),
          tipo: 'texto',
          lida: true,
        };
        const updatedMensagens = {
          ...state.mensagensChatInterno,
          [chatId]: [...(state.mensagensChatInterno[chatId] || []), msg]
        };
        const updatedChats = state.chatsInternos.map(c => 
          c.id === chatId 
            ? { ...c, ultimaMensagem: texto, ultimaHora: new Date() }
            : c
        );
        return { mensagensChatInterno: updatedMensagens, chatsInternos: updatedChats };
      }),

      // Recepção
      receptionOpen: false,
      setReceptionOpen: (v) => set({ receptionOpen: v }),
      tarefasRecepcao: mockTarefasRecepcao,
      addTarefaRecepcao: (unidade, tarefa) => set((state) => ({
        tarefasRecepcao: {
          ...state.tarefasRecepcao,
          [unidade]: [
            ...state.tarefasRecepcao[unidade],
            { ...tarefa, id: `tr-${Date.now()}`, criadaEm: new Date() },
          ],
        },
      })),
      updateTarefaRecepcao: (unidade, id, data) => set((state) => ({
        tarefasRecepcao: {
          ...state.tarefasRecepcao,
          [unidade]: state.tarefasRecepcao[unidade].map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        },
      })),
      deleteTarefaRecepcao: (unidade, id) => set((state) => ({
        tarefasRecepcao: {
          ...state.tarefasRecepcao,
          [unidade]: state.tarefasRecepcao[unidade].filter((t) => t.id !== id),
        },
      })),
    }),
    {
      name: 'zuca-storage',
      partialize: (state) => ({
        clientes: state.clientes,
        viaturas: state.viaturas,
        ordensServico: state.ordensServico,
        faturas: state.faturas,
        estoque: state.estoque,
        agenda: state.agenda,
        funcionarios: state.funcionarios,
        fornecedores: state.fornecedores,
        transacoes: state.transacoes,
        conversas: state.conversas,
        mensagens: state.mensagens,
        config: state.config,
        caixasContas: state.caixasContas,
        folhasPagamento: state.folhasPagamento,
        adiantamentos: state.adiantamentos,
        taxasCambio: state.taxasCambio,
        tarefasKanban: state.tarefasKanban,
        tarefasRecepcao: state.tarefasRecepcao,
      }),
    }
  )
);
