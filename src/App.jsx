import { useEffect, useState } from 'react';

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

const navItems = ['Home', 'Cadastro', 'Dashboards'];
const cadastroTabs = ['Pagamento', 'Categoria'];

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

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const [paymentDate, setPaymentDate] = useState('2026-05-10');
  const [paymentReferenceMonth, setPaymentReferenceMonth] = useState('2026-05');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardId, setCardId] = useState('');
  const [isInstallments, setIsInstallments] = useState(false);
  const [numberInstallments, setNumberInstallments] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [isFixedExpense, setIsFixedExpense] = useState(false);
  const [amount, setAmount] = useState('100.00');
  const [ownerId, setOwnerId] = useState('');
  const [cards, setCards] = useState([]);
  const [paymentCategories, setPaymentCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentFeedback, setPaymentFeedback] = useState({ type: '', message: '' });
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [isLoadingMonthlyPayments, setIsLoadingMonthlyPayments] = useState(true);

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

  const loadMonthlyPayments = async () => {
    const { year, month } = getNextReferencePeriod();

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
    loadMonthlyPayments();
  }, []);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    if (!cardId || !categoryId || !ownerId) {
      setPaymentFeedback({
        type: 'error',
        message: 'Selecione cartao, categoria e responsavel antes de salvar.',
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
          'category-id': Number(categoryId),
          'is-fixed-expense': isFixedExpense,
          amount: Number(amount),
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
      setAmount('100.00');
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
              <input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
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
            <h2>Pagamentos do proximo mes</h2>
          </div>
          <button type="button" className="ghost-btn ghost-btn--light" onClick={loadMonthlyPayments}>
            Atualizar
          </button>
        </div>

        <p className="card-copy card-copy--light">
          A consulta sempre usa o mes atual + 1. Exemplo: durante maio/2026, a API recebe
          `year=2026&month=6`.
        </p>

        <div className="table-wrap table-wrap--light">
          <table className="data-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Categoria</th>
                <th>Parcelas</th>
                <th>Fixa</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingMonthlyPayments ? (
                <tr>
                  <td colSpan="5">Carregando pagamentos...</td>
                </tr>
              ) : null}

              {!isLoadingMonthlyPayments && monthlyPayments.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum pagamento encontrado para o proximo mes.</td>
                </tr>
              ) : null}

              {!isLoadingMonthlyPayments
                ? monthlyPayments.map((payment, index) => (
                    <tr key={`${payment['reference-date']}-${payment['category-id']}-${index}`}>
                      <td>{payment['reference-date']}</td>
                      <td>{payment['category-id']}</td>
                      <td>
                        {payment['is-installments']
                          ? `${payment['number-installments']}x`
                          : '1x'}
                      </td>
                      <td>{payment['is-fixed-expense'] ? 'Sim' : 'Nao'}</td>
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

function DashboardsPage() {
  return (
    <section className="content-panel page-stack">
      <div className="section-heading">
        <span className="eyebrow">Dashboards</span>
        <h1>Acompanhe os indicadores mais importantes em tempo real.</h1>
        <p className="lead compact-lead">
          Veja rapidamente o que esta acima do planejado, o quanto da renda esta comprometida e quais metas seguem no ritmo certo.
        </p>
      </div>

      <div className="dashboard-grid">
        {[
          ['Comprometimento da renda', '48%', 'Dentro da faixa saudavel'],
          ['Economia no mes', 'R$ 920', '18% acima da meta'],
          ['Contas recorrentes', '12 itens', 'Proximo vencimento em 3 dias'],
        ].map(([title, value, description]) => (
          <article key={title} className="content-card stat-card">
            <span className="section-label">Indicador</span>
            <h2>{title}</h2>
            <strong>{value}</strong>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <article className="content-card timeline-card">
        <div className="dashboard-card__top">
          <div>
            <p className="section-label">Leitura semanal</p>
            <h2>Tendencia dos ultimos dias</h2>
          </div>
          <span className="status-pill">Estavel</span>
        </div>

        <div className="trend-bars" aria-label="Resumo visual dos gastos da semana">
          {[42, 58, 36, 74, 64, 48, 52].map((height, index) => (
            <div key={height} className="trend-bar-group">
              <div className="trend-bar" style={{ height: `${height * 2}px` }} />
              <span>{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][index]}</span>
            </div>
          ))}
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