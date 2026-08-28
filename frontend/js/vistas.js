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
    const rolUsuario = (Api.getUsuario() || {}).rol;
    const puedeEscribir = !cfg.soloEscritura || cfg.soloEscritura.includes(rolUsuario);

    contenedor.innerHTML = `
      <header class="page-header">
        <h1>${cfg.titulo}</h1>
      </header>
      ${puedeEscribir ? `
      <div class="panel" style="margin-bottom:20px;">
        <h3>Nuevo registro</h3>
        <form id="form-crud" class="form-grid"></form>
      </div>` : ''}
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

    if (puedeEscribir) {
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

      if (cfg.autocompletarCotizacion) {
        const { campoFecha, campoMoneda, campoCotizacion } = cfg.autocompletarCotizacion;
        const intentarAutocompletar = () => autocompletarCotizacionDesdeTasa(campoFecha, campoMoneda, campoCotizacion);
        document.getElementById(`campo-${campoFecha}`).addEventListener('change', intentarAutocompletar);
        document.getElementById(`campo-${campoMoneda}`).addEventListener('change', intentarAutocompletar);
      }

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
          cargarTablaCrud(cfg, puedeEscribir);
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });
    }

    document.getElementById('f-aplicar').addEventListener('click', () => cargarTablaCrud(cfg, puedeEscribir));
    await cargarTablaCrud(cfg, puedeEscribir);
  };
}

async function autocompletarCotizacionDesdeTasa(campoFecha, campoMoneda, campoCotizacion) {
  const fecha = document.getElementById(`campo-${campoFecha}`).value;
  const monedaId = document.getElementById(`campo-${campoMoneda}`).value;
  if (!fecha || !monedaId) return;
  try {
    const tasa = await Api.buscarTasaMasReciente(fecha, monedaId);
    if (tasa !== null) {
      document.getElementById(`campo-${campoCotizacion}`).value = tasa;
    }
  } catch (err) {
    // silencioso: si falla la busqueda de tasa, el operador puede tipearla igual
    console.warn('No se pudo autocompletar la tasa:', err.message);
  }
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

async function cargarTablaCrud(cfg, puedeEscribir) {
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

  const encabezados = cfg.columnas.map((c) => UI.el('th', {}, c.label));
  if (puedeEscribir) encabezados.push(UI.el('th', {}, ''));
  const table = UI.el('table', {}, [UI.el('thead', {}, UI.el('tr', {}, encabezados))]);
  const tbody = UI.el('tbody');
  filas.forEach((fila) => {
    const tds = cfg.columnas.map((c) => {
      if (c.html) {
        return UI.el('td', { html: c.render(fila) });
      }
      return UI.el('td', {}, c.render ? c.render(fila) : String(fila[c.key] ?? ''));
    });
    if (puedeEscribir) {
      const btnBorrar = UI.el('button', {
        onclick: async () => {
          if (!confirm('¿Eliminar este registro?')) return;
          try {
            await Api.delete(`${cfg.endpoint}/${fila.id}`);
            UI.toast('Registro eliminado.');
            cargarTablaCrud(cfg, puedeEscribir);
          } catch (err) {
            UI.toast(err.message, 'error');
          }
        },
      }, '🗑️');
      tds.push(UI.el('td', { class: 'table-actions' }, btnBorrar));
    }
    tbody.appendChild(UI.el('tr', {}, tds));
  });
  table.appendChild(tbody);
  wrap.innerHTML = '';
  wrap.appendChild(table);
}

/* ======================================================================
   POSICION ACTUAL (antes "Tenencias diarias") — ahora se calcula sola
   con el motor de costeo promedio ponderado, a partir de Apertura de
   saldos + todo el historial de Compra/Venta. Ya no se carga a mano.
   ====================================================================== */
async function vistaTenencias(contenedor) {
  await Estado.cargarMonedas();
  contenedor.innerHTML = `
    <header class="page-header">
      <h1>💰 Posicion actual</h1>
      <div class="filters-bar">
        <div><label>Calcular al</label><input type="date" id="pos-hasta" value="${UI.hoy()}" /></div>
        <button class="btn-secondary" id="pos-recalcular">Recalcular</button>
      </div>
    </header>
    <p style="color:var(--text-muted); font-size:13px; margin-top:-10px;">
      Esta tabla ya no se carga a mano: se calcula sola sumando la <strong>Apertura de saldos</strong>
      con todo el historial de <strong>Compra / Venta</strong>, usando costeo promedio ponderado
      (igual que en la planilla original). Si algo no cierra, revisa esos dos lugares.
    </p>
    <div class="panel" id="pos-wrap" style="margin-top:16px;">
      <div class="empty-state">Calculando...</div>
    </div>
  `;
  document.getElementById('pos-recalcular').addEventListener('click', cargarPosicionActual);
  await cargarPosicionActual();
}

async function cargarPosicionActual() {
  const hasta = document.getElementById('pos-hasta').value;
  const wrap = document.getElementById('pos-wrap');
  wrap.innerHTML = '<div class="empty-state">Calculando...</div>';

  let resultado;
  try {
    resultado = await Api.get('/motor/posiciones', { hasta });
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
    return;
  }

  if (!resultado.fechaCalculada) {
    wrap.innerHTML = '<div class="empty-state">Todavia no hay Apertura de saldos ni operaciones cargadas.</div>';
    return;
  }

  const filas = Object.entries(resultado.monedas)
    .map(([monedaId, pos]) => ({
      moneda: Estado.nombreMoneda(monedaId),
      cantidad: pos.cantidad,
      costo_promedio: pos.costo_promedio,
      total_ars: pos.cantidad * pos.costo_promedio,
    }))
    .filter((f) => Math.abs(f.cantidad) > 0.0001)
    .sort((a, b) => b.total_ars - a.total_ars);

  const totalGeneral = filas.reduce((s, f) => s + f.total_ars, 0);

  const table = UI.el('table', {}, [
    UI.el('thead', {}, UI.el('tr', {}, ['Moneda', 'Cantidad', 'Costo promedio', 'Valor (ARS)'].map((h) => UI.el('th', {}, h)))),
  ]);
  const tbody = UI.el('tbody');
  filas.forEach((f) => {
    tbody.appendChild(UI.el('tr', {}, [
      UI.el('td', {}, f.moneda),
      UI.el('td', {}, UI.formatoNumero(f.cantidad)),
      UI.el('td', {}, UI.formatoNumero(f.costo_promedio)),
      UI.el('td', {}, UI.formatoARS(f.total_ars)),
    ]));
  });
  tbody.appendChild(UI.el('tr', { style: 'font-weight:700;' }, [
    UI.el('td', {}, 'TOTAL'),
    UI.el('td', {}, ''),
    UI.el('td', {}, ''),
    UI.el('td', {}, UI.formatoARS(totalGeneral)),
  ]));
  table.appendChild(tbody);

  wrap.innerHTML = '';
  wrap.appendChild(UI.el('p', { style: 'color:var(--text-muted); font-size:12px; margin:0 0 12px;' },
    `Ultima fecha con movimientos hasta ese dia: ${resultado.fechaCalculada}`));
  wrap.appendChild(table);
}

/* ======================================================================
   APERTURA DE SALDOS (solo admin) — el punto de partida del motor
   ====================================================================== */
async function vistaApertura(contenedor) {
  await Estado.cargarMonedas();
  contenedor.innerHTML = `
    <header class="page-header"><h1>🏁 Apertura de saldos</h1></header>
    <p style="color:var(--text-muted); font-size:13px;">
      Este es el punto de partida del motor de costeo: "al empezar a usar la app, teniamos esta
      cantidad de cada moneda, a este costo promedio". A partir de ahi, todo se recalcula solo con
      las operaciones de Compra/Venta que carguen. <strong>Solo se completa una vez</strong> (al
      migrar desde la planilla); si la vuelven a guardar mas adelante, va a recalcular todo el
      historial desde cero con el nuevo punto de partida.
    </p>
    <div class="panel">
      <table>
        <thead><tr><th>Moneda</th><th>Cantidad</th><th>Costo promedio (ARS)</th><th>Fecha</th><th></th></tr></thead>
        <tbody id="ap-tbody"></tbody>
      </table>
    </div>
  `;
  await cargarAperturaTabla();
}

async function cargarAperturaTabla() {
  const [monedas, aperturas] = await Promise.all([
    Api.get('/monedas', { todas: 'true' }),
    Api.get('/apertura', {}),
  ]);
  const porMoneda = {};
  aperturas.forEach((a) => { porMoneda[a.moneda_id] = a; });

  const tbody = document.getElementById('ap-tbody');
  tbody.innerHTML = '';
  monedas.forEach((m) => {
    const existente = porMoneda[m.id] || { cantidad: 0, costo_promedio: 0, fecha: UI.hoy() };
    const idCantidad = `ap-cant-${m.id}`, idCosto = `ap-costo-${m.id}`, idFecha = `ap-fecha-${m.id}`;
    tbody.appendChild(UI.el('tr', {}, [
      UI.el('td', {}, `${m.codigo} - ${m.nombre}`),
      UI.el('td', {}, UI.el('input', { type: 'number', step: 'any', id: idCantidad, value: existente.cantidad, style: 'margin-bottom:0;' })),
      UI.el('td', {}, UI.el('input', { type: 'number', step: 'any', id: idCosto, value: existente.costo_promedio, style: 'margin-bottom:0;' })),
      UI.el('td', {}, UI.el('input', { type: 'date', id: idFecha, value: existente.fecha || UI.hoy(), style: 'margin-bottom:0;' })),
      UI.el('td', {}, UI.el('button', {
        class: 'btn-secondary',
        onclick: async () => {
          try {
            await Api.put(`/apertura/${m.id}`, {
              cantidad: Number(document.getElementById(idCantidad).value) || 0,
              costo_promedio: Number(document.getElementById(idCosto).value) || 0,
              fecha: document.getElementById(idFecha).value,
            });
            UI.toast(`Apertura de ${m.codigo} guardada.`);
          } catch (err) {
            UI.toast(err.message, 'error');
          }
        },
      }, 'Guardar')),
    ]));
  });
}

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
  autocompletarCotizacion: { campoFecha: 'fecha', campoMoneda: 'moneda_id', campoCotizacion: 'cotizacion' },
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

const vistaTasas = crearVistaCrud({
  titulo: '💱 Tasa del dia',
  endpoint: '/tasas',
  soloEscritura: ['admin'],
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'cotizacion', label: 'Cotizacion (a ARS)', type: 'number', default: () => 0 },
  ],
  calcularTotal: () => ({}),
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'cotizacion', label: 'Cotizacion', render: (f) => UI.formatoNumero(f.cotizacion) },
  ],
});

/* ======================================================================
   CIERRE DIARIO (antes "Resumen diario") — utilidad y acumulado ahora se
   calculan solos con el motor de costeo; el chequeo EXISTENCIA vs
   DEBEMOS se muestra como auditoria automatica (igual que en la planilla).
   ====================================================================== */
async function vistaResumenDiario(contenedor) {
  contenedor.innerHTML = `
    <header class="page-header"><h1>📅 Cierre diario</h1></header>
    <div class="panel" style="margin-bottom:20px;">
      <div class="filters-bar">
        <div><label>Fecha</label><input type="date" id="rd-fecha" value="${UI.hoy()}" /></div>
        <button class="btn-secondary" id="rd-calcular">Calcular</button>
      </div>

      <div class="cards-grid" id="rd-cards"></div>

      <div id="rd-chequeo" style="margin:16px 0;"></div>

      <form id="form-resumen" class="form-grid">
        <div>
          <label>Utilidad del dia (ARS) — calculada, editable si hace falta</label>
          <input type="number" step="any" id="rd-utilidad" value="0" />
        </div>
        <div><label>Descuentos (ARS)</label><input type="number" step="any" id="rd-descuentos" value="0" /></div>
        <div><label>Utilidad adicional (ARS)</label><input type="number" step="any" id="rd-adicional" value="0" /></div>
        <div><label>Faltante / sobrante (ARS)</label><input type="number" step="any" id="rd-faltante" value="0" /></div>
        <div><label>Tasa US cierre (referencia)</label><input type="number" step="any" id="rd-tasa" value="0" /></div>
        <div>
          <label>&nbsp;</label>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text);">
            <input type="checkbox" id="rd-reset" style="width:auto; margin:0;" /> Resetear acumulado este dia
          </label>
        </div>
        <div class="form-row-full"><label>Notas</label><input type="text" id="rd-notas" /></div>
        <div class="form-row-full"><button type="submit" class="btn-primary">Guardar cierre del dia</button></div>
      </form>
    </div>

    <div class="panel" style="margin-bottom:20px;">
      <h3>Otros saldos (Latin Express / MoneyGram) — opcional</h3>
      <p style="color:var(--text-muted); font-size:12px; margin-top:-6px;">
        Sub-cuenta aparte de conciliacion con servicios de remesas. Si no la usan, dejenla en 0.
      </p>
      <div class="form-grid">
        <div><label>Latin Express — les debemos (ARS)</label><input type="number" step="any" id="rd-latin" value="0" /></div>
        <div><label>MoneyGram — nos deben (ARS)</label><input type="number" step="any" id="rd-moneygram" value="0" /></div>
        <div class="form-row-full"><button type="button" class="btn-secondary" id="rd-guardar-otros">Guardar otros saldos</button></div>
      </div>
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

  document.getElementById('rd-calcular').addEventListener('click', calcularCierreDelDia);
  document.getElementById('form-resumen').addEventListener('submit', guardarCierreDelDia);
  document.getElementById('rd-guardar-otros').addEventListener('click', guardarOtrosSaldos);
  document.getElementById('f-aplicar').addEventListener('click', cargarHistorialResumen);

  await calcularCierreDelDia();
  await cargarHistorialResumen();
}

// Guarda en memoria el ultimo calculo, para no repetirlo al guardar
let _ultimoCalculoCierre = null;

async function calcularCierreDelDia() {
  const fecha = document.getElementById('rd-fecha').value;
  const cardsWrap = document.getElementById('rd-cards');
  const chequeoWrap = document.getElementById('rd-chequeo');
  cardsWrap.innerHTML = '<div class="empty-state">Calculando...</div>';
  chequeoWrap.innerHTML = '';

  try {
    const [motor, tenenciasHoy, entradasHoy, salidasHoy, gastosHoy, resumenGuardado, otrosGuardados, historialAnterior] =
      await Promise.all([
        Api.get('/motor/posiciones', { hasta: fecha }),
        Api.get('/motor/posiciones', { hasta: fecha }), // se reutiliza abajo para EXISTENCIA
        Api.get('/entradas', { desde: fecha, hasta: fecha }),
        Api.get('/salidas', { desde: fecha, hasta: fecha }),
        Api.get('/gastos', { desde: fecha, hasta: fecha }),
        Api.get(`/resumen-diario/${fecha}`),
        Api.get(`/otros-saldos/${fecha}`),
        Api.get('/resumen-diario', { hasta: diaAnterior(fecha), desde: UI.haceDias(3650) }),
      ]);

    const utilidadDia = motor.fechaCalculada === fecha ? motor.utilidadDelDia : 0;
    const existenciaTenencias = Object.values(motor.monedas).reduce(
      (s, p) => s + p.cantidad * p.costo_promedio, 0
    );
    const salidaTotal = salidasHoy.reduce((s, r) => s + Number(r.total_ars || 0), 0);
    const entradasTotal = entradasHoy.reduce((s, r) => s + Number(r.total_ars || 0), 0);
    const gastosTotal = gastosHoy.reduce((s, r) => s + Number(r.total_ars || 0), 0);

    const otros = otrosGuardados || { latin_debemos_ars: 0, moneygram_nos_debe_ars: 0 };
    const existencia = existenciaTenencias + salidaTotal + Number(otros.moneygram_nos_debe_ars || 0);

    // saldo anterior = ultimo total_ars guardado antes de esta fecha (o 0 si no hay / reset)
    const anterior = historialAnterior.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
    const saldoAnterior = anterior ? Number(anterior.total_ars || 0) : 0;

    const faltanteSobrante = resumenGuardado ? Number(resumenGuardado.faltante_sobrante_ars || 0) : 0;
    const debemos = entradasTotal + utilidadDia + faltanteSobrante + Number(otros.latin_debemos_ars || 0);
    const diferenciaChequeo = existencia - debemos;

    _ultimoCalculoCierre = { fecha, utilidadDia, gastosTotal, saldoAnterior, existencia, debemos, diferenciaChequeo };

    cardsWrap.innerHTML = '';
    [
      { label: 'Utilidad del dia (compra/venta)', valor: utilidadDia, clase: utilidadDia >= 0 ? 'positivo' : 'negativo' },
      { label: 'Gastos del dia', valor: gastosTotal, clase: 'negativo' },
      { label: 'Saldo dia anterior', valor: saldoAnterior, clase: '' },
      { label: 'Existencia (lo que tenemos)', valor: existencia, clase: '' },
      { label: 'Debemos (lo que se debe)', valor: debemos, clase: '' },
    ].forEach((it) => {
      cardsWrap.appendChild(UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, it.label),
        UI.el('div', { class: `value ${it.clase}` }, UI.formatoARS(it.valor)),
      ]));
    });

    const ok = Math.abs(diferenciaChequeo) < 1;
    chequeoWrap.appendChild(UI.el('div', {
      style: `padding:12px 16px; border-radius:8px; font-size:13px; background:${ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}; color:${ok ? 'var(--primary)' : 'var(--danger)'};`,
    }, ok
      ? '✓ El chequeo cierra: Existencia = Debemos.'
      : `⚠ Diferencia sin explicar: ${UI.formatoARS(diferenciaChequeo)}. Revisa gastos, entradas, salidas u "otros saldos" cargados para esta fecha.`
    ));

    // precargar formulario
    document.getElementById('rd-utilidad').value = resumenGuardado ? resumenGuardado.utilidad_diaria_ars : Math.round(utilidadDia);
    document.getElementById('rd-descuentos').value = resumenGuardado ? resumenGuardado.descuentos_ars : 0;
    document.getElementById('rd-adicional').value = resumenGuardado ? resumenGuardado.utilidad_adicional_ars : 0;
    document.getElementById('rd-faltante').value = resumenGuardado ? resumenGuardado.faltante_sobrante_ars : 0;
    document.getElementById('rd-tasa').value = resumenGuardado ? resumenGuardado.tasa_us_cierre : 0;
    document.getElementById('rd-notas').value = resumenGuardado ? (resumenGuardado.notas || '') : '';
    document.getElementById('rd-reset').checked = resumenGuardado ? !!resumenGuardado.resetear_acumulado : false;
    document.getElementById('rd-latin').value = otros.latin_debemos_ars || 0;
    document.getElementById('rd-moneygram').value = otros.moneygram_nos_debe_ars || 0;
  } catch (err) {
    cardsWrap.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
}

function diaAnterior(fechaStr) {
  const d = new Date(fechaStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

async function guardarCierreDelDia(e) {
  e.preventDefault();
  const fecha = document.getElementById('rd-fecha').value;
  const resetear = document.getElementById('rd-reset').checked;

  const utilidad = Number(document.getElementById('rd-utilidad').value) || 0;
  const descuentos = Number(document.getElementById('rd-descuentos').value) || 0;
  const adicional = Number(document.getElementById('rd-adicional').value) || 0;
  const faltante = Number(document.getElementById('rd-faltante').value) || 0;
  const gastosTotal = _ultimoCalculoCierre ? _ultimoCalculoCierre.gastosTotal : 0;
  const saldoAnterior = resetear ? 0 : (_ultimoCalculoCierre ? _ultimoCalculoCierre.saldoAnterior : 0);

  const total = saldoAnterior + utilidad - gastosTotal - descuentos + adicional + faltante;

  const body = {
    saldo_dia_anterior_ars: saldoAnterior,
    utilidad_diaria_ars: utilidad,
    descuentos_ars: descuentos,
    utilidad_adicional_ars: adicional,
    faltante_sobrante_ars: faltante,
    tasa_us_cierre: Number(document.getElementById('rd-tasa').value) || 0,
    total_ars: total,
    notas: document.getElementById('rd-notas').value,
    resetear_acumulado: resetear,
  };

  try {
    await Api.put(`/resumen-diario/${fecha}`, body);
    UI.toast('Cierre del dia guardado.');
    await calcularCierreDelDia();
    await cargarHistorialResumen();
  } catch (err) {
    UI.toast(err.message, 'error');
  }
}

async function guardarOtrosSaldos() {
  const fecha = document.getElementById('rd-fecha').value;
  try {
    await Api.put(`/otros-saldos/${fecha}`, {
      latin_debemos_ars: Number(document.getElementById('rd-latin').value) || 0,
      moneygram_nos_debe_ars: Number(document.getElementById('rd-moneygram').value) || 0,
    });
    UI.toast('Otros saldos guardados.');
    await calcularCierreDelDia();
  } catch (err) {
    UI.toast(err.message, 'error');
  }
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
    UI.el('thead', {}, UI.el('tr', {}, ['Fecha', 'Saldo ant.', 'Utilidad diaria', 'Faltante/Sobrante', 'Total', 'Reset'].map((h) => UI.el('th', {}, h)))),
  ]);
  const tbody = UI.el('tbody');
  filas.forEach((f) => {
    tbody.appendChild(UI.el('tr', {}, [
      UI.el('td', {}, f.fecha),
      UI.el('td', {}, UI.formatoARS(f.saldo_dia_anterior_ars)),
      UI.el('td', {}, UI.formatoARS(f.utilidad_diaria_ars)),
      UI.el('td', {}, UI.formatoARS(f.faltante_sobrante_ars)),
      UI.el('td', {}, UI.formatoARS(f.total_ars)),
      UI.el('td', {}, f.resetear_acumulado ? '↺' : ''),
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
