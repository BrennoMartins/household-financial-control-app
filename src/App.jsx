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

function App() {
  return (
    <div className="app-shell">
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
    </div>
  );
}

export default App;