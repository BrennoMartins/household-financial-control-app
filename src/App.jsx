import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const highlights = [
  {
    value: 'R$ 4.820',
    label: 'Orcamento mensal planejado',
  },
  {
    value: '62%',
    label: 'Essenciais ja mapeados',
  },
  {
    value: '3 metas',
    label: 'Reserva, viagem e reformas',
  },
];

const categories = [
  'Moradia e contas fixas',
  'Mercado e rotina da casa',
  'Transporte e educacao',
  'Lazer e objetivos da familia',
];

const navItems = ['Home', 'Cadastro', 'Dashboards', 'Database'];
const cadastroTabs = ['Pagamento', 'Categoria'];

const databaseColumns = [
  { key: 'owner-name', label: 'Responsavel', type: 'text', valueGetter: (payment) => payment.owner?.name },
  { key: 'payment-date', label: 'Pagamento', type: 'date' },
  { key: 'reference-date', label: 'Referencia', type: 'date' },
  { key: 'category-name', label: 'Categoria', type: 'text', valueGetter: (payment) => payment.category?.name },
  { key: 'description', label: 'Descricao', type: 'text' },
  { key: 'amount', label: 'Valor', type: 'currency' },
  { key: 'payment-method', label: 'Metodo', type: 'text' },
  { key: 'is-installments', label: 'Parcelado', type: 'boolean' },
  { key: 'number-installments', label: 'Parcelas', type: 'number' },
  { key: 'card-name', label: 'Cartao', type: 'text', valueGetter: (payment) => payment.card?.name },
  { key: 'is-fixed-expense', label: 'Fixo', type: 'boolean' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);

const formatBoolean = (value) => (value ? 'Sim' : 'Nao');

const getPaymentColumnValue = (payment, column) => {
  if (typeof column.valueGetter === 'function') {
    return column.valueGetter(payment);
  }

  return payment[column.key];
};

const getPaymentComparableValue = (payment, column) => {
  const rawValue = getPaymentColumnValue(payment, column);

  if (column.type === 'number' || column.type === 'currency') {
    return Number(rawValue) || 0;
  }

  if (column.type === 'boolean') {
    return rawValue ? 1 : 0;
  }

  return String(rawValue ?? '').toLowerCase();
};

const formatPaymentCell = (payment, column) => {
  const value = getPaymentColumnValue(payment, column);

  if (value == null || value === '') {
    return '-';
  }

  if (column.type === 'currency') {
    return formatCurrency(value);
  }

  if (column.type === 'boolean') {
    return formatBoolean(value);
  }

  return String(value);
};

const matchesPaymentFilter = (payment, column, filterValue) => {
  if (!filterValue) {
    return true;
  }

  const rawValue = getPaymentColumnValue(payment, column);

  if (column.type === 'boolean') {
    return String(Boolean(rawValue)) === filterValue;
  }

  if (column.type === 'date') {
    return String(rawValue ?? '').startsWith(filterValue);
  }

  if (column.type === 'number' || column.type === 'currency') {
    return String(rawValue ?? '').includes(filterValue);
  }

  return String(rawValue ?? '').toLowerCase().includes(filterValue.toLowerCase());
};

function HomePage() {
  return (
    <main className="hero-layout">
      <section className="hero-copy">
        <span className="eyebrow">Household Financial</span>
        <h1>Organize a vida financeira da casa em um unico painel.</h1>
        <p className="lead">
          Planeje gastos, acompanhe metas e deixe as decisoes da familia mais claras com uma visao
          simples do que entra, sai e precisa de atencao.
        </p>

        <div className="hero-actions">
          <button type="button" className="primary-btn">
            Criar meu planejamento
          </button>
          <button type="button" className="ghost-btn">
            Ver demonstracao
          </button>
        </div>

        <div className="highlights-grid">
          {highlights.map((item) => (
            <article key={item.label} className="metric-card">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <aside className="dashboard-card">
        <div className="dashboard-card__top">
          <div>
            <p className="section-label">Resumo da semana</p>
            <h2>Fluxo familiar equilibrado</h2>
          </div>
          <span className="status-pill">+12% previsibilidade</span>
        </div>

        <div className="budget-ring">
          <div>
            <span>Saldo disponivel</span>
            <strong>R$ 1.940</strong>
          </div>
        </div>

        <div className="category-list">
          {categories.map((category, index) => (
            <div key={category} className="category-row">
              <div>
                <span>{category}</span>
                <small>Prioridade {index + 1}</small>
              </div>
              <strong>{[82, 67, 54, 38][index]}%</strong>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}

function PaymentForm() {
  const getNextReferencePeriod = () => {
    const today = new Date();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    return {
      year: nextMonthDate.getFullYear(),
      month: nextMonthDate.getMonth() + 1,
    };
  };

  const getNextReferenceMonthValue = () => {
    const { year, month } = getNextReferencePeriod();

    return `${year}-${String(month).padStart(2, '0')}`;
  };

  const [paymentDate, setPaymentDate] = useState('2026-05-10');
  const [paymentReferenceMonth, setPaymentReferenceMonth] = useState('2026-05');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardId, setCardId] = useState('');
  const [isInstallments, setIsInstallments] = useState(false);
  const [numberInstallments, setNumberInstallments] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [isFixedExpense, setIsFixedExpense] = useState(false);
  const [amount, setAmount] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [cards, setCards] = useState([]);
  const [paymentCategories, setPaymentCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState({ type: '', message: '' });
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [isLoadingMonthlyPayments, setIsLoadingMonthlyPayments] = useState(true);
  const [monthlyPaymentsReferenceMonth, setMonthlyPaymentsReferenceMonth] = useState(
    getNextReferenceMonthValue(),
  );

  const parseCurrencyInput = (value) => {
    const digitsOnly = String(value).replace(/\D/g, '');

    if (!digitsOnly) {
      return 0;
    }

    return Number(digitsOnly) / 100;
  };

  const handleAmountChange = (nextValue) => {
    const normalizedAmount = parseCurrencyInput(nextValue);

    if (!normalizedAmount) {
      setAmount('');
      return;
    }

    setAmount(formatCurrency(normalizedAmount));
  };

  const updateInstallments = (nextValue) => {
    const parsedValue = Number.parseInt(String(nextValue), 10);

    if (Number.isNaN(parsedValue)) {
      setNumberInstallments('1');
      setIsInstallments(false);
      return;
    }

    const normalizedInstallments = Math.max(1, parsedValue);

    setNumberInstallments(String(normalizedInstallments));
    setIsInstallments(normalizedInstallments > 1);
  };

  const loadPaymentOptions = async () => {
    setIsLoadingOptions(true);

    try {
      const [cardsResponse, categoriesResponse, ownersResponse] = await Promise.all([
        fetch('http://localhost:3000/card'),
        fetch('http://localhost:3000/category'),
        fetch('http://localhost:3000/owner'),
      ]);

      if (!cardsResponse.ok || !categoriesResponse.ok || !ownersResponse.ok) {
        throw new Error('Nao foi possivel carregar as opcoes do pagamento.');
      }

      const [cardsData, categoriesData, ownersData] = await Promise.all([
        cardsResponse.json(),
        categoriesResponse.json(),
        ownersResponse.json(),
      ]);

      const nextCards = Array.isArray(cardsData.cards) ? cardsData.cards : [];
      const nextCategories = Array.isArray(categoriesData.categories) ? categoriesData.categories : [];
      const nextOwners = Array.isArray(ownersData.owners) ? ownersData.owners : [];

      setCards(nextCards);
      setPaymentCategories(nextCategories);
      setOwners(nextOwners);

      setCardId((currentValue) => currentValue || String(nextCards[0]?.id ?? ''));
      setCategoryId((currentValue) => currentValue || String(nextCategories[0]?.id ?? ''));
      setOwnerId((currentValue) => currentValue || String(nextOwners[0]?.id ?? ''));
    } catch (error) {
      setPaymentFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Erro inesperado ao carregar as opcoes do pagamento.',
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const loadMonthlyPayments = async (referenceMonth = monthlyPaymentsReferenceMonth) => {
    const [year, month] = String(referenceMonth).split('-');

    if (!year || !month) {
      setPaymentFeedback({
        type: 'error',
        message: 'Selecione um mes/ano valido para listar os pagamentos.',
      });
      setMonthlyPayments([]);
      setIsLoadingMonthlyPayments(false);
      return;
    }

    setIsLoadingMonthlyPayments(true);

    try {
      const response = await fetch(
        `http://localhost:3000/payment/monthly-reference?year=${year}&month=${month}`,
      );

      if (!response.ok) {
        throw new Error('Nao foi possivel carregar a listagem de pagamentos.');
      }

      const data = await response.json();
      setMonthlyPayments(Array.isArray(data.payments) ? data.payments : []);
    } catch (error) {
      setPaymentFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Erro inesperado ao carregar os pagamentos.',
      });
    } finally {
      setIsLoadingMonthlyPayments(false);
    }
  };

  useEffect(() => {
    loadPaymentOptions();
  }, []);

  useEffect(() => {
    loadMonthlyPayments(monthlyPaymentsReferenceMonth);
  }, [monthlyPaymentsReferenceMonth]);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    const normalizedAmount = parseCurrencyInput(amount);

    if (!cardId || !categoryId || !ownerId) {
      setPaymentFeedback({
        type: 'error',
        message: 'Selecione cartao, categoria e responsavel antes de salvar.',
      });
      return;
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setPaymentFeedback({
        type: 'error',
        message: 'Informe um valor valido maior que zero.',
      });
      return;
    }

    setIsSubmittingPayment(true);
    setPaymentFeedback({ type: '', message: '' });

    try {
      const normalizedReferenceDate = `${paymentReferenceMonth}-01`;
      const normalizedInstallments = Math.max(1, Number.parseInt(numberInstallments, 10) || 1);

      const response = await fetch('http://localhost:3000/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'payment-date': paymentDate,
          'reference-date': normalizedReferenceDate,
          'payment-method': paymentMethod,
          'card-id': Number(cardId),
          'is-installments': isInstallments,
          'number-installments': normalizedInstallments,
          'quantity-installments': normalizedInstallments,
          'category-id': Number(categoryId),
          'is-fixed-expense': isFixedExpense,
          amount: normalizedAmount,
          'owner-id': Number(ownerId),
        }),
      });

      if (!response.ok) {
        throw new Error('Nao foi possivel cadastrar o pagamento.');
      }

      setPaymentFeedback({ type: 'success', message: 'Pagamento cadastrado com sucesso.' });
      await loadMonthlyPayments();
      setIsInstallments(false);
      setNumberInstallments('1');
      setAmount('');
    } catch (error) {
      setPaymentFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro inesperado ao cadastrar o pagamento.',
      });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="form-grid">
      <article className="content-card">
        <h2>Novo lancamento</h2>
        <p className="card-copy">Preencha os dados do pagamento e selecione cartao, categoria e responsavel nos combos carregados pela API.</p>
        <form className="page-form" onSubmit={handlePaymentSubmit}>
          <div className="field-grid">
            <label className="field">
              <span>Data do pagamento</span>
              <input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
            </label>
            <label className="field">
              <span>Mes/Ano Pagamento</span>
              <input
                type="month"
                value={paymentReferenceMonth}
                onChange={(event) => setPaymentReferenceMonth(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Metodo de pagamento</span>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="debit-card">Debito</option>
                <option value="credit-card">Credito</option>
              </select>
            </label>
            <label className="field">
              <span>Cartao</span>
              <select value={cardId} onChange={(event) => setCardId(event.target.value)} disabled={isLoadingOptions || cards.length === 0}>
                <option value="">Selecione</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Categoria</span>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                disabled={isLoadingOptions || paymentCategories.length === 0}
              >
                <option value="">Selecione</option>
                {paymentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Responsavel</span>
              <select value={ownerId} onChange={(event) => setOwnerId(event.target.value)} disabled={isLoadingOptions || owners.length === 0}>
                <option value="">Selecione</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Valor</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={amount}
                onChange={(event) => handleAmountChange(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Numero de parcelas</span>
              <div className="stepper-field">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => updateInstallments(Number(numberInstallments) - 1)}
                  aria-label="Diminuir numero de parcelas"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={numberInstallments}
                  onChange={(event) => updateInstallments(event.target.value)}
                />
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => updateInstallments(Number(numberInstallments) + 1)}
                  aria-label="Aumentar numero de parcelas"
                >
                  +
                </button>
              </div>
            </label>
          </div>

          <div className="toggle-grid">
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={isInstallments}
                onChange={(event) => {
                  setIsInstallments(event.target.checked);

                  if (!event.target.checked) {
                    setNumberInstallments('1');
                  } else if (Number(numberInstallments) < 2) {
                    setNumberInstallments('2');
                  }
                }}
              />
              <span>Compra parcelada</span>
            </label>
            <label className="toggle-field">
              <input
                type="checkbox"
                checked={isFixedExpense}
                onChange={(event) => setIsFixedExpense(event.target.checked)}
              />
              <span>Despesa fixa</span>
            </label>
          </div>

          {paymentFeedback.message ? (
            <p className={paymentFeedback.type === 'success' ? 'form-feedback success' : 'form-feedback error'}>
              {paymentFeedback.message}
            </p>
          ) : null}

          <button type="submit" className="primary-btn full-width-btn" disabled={isSubmittingPayment || isLoadingOptions}>
            {isSubmittingPayment ? 'Salvando...' : 'Salvar lancamento'}
          </button>
        </form>
      </article>

      <article className="content-card accent-card">
        <div className="card-header-row">
          <div>
            <span className="section-label section-label--light">GET /payment/monthly-reference</span>
            <h2>Pagamentos por mes de referencia</h2>
          </div>
          <button
            type="button"
            className="ghost-btn ghost-btn--light"
            onClick={() => loadMonthlyPayments(monthlyPaymentsReferenceMonth)}
          >
            Atualizar
          </button>
        </div>

        <p className="card-copy card-copy--light">
          Selecione o mes/ano desejado para consultar a API com o periodo informado.
        </p>

        <label className="field">
          <span>Mes/Ano da listagem</span>
          <input
            type="month"
            value={monthlyPaymentsReferenceMonth}
            onChange={(event) => setMonthlyPaymentsReferenceMonth(event.target.value)}
          />
        </label>

        <div className="table-wrap table-wrap--light">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Parcelas</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingMonthlyPayments ? (
                <tr>
                  <td colSpan="3">Carregando pagamentos...</td>
                </tr>
              ) : null}

              {!isLoadingMonthlyPayments && monthlyPayments.length === 0 ? (
                <tr>
                  <td colSpan="3">Nenhum pagamento encontrado para o mes/ano selecionado.</td>
                </tr>
              ) : null}

              {!isLoadingMonthlyPayments
                ? monthlyPayments.map((payment, index) => (
                    <tr key={`${payment.category_name}-${payment.quantity_installments}-${payment.number_installments}-${index}`}>
                      <td>{payment.category_name}</td>
                      <td>{`${payment.quantity_installments}/${payment.number_installments}`}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

function CategoryForm() {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [categoryRows, setCategoryRows] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const loadCategories = async () => {
    setIsLoadingCategories(true);

    try {
      const response = await fetch('http://localhost:3000/category');

      if (!response.ok) {
        throw new Error('Nao foi possivel carregar as categorias cadastradas.');
      }

      const data = await response.json();
      setCategoryRows(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Erro inesperado ao buscar categorias cadastradas.',
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFeedback({ type: 'error', message: 'Informe o nome da categoria antes de salvar.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await fetch('http://localhost:3000/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        throw new Error('Nao foi possivel cadastrar a categoria.');
      }

      setName('');
      setFeedback({ type: 'success', message: 'Categoria cadastrada com sucesso.' });
      await loadCategories();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro inesperado ao cadastrar categoria.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-grid cadastro-form-grid">
      <article className="content-card">
        <h2>Nova categoria</h2>
        <p className="card-copy">Use o endpoint de categorias para adicionar novos tipos de gasto ou receita.</p>
        <form className="page-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome da categoria</span>
            <input
              type="text"
              placeholder="Ex.: Farmacia"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          {feedback.message ? (
            <p className={feedback.type === 'success' ? 'form-feedback success' : 'form-feedback error'}>
              {feedback.message}
            </p>
          ) : null}

          <button type="submit" className="primary-btn full-width-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar categoria'}
          </button>
        </form>
      </article>

      <article className="content-card accent-card">
        <div className="card-header-row">
          <div>
            <span className="section-label section-label--light">GET /category</span>
            <h2>Categorias cadastradas</h2>
          </div>
          <button type="button" className="ghost-btn ghost-btn--light" onClick={loadCategories}>
            Atualizar
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingCategories ? (
                <tr>
                  <td colSpan="2">Carregando categorias...</td>
                </tr>
              ) : null}

              {!isLoadingCategories && categoryRows.length === 0 ? (
                <tr>
                  <td colSpan="2">Nenhuma categoria cadastrada.</td>
                </tr>
              ) : null}

              {!isLoadingCategories
                ? categoryRows.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td>{category.name}</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}

function CadastroPage() {
  const [activeTab, setActiveTab] = useState('Pagamento');

  const renderCadastroContent = () => {
    if (activeTab === 'Pagamento') {
      return <PaymentForm />;
    }

    return <CategoryForm />;
  };

  return (
    <section className="content-panel page-stack">
      <div className="subnav" aria-label="Tipos de cadastro">
        {cadastroTabs.map((item) => (
          <button
            key={item}
            type="button"
            className={item === activeTab ? 'subnav-link active' : 'subnav-link'}
            onClick={() => setActiveTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {renderCadastroContent()}
    </section>
  );
}

const DASH_COLORS = [
  '#386641', '#ffd166', '#2ec4b6', '#e76f51', '#264653',
  '#a8dadc', '#457b9d', '#e9c46a', '#f4a261', '#e63946',
];
const OWNER_COLORS = ['#386641', '#ffd166', '#2ec4b6'];
const CARD_COLORS = ['#14213d', '#386641', '#ffd166'];
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.96)',
  border: '1px solid rgba(20,33,61,0.12)',
  borderRadius: '14px',
  boxShadow: '0 12px 30px rgba(20,33,61,0.12)',
  fontFamily: 'inherit',
};

function formatMonthLabel(key) {
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[Number(month) - 1]}/${String(year).slice(2)}`;
}

function DashboardsPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashError, setDashError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setDashError('');
      try {
        const res = await fetch('http://localhost:3000/payment');
        if (!res.ok) throw new Error('Nao foi possivel carregar os pagamentos.');
        const data = await res.json();
        setPayments(Array.isArray(data.payments) ? data.payments : []);
      } catch (e) {
        setDashError(e instanceof Error ? e.message : 'Erro inesperado.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const availableMonths = [...new Set(
    payments
      .map((p) => (p['reference-date'] ?? '').substring(0, 7))
      .filter((k) => k.length === 7),
  )].sort();

  const visiblePayments = selectedMonth
    ? payments.filter((p) => (p['reference-date'] ?? '').startsWith(selectedMonth))
    : payments;

  // visiblePayments filtrado também por owner (usado em todos os gráficos exceto o de owner)
  const ownerFilteredPayments = selectedOwner
    ? visiblePayments.filter((p) => (p.owner?.name ?? 'Desconhecido') === selectedOwner)
    : visiblePayments;

  const totalAmount = ownerFilteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const fixedAmount = ownerFilteredPayments.filter((p) => p['is-fixed-expense']).reduce((sum, p) => sum + p.amount, 0);
  const installmentsAmount = ownerFilteredPayments.filter((p) => p['is-installments']).reduce((sum, p) => sum + p.amount, 0);
  const variableAmount = ownerFilteredPayments.filter((p) => !p['is-fixed-expense']).reduce((sum, p) => sum + p.amount, 0);

  const byCategory = Object.values(
    ownerFilteredPayments.reduce((acc, p) => {
      const name = p.category?.name ?? 'Sem categoria';
      if (!acc[name]) acc[name] = { name, value: 0 };
      acc[name].value += p.amount;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const byOwner = Object.values(
    visiblePayments.reduce((acc, p) => {
      const name = p.owner?.name ?? 'Desconhecido';
      if (!acc[name]) acc[name] = { name, value: 0 };
      acc[name].value += p.amount;
      return acc;
    }, {}),
  );

  const byCard = Object.values(
    ownerFilteredPayments.reduce((acc, p) => {
      const name = p.card?.name ?? 'Desconhecido';
      if (!acc[name]) acc[name] = { name, value: 0 };
      acc[name].value += p.amount;
      return acc;
    }, {}),
  );

  // Projecao mensal filtra por owner se selecionado, mas sempre exibe todos os meses como contexto
  const byMonthSource = selectedOwner
    ? payments.filter((p) => (p.owner?.name ?? 'Desconhecido') === selectedOwner)
    : payments;

  const byMonth = Object.values(
    byMonthSource.reduce((acc, p) => {
      const ref = p['reference-date'] ?? '';
      const key = ref.substring(0, 7);
      if (key.length < 7) return acc;
      if (!acc[key]) {
        acc[key] = { key, month: formatMonthLabel(key), value: 0 };
      }
      acc[key].value += p.amount;
      return acc;
    }, {}),
  ).sort((a, b) => a.key.localeCompare(b.key));

  const fixedVsVariable = [
    { name: 'Fixo', value: parseFloat(fixedAmount.toFixed(2)) },
    { name: 'Variavel', value: parseFloat(variableAmount.toFixed(2)) },
  ];

  const kpiCards = [
    { label: 'Total no periodo', value: formatCurrency(totalAmount), color: '#386641' },
    { label: 'Despesas fixas', value: formatCurrency(fixedAmount), color: '#14213d' },
    { label: 'Total parcelado', value: formatCurrency(installmentsAmount), color: '#2ec4b6' },
    { label: 'Gastos variaveis', value: formatCurrency(variableAmount), color: '#e76f51' },
  ];

  if (isLoading) {
    return (
      <section className="content-panel page-stack">
        <div className="section-heading">
          <span className="eyebrow">Dashboards</span>
          <h1>Carregando dados...</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="content-panel page-stack">
      <div className="section-heading">
        <span className="eyebrow">Dashboards</span>
        <h1>Visao financeira geral</h1>
        <p className="lead compact-lead">
          Analise seus gastos por categoria, responsavel, cartao e projecao mensal com base nos lancamentos cadastrados.
        </p>
      </div>

      {dashError ? <p className="form-feedback error">{dashError}</p> : null}

      <div className="dash-filter-bar">
        <label className="dash-filter-label" htmlFor="dash-month-select">Mes de referencia</label>
        <select
          id="dash-month-select"
          className="dash-month-select"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
        >
          <option value="">Todos os meses</option>
          {availableMonths.map((key) => (
            <option key={key} value={key}>
              {formatMonthLabel(key)}
            </option>
          ))}
        </select>
      </div>

      <div className="dash-kpi-grid">
        {kpiCards.map((card) => (
          <article key={card.label} className="content-card dash-kpi-card">
            <span className="dash-kpi-value" style={{ color: card.color }}>{card.value}</span>
            <span className="dash-kpi-label">{card.label}</span>
          </article>
        ))}
      </div>

      <div className="dash-charts-grid">
        <article className="content-card">
          <span className="section-label">Top Categorias</span>
          <h2>Maiores gastos por categoria</h2>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={byCategory}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 8, left: 110 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,33,61,0.08)" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                tick={{ fill: 'rgba(20,33,61,0.55)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'rgba(20,33,61,0.7)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Total']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={26}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={DASH_COLORS[i % DASH_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="content-card">
          <span className="section-label">Responsavel</span>
          <h2>Distribuicao por responsavel</h2>
          {selectedOwner ? (
            <p className="card-copy">
              Filtrando todos os graficos por: <strong>{selectedOwner}</strong>{' '}·{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => setSelectedOwner(null)}
              >
                Limpar filtro
              </button>
            </p>
          ) : (
            <p className="card-copy">Clique em uma fatia para filtrar todos os graficos pelo responsavel.</p>
          )}
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={byOwner}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="46%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'rgba(20,33,61,0.3)' }}
                onClick={(data) => setSelectedOwner(selectedOwner === data.name ? null : data.name)}
                style={{ cursor: 'pointer' }}
              >
                {byOwner.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={OWNER_COLORS[i % OWNER_COLORS.length]}
                    opacity={!selectedOwner || selectedOwner === entry.name ? 1 : 0.35}
                    stroke={selectedOwner === entry.name ? '#14213d' : 'none'}
                    strokeWidth={selectedOwner === entry.name ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Total']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>

      <article className="content-card">
        <span className="section-label">Projecao Mensal</span>
        <h2>Total por mes de referencia da fatura</h2>
        <p className="card-copy">
          {selectedMonth
            ? `Mes selecionado destacado. Grafico exibe todos os meses como contexto.`
            : 'Distribuicao dos lancamentos ao longo dos meses de competencia.'}
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byMonth} margin={{ top: 8, right: 24, bottom: 8, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,33,61,0.08)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: 'rgba(20,33,61,0.6)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              tick={{ fill: 'rgba(20,33,61,0.6)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), 'Total']}
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={52}>
              {byMonth.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={
                    !selectedMonth || entry.key === selectedMonth
                      ? '#386641'
                      : 'rgba(20,33,61,0.12)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </article>

      <div className="dash-charts-grid">
        <article className="content-card">
          <span className="section-label">Cartao</span>
          <h2>Gastos por cartao</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={byCard}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="46%"
                outerRadius={105}
                innerRadius={52}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'rgba(20,33,61,0.3)' }}
              >
                {byCard.map((_, i) => (
                  <Cell key={i} fill={CARD_COLORS[i % CARD_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Total']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="content-card">
          <span className="section-label">Tipo de Gasto</span>
          <h2>Fixo vs Variavel</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={fixedVsVariable}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="46%"
                outerRadius={105}
                innerRadius={52}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'rgba(20,33,61,0.3)' }}
              >
                <Cell fill="#386641" />
                <Cell fill="#ffd166" />
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Total']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>

    </section>
  );
}

function DatabasePage() {
  const [payments, setPayments] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [databaseFeedback, setDatabaseFeedback] = useState({ type: '', message: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'description', direction: 'asc' });
  const [filters, setFilters] = useState(() =>
    databaseColumns.reduce((accumulator, column) => {
      accumulator[column.key] = '';
      return accumulator;
    }, {}),
  );

  const loadPayments = async () => {
    setIsLoadingPayments(true);

    try {
      const response = await fetch('http://localhost:3000/payment');

      if (!response.ok) {
        throw new Error('Nao foi possivel carregar os pagamentos do database.');
      }

      const data = await response.json();
      setPayments(Array.isArray(data.payments) ? data.payments : []);
      setDatabaseFeedback({ type: '', message: '' });
    } catch (error) {
      setPayments([]);
      setDatabaseFeedback({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Erro inesperado ao carregar o database.',
      });
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleFilterChange = (columnKey, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [columnKey]: value,
    }));
  };

  const handleSort = (columnKey) => {
    setSortConfig((currentConfig) => {
      if (currentConfig.key === columnKey) {
        return {
          key: columnKey,
          direction: currentConfig.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return { key: columnKey, direction: 'asc' };
    });
  };

  const filteredPayments = payments.filter((payment) =>
    databaseColumns.every((column) => matchesPaymentFilter(payment, column, filters[column.key])),
  );

  const sortedPayments = [...filteredPayments].sort((leftPayment, rightPayment) => {
    const activeColumn = databaseColumns.find((column) => column.key === sortConfig.key);

    if (!activeColumn) {
      return 0;
    }

    const leftValue = getPaymentComparableValue(leftPayment, activeColumn);
    const rightValue = getPaymentComparableValue(rightPayment, activeColumn);

    if (leftValue === rightValue) {
      return 0;
    }

    if (leftValue > rightValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }

    return sortConfig.direction === 'asc' ? -1 : 1;
  });

  return (
    <section className="content-panel page-stack">
      <div className="section-heading">
        <span className="eyebrow">Database</span>
        <h1>Consulte todos os pagamentos em uma tabela unica.</h1>
        <p className="lead compact-lead">
          Use os filtros por coluna e clique no cabecalho para ordenar qualquer campo retornado pela API.
        </p>
      </div>

      <article className="content-card database-card">
        <div className="card-header-row">
          <div>
            <span className="section-label">GET /payment</span>
            <h2>Base completa de pagamentos</h2>
          </div>
          <button type="button" className="ghost-btn" onClick={loadPayments}>
            Atualizar
          </button>
        </div>

        <p className="card-copy">
          {filteredPayments.length} de {payments.length} pagamentos exibidos.
        </p>

        {databaseFeedback.message ? (
          <p className={databaseFeedback.type === 'success' ? 'form-feedback success' : 'form-feedback error'}>
            {databaseFeedback.message}
          </p>
        ) : null}

        <div className="table-wrap table-wrap--database">
          <table className="data-table data-table--dark">
            <thead>
              <tr>
                {databaseColumns.map((column) => {
                  const isActiveSort = sortConfig.key === column.key;
                  const directionLabel = isActiveSort && sortConfig.direction === 'asc' ? '↑' : '↓';

                  return (
                    <th key={column.key}>
                      <button
                        type="button"
                        className={isActiveSort ? 'table-sort active' : 'table-sort'}
                        onClick={() => handleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        <span>{isActiveSort ? directionLabel : '↕'}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
              <tr className="filter-row">
                {databaseColumns.map((column) => (
                  <th key={`${column.key}-filter`}>
                    {column.type === 'boolean' ? (
                      <select
                        className="table-filter"
                        value={filters[column.key]}
                        onChange={(event) => handleFilterChange(column.key, event.target.value)}
                      >
                        <option value="">Todos</option>
                        <option value="true">Sim</option>
                        <option value="false">Nao</option>
                      </select>
                    ) : (
                      <input
                        className="table-filter"
                        type={column.type === 'date' ? 'date' : column.type === 'number' ? 'number' : 'text'}
                        placeholder={`Filtrar ${column.label}`}
                        value={filters[column.key]}
                        onChange={(event) => handleFilterChange(column.key, event.target.value)}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoadingPayments ? (
                <tr>
                  <td colSpan={databaseColumns.length}>Carregando pagamentos...</td>
                </tr>
              ) : null}

              {!isLoadingPayments && sortedPayments.length === 0 ? (
                <tr>
                  <td colSpan={databaseColumns.length}>Nenhum pagamento encontrado com os filtros atuais.</td>
                </tr>
              ) : null}

              {!isLoadingPayments
                ? sortedPayments.map((payment) => (
                    <tr key={payment.id}>
                      {databaseColumns.map((column) => (
                        <td key={`${payment.id}-${column.key}`}>{formatPaymentCell(payment, column)}</td>
                      ))}
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function App() {
  const [activePage, setActivePage] = useState('Home');

  const renderPage = () => {
    if (activePage === 'Cadastro') {
      return <CadastroPage />;
    }

    if (activePage === 'Dashboards') {
      return <DashboardsPage />;
    }

    if (activePage === 'Database') {
      return <DatabasePage />;
    }

    return <HomePage />;
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <span className="eyebrow">Controle Familiar</span>
          <strong>Household Financial</strong>
        </div>

        <nav className="main-nav" aria-label="Paginas principais">
          {navItems.map((item) => (
            <button
              key={item}
              type="button"
              className={item === activePage ? 'nav-link active' : 'nav-link'}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      {renderPage()}
    </div>
  );
}

export default App;