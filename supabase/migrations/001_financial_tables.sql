-- ============================================================
-- ZucaMotors ERP — Financial Schema
-- Migration: 001_financial_tables
-- ============================================================

-- Enum de moedas suportadas
CREATE TYPE currency_code AS ENUM ('AOA', 'USD', 'EUR');

-- Enum de estado de transacção
CREATE TYPE transaction_status AS ENUM ('concluido', 'pendente', 'reconciliado');

-- Enum de método de pagamento
CREATE TYPE payment_method AS ENUM (
  'numerario', 'transferencia', 'multibanco',
  'tpa', 'multicaixa_express', 'cheque'
);

-- Enum de estado de fatura
CREATE TYPE invoice_status AS ENUM ('rascunho', 'emitida', 'paga', 'cancelada');

-- Enum de estado de folha/adiantamento
CREATE TYPE payroll_status AS ENUM ('pendente', 'pago');

-- ─────────────────────────────────────────────
-- Tabela: exchange_rates (cache BNA)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exchange_rates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency     currency_code NOT NULL,
  rate_to_aoa  NUMERIC(12, 4) NOT NULL,
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source       TEXT DEFAULT 'bna', -- 'bna' | 'manual' | 'fallback'
  UNIQUE (currency, fetched_at)
);

CREATE INDEX idx_exchange_rates_currency_date ON exchange_rates (currency, fetched_at DESC);

-- ─────────────────────────────────────────────
-- Tabela: financial_transactions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS financial_transactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo                  TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria             TEXT NOT NULL,
  valor                 NUMERIC(14, 2) NOT NULL CHECK (valor > 0),
  moeda                 currency_code NOT NULL DEFAULT 'AOA',
  taxa_cambio_applied   NUMERIC(12, 4) NOT NULL DEFAULT 1,
  valor_aoa             NUMERIC(14, 2) GENERATED ALWAYS AS (valor * taxa_cambio_applied) STORED,
  data                  DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao             TEXT,
  fornecedor_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cliente_id            UUID,
  os_id                 UUID,
  conta_id              TEXT NOT NULL,
  metodo_pagamento      payment_method NOT NULL,
  status                transaction_status NOT NULL DEFAULT 'concluido',
  recibo_gerado         BOOLEAN NOT NULL DEFAULT FALSE,
  iva                   NUMERIC(14, 2),
  retencao              NUMERIC(14, 2),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_data    ON financial_transactions (data DESC);
CREATE INDEX idx_transactions_tipo    ON financial_transactions (tipo);
CREATE INDEX idx_transactions_moeda   ON financial_transactions (moeda);
CREATE INDEX idx_transactions_conta   ON financial_transactions (conta_id);

-- ─────────────────────────────────────────────
-- Tabela: invoices (faturas)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero                TEXT NOT NULL UNIQUE,
  cliente_id            TEXT NOT NULL,
  os_id                 TEXT,
  data_emissao          DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento       DATE,
  subtotal              NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
  iva                   NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total                 NUMERIC(14, 2) NOT NULL CHECK (total >= 0),
  moeda                 currency_code NOT NULL DEFAULT 'AOA',
  taxa_cambio_applied   NUMERIC(12, 4) NOT NULL DEFAULT 1,
  total_aoa             NUMERIC(14, 2) GENERATED ALWAYS AS (total * taxa_cambio_applied) STORED,
  status                invoice_status NOT NULL DEFAULT 'emitida',
  meio_pagamento        payment_method,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_status       ON invoices (status);
CREATE INDEX idx_invoices_data_emissao ON invoices (data_emissao DESC);
CREATE INDEX idx_invoices_cliente      ON invoices (cliente_id);

-- ─────────────────────────────────────────────
-- Tabela: salary_advances (adiantamentos)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_advances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id  TEXT NOT NULL,
  valor           NUMERIC(14, 2) NOT NULL CHECK (valor > 0),
  moeda           currency_code NOT NULL DEFAULT 'AOA',
  taxa_cambio_applied NUMERIC(12, 4) NOT NULL DEFAULT 1,
  data            DATE NOT NULL DEFAULT CURRENT_DATE,
  status          payroll_status NOT NULL DEFAULT 'pendente',
  motivo          TEXT,
  aprovado_por    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_advances_funcionario ON salary_advances (funcionario_id);
CREATE INDEX idx_advances_status      ON salary_advances (status);

-- ─────────────────────────────────────────────
-- Tabela: payroll (folhas de pagamento)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id      TEXT NOT NULL,
  mes                 SMALLINT NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano                 SMALLINT NOT NULL CHECK (ano >= 2020),
  salario_base        NUMERIC(14, 2) NOT NULL CHECK (salario_base >= 0),
  subsidios           NUMERIC(14, 2) NOT NULL DEFAULT 0,
  premios             NUMERIC(14, 2) NOT NULL DEFAULT 0,
  irt                 NUMERIC(14, 2) NOT NULL DEFAULT 0,
  inss                NUMERIC(14, 2) NOT NULL DEFAULT 0,
  faltas              NUMERIC(14, 2) NOT NULL DEFAULT 0,
  adiantamentos       NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_liquido       NUMERIC(14, 2) NOT NULL CHECK (total_liquido >= 0),
  moeda               currency_code NOT NULL DEFAULT 'AOA',
  taxa_cambio_applied NUMERIC(12, 4) NOT NULL DEFAULT 1,
  status              payroll_status NOT NULL DEFAULT 'pendente',
  data_pagamento      DATE,
  conta_id            TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (funcionario_id, mes, ano)
);

CREATE INDEX idx_payroll_funcionario ON payroll (funcionario_id);
CREATE INDEX idx_payroll_periodo     ON payroll (ano DESC, mes DESC);
CREATE INDEX idx_payroll_status      ON payroll (status);

-- ─────────────────────────────────────────────
-- Trigger: updated_at automático
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- Row Level Security (RLS)
-- ─────────────────────────────────────────────
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices                ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_advances         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates          ENABLE ROW LEVEL SECURITY;

-- Exchange rates são públicos (leitura)
CREATE POLICY "exchange_rates_read_all" ON exchange_rates
  FOR SELECT USING (true);

-- Transacções, faturas, folha: apenas utilizadores autenticados
CREATE POLICY "transactions_authenticated" ON financial_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "invoices_authenticated" ON invoices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "advances_authenticated" ON salary_advances
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "payroll_authenticated" ON payroll
  FOR ALL USING (auth.role() = 'authenticated');
