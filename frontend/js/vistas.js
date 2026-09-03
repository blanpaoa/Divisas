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
        <h3>${cfg.esEstadoQueArrastra ? 'Cargar / actualizar un concepto' : 'Nuevo registro'}</h3>
        ${cfg.esEstadoQueArrastra ? `
        <p style="color:var(--text-muted); font-size:12px; margin-top:-6px;">
          Estos valores se arrastran solos día a día — no hace falta recargarlos si no cambiaron.
          Cargá un concepto solo cuando su valor cambie; a partir de esa fecha, ese va a ser el
          valor vigente hasta que lo vuelvas a cambiar.
        </p>` : ''}
        <form id="form-crud" class="form-grid"></form>
      </div>` : ''}
      <div class="panel">
        <h3>${cfg.esEstadoQueArrastra ? 'Estado vigente' : 'Filtros'}</h3>
        ${cfg.esEstadoQueArrastra ? `
        <div class="filters-bar">
          <div><label>Ver estado al</label><input type="date" id="f-hasta" value="${UI.hoy()}" /></div>
          <button class="btn-secondary" id="f-aplicar">Ver</button>
        </div>
        ` : `
        <div class="filters-bar">
          <div><label>Desde</label><input type="date" id="f-desde" value="${UI.haceDias(60)}" /></div>
          <div><label>Hasta</label><input type="date" id="f-hasta" value="${UI.hoy()}" /></div>
          <button class="btn-secondary" id="f-aplicar">Filtrar</button>
        </div>
        `}
        <div id="tabla-wrap"></div>
      </div>
      ${cfg.esEstadoQueArrastra ? `
      <div class="panel" style="margin-top:20px;">
        <h3>Historial completo (auditoría)</h3>
        <div class="filters-bar">
          <div><label>Desde</label><input type="date" id="fh-desde" value="${UI.haceDias(60)}" /></div>
          <div><label>Hasta</label><input type="date" id="fh-hasta" value="${UI.hoy()}" /></div>
          <button class="btn-secondary" id="fh-aplicar">Ver historial</button>
        </div>
        <div id="historial-wrap"></div>
      </div>` : ''}
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
          if (cfg.onGuardado) await cfg.onGuardado(body);
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
    if (cfg.esEstadoQueArrastra) {
      document.getElementById('fh-aplicar').addEventListener('click', () => cargarHistorialAuditoria(cfg));
      await cargarHistorialAuditoria(cfg);
    }
    await cargarTablaCrud(cfg, puedeEscribir);
  };
}

async function cargarHistorialAuditoria(cfg) {
  const desde = document.getElementById('fh-desde').value;
  const hasta = document.getElementById('fh-hasta').value;
  const wrap = document.getElementById('historial-wrap');
  wrap.innerHTML = '<div class="empty-state">Cargando...</div>';
  try {
    const filas = await Api.get(cfg.endpoint, { desde, hasta });
    if (filas.length === 0) {
      wrap.innerHTML = '<div class="empty-state">No hay registros en este periodo.</div>';
      return;
    }
    const table = UI.el('table', {}, [
      UI.el('thead', {}, UI.el('tr', {}, ['Fecha', 'Concepto', 'Moneda', 'Total ARS'].map((h) => UI.el('th', {}, h)))),
    ]);
    const tbody = UI.el('tbody');
    filas.forEach((f) => {
      tbody.appendChild(UI.el('tr', {}, [
        UI.el('td', {}, f.fecha),
        UI.el('td', {}, f.concepto),
        UI.el('td', {}, f.moneda_codigo),
        UI.el('td', {}, UI.formatoARS(f.total_ars)),
      ]));
    });
    table.appendChild(tbody);
    wrap.innerHTML = '';
    wrap.appendChild(table);
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
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
      list: campo.sugerencias ? `sugerencias-${campo.key}` : undefined,
    });
    if (campo.default !== undefined) input.value = campo.default();
    if (campo.sugerencias) {
      wrap.appendChild(
        UI.el(
          'datalist',
          { id: `sugerencias-${campo.key}` },
          campo.sugerencias.map((s) => UI.el('option', { value: s }))
        )
      );
    }
  }
  wrap.appendChild(input);
  return wrap;
}

async function cargarTablaCrud(cfg, puedeEscribir) {
  const hasta = document.getElementById('f-hasta').value;
  const wrap = document.getElementById('tabla-wrap');
  wrap.innerHTML = '<div class="empty-state">Cargando...</div>';

  let filas;
  try {
    if (cfg.esEstadoQueArrastra) {
      filas = await Api.estadoActual(cfg.endpoint, hasta);
      filas = filas.filter((f) => Number(f.total_ars) !== 0 || Number(f.valor) !== 0);
    } else {
      const desde = document.getElementById('f-desde').value;
      filas = await Api.get(cfg.endpoint, { desde, hasta });
    }
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

  // Fila de TOTAL (suma la columna total_ars, si la tabla la tiene) -- igual
  // que el renglon "TOTAL" al pie de las tablas en la planilla original.
  const colTotal = cfg.columnas.find((c) => c.key === 'total_ars');
  if (colTotal) {
    const suma = filas.reduce((s, f) => s + (Number(f.total_ars) || 0), 0);
    const tdsTotal = cfg.columnas.map((c, i) => {
      if (i === 0) return UI.el('td', { style: 'font-weight:700;' }, 'TOTAL');
      if (c.key === 'total_ars') return UI.el('td', { style: 'font-weight:700;' }, UI.formatoARS(suma));
      return UI.el('td', {}, '');
    });
    if (puedeEscribir) tdsTotal.push(UI.el('td', {}, ''));
    tbody.appendChild(UI.el('tr', { style: 'background:var(--bg-panel-light);' }, tdsTotal));
  }
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


// Formula confirmada contra la planilla real: cuando la moneda del renglon
// es Pesos (ARS), el segundo campo ("%") es en realidad OTRO MONTO que se
// SUMA (ej: "CTA BBVA LILI VENEZUELA | AR | 2.522.708 | 139.500 | 2.662.208").
// Cuando la moneda es extranjera, ese campo es la cotizacion y MULTIPLICA
// (ej: "ALO PRETA | US | 400 | 1.393,43 | 557.372").
// Sugerencias de conceptos frecuentes, confirmadas contra la planilla real
const CONCEPTOS_SUGERIDOS = [
  'Comision Latin',
  'Pago transferencia Colombia',
  'Ingreso transferencia Colombia',
];

function calcularTotalEntradaSalidaGasto(body) {
  const moneda = Estado.monedas.find((m) => m.id === Number(body.moneda_id));
  const esPesos = moneda && moneda.codigo === 'ARS';
  const valor = Number(body.valor) || 0;
  const segundo = Number(body.porcentaje) || 0;
  return { total_ars: esPesos ? valor + segundo : valor * segundo };
}

const vistaEntradas = crearVistaCrud({
  titulo: '⬇️ Entradas y prestamos (capital recibido)',
  endpoint: '/entradas',
  esEstadoQueArrastra: true,
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'concepto', label: 'Concepto', type: 'text', default: () => '', sugerencias: CONCEPTOS_SUGERIDOS },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'valor', label: 'Valor', type: 'number', default: () => 0 },
    { key: 'porcentaje', label: 'Segundo monto (si es pesos) / Cotizacion (si es otra moneda)', type: 'number', default: () => 0 },
    { key: 'observaciones', label: 'Observaciones', type: 'text', default: () => '' },
  ],
  calcularTotal: calcularTotalEntradaSalidaGasto,
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
    { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    { key: 'observaciones', label: 'Observaciones' },
  ],
});

const vistaSalidas = crearVistaCrud({
  titulo: '⬆️ Salidas / prestamos otorgados',
  endpoint: '/salidas',
  esEstadoQueArrastra: true,
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'concepto', label: 'Concepto', type: 'text', default: () => '', sugerencias: CONCEPTOS_SUGERIDOS },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'valor', label: 'Valor', type: 'number', default: () => 0 },
    { key: 'porcentaje', label: 'Segundo monto (si es pesos) / Cotizacion (si es otra moneda)', type: 'number', default: () => 0 },
    { key: 'observaciones', label: 'Observaciones', type: 'text', default: () => '' },
  ],
  calcularTotal: calcularTotalEntradaSalidaGasto,
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
    { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    { key: 'observaciones', label: 'Observaciones' },
  ],
});

const vistaGastos = crearVistaCrud({
  titulo: '🧾 Gastos',
  endpoint: '/gastos',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'concepto', label: 'Concepto', type: 'text', default: () => '', sugerencias: CONCEPTOS_SUGERIDOS },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'valor', label: 'Valor', type: 'number', default: () => 0 },
    { key: 'porcentaje', label: 'Segundo monto (si es pesos) / Cotizacion (si es otra moneda)', type: 'number', default: () => 0 },
    { key: 'observaciones', label: 'Observaciones', type: 'text', default: () => '' },
  ],
  calcularTotal: calcularTotalEntradaSalidaGasto,
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
    { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    { key: 'observaciones', label: 'Observaciones' },
  ],
});

// Calcula (sin escribir nada en la base) el saldo BRUTO acumulado de "CTA BBVA
// Lili Venezuela" y el NETO "Debo a Venezuela" para una fecha. Son dos cosas
// distintas: el bruto es lo que suma a Existencia (via Salidas), el neto es
// solo informativo. Funcion pura -- se puede llamar desde cualquier pantalla
// sin riesgo de dejar datos a medias; quien la llama decide si guarda el
// resultado o no.
async function calcularCtaVenezuela(fecha) {
  const [movPesosHoy, salidasAnteriores, historialOtrosAnterior] = await Promise.all([
    Api.get('/movimientos-pesos', { desde: fecha, hasta: fecha }),
    Api.estadoActual('/salidas', diaAnterior(fecha)),
    Api.get('/otros-saldos', { hasta: diaAnterior(fecha), desde: UI.haceDias(3650) }),
  ]);
  const bbvaVenezuelaHoy = movPesosHoy.filter((m) => m.tipo === 'salida' && m.concepto === 'CTA').reduce((s, m) => s + Number(m.monto || 0), 0);
  const abonosVenezuelaHoy = movPesosHoy.filter((m) => m.tipo === 'entrada' && m.concepto === 'CTA').reduce((s, m) => s + Number(m.monto || 0), 0);

  const ctaAnterior = salidasAnteriores.find((f) => f.concepto === 'CTA BBVA Lili Venezuela');
  const ctaBrutoAcumulado = (ctaAnterior ? Number(ctaAnterior.total_ars || 0) : 0) + bbvaVenezuelaHoy;

  const otrosAnterior = historialOtrosAnterior.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
  const deboVenezuelaAyer = otrosAnterior ? Number(otrosAnterior.debo_venezuela_ars || 0) : 0;
  const deboVenezuela = deboVenezuelaAyer + bbvaVenezuelaHoy - abonosVenezuelaHoy;

  return { ctaBrutoAcumulado, deboVenezuela };
}

// Guarda lo que calculo() ya calculo: el bruto en Salidas, el neto en Otros
// saldos. Se llama SOLO desde 'Guardar otros saldos' (Cierre diario) -- el
// unico lugar que escribe, para que nunca queden datos a medias.
async function guardarCtaVenezuela(fecha, ctaBrutoAcumulado) {
  await Estado.cargarMonedas();
  await Api.post('/salidas', {
    fecha,
    concepto: 'CTA BBVA Lili Venezuela',
    moneda_id: (Estado.monedas.find((m) => m.codigo === 'ARS') || {}).id,
    valor: ctaBrutoAcumulado,
    porcentaje: 0,
    total_ars: ctaBrutoAcumulado,
  });
}

// MoneyGram / Latin: formula del usuario, confirmada exacta contra 6 dias
// reales. Tambien pura -- solo calcula, no escribe.
async function calcularLatinMoneygram(fecha) {
  const [movPesosHoy, historialOtrosAnterior] = await Promise.all([
    Api.get('/movimientos-pesos', { desde: fecha, hasta: fecha }),
    Api.get('/otros-saldos', { hasta: diaAnterior(fecha), desde: UI.haceDias(3650) }),
  ]);
  const salidaMHoy = movPesosHoy.filter((m) => m.tipo === 'salida' && m.concepto === 'MONEY').reduce((s, m) => s + Number(m.monto || 0), 0);
  const entradaMHoy = movPesosHoy.filter((m) => m.tipo === 'entrada' && m.concepto === 'MONEY').reduce((s, m) => s + Number(m.monto || 0), 0);
  const abonoLatinHoy = movPesosHoy.filter((m) => m.tipo === 'entrada' && m.concepto === 'LATIN').reduce((s, m) => s + Number(m.monto || 0), 0);

  const otrosAnterior = historialOtrosAnterior.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
  const moneygramAyer = otrosAnterior ? Number(otrosAnterior.moneygram_nos_debe_ars || 0) : 0;
  const latinAyer = otrosAnterior ? Number(otrosAnterior.latin_debemos_ars || 0) : 0;
  const moneygram = moneygramAyer + salidaMHoy - abonoLatinHoy;
  const latin = latinAyer + entradaMHoy;

  return { moneygram, latin };
}

const vistaMovimientosPesos = crearVistaCrud({
  titulo: '💵 Movimientos de pesos',
  endpoint: '/movimientos-pesos',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'tipo', label: 'Tipo', type: 'select', options: [
      { value: 'salida', label: 'Salida' },
      { value: 'entrada', label: 'Entrada' },
    ] },
    { key: 'concepto', label: 'Concepto', type: 'select', options: [
      { value: 'MONEY', label: 'MONEY (códigos m/M/L — Moneygram/Latin)' },
      { value: 'LATIN', label: 'LATIN (Abono Latin)' },
      { value: 'CTA', label: 'CTA (CTA BBVA Lili Venezuela)' },
      { value: 'OTROS', label: 'OTROS' },
    ] },
    { key: 'monto', label: 'Monto (ARS)', type: 'number', default: () => 0 },
    { key: 'observaciones', label: 'Observaciones (código "m 12345678", nota, etc)', type: 'text', default: () => '' },
  ],
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'tipo', label: 'Tipo', html: true, render: (f) => `<span class="badge ${f.tipo === 'entrada' ? 'compra' : 'venta'}">${f.tipo.toUpperCase()}</span>` },
    { key: 'concepto', label: 'Concepto' },
    { key: 'monto', label: 'Monto', render: (f) => UI.formatoARS(f.monto) },
    { key: 'observaciones', label: 'Observaciones' },
  ],
});

const vistaDepositosBancarios = crearVistaCrud({
  titulo: '🏦 Depósitos bancarios',
  endpoint: '/depositos-bancarios',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'monto', label: 'Monto (ARS)', type: 'number', default: () => 0 },
    { key: 'notas', label: 'Notas', type: 'text', default: () => '' },
  ],
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'monto', label: 'Monto', render: (f) => UI.formatoARS(f.monto) },
    { key: 'notas', label: 'Notas' },
  ],
});

const vistaCierresVenezuela = crearVistaCrud({
  titulo: '🇻🇪 Cierres de Venezuela (USD)',
  endpoint: '/cierres-venezuela',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'tipo', label: 'Tipo', type: 'select', options: [
      { value: 'salida', label: 'Salida' },
      { value: 'entrada', label: 'Entrada' },
    ] },
    { key: 'moneda_id', label: 'Moneda', type: 'select-moneda' },
    { key: 'cantidad', label: 'Cantidad', type: 'number', default: () => 0 },
    { key: 'concepto', label: 'Concepto', type: 'text', default: () => '' },
  ],
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'tipo', label: 'Tipo', html: true, render: (f) => `<span class="badge ${f.tipo === 'entrada' ? 'compra' : 'venta'}">${f.tipo.toUpperCase()}</span>` },
    { key: 'moneda_codigo', label: 'Moneda' },
    { key: 'cantidad', label: 'Cantidad', render: (f) => UI.formatoNumero(f.cantidad) },
    { key: 'concepto', label: 'Concepto' },
  ],
});

const vistaAjustesLibres = crearVistaCrud({
  titulo: '🧩 Ajustes libres',
  endpoint: '/ajustes-libres',
  campos: [
    { key: 'fecha', label: 'Fecha', type: 'date', default: () => UI.hoy() },
    { key: 'categoria', label: 'Categoría', type: 'text', default: () => '', sugerencias: [
      'UT', 'LUJ', 'VE', 'Latin/Moneygram detalle', 'Pago obligaciones', 'Otro',
    ] },
    { key: 'concepto', label: 'Concepto / observación', type: 'text', default: () => '' },
    { key: 'monto', label: 'Monto (ARS)', type: 'number', default: () => 0 },
    { key: 'afecta', label: 'Afecta a', type: 'select', options: [
      { value: 'ninguno', label: 'Solo informativo (no afecta cálculos)' },
      { value: 'existencia', label: 'Suma a Existencia' },
      { value: 'debemos', label: 'Suma a Debemos' },
    ] },
  ],
  columnas: [
    { key: 'fecha', label: 'Fecha' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'concepto', label: 'Concepto' },
    { key: 'monto', label: 'Monto', render: (f) => UI.formatoARS(f.monto) },
    { key: 'afecta', label: 'Afecta a' },
  ],
});

async function vistaTransferencias(contenedor) {
  await Estado.cargarMonedas();
  contenedor.innerHTML = `
    <header class="page-header"><h1>🌎 Transferencias (Colombia / Venezuela / otros)</h1></header>

    <div class="panel" style="margin-bottom:20px;">
      <h3>Nueva transferencia / movimiento</h3>
      <form id="form-transferencia" class="form-grid">
        <div><label>Fecha</label><input type="date" id="tr-fecha" value="${UI.hoy()}" /></div>
        <div>
          <label>Destino</label>
          <input type="text" id="tr-destino" list="tr-destinos-sugeridos" value="COLOMBIA" />
          <datalist id="tr-destinos-sugeridos">
            <option value="COLOMBIA"></option>
            <option value="VENEZUELA - BBVA"></option>
          </datalist>
        </div>
        <div>
          <label>Tipo</label>
          <select id="tr-tipo">
            <option value="ingreso">Ingreso (recibimos plata)</option>
            <option value="egreso">Egreso (pagamos / enviamos)</option>
            <option value="debemos">Debemos</option>
            <option value="abonos">Abonos (pago de lo que debiamos)</option>
          </select>
        </div>
        <div><label>Moneda</label><select id="tr-moneda"></select></div>
        <div><label>Valor</label><input type="number" step="any" id="tr-valor" value="0" /></div>
        <div><label>Referencia (Nº cuenta/transaccion, opcional)</label><input type="text" id="tr-referencia" /></div>
        <div class="form-row-full"><label>Notas</label><input type="text" id="tr-notas" /></div>
        <div class="form-row-full"><button type="submit" class="btn-primary">Guardar</button></div>
      </form>
    </div>

    <div class="panel" style="margin-bottom:20px;">
      <h3>Saldo neto por destino y moneda</h3>
      <p style="color:var(--text-muted); font-size:12px; margin-top:-6px;">
        Ingresos + Abonos − Egresos − Debemos, sumando todo el historial cargado.
      </p>
      <div id="tr-resumen" class="cards-grid"></div>
    </div>

    <div class="panel">
      <h3>Historial</h3>
      <div class="filters-bar">
        <div><label>Desde</label><input type="date" id="f-desde" value="${UI.haceDias(60)}" /></div>
        <div><label>Hasta</label><input type="date" id="f-hasta" value="${UI.hoy()}" /></div>
        <button class="btn-secondary" id="f-aplicar">Filtrar</button>
      </div>
      <div id="tr-tabla-wrap"></div>
    </div>
  `;

  const selectMoneda = document.getElementById('tr-moneda');
  Estado.monedas.forEach((m) => {
    selectMoneda.appendChild(UI.el('option', { value: m.id }, `${m.codigo} - ${m.nombre}`));
  });

  document.getElementById('form-transferencia').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await Api.post('/transferencias', {
        fecha: document.getElementById('tr-fecha').value,
        destino: document.getElementById('tr-destino').value,
        tipo: document.getElementById('tr-tipo').value,
        moneda_id: Number(selectMoneda.value),
        valor: Number(document.getElementById('tr-valor').value) || 0,
        referencia: document.getElementById('tr-referencia').value,
        notas: document.getElementById('tr-notas').value,
      });
      UI.toast('Movimiento guardado.');
      document.getElementById('form-transferencia').reset();
      document.getElementById('tr-fecha').value = UI.hoy();
      cargarTransferencias();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  });

  document.getElementById('f-aplicar').addEventListener('click', cargarTransferencias);
  await cargarTransferencias();
}

async function cargarTransferencias() {
  const desde = document.getElementById('f-desde').value;
  const hasta = document.getElementById('f-hasta').value;
  const resumenWrap = document.getElementById('tr-resumen');
  const tablaWrap = document.getElementById('tr-tabla-wrap');
  tablaWrap.innerHTML = '<div class="empty-state">Cargando...</div>';

  // El resumen de saldo neto usa TODO el historial (no solo el filtro de fecha)
  let todas, filtradas;
  try {
    [todas, filtradas] = await Promise.all([
      Api.get('/transferencias', {}),
      Api.get('/transferencias', { desde, hasta }),
    ]);
  } catch (err) {
    tablaWrap.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
    return;
  }

  const saldos = {}; // `${destino}|${moneda_codigo}` -> saldo
  todas.forEach((t) => {
    const key = `${t.destino}|${t.moneda_codigo}`;
    const signo = (t.tipo === 'ingreso' || t.tipo === 'abonos') ? 1 : -1;
    saldos[key] = (saldos[key] || 0) + signo * Number(t.valor || 0);
  });

  resumenWrap.innerHTML = '';
  const entradasResumen = Object.entries(saldos);
  if (entradasResumen.length === 0) {
    resumenWrap.appendChild(UI.el('div', { class: 'empty-state' }, 'Todavia no hay movimientos cargados.'));
  } else {
    entradasResumen.forEach(([key, saldo]) => {
      const [destino, monedaCodigo] = key.split('|');
      resumenWrap.appendChild(UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, `${destino} (${monedaCodigo})`),
        UI.el('div', { class: `value ${saldo >= 0 ? 'positivo' : 'negativo'}` }, UI.formatoNumero(saldo)),
      ]));
    });
  }

  if (filtradas.length === 0) {
    tablaWrap.innerHTML = '<div class="empty-state">No hay movimientos en este periodo.</div>';
    return;
  }

  const table = UI.el('table', {}, [
    UI.el('thead', {}, UI.el('tr', {}, ['Fecha', 'Destino', 'Tipo', 'Moneda', 'Valor', 'Referencia', 'Notas', ''].map((h) => UI.el('th', {}, h)))),
  ]);
  const tbody = UI.el('tbody');
  filtradas.forEach((t) => {
    tbody.appendChild(UI.el('tr', {}, [
      UI.el('td', {}, t.fecha),
      UI.el('td', {}, t.destino),
      UI.el('td', {}, t.tipo),
      UI.el('td', {}, t.moneda_codigo),
      UI.el('td', {}, UI.formatoNumero(t.valor)),
      UI.el('td', {}, t.referencia || ''),
      UI.el('td', {}, t.notas || ''),
      UI.el('td', { class: 'table-actions' }, UI.el('button', {
        onclick: async () => {
          if (!confirm('¿Eliminar este movimiento?')) return;
          try {
            await Api.delete(`/transferencias/${t.id}`);
            UI.toast('Eliminado.');
            cargarTransferencias();
          } catch (err) {
            UI.toast(err.message, 'error');
          }
        },
      }, '🗑️')),
    ]));
  });
  table.appendChild(tbody);
  tablaWrap.innerHTML = '';
  tablaWrap.appendChild(table);
}


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
   CIERRE DIARIO — Utilidad y Gastos se acumulan por SEPARADO (cada uno
   con su propio reset independiente), igual que la planilla real:
     UTILIDAD ACUMULADA(hoy) = utilidad de hoy + UTILIDAD ACUMULADA(ayer)
     GASTOS ACUMULADO(hoy)   = gastos de hoy   + GASTOS ACUMULADO(ayer)
     TOTAL = UTILIDAD ACUMULADA - GASTOS ACUMULADO
   ====================================================================== */
async function vistaResumenDiario(contenedor) {
  await Estado.cargarMonedas();
  contenedor.innerHTML = `
    <header class="page-header"><h1>📅 Cierre diario</h1></header>
    <div class="panel" style="margin-bottom:20px;">
      <div class="filters-bar">
        <div><label>Fecha</label><input type="date" id="rd-fecha" value="${UI.hoy()}" /></div>
        <button class="btn-secondary" id="rd-calcular">Ver</button>
      </div>
    </div>
    <div id="rd-registros"></div>
    <div class="panel" style="margin-bottom:20px;">
      <h3>Cerrar el día</h3>
      <p style="color:var(--text-muted); font-size:12px; margin-top:-6px;">
        Todo lo demás (utilidad de compra/venta, gastos, Latin, MoneyGram, Debo a Venezuela) se
        calcula solo a partir de lo que ya cargaste en las otras pantallas. Completá esto y tocá
        el botón.
      </p>
      <form id="form-resumen" class="form-grid">
        <div><label>Utilidad Venezuela del día (ARS)</label><input type="number" step="any" id="rd-cadivi-dia" value="0" /></div>
        <div class="form-row-full"><button type="submit" class="btn-primary">Cerrar el día</button></div>
      </form>
    </div>
    <div id="rd-resultado"></div>
  `;
  document.getElementById('rd-calcular').addEventListener('click', cargarRegistrosDelDia);
  document.getElementById('form-resumen').addEventListener('submit', cerrarElDia);
  await cargarRegistrosDelDia();
}

// Muestra, de solo lectura, todo lo que ya se cargo para el dia en las
// pantallas correspondientes (Compra/Venta, Entradas, Salidas, Gastos,
// Movimientos de pesos) -- para editar cada cosa se usa su pantalla propia.
async function cargarRegistrosDelDia() {
  const fecha = document.getElementById('rd-fecha').value;
  const wrap = document.getElementById('rd-registros');
  wrap.innerHTML = '<div class="empty-state">Cargando...</div>';
  try {
    const [operaciones, entradas, salidas, gastos, movPesos] = await Promise.all([
      Api.get('/operaciones', { desde: fecha, hasta: fecha }),
      Api.estadoActual('/entradas', fecha),
      Api.estadoActual('/salidas', fecha),
      Api.get('/gastos', { desde: fecha, hasta: fecha }),
      Api.get('/movimientos-pesos', { desde: fecha, hasta: fecha }),
    ]);
    wrap.innerHTML = '';
    wrap.appendChild(panelTabla('🔄 Compra / Venta', [
      { key: 'tipo', label: 'Tipo' }, { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'cantidad', label: 'Cantidad', render: (f) => UI.formatoNumero(f.cantidad) },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], operaciones, 'total_ars'));
    wrap.appendChild(panelTabla('⬇️ Entradas y préstamos (estado vigente)', [
      { key: 'concepto', label: 'Concepto' }, { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], entradas.filter((f) => Number(f.total_ars) !== 0), 'total_ars'));
    wrap.appendChild(panelTabla('⬆️ Salidas / préstamos (estado vigente)', [
      { key: 'concepto', label: 'Concepto' }, { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], salidas.filter((f) => Number(f.total_ars) !== 0), 'total_ars'));
    wrap.appendChild(panelTabla('🧾 Gastos', [
      { key: 'concepto', label: 'Concepto' }, { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], gastos, 'total_ars'));
    wrap.appendChild(panelTabla('💵 Movimientos de pesos', [
      { key: 'tipo', label: 'Tipo' }, { key: 'concepto', label: 'Concepto' },
      { key: 'monto', label: 'Monto', render: (f) => UI.formatoARS(f.monto) },
    ], movPesos, 'monto'));
  } catch (err) {
    wrap.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
}

function diaAnterior(fechaStr) {
  const d = new Date(fechaStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Hace TODO en un solo paso: calcula utilidad (motor), gastos (suma de la
// tabla), Latin/MoneyGram/Debo-a-Venezuela (formulas confirmadas), y
// encadena Utilidad Venezuela y Utilidad/Gastos acumulados -- todo junto,
// una sola escritura atomica por tabla, sin estados intermedios.
async function cerrarElDia(e) {
  e.preventDefault();
  const fecha = document.getElementById('rd-fecha').value;
  const cadiviDia = Number(document.getElementById('rd-cadivi-dia').value) || 0;
  const resultadoWrap = document.getElementById('rd-resultado');
  resultadoWrap.innerHTML = '<div class="empty-state">Cerrando el día...</div>';

  try {
    const [motor, gastosHoy, historialAnterior, entradas, salidas] = await Promise.all([
      Api.get('/motor/posiciones', { hasta: fecha }),
      Api.get('/gastos', { desde: fecha, hasta: fecha }),
      Api.get('/resumen-diario', { hasta: diaAnterior(fecha), desde: UI.haceDias(3650) }),
      Api.estadoActual('/entradas', fecha),
      Api.estadoActual('/salidas', fecha),
    ]);

    const utilidadDia = motor.fechaCalculada === fecha ? motor.utilidadDelDia : 0;
    const gastosDia = gastosHoy.reduce((s, g) => s + Number(g.total_ars || 0), 0);

    const anterior = historialAnterior.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
    const utilidadAcumAnterior = anterior ? Number(anterior.utilidad_acumulada_ars || 0) : 0;
    const gastosAcumAnterior = anterior ? Number(anterior.gastos_acumulado_ars || 0) : 0;
    const cadiviAcumAnterior = anterior ? Number(anterior.utilidad_cadivi_ars || 0) : 0;
    const faltanteAcumAnterior = anterior ? Number(anterior.faltante_sobrante_ars || 0) : 0;

    const utilidadAcumulada = utilidadDia + utilidadAcumAnterior;
    const gastosAcumulado = gastosDia + gastosAcumAnterior;
    const utilidadCadivi = cadiviAcumAnterior + cadiviDia; // sin descuentos/adicional -- simplificado
    const faltanteSobrante = faltanteAcumAnterior; // no se toca -- se mantiene igual que ayer
    const total = utilidadAcumulada - gastosAcumulado;

    const { moneygram, latin } = await calcularLatinMoneygram(fecha);
    const { ctaBrutoAcumulado, deboVenezuela } = await calcularCtaVenezuela(fecha);

    await Api.put(`/resumen-diario/${fecha}`, {
      utilidad_diaria_ars: utilidadDia,
      gastos_dia_ars: gastosDia,
      cadivi_dia_ars: cadiviDia,
      cadivi_descuentos_ars: 0,
      cadivi_adicional_ars: 0,
      utilidad_cadivi_ars: utilidadCadivi,
      faltante_dia_ars: 0,
      faltante_descuento_ars: 0,
      faltante_sobrante_ars: faltanteSobrante,
      utilidad_acumulada_ars: utilidadAcumulada,
      gastos_acumulado_ars: gastosAcumulado,
      total_ars: total,
      resetear_utilidad_acumulada: false,
      resetear_gastos_acumulado: false,
      resetear_cadivi: false,
      resetear_faltante: false,
    });
    await Api.put(`/otros-saldos/${fecha}`, {
      latin_debemos_ars: latin,
      moneygram_nos_debe_ars: moneygram,
      debo_venezuela_ars: deboVenezuela,
    });
    await guardarCtaVenezuela(fecha, ctaBrutoAcumulado);

    // Chequeo final: Existencia vs Debemos
    const existenciaTenencias = Object.values(motor.monedas || {}).reduce((s, p) => s + p.cantidad * p.costo_promedio, 0);
    const salidaTotal = salidas.reduce((s, r) => s + Number(r.total_ars || 0), 0);
    const entradasTotal = entradas.reduce((s, r) => s + Number(r.total_ars || 0), 0);
    const existencia = existenciaTenencias + salidaTotal + moneygram;
    const debemos = entradasTotal + utilidadCadivi + faltanteSobrante + latin;
    const diferencia = existencia - debemos;
    const ok = Math.abs(diferencia) < 1;

    resultadoWrap.innerHTML = '';
    const panel = UI.el('div', { class: 'panel' }, [UI.el('h3', {}, '✅ Día cerrado')]);
    const grid = UI.el('div', { class: 'cards-grid' });
    [
      ['Utilidad del día', utilidadDia, 'positivo'],
      ['Gastos del día', gastosDia, 'negativo'],
      ['TOTAL (Utilidad − Gastos acum.)', total, total >= 0 ? 'positivo' : 'negativo'],
      ['Existencia', existencia, ''],
      ['Debemos', debemos, ''],
      ['Diferencia', diferencia, ok ? 'positivo' : 'negativo'],
    ].forEach(([label, valor, clase]) => {
      grid.appendChild(UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, label),
        UI.el('div', { class: `value ${clase}` }, UI.formatoARS(valor)),
      ]));
    });
    panel.appendChild(grid);
    panel.appendChild(UI.el('div', {
      style: `margin-top:10px; padding:10px 14px; border-radius:8px; font-size:13px; background:${ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}; color:${ok ? 'var(--primary)' : 'var(--danger)'};`,
    }, ok ? '✓ Cierra correctamente.' : '⚠ Hay una diferencia sin explicar.'));
    resultadoWrap.appendChild(panel);
    UI.toast('Día cerrado.');
  } catch (err) {
    resultadoWrap.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
    UI.toast(err.message, 'error');
  }
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
        <button class="btn-secondary" id="um-autocompletar">🔄 Autocompletar Utilidades Libres desde Cierre diario</button>
      </div>
    </header>
    <p style="color:var(--text-muted); font-size:13px; margin-top:-10px;">
      "Utilidades Libres" (ARS) se puede autocompletar sumando la utilidad diaria ya calculada
      en <strong>Cierre diario</strong> para cada mes. "Total US" se calcula solo dividiendo
      Utilidades Libres por la Tasa de cierre que cargues — igual que en la planilla original.
      Todo sigue siendo editable.
    </p>
    <div class="panel">
      <table>
        <thead><tr><th>Mes</th><th>Tasa de cierre</th><th>Utilidades Libres (ARS)</th><th>Total US</th><th>Notas</th><th></th></tr></thead>
        <tbody id="um-tbody"></tbody>
      </table>
    </div>
  `;
  document.getElementById('um-aplicar').addEventListener('click', cargarUtilidadMensual);
  document.getElementById('um-autocompletar').addEventListener('click', autocompletarUtilidadAnual);
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
    const registro = porMes[mes] || { utilidad_us: 0, utilidad_ars: 0, tasa_cierre: 0, notas: '' };
    const idTasa = `um-tasa-${mes}`, idArs = `um-ars-${mes}`, idUs = `um-us-${mes}`, idNotas = `um-notas-${mes}`;

    const inputTasa = UI.el('input', { type: 'number', step: 'any', id: idTasa, value: registro.tasa_cierre, style: 'margin-bottom:0;' });
    const inputArs = UI.el('input', { type: 'number', step: 'any', id: idArs, value: registro.utilidad_ars, style: 'margin-bottom:0;' });
    const inputUs = UI.el('input', { type: 'number', step: 'any', id: idUs, value: registro.utilidad_us, style: 'margin-bottom:0;' });

    const recalcularUs = () => {
      const tasa = Number(inputTasa.value) || 0;
      const ars = Number(inputArs.value) || 0;
      if (tasa > 0) inputUs.value = ars / tasa;
    };
    inputTasa.addEventListener('input', recalcularUs);
    inputArs.addEventListener('input', recalcularUs);

    const tr = UI.el('tr', {}, [
      UI.el('td', {}, NOMBRES_MESES[mes - 1]),
      UI.el('td', {}, inputTasa),
      UI.el('td', {}, inputArs),
      UI.el('td', {}, inputUs),
      UI.el('td', {}, UI.el('input', { type: 'text', id: idNotas, value: registro.notas || '', style: 'margin-bottom:0;' })),
      UI.el('td', {}, UI.el('button', { class: 'btn-secondary', onclick: () => guardarUtilidadMes(anio, mes, idUs, idArs, idNotas, idTasa) }, 'Guardar')),
    ]);
    tbody.appendChild(tr);
  }
}

// Suma la utilidad diaria (Cierre diario) de cada mes del año elegido, y precarga
// el campo "Utilidades Libres" de cada fila con ese total (sin guardar todavia -- el
// usuario revisa y toca "Guardar" en cada mes que le parezca correcto).
async function autocompletarUtilidadAnual() {
  const anio = Number(document.getElementById('um-anio').value);
  UI.toast('Sumando utilidad diaria por mes...');
  try {
    const desde = `${anio}-01-01`;
    const hasta = `${anio}-12-31`;
    const filas = await Api.get('/resumen-diario', { desde, hasta });

    const totalesPorMes = {};
    filas.forEach((f) => {
      const mes = Number(f.fecha.slice(5, 7));
      totalesPorMes[mes] = (totalesPorMes[mes] || 0) + Number(f.utilidad_diaria_ars || 0);
    });

    for (let mes = 1; mes <= 12; mes++) {
      const input = document.getElementById(`um-ars-${mes}`);
      if (input && totalesPorMes[mes] !== undefined) {
        input.value = totalesPorMes[mes];
        input.dispatchEvent(new Event('input'));
      }
    }
    UI.toast('Listo. Revisa cada mes y toca "Guardar" para confirmar.');
  } catch (err) {
    UI.toast(err.message, 'error');
  }
}

async function guardarUtilidadMes(anio, mes, idUs, idArs, idNotas, idTasa) {
  try {
    await Api.put(`/utilidad-mensual/${anio}/${mes}`, {
      utilidad_us: Number(document.getElementById(idUs).value) || 0,
      utilidad_ars: Number(document.getElementById(idArs).value) || 0,
      tasa_cierre: Number(document.getElementById(idTasa).value) || 0,
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
/* ======================================================================
   COMISIONES MENSUALES (Latin Express / MoneyGram)
   ====================================================================== */
async function vistaComisionesMensuales(contenedor) {
  const anioActual = new Date().getFullYear();
  contenedor.innerHTML = `
    <header class="page-header">
      <h1>💳 Comisiones Latin / Moneygram</h1>
      <div class="filters-bar">
        <div><label>Año</label><input type="number" id="cm-anio" value="${anioActual}" /></div>
        <button class="btn-secondary" id="cm-aplicar">Ver</button>
      </div>
    </header>
    <div class="panel">
      <table>
        <thead><tr><th>Mes</th><th>Latin</th><th>Money</th><th>Total</th><th>Fecha</th><th>Notas</th><th></th></tr></thead>
        <tbody id="cm-tbody"></tbody>
        <tfoot><tr style="font-weight:700;"><td>TOTAL AÑO</td><td id="cm-total-latin">0</td><td id="cm-total-money">0</td><td id="cm-total-total">0</td><td colspan="3"></td></tr></tfoot>
      </table>
    </div>
  `;
  document.getElementById('cm-aplicar').addEventListener('click', cargarComisionesMensuales);
  await cargarComisionesMensuales();
}

async function cargarComisionesMensuales() {
  const anio = document.getElementById('cm-anio').value;
  const data = await Api.get('/comisiones-mensuales', { anio });
  const porMes = {};
  data.forEach((d) => { porMes[d.mes] = d; });

  const tbody = document.getElementById('cm-tbody');
  tbody.innerHTML = '';
  let sumaLatin = 0, sumaMoney = 0;

  for (let mes = 1; mes <= 12; mes++) {
    const registro = porMes[mes] || { latin: 0, money: 0, fecha: '', notas: '' };
    sumaLatin += Number(registro.latin || 0);
    sumaMoney += Number(registro.money || 0);

    const idLatin = `cm-latin-${mes}`, idMoney = `cm-money-${mes}`, idTotal = `cm-total-${mes}`;
    const idFecha = `cm-fecha-${mes}`, idNotas = `cm-notas-${mes}`;

    const inputLatin = UI.el('input', { type: 'number', step: 'any', id: idLatin, value: registro.latin, style: 'margin-bottom:0;' });
    const inputMoney = UI.el('input', { type: 'number', step: 'any', id: idMoney, value: registro.money, style: 'margin-bottom:0;' });
    const spanTotal = UI.el('span', { id: idTotal }, UI.formatoNumero(Number(registro.latin || 0) + Number(registro.money || 0)));

    const recalcular = () => {
      const total = (Number(inputLatin.value) || 0) + (Number(inputMoney.value) || 0);
      spanTotal.textContent = UI.formatoNumero(total);
    };
    inputLatin.addEventListener('input', recalcular);
    inputMoney.addEventListener('input', recalcular);

    tbody.appendChild(UI.el('tr', {}, [
      UI.el('td', {}, NOMBRES_MESES[mes - 1]),
      UI.el('td', {}, inputLatin),
      UI.el('td', {}, inputMoney),
      UI.el('td', {}, spanTotal),
      UI.el('td', {}, UI.el('input', { type: 'date', id: idFecha, value: registro.fecha || '', style: 'margin-bottom:0;' })),
      UI.el('td', {}, UI.el('input', { type: 'text', id: idNotas, value: registro.notas || '', style: 'margin-bottom:0;' })),
      UI.el('td', {}, UI.el('button', { class: 'btn-secondary', onclick: () => guardarComisionMes(anio, mes, idLatin, idMoney, idFecha, idNotas) }, 'Guardar')),
    ]));
  }

  document.getElementById('cm-total-latin').textContent = UI.formatoNumero(sumaLatin);
  document.getElementById('cm-total-money').textContent = UI.formatoNumero(sumaMoney);
  document.getElementById('cm-total-total').textContent = UI.formatoNumero(sumaLatin + sumaMoney);
}

async function guardarComisionMes(anio, mes, idLatin, idMoney, idFecha, idNotas) {
  try {
    const fechaVal = document.getElementById(idFecha).value;
    await Api.put(`/comisiones-mensuales/${anio}/${mes}`, {
      latin: Number(document.getElementById(idLatin).value) || 0,
      money: Number(document.getElementById(idMoney).value) || 0,
      fecha: fechaVal || null,
      notas: document.getElementById(idNotas).value,
    });
    UI.toast(`${NOMBRES_MESES[mes - 1]} guardado.`);
  } catch (err) {
    UI.toast(err.message, 'error');
  }
}

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
/* ======================================================================
   PRESTAMOS: con estado (pendiente/parcial/pagado) y saldo por persona
   ====================================================================== */
async function vistaPrestamos(contenedor) {
  await Estado.cargarMonedas();
  contenedor.innerHTML = `
    <header class="page-header"><h1>🤝 Prestamos</h1></header>

    <div class="panel" style="margin-bottom:20px;">
      <h3>Nuevo prestamo</h3>
      <form id="form-prestamo" class="form-grid">
        <div>
          <label>Tipo</label>
          <select id="pr-tipo">
            <option value="nos_deben">Nos deben (prestamos nosotros)</option>
            <option value="debemos">Debemos (nos prestaron a nosotros)</option>
          </select>
        </div>
        <div><label>Persona</label><input type="text" id="pr-persona" required /></div>
        <div><label>Moneda</label><select id="pr-moneda"></select></div>
        <div><label>Monto original</label><input type="number" step="any" id="pr-monto" value="0" /></div>
        <div><label>Fecha</label><input type="date" id="pr-fecha" value="${UI.hoy()}" /></div>
        <div class="form-row-full"><label>Concepto / notas</label><input type="text" id="pr-concepto" /></div>
        <div class="form-row-full"><button type="submit" class="btn-primary">Guardar prestamo</button></div>
      </form>
    </div>

    <div class="panel" style="margin-bottom:20px;">
      <h3>Resumen por moneda (solo saldos pendientes)</h3>
      <div id="pr-resumen" class="cards-grid"></div>
    </div>

    <div class="panel">
      <h3>Listado</h3>
      <div class="filters-bar">
        <div>
          <label>Tipo</label>
          <select id="f-tipo">
            <option value="">Todos</option>
            <option value="nos_deben">Nos deben</option>
            <option value="debemos">Debemos</option>
          </select>
        </div>
        <div>
          <label>Estado</label>
          <select id="f-estado">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="parcial">Parcial</option>
            <option value="pagado">Pagado</option>
          </select>
        </div>
        <button class="btn-secondary" id="f-aplicar">Filtrar</button>
      </div>
      <div id="pr-tabla-wrap"></div>
    </div>
  `;

  const selectMoneda = document.getElementById('pr-moneda');
  Estado.monedas.forEach((m) => {
    selectMoneda.appendChild(UI.el('option', { value: m.id }, `${m.codigo} - ${m.nombre}`));
  });

  document.getElementById('form-prestamo').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const tipo = document.getElementById('pr-tipo').value;
      const persona = document.getElementById('pr-persona').value;
      const monedaId = Number(selectMoneda.value);
      const montoOriginal = Number(document.getElementById('pr-monto').value) || 0;
      const fecha = document.getElementById('pr-fecha').value;
      const concepto = document.getElementById('pr-concepto').value;

      const { id } = await Api.post('/prestamos', {
        tipo, persona, moneda_id: monedaId, monto_original: montoOriginal, fecha, concepto,
      });
      await sincronizarPrestamoConEntradaSalida({ id, tipo, persona, concepto, moneda_id: monedaId, fecha }, montoOriginal);

      UI.toast('Prestamo guardado.');
      document.getElementById('form-prestamo').reset();
      document.getElementById('pr-fecha').value = UI.hoy();
      cargarPrestamos();
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  });

  document.getElementById('f-aplicar').addEventListener('click', cargarPrestamos);
  await cargarPrestamos();
}

// Crea/actualiza el renglon vigente en Entradas (si tipo='debemos') o Salidas
// (si tipo='nos_deben') con el saldo pendiente actual del prestamo. El concepto
// incluye el ID del prestamo para que cada uno tenga su propio renglon, sin
// mezclarse con otros prestamos de la misma persona.
async function sincronizarPrestamoConEntradaSalida(prestamo, saldoPendiente) {
  const endpoint = prestamo.tipo === 'nos_deben' ? '/salidas' : '/entradas';
  const conceptoBase = prestamo.concepto ? prestamo.concepto : 'Prestamo';
  const concepto = prestamo.concepto_vinculado || `${prestamo.persona} - ${conceptoBase} #${prestamo.id}`;
  const moneda = Estado.monedas.find((m) => m.id === Number(prestamo.moneda_id));
  const esPesos = moneda && moneda.codigo === 'ARS';

  let porcentaje = 0; // en pesos, "porcentaje" suma 0 -> total_ars = valor
  if (!esPesos) {
    // en moneda extranjera, "porcentaje" es la cotizacion que multiplica -- buscamos
    // la tasa del dia mas reciente para que el total_ars sea razonable
    try {
      const tasa = await Api.buscarTasaMasReciente(UI.hoy(), prestamo.moneda_id);
      porcentaje = tasa || 1;
    } catch (err) {
      porcentaje = 1;
    }
  }

  const body = { fecha: UI.hoy(), concepto, moneda_id: prestamo.moneda_id, valor: saldoPendiente, porcentaje };
  Object.assign(body, calcularTotalEntradaSalidaGasto(body));
  await Api.post(endpoint, body);
}

async function cargarPrestamos() {
  const tipo = document.getElementById('f-tipo').value;
  const estado = document.getElementById('f-estado').value;
  const resumenWrap = document.getElementById('pr-resumen');
  const tablaWrap = document.getElementById('pr-tabla-wrap');
  tablaWrap.innerHTML = '<div class="empty-state">Cargando...</div>';

  let prestamos;
  try {
    prestamos = await Api.get('/prestamos', { tipo, estado });
  } catch (err) {
    tablaWrap.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
    return;
  }

  // Resumen de saldos pendientes por moneda y tipo
  const resumen = {}; // `${tipo}|${moneda_codigo}` -> total
  prestamos.forEach((p) => {
    if (p.estado === 'pagado') return;
    const key = `${p.tipo}|${p.moneda_codigo}`;
    resumen[key] = (resumen[key] || 0) + p.saldo_pendiente;
  });
  resumenWrap.innerHTML = '';
  const entradas = Object.entries(resumen);
  if (entradas.length === 0) {
    resumenWrap.appendChild(UI.el('div', { class: 'empty-state' }, 'No hay saldos pendientes.'));
  } else {
    entradas.forEach(([key, total]) => {
      const [tipoKey, monedaCodigo] = key.split('|');
      resumenWrap.appendChild(UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, `${tipoKey === 'nos_deben' ? 'Nos deben' : 'Debemos'} (${monedaCodigo})`),
        UI.el('div', { class: `value ${tipoKey === 'nos_deben' ? 'positivo' : 'negativo'}` }, UI.formatoNumero(total)),
      ]));
    });
  }

  if (prestamos.length === 0) {
    tablaWrap.innerHTML = '<div class="empty-state">No hay prestamos cargados.</div>';
    return;
  }

  const table = UI.el('table', {}, [
    UI.el('thead', {}, UI.el('tr', {}, ['Persona', 'Tipo', 'Moneda', 'Original', 'Pagado', 'Saldo', 'Estado', 'Fecha', ''].map((h) => UI.el('th', {}, h)))),
  ]);
  const tbody = UI.el('tbody');
  prestamos.forEach((p) => {
    const filaId = `pr-fila-${p.id}`;
    const badgeEstado = { pendiente: 'venta', parcial: 'operador', pagado: 'compra' }[p.estado] || '';
    tbody.appendChild(UI.el('tr', { id: filaId }, [
      UI.el('td', {}, p.persona),
      UI.el('td', {}, p.tipo === 'nos_deben' ? 'Nos deben' : 'Debemos'),
      UI.el('td', {}, p.moneda_codigo),
      UI.el('td', {}, UI.formatoNumero(p.monto_original)),
      UI.el('td', {}, UI.formatoNumero(p.pagado)),
      UI.el('td', {}, UI.formatoNumero(p.saldo_pendiente)),
      UI.el('td', { html: `<span class="badge ${badgeEstado}">${p.estado}</span>` }),
      UI.el('td', {}, p.fecha),
      UI.el('td', { class: 'table-actions' }, [
        UI.el('button', {
          onclick: () => mostrarFormularioPago(p),
        }, '💵 Pago'),
        UI.el('button', {
          onclick: () => mostrarHistorialPagos(p),
        }, '📜'),
        UI.el('button', {
          onclick: async () => {
            if (!confirm('¿Eliminar este prestamo y todos sus pagos?')) return;
            try {
              await Api.delete(`/prestamos/${p.id}`);
              UI.toast('Prestamo eliminado.');
              cargarPrestamos();
            } catch (err) {
              UI.toast(err.message, 'error');
            }
          },
        }, '🗑️'),
      ]),
    ]));
  });
  table.appendChild(tbody);
  tablaWrap.innerHTML = '';
  tablaWrap.appendChild(table);
}

function mostrarFormularioPago(prestamo) {
  const fila = document.getElementById(`pr-fila-${prestamo.id}`);
  if (!fila) return;
  const idMonto = `pago-monto-${prestamo.id}`;
  const idFecha = `pago-fecha-${prestamo.id}`;

  const filaPago = UI.el('tr', {}, UI.el('td', { colspan: '9', style: 'background:var(--bg-panel-light);' }, [
    UI.el('div', { class: 'form-grid', style: 'align-items:end;' }, [
      UI.el('div', {}, [UI.el('label', {}, `Monto del pago (saldo: ${UI.formatoNumero(prestamo.saldo_pendiente)})`), UI.el('input', { type: 'number', step: 'any', id: idMonto, value: prestamo.saldo_pendiente })]),
      UI.el('div', {}, [UI.el('label', {}, 'Fecha'), UI.el('input', { type: 'date', id: idFecha, value: UI.hoy() })]),
      UI.el('div', {}, [
        UI.el('button', {
          class: 'btn-primary',
          onclick: async () => {
            try {
              const montoPago = Number(document.getElementById(idMonto).value) || 0;
              await Api.post('/pagos-prestamos', {
                prestamo_id: prestamo.id,
                monto: montoPago,
                fecha: document.getElementById(idFecha).value,
              });
              const nuevoSaldo = Math.max(0, prestamo.saldo_pendiente - montoPago);
              await sincronizarPrestamoConEntradaSalida(prestamo, nuevoSaldo);
              UI.toast('Pago registrado.');
              cargarPrestamos();
            } catch (err) {
              UI.toast(err.message, 'error');
            }
          },
        }, 'Confirmar pago'),
      ]),
      UI.el('div', {}, [UI.el('button', { class: 'btn-secondary', onclick: () => cargarPrestamos() }, 'Cancelar')]),
    ]),
  ]));
  fila.replaceWith(filaPago);
}

async function mostrarHistorialPagos(prestamo) {
  const fila = document.getElementById(`pr-fila-${prestamo.id}`);
  if (!fila) return;
  let pagos;
  try {
    pagos = await Api.get('/pagos-prestamos', { prestamo_id: prestamo.id });
  } catch (err) {
    UI.toast(err.message, 'error');
    return;
  }
  const contenido = pagos.length === 0
    ? UI.el('p', { style: 'color:var(--text-muted); margin:0;' }, 'Todavia no tiene pagos registrados.')
    : UI.el('table', {}, [
        UI.el('thead', {}, UI.el('tr', {}, ['Fecha', 'Monto', ''].map((h) => UI.el('th', {}, h)))),
        UI.el('tbody', {}, pagos.map((pg) => UI.el('tr', {}, [
          UI.el('td', {}, pg.fecha),
          UI.el('td', {}, UI.formatoNumero(pg.monto)),
          UI.el('td', {}, UI.el('button', {
            onclick: async () => {
              if (!confirm('¿Eliminar este pago?')) return;
              await Api.delete(`/pagos-prestamos/${pg.id}`);
              cargarPrestamos();
            },
          }, '🗑️')),
        ]))),
      ]);

  const filaDetalle = UI.el('tr', {}, UI.el('td', { colspan: '9', style: 'background:var(--bg-panel-light);' }, [
    UI.el('div', {}, [
      UI.el('strong', {}, `Pagos de ${prestamo.persona}`),
      contenido,
      UI.el('button', { class: 'btn-secondary', style: 'margin-top:8px;', onclick: () => cargarPrestamos() }, 'Cerrar'),
    ]),
  ]));
  fila.replaceWith(filaDetalle);
}

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

/* ======================================================================
   CIERRE COMPLETO — todo lo del dia en una sola pantalla, igual que un
   dia completo en la planilla original (solo lectura; para editar cada
   cosa se usa su pantalla propia).
   ====================================================================== */
async function vistaCierreCompleto(contenedor) {
  await Estado.cargarMonedas();
  contenedor.innerHTML = `
    <header class="page-header">
      <h1>🗂️ Cierre completo del día</h1>
      <div class="filters-bar">
        <div><label>Fecha</label><input type="date" id="cc-fecha" value="${UI.hoy()}" /></div>
        <button class="btn-secondary" id="cc-ver">Ver</button>
      </div>
    </header>
    <div id="cc-contenido"><div class="empty-state">Cargando...</div></div>
  `;
  document.getElementById('cc-ver').addEventListener('click', cargarCierreCompleto);
  await cargarCierreCompleto();
}

function panelTabla(titulo, columnas, filas, totalKey, endpointEliminar, fechaVista) {
  const panel = UI.el('div', { class: 'panel', style: 'margin-bottom:16px;' }, [UI.el('h3', {}, titulo)]);
  if (filas.length === 0) {
    panel.appendChild(UI.el('div', { class: 'empty-state' }, 'Sin registros.'));
    return panel;
  }
  const encabezados = columnas.map((c) => UI.el('th', {}, c.label));
  if (endpointEliminar) encabezados.push(UI.el('th', {}, ''));
  const table = UI.el('table', {}, [UI.el('thead', {}, UI.el('tr', {}, encabezados))]);
  const tbody = UI.el('tbody');
  filas.forEach((fila) => {
    const tds = columnas.map((c) => UI.el('td', {}, c.render ? c.render(fila) : String(fila[c.key] ?? '')));
    if (endpointEliminar) {
      // "estado vigente": la fila que se ve puede ser un registro VIEJO que se
      // esta arrastrando desde otra fecha (no necesariamente de hoy). Borrarlo
      // directo lo haria desaparecer de TODOS los dias desde su fecha original
      // en adelante. Por eso, en vez de eliminar, creamos un registro nuevo en 0
      // fechado hoy -- asi el historial queda intacto y el concepto queda en 0
      // desde esta fecha para adelante, sin destruir nada de atras.
      const esDeOtroDia = fechaVista && fila.fecha !== fechaVista;
      tds.push(UI.el('td', { class: 'table-actions' }, UI.el('button', {
        title: esDeOtroDia ? `Este registro es del ${fila.fecha}, se esta arrastrando. "Poner en 0" crea uno nuevo, no borra el original.` : '',
        onclick: async () => {
          const msg = esDeOtroDia
            ? `Este registro es del ${fila.fecha} (se viene arrastrando). Para no perder el historial, esto va a crear un registro NUEVO en 0 fechado hoy (${fechaVista}), sin borrar el original. ¿Continuar?`
            : '¿Poner este registro en 0? (crea un registro nuevo, no borra el historial)';
          if (!confirm(msg)) return;
          try {
            const body = { fecha: fechaVista || UI.hoy(), concepto: fila.concepto, moneda_id: fila.moneda_id, valor: 0, porcentaje: 0, total_ars: 0 };
            await Api.post(endpointEliminar, body);
            UI.toast('Puesto en 0 desde esta fecha.');
            cargarCierreCompleto();
          } catch (err) {
            UI.toast(err.message, 'error');
          }
        },
      }, '0️⃣')));
    }
    tbody.appendChild(UI.el('tr', {}, tds));
  });
  if (totalKey) {
    const suma = filas.reduce((s, f) => s + (Number(f[totalKey]) || 0), 0);
    const tds = columnas.map((c, i) => {
      if (i === 0) return UI.el('td', { style: 'font-weight:700;' }, 'TOTAL');
      if (c.key === totalKey) return UI.el('td', { style: 'font-weight:700;' }, UI.formatoARS(suma));
      return UI.el('td', {}, '');
    });
    if (endpointEliminar) tds.push(UI.el('td', {}, ''));
    tbody.appendChild(UI.el('tr', { style: 'background:var(--bg-panel-light);' }, tds));
  }
  table.appendChild(tbody);
  panel.appendChild(table);
  return panel;
}

async function cargarCierreCompleto() {
  const fecha = document.getElementById('cc-fecha').value;
  const cont = document.getElementById('cc-contenido');
  cont.innerHTML = '<div class="empty-state">Cargando...</div>';

  try {
    const [motor, entradas, salidas, gastos, movPesos, resumen, otros, operaciones, ajustes, historialAnterior, historialOtrosAnterior] = await Promise.all([
      Api.get('/motor/posiciones', { hasta: fecha }),
      Api.estadoActual('/entradas', fecha),
      Api.estadoActual('/salidas', fecha),
      Api.get('/gastos', { desde: fecha, hasta: fecha }),
      Api.get('/movimientos-pesos', { desde: fecha, hasta: fecha }),
      Api.get(`/resumen-diario/${fecha}`),
      Api.get(`/otros-saldos/${fecha}`),
      Api.get('/operaciones', { desde: fecha, hasta: fecha }),
      Api.get('/ajustes-libres', { desde: fecha, hasta: fecha }),
      Api.get('/resumen-diario', { hasta: diaAnterior(fecha), desde: UI.haceDias(3650) }),
      Api.get('/otros-saldos', { hasta: diaAnterior(fecha), desde: UI.haceDias(3650) }),
    ]);

    cont.innerHTML = '';

    // Siempre calculamos en vivo con las mismas funciones puras que usa Cierre
    // diario -- Cierre completo NUNCA confia en lo guardado en otros_saldos_diarios
    // para "hoy" (solo lo usa como referencia de "ayer" dentro de esas funciones).
    // Asi da lo mismo el orden en que se cargaron las cosas, y no puede quedar
    // un valor pegado en 0 por una sincronizacion a medias.
    const { moneygram: moneygramCC, latin: latinCC } = await calcularLatinMoneygram(fecha);
    const { deboVenezuela: deboVenezuelaCC } = await calcularCtaVenezuela(fecha);
    const o = {
      latin_debemos_ars: latinCC,
      moneygram_nos_debe_ars: moneygramCC,
      debo_venezuela_ars: deboVenezuelaCC,
    };

    // ---- Posicion actual (tenencias) ----
    const filasTenencias = Object.entries(motor.monedas || {})
      .map(([id, pos]) => ({ moneda: Estado.nombreMoneda(id), cantidad: pos.cantidad, costo_promedio: pos.costo_promedio, total_ars: pos.cantidad * pos.costo_promedio }))
      .filter((f) => Math.abs(f.cantidad) > 0.0001)
      .sort((a, b) => b.total_ars - a.total_ars);
    cont.appendChild(panelTabla('💰 Posición actual (al ' + (motor.fechaCalculada || fecha) + ')', [
      { key: 'moneda', label: 'Moneda' },
      { key: 'cantidad', label: 'Cantidad', render: (f) => UI.formatoNumero(f.cantidad) },
      { key: 'costo_promedio', label: 'Costo promedio', render: (f) => UI.formatoNumero(f.costo_promedio) },
      { key: 'total_ars', label: 'Valor ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], filasTenencias, 'total_ars'));

    // ---- Compra / Venta del dia ----
    cont.appendChild(panelTabla('🔄 Compra / Venta del día', [
      { key: 'tipo', label: 'Tipo' },
      { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'cantidad', label: 'Cantidad', render: (f) => UI.formatoNumero(f.cantidad) },
      { key: 'cotizacion', label: 'Cotización', render: (f) => UI.formatoNumero(f.cotizacion) },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], operaciones, 'total_ars'));

    // ---- Entradas / Salidas (estado vigente a la fecha) ----
    // Ocultamos los conceptos que estan en 0 (resueltos/saldados) para no
    // llenar la vista de ruido -- no se borran, siguen intactos en el
    // historial si se consulta una fecha anterior a cuando se pusieron en 0.
    const entradasVisibles = entradas.filter((f) => Number(f.total_ars) !== 0 || Number(f.valor) !== 0);
    const salidasVisibles = salidas.filter((f) => Number(f.total_ars) !== 0 || Number(f.valor) !== 0);

    cont.appendChild(panelTabla('⬇️ Entradas y préstamos (estado vigente)', [
      { key: 'fecha', label: 'Última actualización' },
      { key: 'concepto', label: 'Concepto' }, { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], entradasVisibles, 'total_ars', '/entradas', fecha));

    cont.appendChild(panelTabla('⬆️ Salidas / préstamos (estado vigente)', [
      { key: 'fecha', label: 'Última actualización' },
      { key: 'concepto', label: 'Concepto' }, { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], salidasVisibles, 'total_ars', '/salidas', fecha));

    cont.appendChild(panelTabla('🧾 Gastos', [
      { key: 'concepto', label: 'Concepto' }, { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'valor', label: 'Valor', render: (f) => UI.formatoNumero(f.valor) },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], gastos, 'total_ars'));

    cont.appendChild(panelTabla('💵 Movimientos de pesos', [
      { key: 'tipo', label: 'Tipo' }, { key: 'concepto', label: 'Concepto' },
      { key: 'monto', label: 'Monto', render: (f) => UI.formatoARS(f.monto) },
    ], movPesos, 'monto'));

    // ---- Ajustes libres ----
    cont.appendChild(panelTabla('🧩 Ajustes libres', [
      { key: 'categoria', label: 'Categoría' }, { key: 'concepto', label: 'Concepto' },
      { key: 'monto', label: 'Monto', render: (f) => UI.formatoARS(f.monto) },
      { key: 'afecta', label: 'Afecta a' },
    ], ajustes, 'monto'));
    const ajustesExistencia = ajustes.filter((a) => a.afecta === 'existencia').reduce((s, a) => s + Number(a.monto || 0), 0);
    const ajustesDebemos = ajustes.filter((a) => a.afecta === 'debemos').reduce((s, a) => s + Number(a.monto || 0), 0);

    // ---- Otros saldos ----
    const panelOtros = UI.el('div', { class: 'panel', style: 'margin-bottom:16px;' }, [UI.el('h3', {}, '🌎 Otros saldos')]);
    if (!otros) {
      panelOtros.appendChild(UI.el('p', { style: 'color:var(--text-muted); font-size:12px; margin-top:-6px;' },
        '⚠ Todavía no se guardó "Otros saldos" para este día — estos son valores sugeridos calculados en base al día anterior y a Movimientos de pesos. Entrá a Cierre diario y guardalos para que queden fijos.'));
    }
    const gridOtros = UI.el('div', { class: 'cards-grid' });
    [
      ['Latin Express — les debemos', o.latin_debemos_ars],
      ['MoneyGram — nos deben', o.moneygram_nos_debe_ars],
      ['Debo a Venezuela', o.debo_venezuela_ars],
    ].forEach(([label, valor]) => {
      gridOtros.appendChild(UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, label),
        UI.el('div', { class: 'value' }, UI.formatoARS(valor || 0)),
      ]));
    });
    panelOtros.appendChild(gridOtros);
    cont.appendChild(panelOtros);

    // ---- Existencia vs Debemos ----
    const salidaTotal = salidas.reduce((s, r) => s + Number(r.total_ars || 0), 0);
    const entradasTotal = entradas.reduce((s, r) => s + Number(r.total_ars || 0), 0);
    const existenciaTenencias = filasTenencias.reduce((s, f) => s + f.total_ars, 0);
    const existencia = existenciaTenencias + salidaTotal + Number(o.moneygram_nos_debe_ars || 0) + ajustesExistencia;
    const faltanteSobrante = resumen
      ? Number(resumen.faltante_sobrante_ars || 0)
      : (() => {
          const anteriorF = historialAnterior.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
          return (anteriorF ? Number(anteriorF.faltante_sobrante_ars || 0) : 0);
        })();
    const utilidadCadivi = resumen
      ? Number(resumen.utilidad_cadivi_ars || 0)
      : (() => {
          const anteriorC = historialAnterior.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
          return (anteriorC ? Number(anteriorC.utilidad_cadivi_ars || 0) : 0);
        })();
    const debemos = entradasTotal + utilidadCadivi + faltanteSobrante + Number(o.latin_debemos_ars || 0) + ajustesDebemos;
    const diferencia = existencia - debemos;
    const ok = Math.abs(diferencia) < 1;

    const panelChequeo = UI.el('div', { class: 'panel', style: 'margin-bottom:16px;' }, [UI.el('h3', {}, '⚖️ Existencia vs Debemos')]);
    const gridChequeo = UI.el('div', { class: 'cards-grid' });
    [
      ['Existencia', existencia, ''],
      ['Debemos', debemos, ''],
      ['Diferencia', diferencia, ok ? 'positivo' : 'negativo'],
    ].forEach(([label, valor, clase]) => {
      gridChequeo.appendChild(UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, label),
        UI.el('div', { class: `value ${clase}` }, UI.formatoARS(valor)),
      ]));
    });
    panelChequeo.appendChild(gridChequeo);
    panelChequeo.appendChild(UI.el('div', {
      style: `margin-top:10px; padding:10px 14px; border-radius:8px; font-size:13px; background:${ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}; color:${ok ? 'var(--primary)' : 'var(--danger)'};`,
    }, ok ? '✓ Cierra correctamente.' : '⚠ Hay una diferencia sin explicar.'));
    cont.appendChild(panelChequeo);

    // ---- Cierre diario (utilidad/gastos acumulados) ----
    const r = resumen || {};
    const panelCierre = UI.el('div', { class: 'panel' }, [UI.el('h3', {}, '📅 Cierre diario')]);
    const gridCierre = UI.el('div', { class: 'cards-grid' });
    [
      ['Utilidad del día', r.utilidad_diaria_ars, 'positivo'],
      ['Gastos del día', r.gastos_dia_ars, 'negativo'],
      ['Utilidad acumulada', r.utilidad_acumulada_ars, 'positivo'],
      ['Gastos acumulado', r.gastos_acumulado_ars, 'negativo'],
      ['Utilidad Cadivi', r.utilidad_cadivi_ars, ''],
      ['Faltante / sobrante', r.faltante_sobrante_ars, ''],
      ['TOTAL', r.total_ars, (r.total_ars || 0) >= 0 ? 'positivo' : 'negativo'],
    ].forEach(([label, valor, clase]) => {
      gridCierre.appendChild(UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, label),
        UI.el('div', { class: `value ${clase}` }, UI.formatoARS(valor || 0)),
      ]));
    });
    panelCierre.appendChild(gridCierre);
    if (!resumen) {
      panelCierre.appendChild(UI.el('div', { class: 'empty-state', style: 'margin-top:10px;' }, 'Este día todavía no tiene un Cierre diario guardado.'));
    }
    cont.appendChild(panelCierre);

    // ---- Auto-chequeo final: (Existencia - Debemos) vs (Utilidad acum. - Gastos acum.) ----
    // Dos formas independientes de llegar al mismo numero -- si no coinciden, hay algo mal cargado.
    const utilidadEnPlanilla = diferencia; // = Existencia - Debemos
    const totalUtilidadReal = Number(r.total_ars || 0); // = Utilidad acum. - Gastos acum.
    const diferenciaFinal = utilidadEnPlanilla - totalUtilidadReal;
    const okFinal = Math.abs(diferenciaFinal) < 2;

    const panelAuto = UI.el('div', { class: 'panel', style: 'margin-top:16px;' }, [UI.el('h3', {}, '✅ Auto-chequeo final')]);
    const gridAuto = UI.el('div', { class: 'cards-grid' });
    [
      ['Utilidad en planilla (Existencia − Debemos)', utilidadEnPlanilla, ''],
      ['Total utilidad real (Utilidad acum. − Gastos acum.)', totalUtilidadReal, ''],
      ['Diferencia', diferenciaFinal, okFinal ? 'positivo' : 'negativo'],
    ].forEach(([label, valor, clase]) => {
      gridAuto.appendChild(UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, label),
        UI.el('div', { class: `value ${clase}` }, UI.formatoARS(valor)),
      ]));
    });
    panelAuto.appendChild(gridAuto);
    panelAuto.appendChild(UI.el('div', {
      style: `margin-top:10px; padding:10px 14px; border-radius:8px; font-size:13px; background:${okFinal ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}; color:${okFinal ? 'var(--primary)' : 'var(--danger)'};`,
    }, okFinal ? '✓ Los dos calculos coinciden (diferencia de redondeo normal).' : '⚠ Los dos calculos no coinciden — revisar la carga del día.'));
    cont.appendChild(panelAuto);
  } catch (err) {
    cont.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
}

/* ======================================================================
   RESUMEN VENEZUELA — junta en una sola pantalla todo lo relacionado a
   Venezuela que hoy vive repartido en distintos modulos: Debo a
   Venezuela (Otros saldos), movimientos con concepto BBVA/Venezuela en
   Entradas y Salidas, Cierres Venezuela (USD), y ajustes libres
   relacionados. Es de solo lectura -- para cargar cada cosa se usa su
   pantalla propia.
   ====================================================================== */
async function vistaResumenVenezuela(contenedor) {
  await Estado.cargarMonedas();
  contenedor.innerHTML = `
    <header class="page-header">
      <h1>🇻🇪 Resumen Venezuela</h1>
      <div class="filters-bar">
        <div><label>Desde</label><input type="date" id="rv-desde" value="${UI.haceDias(30)}" /></div>
        <div><label>Hasta</label><input type="date" id="rv-hasta" value="${UI.hoy()}" /></div>
        <button class="btn-secondary" id="rv-ver">Ver</button>
      </div>
    </header>
    <p style="color:var(--text-muted); font-size:13px; margin-top:-10px;">
      Junta todo lo relacionado a Venezuela que hoy vive repartido en distintos módulos. Es
      de solo lectura — para cargar algo puntual se sigue usando Otros saldos, Entradas,
      Salidas, Cierres Venezuela o Ajustes libres.
    </p>
    <div id="rv-contenido"><div class="empty-state">Cargando...</div></div>
  `;
  document.getElementById('rv-ver').addEventListener('click', cargarResumenVenezuela);
  await cargarResumenVenezuela();
}

function contieneVenezuela(texto) {
  const t = (texto || '').toUpperCase();
  return t.includes('VENEZUELA') || t.includes('VZLA') || t.includes('BBVA') || t.includes('HAROLD');
}

async function cargarResumenVenezuela() {
  const desde = document.getElementById('rv-desde').value;
  const hasta = document.getElementById('rv-hasta').value;
  const cont = document.getElementById('rv-contenido');
  cont.innerHTML = '<div class="empty-state">Cargando...</div>';

  try {
    const [entradas, salidas, cierresVzla, ajustes, otrosSaldos] = await Promise.all([
      Api.get('/entradas', { desde, hasta }),
      Api.get('/salidas', { desde, hasta }),
      Api.get('/cierres-venezuela', { desde, hasta }),
      Api.get('/ajustes-libres', { desde, hasta }),
      Api.get('/otros-saldos', { desde, hasta }),
    ]);

    cont.innerHTML = '';

    // ---- Debo a Venezuela: evolucion en el periodo ----
    const conDeuda = otrosSaldos.filter((o) => o.debo_venezuela_ars !== undefined);
    const ultimoDebo = conDeuda.length ? conDeuda[0] : null; // ya viene ordenado desc por fecha
    const panelDebo = UI.el('div', { class: 'panel', style: 'margin-bottom:16px;' }, [UI.el('h3', {}, '💰 Debo a Venezuela')]);
    panelDebo.appendChild(UI.el('div', { class: 'cards-grid' }, [
      UI.el('div', { class: 'stat-card' }, [
        UI.el('div', { class: 'label' }, ultimoDebo ? `Último valor cargado (${ultimoDebo.fecha})` : 'Sin datos en el período'),
        UI.el('div', { class: 'value' }, UI.formatoARS(ultimoDebo ? ultimoDebo.debo_venezuela_ars : 0)),
      ]),
    ]));
    cont.appendChild(panelDebo);

    // ---- Movimientos con concepto Venezuela/BBVA/Harold en Entradas y Salidas ----
    const entradasVzla = entradas.filter((e) => contieneVenezuela(e.concepto));
    const salidasVzla = salidas.filter((s) => contieneVenezuela(s.concepto));

    cont.appendChild(panelTabla('⬇️ Entradas relacionadas (concepto con Venezuela/BBVA/Harold)', [
      { key: 'fecha', label: 'Fecha' }, { key: 'concepto', label: 'Concepto' },
      { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], entradasVzla, 'total_ars'));

    cont.appendChild(panelTabla('⬆️ Salidas relacionadas (concepto con Venezuela/BBVA/Harold)', [
      { key: 'fecha', label: 'Fecha' }, { key: 'concepto', label: 'Concepto' },
      { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'total_ars', label: 'Total ARS', render: (f) => UI.formatoARS(f.total_ars) },
    ], salidasVzla, 'total_ars'));

    // ---- Cierres Venezuela (USD) ----
    cont.appendChild(panelTabla('🇻🇪 Cierres Venezuela (USD) — solo informativo', [
      { key: 'fecha', label: 'Fecha' }, { key: 'tipo', label: 'Tipo' },
      { key: 'moneda_codigo', label: 'Moneda' },
      { key: 'cantidad', label: 'Cantidad', render: (f) => UI.formatoNumero(f.cantidad) },
      { key: 'concepto', label: 'Concepto' },
    ], cierresVzla, null));

    // ---- Ajustes libres relacionados ----
    const ajustesVzla = ajustes.filter((a) => contieneVenezuela(a.categoria) || contieneVenezuela(a.concepto));
    cont.appendChild(panelTabla('🧩 Ajustes libres relacionados', [
      { key: 'fecha', label: 'Fecha' }, { key: 'categoria', label: 'Categoría' },
      { key: 'concepto', label: 'Concepto' },
      { key: 'monto', label: 'Monto', render: (f) => UI.formatoARS(f.monto) },
      { key: 'afecta', label: 'Afecta a' },
    ], ajustesVzla, 'monto'));
  } catch (err) {
    cont.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
  }
}
