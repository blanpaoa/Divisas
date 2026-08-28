const Estado = {
  monedas: [],
  async cargarMonedas() {
    if (this.monedas.length === 0) {
      this.monedas = await Api.get('/monedas', { todas: 'true' });
    }
    return this.monedas;
  },
  nombreMoneda(id) {
    const m = this.monedas.find((x) => x.id === Number(id));
    return m ? m.codigo : '-';
  },
};

/* ======================================================================
   DASHBOARD
   ====================================================================== */
async function vistaDashboard(contenedor) {
  contenedor.innerHTML = `
    <header class="page-header">
      <h1>📊 Dashboard</h1>
      <div class="filters-bar">
        <div>
          <label>Desde</label>
          <input type="date" id="db-desde" value="${UI.haceDias(30)}" />
        </div>
        <div>
          <label>Hasta</label>
          <input type="date" id="db-hasta" value="${UI.hoy()}" />
        </div>
        <button class="btn-secondary" id="db-aplicar">Aplicar</button>
      </div>
    </header>
    <div class="cards-grid" id="db-cards">
      <div class="empty-state">Cargando...</div>
    </div>
    <div class="charts-grid">
      <div class="panel">
        <h3>Evolucion de capital y utilidad diaria</h3>
        <canvas id="chart-evolucion" height="110"></canvas>
      </div>
      <div class="panel">
        <h3>Distribucion por moneda</h3>
        <canvas id="chart-distribucion" height="110"></canvas>
      </div>
    </div>
    <div class="panel">
      <h3>Gastos por concepto</h3>
      <canvas id="chart-gastos" height="80"></canvas>
    </div>
  `;

  document.getElementById('db-aplicar').addEventListener('click', () => cargarDashboard());
  await Estado.cargarMonedas();
  await cargarDashboard();
}

let _charts = {};
function destruirChart(nombre) {
  if (_charts[nombre]) {
    _charts[nombre].destroy();
    delete _charts[nombre];
  }
}

async function cargarDashboard() {
  const desde = document.getElementById('db-desde').value;
  const hasta = document.getElementById('db-hasta').value;

  const [resumen, evolucion, distribucion, gastosConcepto] = await Promise.all([
    Api.get('/dashboard/resumen', { desde, hasta }),
    Api.get('/dashboard/evolucion', { desde, hasta }),
    Api.get('/dashboard/distribucion-monedas', { hasta }),
    Api.get('/dashboard/gastos-por-concepto', { desde, hasta }),
  ]);

  const cards = document.getElementById('db-cards');
  cards.innerHTML = '';
  const items = [
    { label: 'Capital actual', valor: resumen.capital_actual_ars, clase: '' },
    {
      label: 'Utilidad del periodo',
      valor: resumen.utilidad_periodo_ars,
      clase: resumen.utilidad_periodo_ars >= 0 ? 'positivo' : 'negativo',
    },
    { label: 'Gastos del periodo', valor: resumen.gastos_periodo_ars, clase: 'negativo' },
    { label: 'Entradas del periodo', valor: resumen.entradas_periodo_ars, clase: 'positivo' },
  ];
  items.forEach((it) => {
    cards.appendChild(
      UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, it.label),
        UI.el('div', { class: `value ${it.clase}` }, UI.formatoARS(it.valor)),
      ])
    );
  });

  // Grafico de evolucion (linea): capital total y utilidad diaria
  destruirChart('evolucion');
  const fechasCapital = evolucion.capital_diario.map((r) => r.fecha);
  const capitalMap = Object.fromEntries(evolucion.capital_diario.map((r) => [r.fecha, r.capital_total_ars]));
  const utilidadMap = Object.fromEntries(evolucion.utilidad_diaria.map((r) => [r.fecha, r.utilidad_diaria_ars]));
  const todasFechas = Array.from(
    new Set([...fechasCapital, ...evolucion.utilidad_diaria.map((r) => r.fecha)])
  ).sort();

  _charts.evolucion = new Chart(document.getElementById('chart-evolucion'), {
    type: 'line',
    data: {
      labels: todasFechas,
      datasets: [
        {
          label: 'Capital total (ARS)',
          data: todasFechas.map((f) => capitalMap[f] ?? null),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34,197,94,0.15)',
          tension: 0.3,
          spanGaps: true,
        },
        {
          label: 'Utilidad diaria (ARS)',
          data: todasFechas.map((f) => utilidadMap[f] ?? null),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.15)',
          tension: 0.3,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
      },
    },
  });

  // Grafico de distribucion por moneda (torta)
  destruirChart('distribucion');
  _charts.distribucion = new Chart(document.getElementById('chart-distribucion'), {
    type: 'doughnut',
    data: {
      labels: distribucion.map((d) => d.codigo),
      datasets: [
        {
          data: distribucion.map((d) => d.total_ars),
          backgroundColor: [
            '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7',
            '#14b8a6', '#eab308', '#ec4899', '#06b6d4', '#84cc16',
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { color: '#e2e8f0', boxWidth: 12 } } },
    },
  });

  // Grafico de gastos por concepto (barras)
  destruirChart('gastos');
  _charts.gastos = new Chart(document.getElementById('chart-gastos'), {
    type: 'bar',
    data: {
      labels: gastosConcepto.map((g) => g.concepto),
      datasets: [
        {
          label: 'Total ARS',
          data: gastosConcepto.map((g) => g.total_ars),
          backgroundColor: '#ef4444',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
      },
    },
  });
}

/* ======================================================================
   GENERADOR GENERICO DE VISTAS CRUD (tenencias, entradas, salidas,
   gastos, operaciones, transferencias)
   ====================================================================== */

// campos: [{ key, label, type: 'text'|'number'|'date'|'select-moneda'|'select', options, default }]
function crearVistaCrud(cfg) {
  return async function (contenedor) {
    await Estado.cargarMonedas();

    contenedor.innerHTML = `
      <header class="page-header">
        <h1>${cfg.titulo}</h1>
      </header>
      <div class="panel" style="margin-bottom:20px;">
        <h3>Nuevo registro</h3>
        <form id="form-crud" class="form-grid"></form>
      </div>
      <div class="panel">
        <h3>Filtros</h3>
        <div class="filters-bar">
          <div><label>Desde</label><input type="date" id="f-desde" value="${UI.haceDias(60)}" /></div>
          <div><label>Hasta</label><input type="date" id="f-hasta" value="${UI.hoy()}" /></div>
          <button class="btn-secondary" id="f-aplicar">Filtrar</button>
        </div>
        <div id="tabla-wrap"></div>
      </div>
    `;

    const form = document.getElementById('form-crud');
    cfg.campos.forEach((campo) => {
      form.appendChild(construirCampoInput(campo));
    });
    const btnGuardar = UI.el(
      'button',
      { type: 'submit', class: 'btn-primary form-row-full', style: 'margin-top:4px;' },
      'Guardar'
    );
    form.appendChild(UI.el('div', { class: 'form-row-full' }, btnGuardar));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {};
      cfg.campos.forEach((c) => {
        const input = document.getElementById(`campo-${c.key}`);
        let val = input.value;
        if (c.type === 'number') val = val === '' ? 0 : Number(val);
        body[c.key] = val;
      });
      if (cfg.calcularTotal) Object.assign(body, cfg.calcularTotal(body));
      try {
        await Api.post(cfg.endpoint, body);
        UI.toast('Registro guardado correctamente.');
        form.reset();
        cfg.campos.forEach((c) => {
          if (c.default !== undefined) document.getElementById(`campo-${c.key}`).value = c.default();
        });
        cargarTablaCrud(cfg);
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });

    document.getElementById('f-aplicar').addEventListener('click', () => cargarTablaCrud(cfg));
    await cargarTablaCrud(cfg);
  };
}

function construirCampoInput(campo) {
  const wrap = UI.el('div', {}, [UI.el('label', {}, campo.label)]);
  let input;
  if (campo.type === 'select-moneda') {
    input = UI.el(
      'select',
      { id: `campo-${campo.key}` },
      Estado.monedas.map((m) => UI.el('option', { value: m.id }, `${m.codigo} - ${m.nombre}`))
    );
  } else if (campo.type === 'select') {
    input = UI.el(
      'select',
      { id: `campo-${campo.key}` },
      campo.options.map((o) => UI.el('option', { value: o.value }, o.label))
    );
  } else {
    input = UI.el('input', {
      id: `campo-${campo.key}`,
      type: campo.type || 'text',
      step: campo.type === 'number' ? 'any' : undefined,
    });
    if (campo.default !== undefined) input.value = campo.default();
  }
  wrap.appendChild(input);
  return wrap;
}

async function cargarTablaCrud(cfg) {
  const desde = document.getElementById('f-desde').value;
  const hasta = document.getElementById('f-hasta').value;
  const wrap = document.getElementById('tabla-wrap');
  wrap.innerHTML = '<div class="empty-state">Cargando...</div>';

  let filas;
  try {
    filas = await Api.get(cfg.endpoint, { desde, hasta });
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">Error al cargar: ${err.message}</div>`;
    return;
  }

  if (filas.length === 0) {
    wrap.innerHTML = '<div class="empty-state">No hay registros en este periodo.</div>';
    return;
  }

  const table = UI.el('table', {}, [
    UI.el('thead', {}, UI.el('tr', {}, cfg.columnas.map((c) => UI.el('th', {}, c.label)).concat(UI.el('th', {}, '')))),
  ]);
  const tbody = UI.el('tbody');
  filas.forEach((fila) => {
    const tds = cfg.columnas.map((c) => {
      if (c.html) {
        return UI.el('td', { html: c.render(fila) });
      }
      return UI.el('td', {}, c.render ? c.render(fila) : String(fila[c.key] ?? ''));
    });
    const btnBorrar = UI.el('button', {
      onclick: async () => {
        if (!confirm('¿Eliminar este registro?')) return;
        try {
          await Api.delete(`${cfg.endpoint}/${fila.id}`);
          UI.toast('Registro eliminado.');
          cargarTablaCrud(cfg);
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      },
    }, '🗑️');
    tds.push(UI.el('td', { class: 'table-actions' }, btnBorrar));
    tbody.appendChild(UI.el('tr', {}, tds));
  });
  table.appendChild(tbody);
  wrap.innerHTML = '';
  wrap.appendChild(table);
}

/* ---------- Configuraciones de cada modulo ---------- */

const vistaTenencias = crearVistaCrud({
  titulo: '💰 Tenencias diarias',
  endpoint: '/tenencias',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'valor', label: 'Cantidad', type: 'number', default: () => 0 },
    { key: 'cotizacion', label: 'Cotizacion (a ARS)', type: 'number', default: () => 0 },
  ],
  calcularTotal: (body) => ({ total_ars: Number(body.valor) * Number(body.cotizacion) }),
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'valor', label: 'Cantidad', render: (f) => UI.formatoNumero(f.valor) },
    { key: 'cotizacion', label: 'Cotizacion', render: (f) => UI.formatoNumero(f.cotizacion) },
    { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
  ],
});

const vistaOperaciones = crearVistaCrud({
  titulo: '🔄 Compra / Venta de divisas',
  endpoint: '/operaciones',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'tipo', label: 'Tipo', type: 'select', options: [{ value: 'compra', label: 'Compra' }, { value: 'venta', label: 'Venta' }] },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'cantidad', label: 'Cantidad', type: 'number', default: () => 0 },
    { key: 'cotizacion', label: 'Cotizacion', type: 'number', default: () => 0 },
  ],
  calcularTotal: (body) => ({ total_ars: Number(body.cantidad) * Number(body.cotizacion) }),
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'tipo', label: 'Tipo', html: true, render: (f) => `<span class="badge ${f.tipo}">${f.tipo.toUpperCase()}</span>` },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'cantidad', label: 'Cantidad', render: (f) => UI.formatoNumero(f.cantidad) },
    { key: 'cotizacion', label: 'Cotizacion', render: (f) => UI.formatoNumero(f.cotizacion) },
    { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
  ],
});


const vistaEntradas = crearVistaCrud({
  titulo: '⬇️ Entradas y prestamos (capital recibido)',
  endpoint: '/entradas',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'concepto', label: 'Concepto', type: 'text', default: () => '' },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'valor', label: 'Valor', type: 'number', default: () => 0 },
    { key: 'porcentaje', label: '% / Cotizacion', type: 'number', default: () => 0 },
  ],
  calcularTotal: (body) => ({ total_ars: Number(body.valor) * (Number(body.porcentaje) || 1) }),
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
    { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
  ],
});

const vistaSalidas = crearVistaCrud({
  titulo: '⬆️ Salidas / prestamos otorgados',
  endpoint: '/salidas',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'concepto', label: 'Concepto', type: 'text', default: () => '' },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'valor', label: 'Valor', type: 'number', default: () => 0 },
    { key: 'porcentaje', label: '% / Cotizacion', type: 'number', default: () => 0 },
  ],
  calcularTotal: (body) => ({ total_ars: Number(body.valor) * (Number(body.porcentaje) || 1) }),
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
    { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
  ],
});

const vistaGastos = crearVistaCrud({
  titulo: '🧾 Gastos',
  endpoint: '/gastos',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'concepto', label: 'Concepto', type: 'text', default: () => '' },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'valor', label: 'Valor', type: 'number', default: () => 0 },
    { key: 'porcentaje', label: '% / Cotizacion', type: 'number', default: () => 0 },
  ],
  calcularTotal: (body) => ({ total_ars: Number(body.valor) * (Number(body.porcentaje) || 1) }),
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
    { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
  ],
});

const vistaTransferencias = crearVistaCrud({
  titulo: '🌎 Transferencias (Venezuela / Colombia / otros)',
  endpoint: '/transferencias',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'destino', label: 'Destino', type: 'text', default: () => 'VENEZUELA' },
    { key: 'tipo', label: 'Tipo', type: 'select', options: [
      { value: 'debemos', label: 'Debemos' },
      { value: 'abonos', label: 'Abonos' },
      { value: 'ingreso', label: 'Ingreso' },
      { value: 'egreso', label: 'Egreso' },
    ] },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'valor', label: 'Valor', type: 'number', default: () => 0 },
    { key: 'notas', label: 'Notas', type: 'text', default: () => '' },
  ],
  calcularTotal: () => ({}),
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'destino', label: 'Destino' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
    { key: 'notas', label: 'Notas' },
  ],
});

/* ======================================================================
   RESUMEN DIARIO (upsert por fecha)
   ====================================================================== */
async function vistaResumenDiario(contenedor) {
  contenedor.innerHTML = `
    <header class="page-header"><h1>📅 Resumen diario</h1></header>
    <div class="panel" style="margin-bottom:20px;">
      <h3>Cargar / actualizar resumen del dia</h3>
      <form id="form-resumen" class="form-grid">
        <div><label>Fecha</label><input type="date" id="rd-fecha" value="${UI.hoy()}" /></div>
        <div><label>Saldo dia anterior (ARS)</label><input type="number" step="any" id="rd-saldo" value="0" /></div>
        <div><label>Utilidad diaria (ARS)</label><input type="number" step="any" id="rd-utilidad" value="0" /></div>
        <div><label>Descuentos (ARS)</label><input type="number" step="any" id="rd-descuentos" value="0" /></div>
        <div><label>Utilidad adicional (ARS)</label><input type="number" step="any" id="rd-adicional" value="0" /></div>
        <div><label>Faltante / sobrante (ARS)</label><input type="number" step="any" id="rd-faltante" value="0" /></div>
        <div><label>Tasa US cierre</label><input type="number" step="any" id="rd-tasa" value="0" /></div>
        <div><label>Total (ARS)</label><input type="number" step="any" id="rd-total" value="0" /></div>
        <div class="form-row-full"><label>Notas</label><input type="text" id="rd-notas" /></div>
        <div class="form-row-full"><button type="submit" class="btn-primary">Guardar resumen del dia</button></div>
      </form>
    </div>
    <div class="panel">
      <h3>Historial</h3>
      <div class="filters-bar">
        <div><label>Desde</label><input type="date" id="f-desde" value="${UI.haceDias(60)}" /></div>
        <div><label>Hasta</label><input type="date" id="f-hasta" value="${UI.hoy()}" /></div>
        <button class="btn-secondary" id="f-aplicar">Filtrar</button>
      </div>
      <div id="tabla-wrap"></div>
    </div>
  `;

  document.getElementById('rd-fecha').addEventListener('change', cargarResumenDeFecha);
  document.getElementById('form-resumen').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fecha = document.getElementById('rd-fecha').value;
    const body = {
      saldo_dia_anterior_ars: Number(document.getElementById('rd-saldo').value) || 0,
      utilidad_diaria_ars: Number(document.getElementById('rd-utilidad').value) || 0,
      descuentos_ars: Number(document.getElementById('rd-descuentos').value) || 0,
      utilidad_adicional_ars: Number(document.getElementById('rd-adicional').value) || 0,
      faltante_sobrante_ars: Number(document.getElementById('rd-faltante').value) || 0,
      tasa_us_cierre: Number(document.getElementById('rd-tasa').value) || 0,
      total_ars: Number(document.getElementById('rd-total').value) || 0,
      notas: document.getElementById('rd-notas').value,
    };
    try {
      await Api.put(`/resumen-diario/${fecha}`, body);
      UI.toast('Resumen guardado.');
      cargarHistorialResumen();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  });
  document.getElementById('f-aplicar').addEventListener('click', cargarHistorialResumen);

  await cargarResumenDeFecha();
  await cargarHistorialResumen();
}

async function cargarResumenDeFecha() {
  const fecha = document.getElementById('rd-fecha').value;
  const data = await Api.get(`/resumen-diario/${fecha}`);
  const campos = {
    'rd-saldo': 'saldo_dia_anterior_ars', 'rd-utilidad': 'utilidad_diaria_ars',
    'rd-descuentos': 'descuentos_ars', 'rd-adicional': 'utilidad_adicional_ars',
    'rd-faltante': 'faltante_sobrante_ars', 'rd-tasa': 'tasa_us_cierre',
    'rd-total': 'total_ars', 'rd-notas': 'notas',
  };
  Object.entries(campos).forEach(([id, key]) => {
    document.getElementById(id).value = data ? (data[key] ?? '') : (id === 'rd-notas' ? '' : 0);
  });
}

async function cargarHistorialResumen() {
  const desde = document.getElementById('f-desde').value;
  const hasta = document.getElementById('f-hasta').value;
  const wrap = document.getElementById('tabla-wrap');
  const filas = await Api.get('/resumen-diario', { desde, hasta });
  if (filas.length === 0) {
    wrap.innerHTML = '<div class="empty-state">No hay registros en este periodo.</div>';
    return;
  }
  const table = UI.el('table', {}, [
    UI.el('thead', {}, UI.el('tr', {}, ['Fecha', 'Saldo ant.', 'Utilidad diaria', 'Faltante/Sobrante', 'Total'].map((h) => UI.el('th', {}, h)))),
  ]);
  const tbody = UI.el('tbody');
  filas.forEach((f) => {
    tbody.appendChild(UI.el('tr', {}, [
      UI.el('td', {}, f.fecha),
      UI.el('td', {}, UI.formatoARS(f.saldo_dia_anterior_ars)),
      UI.el('td', {}, UI.formatoARS(f.utilidad_diaria_ars)),
      UI.el('td', {}, UI.formatoARS(f.faltante_sobrante_ars)),
      UI.el('td', {}, UI.formatoARS(f.total_ars)),
    ]));
  });
  table.appendChild(tbody);
  wrap.innerHTML = '';
  wrap.appendChild(table);
}

/* ======================================================================
   UTILIDAD MENSUAL
   ====================================================================== */
const NOMBRES_MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

async function vistaUtilidadMensual(contenedor) {
  const anioActual = new Date().getFullYear();
  contenedor.innerHTML = `
    <header class="page-header">
      <h1>📈 Utilidad mensual</h1>
      <div class="filters-bar">
        <div><label>Año</label><input type="number" id="um-anio" value="${anioActual}" /></div>
        <button class="btn-secondary" id="um-aplicar">Ver</button>
      </div>
    </header>
    <div class="panel">
      <table>
        <thead><tr><th>Mes</th><th>Utilidad USD</th><th>Utilidad ARS</th><th>Notas</th><th></th></tr></thead>
        <tbody id="um-tbody"></tbody>
      </table>
    </div>
  `;
  document.getElementById('um-aplicar').addEventListener('click', cargarUtilidadMensual);
  await cargarUtilidadMensual();
}

async function cargarUtilidadMensual() {
  const anio = document.getElementById('um-anio').value;
  const data = await Api.get('/utilidad-mensual', { anio });
  const porMes = {};
  data.forEach((d) => { porMes[d.mes] = d; });

  const tbody = document.getElementById('um-tbody');
  tbody.innerHTML = '';
  for (let mes = 1; mes <= 12; mes++) {
    const registro = porMes[mes] || { utilidad_us: 0, utilidad_ars: 0, notas: '' };
    const idUs = `um-us-${mes}`, idArs = `um-ars-${mes}`, idNotas = `um-notas-${mes}`;
    const tr = UI.el('tr', {}, [
      UI.el('td', {}, NOMBRES_MESES[mes - 1]),
      UI.el('td', {}, UI.el('input', { type: 'number', step: 'any', id: idUs, value: registro.utilidad_us, style: 'margin-bottom:0;' })),
      UI.el('td', {}, UI.el('input', { type: 'number', step: 'any', id: idArs, value: registro.utilidad_ars, style: 'margin-bottom:0;' })),
      UI.el('td', {}, UI.el('input', { type: 'text', id: idNotas, value: registro.notas || '', style: 'margin-bottom:0;' })),
      UI.el('td', {}, UI.el('button', { class: 'btn-secondary', onclick: () => guardarUtilidadMes(anio, mes, idUs, idArs, idNotas) }, 'Guardar')),
    ]);
    tbody.appendChild(tr);
  }
}

async function guardarUtilidadMes(anio, mes, idUs, idArs, idNotas) {
  try {
    await Api.put(`/utilidad-mensual/${anio}/${mes}`, {
      utilidad_us: Number(document.getElementById(idUs).value) || 0,
      utilidad_ars: Number(document.getElementById(idArs).value) || 0,
      notas: document.getElementById(idNotas).value,
    });
    UI.toast(`${NOMBRES_MESES[mes - 1]} guardado.`);
  } catch (err) {
    UI.toast(err.message, 'error');
  }
}

/* ======================================================================
   MONEDAS
   ====================================================================== */
async function vistaMonedas(contenedor) {
  contenedor.innerHTML = `
    <header class="page-header"><h1>🪙 Monedas</h1></header>
    <div class="panel" style="margin-bottom:20px;">
      <h3>Agregar moneda</h3>
      <form id="form-moneda" class="form-grid">
        <div><label>Codigo (ej: USD)</label><input type="text" id="mo-codigo" required /></div>
        <div><label>Nombre</label><input type="text" id="mo-nombre" required /></div>
        <div class="form-row-full"><button type="submit" class="btn-primary">Agregar</button></div>
      </form>
    </div>
    <div class="panel"><table><thead><tr><th>Codigo</th><th>Nombre</th><th>Activa</th><th></th></tr></thead><tbody id="mo-tbody"></tbody></table></div>
  `;
  document.getElementById('form-moneda').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await Api.post('/monedas', {
        codigo: document.getElementById('mo-codigo').value,
        nombre: document.getElementById('mo-nombre').value,
      });
      UI.toast('Moneda agregada.');
      document.getElementById('form-moneda').reset();
      Estado.monedas = [];
      await cargarMonedasTabla();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  });
  await cargarMonedasTabla();
}

async function cargarMonedasTabla() {
  const monedas = await Api.get('/monedas', { todas: 'true' });
  const tbody = document.getElementById('mo-tbody');
  tbody.innerHTML = '';
  monedas.forEach((m) => {
    tbody.appendChild(UI.el('tr', {}, [
      UI.el('td', {}, m.codigo),
      UI.el('td', {}, m.nombre),
      UI.el('td', {}, m.activa ? 'Si' : 'No'),
      UI.el('td', {}, UI.el('button', {
        class: 'btn-secondary',
        onclick: async () => {
          await Api.put(`/monedas/${m.id}`, { activa: m.activa ? 0 : 1 });
          Estado.monedas = [];
          cargarMonedasTabla();
        },
      }, m.activa ? 'Desactivar' : 'Activar')),
    ]));
  });
}

/* ======================================================================
   USUARIOS (solo admin)
   ====================================================================== */
async function vistaUsuarios(contenedor) {
  contenedor.innerHTML = `
    <header class="page-header"><h1>👤 Usuarios</h1></header>
    <div class="panel" style="margin-bottom:20px;">
      <h3>Como agregar una persona nueva</h3>
      <p style="color:var(--text-muted); font-size:13px; line-height:1.6;">
        1. Entra al <strong>Dashboard de Supabase</strong> de este proyecto → <em>Authentication → Users → Add user</em>,
        cargá su email y una clave provisoria.<br />
        2. Volvé a esta pantalla: la persona va a aparecer automaticamente en la lista de abajo con rol
        "visor". Cambiale el rol que corresponda con el selector.
      </p>
    </div>
    <div class="panel">
      <table>
        <thead><tr><th>Email</th><th>Nombre</th><th>Rol</th><th>Activo</th><th></th></tr></thead>
        <tbody id="us-tbody"></tbody>
      </table>
    </div>
  `;
  await cargarUsuariosTabla();
}

async function cargarUsuariosTabla() {
  const usuarios = await Api.get('/usuarios');
  const yo = Api.getUsuario();
  const tbody = document.getElementById('us-tbody');
  tbody.innerHTML = '';
  usuarios.forEach((u) => {
    const selectRol = UI.el(
      'select',
      {
        style: 'margin-bottom:0;',
        onchange: async (e) => {
          try {
            await Api.put(`/usuarios/${u.id}`, { rol: e.target.value });
            UI.toast('Rol actualizado.');
          } catch (err) {
            UI.toast(err.message, 'error');
          }
        },
      },
      ['operador', 'admin', 'visor'].map((r) => {
        const attrs = { value: r };
        if (r === u.rol) attrs.selected = 'selected';
        return UI.el('option', attrs, r);
      })
    );

    tbody.appendChild(UI.el('tr', {}, [
      UI.el('td', {}, u.username),
      UI.el('td', {}, u.nombre_completo || '-'),
      UI.el('td', {}, selectRol),
      UI.el('td', {}, u.activo ? 'Si' : 'No'),
      UI.el('td', { class: 'table-actions' }, UI.el('button', {
        onclick: async () => {
          if (u.id === yo.id) { UI.toast('No podes desactivar tu propio usuario.', 'error'); return; }
          if (!confirm(`¿${u.activo ? 'Desactivar' : 'Activar'} a ${u.username}?`)) return;
          try {
            await Api.put(`/usuarios/${u.id}`, { activo: !u.activo });
            cargarUsuariosTabla();
          } catch (err) {
            UI.toast(err.message, 'error');
          }
        },
      }, u.activo ? '🚫 Desactivar' : '✅ Activar')),
    ]));
  });
}
