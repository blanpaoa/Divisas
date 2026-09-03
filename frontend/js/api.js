// Mapea los nombres de "endpoint" usados en las vistas a las tablas reales de Postgres
const TABLA_POR_RECURSO = {
  tenencias: 'tenencias_diarias',
  operaciones: 'operaciones_cambio',
  entradas: 'entradas_prestamos',
  salidas: 'salidas_prestamos',
  gastos: 'gastos',
  transferencias: 'transferencias',
  'resumen-diario': 'resumen_diario',
  'utilidad-mensual': 'utilidad_mensual',
  monedas: 'monedas',
  usuarios: 'perfiles',
  tasas: 'tasas_diarias',
  apertura: 'apertura_saldos',
  'otros-saldos': 'otros_saldos_diarios',
  prestamos: 'prestamos',
  'pagos-prestamos': 'prestamos_pagos',
  'comisiones-mensuales': 'comisiones_mensuales',
  'movimientos-pesos': 'movimientos_pesos',
  'ajustes-libres': 'ajustes_libres',
  'depositos-bancarios': 'depositos_bancarios',
  'cierres-venezuela': 'cierres_venezuela',
};

function aplanarModenaJoin(fila) {
  if (fila && fila.monedas) {
    fila.moneda_codigo = fila.monedas.codigo;
    fila.moneda_nombre = fila.monedas.nombre;
    delete fila.monedas;
  }
  return fila;
}

const Api = {
  _usuarioCache: null,

  getUsuario() {
    return this._usuarioCache;
  },

  cerrarSesion() {
    this._usuarioCache = null;
    return supabaseClient.auth.signOut();
  },

  // Recibe una tabla tipo "estado que se arrastra" (Entradas/Salidas) y
  // devuelve, para cada concepto distinto, el ultimo registro con
  // fecha <= fechaHasta. Asi los valores quedan "vigentes" dia tras dia
  // hasta que se cargue un cambio nuevo -- igual que en la planilla real
  // (CAPITAL-PERDIDAS, ULTIMA UTILI, etc se repiten solas sin recargarlas).
  async estadoActual(endpoint, fechaHasta) {
    const todas = await this.get(endpoint, { desde: '2000-01-01', hasta: fechaHasta });
    // Normalizamos la clave de agrupado (espacios y mayusculas no deberian crear
    // conceptos distintos) -- antes agrupaba por el texto EXACTO, y una diferencia
    // minima de tipeo hacia que dos entradas del mismo concepto quedaran separadas.
    const normalizar = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const porConcepto = {};
    for (let i = todas.length - 1; i >= 0; i--) {
      const f = todas[i];
      porConcepto[normalizar(f.concepto)] = f;
    }
    return Object.values(porConcepto).sort((a, b) => (a.concepto > b.concepto ? 1 : -1));
  },

  // Recupera el perfil (rol, nombre) del usuario actualmente logueado en Supabase Auth
  async cargarPerfilActual() {
    const { data: sesionData } = await supabaseClient.auth.getSession();
    const session = sesionData && sesionData.session;
    if (!session) {
      this._usuarioCache = null;
      return null;
    }
    const { data: perfil, error } = await supabaseClient
      .from('perfiles')
      .select('id, username, nombre_completo, rol, activo')
      .eq('id', session.user.id)
      .single();
    if (error || !perfil || !perfil.activo) {
      this._usuarioCache = null;
      return null;
    }
    this._usuarioCache = perfil;
    return perfil;
  },

  /* ===================== AUTH ===================== */
  async login(email, password) {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error(traducirErrorAuth(error.message));
    const perfil = await this.cargarPerfilActual();
    if (!perfil) {
      await supabaseClient.auth.signOut();
      throw new Error('Tu usuario no tiene un perfil activo. Pedile a un admin que lo revise.');
    }
    return perfil;
  },

  /* ===================== LECTURA GENERICA ===================== */
  async get(path, params = {}) {
    // Rutas especiales
    if (path.startsWith('/dashboard/')) return this._dashboard(path, params);
    if (path.startsWith('/resumen-diario/')) return this._resumenDeFecha(path.split('/')[2]);
    if (path.startsWith('/otros-saldos/')) return this._otrosSaldosDeFecha(path.split('/')[2]);
    if (path.startsWith('/utilidad-mensual')) return this._listarUtilidadMensual(params);
    if (path.startsWith('/comisiones-mensuales')) return this._listarComisionesMensuales(params);
    if (path === '/motor/posiciones') return this._motorPosiciones(params);
    if (path === '/prestamos') return this._listarPrestamosConSaldo(params);
    if (path.startsWith('/pagos-prestamos')) return this._listarPagos(params.prestamo_id);

    const partes = path.split('/').filter(Boolean); // ej: ["tenencias"]
    const recurso = partes[0];
    const tabla = TABLA_POR_RECURSO[recurso];
    if (!tabla) throw new Error(`Recurso no soportado: ${path}`);

    if (recurso === 'monedas') return this._listarMonedas(params);
    if (recurso === 'usuarios') return this._listarUsuarios();

    // Tablas que no tienen moneda_id (siempre son en pesos): no intentar el join
    const SIN_MONEDA = ['movimientos-pesos', 'resumen-diario', 'otros-saldos', 'utilidad-mensual', 'comisiones-mensuales', 'ajustes-libres', 'depositos-bancarios'];
    const select = SIN_MONEDA.includes(recurso) ? '*' : '*, monedas(codigo,nombre)';

    let query = supabaseClient.from(tabla).select(select);
    if (params.desde) query = query.gte('fecha', params.desde);
    if (params.hasta) query = query.lte('fecha', params.hasta);
    if (params.moneda_id) query = query.eq('moneda_id', params.moneda_id);
    query = query.order('fecha', { ascending: false }).order('id', { ascending: false });

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return select.includes('monedas') ? data.map(aplanarModenaJoin) : data;
  },

  async _listarMonedas(params) {
    let query = supabaseClient.from('monedas').select('*').order('nombre');
    if (params.todas !== 'true') query = query.eq('activa', true);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  async _listarUsuarios() {
    const { data, error } = await supabaseClient
      .from('perfiles')
      .select('id, username, nombre_completo, rol, activo, creado_en')
      .order('creado_en');
    if (error) throw new Error(error.message);
    return data;
  },

  async _resumenDeFecha(fecha) {
    const { data, error } = await supabaseClient
      .from('resumen_diario')
      .select('*')
      .eq('fecha', fecha)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async _otrosSaldosDeFecha(fecha) {
    const { data, error } = await supabaseClient
      .from('otros_saldos_diarios')
      .select('*')
      .eq('fecha', fecha)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  },

  async _listarUtilidadMensual(params) {
    let query = supabaseClient.from('utilidad_mensual').select('*').order('mes');
    if (params.anio) query = query.eq('anio', params.anio);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  async _listarComisionesMensuales(params) {
    let query = supabaseClient.from('comisiones_mensuales').select('*').order('mes');
    if (params.anio) query = query.eq('anio', params.anio);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  },

  /* ===================== ESCRITURA GENERICA ===================== */
  async post(path, body) {
    if (path === '/monedas') {
      const { data, error } = await supabaseClient
        .from('monedas')
        .insert({ codigo: body.codigo.toUpperCase(), nombre: body.nombre })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const partes = path.split('/').filter(Boolean);
    const tabla = TABLA_POR_RECURSO[partes[0]];
    if (!tabla) throw new Error(`Recurso no soportado: ${path}`);

    const usuario = this.getUsuario();
    const payload = { ...body, usuario_id: usuario ? usuario.id : null };
    const { data, error } = await supabaseClient.from(tabla).insert(payload).select().single();
    if (error) throw new Error(error.message);
    return { id: data.id };
  },

  async put(path, body) {
    if (path.startsWith('/resumen-diario/')) {
      const fecha = path.split('/')[2];
      const usuario = this.getUsuario();
      const { error } = await supabaseClient
        .from('resumen_diario')
        .upsert({ fecha, ...body, usuario_id: usuario ? usuario.id : null }, { onConflict: 'fecha' });
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (path.startsWith('/otros-saldos/')) {
      const fecha = path.split('/')[2];
      const usuario = this.getUsuario();
      const { error } = await supabaseClient
        .from('otros_saldos_diarios')
        .upsert({ fecha, ...body, usuario_id: usuario ? usuario.id : null }, { onConflict: 'fecha' });
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (path.startsWith('/apertura/')) {
      const monedaId = path.split('/')[2];
      const usuario = this.getUsuario();
      const { error } = await supabaseClient
        .from('apertura_saldos')
        .upsert(
          { moneda_id: Number(monedaId), ...body, usuario_id: usuario ? usuario.id : null },
          { onConflict: 'moneda_id' }
        );
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (path.startsWith('/utilidad-mensual/')) {
      const [, , anio, mes] = path.split('/');
      const { error } = await supabaseClient
        .from('utilidad_mensual')
        .upsert({ anio: Number(anio), mes: Number(mes), ...body }, { onConflict: 'anio,mes' });
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    if (path.startsWith('/comisiones-mensuales/')) {
      const [, , anio, mes] = path.split('/');
      const usuario = this.getUsuario();
      const { error } = await supabaseClient
        .from('comisiones_mensuales')
        .upsert(
          { anio: Number(anio), mes: Number(mes), ...body, usuario_id: usuario ? usuario.id : null },
          { onConflict: 'anio,mes' }
        );
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const partes = path.split('/').filter(Boolean); // ej: ["monedas", "3"]
    const tabla = TABLA_POR_RECURSO[partes[0]];
    const id = partes[1];
    if (!tabla || !id) throw new Error(`Ruta invalida para actualizar: ${path}`);
    const { error } = await supabaseClient.from(tabla).update(body).eq('id', id);
    if (error) throw new Error(error.message);
    return { ok: true };
  },

  async delete(path) {
    const partes = path.split('/').filter(Boolean);
    const tabla = TABLA_POR_RECURSO[partes[0]];
    const id = partes[1];
    if (!tabla || !id) throw new Error(`Ruta invalida para eliminar: ${path}`);

    // Para "usuarios" (perfiles), eliminar = desactivar (no borramos la cuenta de Auth)
    if (partes[0] === 'usuarios') {
      const { error } = await supabaseClient.from('perfiles').update({ activo: false }).eq('id', id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error } = await supabaseClient.from(tabla).delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { ok: true };
  },

  // Busca la tasa cargada para esa fecha exacta y moneda; si no existe, usa
  // la mas reciente anterior a esa fecha. Devuelve null si no hay ninguna.
  async buscarTasaMasReciente(fecha, monedaId) {
    const { data, error } = await supabaseClient
      .from('tasas_diarias')
      .select('cotizacion')
      .eq('moneda_id', monedaId)
      .lte('fecha', fecha)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? data.cotizacion : null;
  },

  /* ===================== PRESTAMOS (con saldo y estado) ===================== */
  async _listarPrestamosConSaldo({ tipo, estado } = {}) {
    let query = supabaseClient
      .from('prestamos')
      .select('*, monedas(codigo,nombre)')
      .order('fecha', { ascending: false });
    if (tipo) query = query.eq('tipo', tipo);
    const { data: prestamosData, error } = await query;
    if (error) throw new Error(error.message);

    const ids = prestamosData.map((p) => p.id);
    let pagosPorPrestamo = {};
    if (ids.length > 0) {
      const { data: pagosData, error: errPagos } = await supabaseClient
        .from('prestamos_pagos')
        .select('prestamo_id, monto')
        .in('prestamo_id', ids);
      if (errPagos) throw new Error(errPagos.message);
      pagosData.forEach((p) => {
        pagosPorPrestamo[p.prestamo_id] = (pagosPorPrestamo[p.prestamo_id] || 0) + Number(p.monto);
      });
    }

    let resultado = prestamosData.map((p) => {
      const pagado = pagosPorPrestamo[p.id] || 0;
      const saldo_pendiente = Number(p.monto_original) - pagado;
      let est = 'pendiente';
      if (saldo_pendiente <= 0.01) est = 'pagado';
      else if (pagado > 0) est = 'parcial';
      return {
        ...aplanarModenaJoin(p),
        pagado,
        saldo_pendiente,
        estado: est,
      };
    });

    if (estado) resultado = resultado.filter((p) => p.estado === estado);
    return resultado;
  },

  async _listarPagos(prestamoId) {
    if (!prestamoId) return [];
    const { data, error } = await supabaseClient
      .from('prestamos_pagos')
      .select('*')
      .eq('prestamo_id', prestamoId)
      .order('fecha', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  /* ===================== MOTOR DE COSTEO (WAC) ===================== */
  async _motorPosiciones({ hasta } = {}) {
    const [aperturaRes, operacionesRes, otrosSaldosRes, movimientosPesosRes, gastosRes, resumenRes] = await Promise.all([
      supabaseClient.from('apertura_saldos').select('moneda_id, cantidad, costo_promedio'),
      supabaseClient
        .from('operaciones_cambio')
        .select('fecha, tipo, moneda_id, cantidad, cotizacion')
        .order('fecha', { ascending: true }),
      supabaseClient
        .from('otros_saldos_diarios')
        .select('fecha, otras_salidas_pesos_ars, otras_entradas_pesos_ars')
        .order('fecha', { ascending: true }),
      supabaseClient
        .from('movimientos_pesos')
        .select('fecha, tipo, monto')
        .order('fecha', { ascending: true }),
      supabaseClient
        .from('gastos')
        .select('fecha, moneda_id, total_ars')
        .order('fecha', { ascending: true }),
      supabaseClient
        .from('resumen_diario')
        .select('fecha, cadivi_dia_ars')
        .order('fecha', { ascending: true }),
    ]);
    if (aperturaRes.error) throw new Error(aperturaRes.error.message);
    if (operacionesRes.error) throw new Error(operacionesRes.error.message);
    if (otrosSaldosRes.error) throw new Error(otrosSaldosRes.error.message);
    if (movimientosPesosRes.error) throw new Error(movimientosPesosRes.error.message);
    if (gastosRes.error) throw new Error(gastosRes.error.message);
    if (resumenRes.error) throw new Error(resumenRes.error.message);

    // moneda_id viene como numero desde Supabase; el motor identifica monedas por codigo
    // para las divisas extranjeras, y por separado calcula el pozo de pesos (ARS).
    const codigoPorId = {};
    Estado.monedas.forEach((m) => { codigoPorId[m.id] = m.codigo; });
    // Aseguramos que Estado.monedas este cargado (puede no estarlo si se llama muy temprano)
    if (Object.keys(codigoPorId).length === 0) {
      const { data } = await supabaseClient.from('monedas').select('id, codigo');
      (data || []).forEach((m) => { codigoPorId[m.id] = m.codigo; });
    }

    const aperturaArs = (aperturaRes.data.find((a) => codigoPorId[a.moneda_id] === 'ARS') || { cantidad: 0 }).cantidad;
    const aperturaExtranjera = aperturaRes.data.filter((a) => codigoPorId[a.moneda_id] !== 'ARS');

    const resultado = window.MotorCosteo.calcularPosiciones(aperturaExtranjera, operacionesRes.data);
    const fechas = Object.keys(resultado).sort();
    const fechasHasta = hasta ? fechas.filter((f) => f <= hasta) : fechas;
    const ultimaFecha = fechasHasta.length ? fechasHasta[fechasHasta.length - 1] : null;

    // Saldo de pesos (formula validada contra la planilla real). Se combinan
    // TODAS las fuentes que mueven pesos, para que cargar algo UNA sola vez
    // (en Gastos, en Cierre diario, o en Movimientos de pesos) alcance --
    // sin tener que repetir el mismo numero en varios lugares:
    //  - Otros saldos (numero cargado a mano, usado para la carga historica)
    //  - Movimientos de pesos (el log item por item del dia a dia)
    //  - Gastos en ARS (salida automatica -- pagar un gasto es plata que sale)
    //  - Utilidad Cadivi/Venezuela del dia (entrada automatica, confirmado
    //    contra la planilla real que este monto tambien mueve el pozo)
    const otrosPorFecha = {};
    otrosSaldosRes.data.forEach((o) => {
      otrosPorFecha[o.fecha] = otrosPorFecha[o.fecha] || { otras_salidas: 0, otras_entradas: 0 };
      otrosPorFecha[o.fecha].otras_salidas += Number(o.otras_salidas_pesos_ars) || 0;
      otrosPorFecha[o.fecha].otras_entradas += Number(o.otras_entradas_pesos_ars) || 0;
    });
    movimientosPesosRes.data.forEach((m) => {
      otrosPorFecha[m.fecha] = otrosPorFecha[m.fecha] || { otras_salidas: 0, otras_entradas: 0 };
      if (m.tipo === 'salida') otrosPorFecha[m.fecha].otras_salidas += Number(m.monto) || 0;
      else otrosPorFecha[m.fecha].otras_entradas += Number(m.monto) || 0;
    });
    gastosRes.data.forEach((g) => {
      if (codigoPorId[g.moneda_id] !== 'ARS') return; // solo gastos en pesos mueven el pozo directo
      otrosPorFecha[g.fecha] = otrosPorFecha[g.fecha] || { otras_salidas: 0, otras_entradas: 0 };
      otrosPorFecha[g.fecha].otras_salidas += Number(g.total_ars) || 0;
    });
    resumenRes.data.forEach((r) => {
      if (!r.cadivi_dia_ars) return;
      otrosPorFecha[r.fecha] = otrosPorFecha[r.fecha] || { otras_salidas: 0, otras_entradas: 0 };
      otrosPorFecha[r.fecha].otras_entradas += Number(r.cadivi_dia_ars) || 0;
    });
    const otrosPesosPorFecha = Object.entries(otrosPorFecha).map(([fecha, d]) => ({ fecha, ...d }));
    const saldoPesosPorFecha = window.MotorCosteo.calcularSaldoPesos(aperturaArs, operacionesRes.data, otrosPesosPorFecha);
    const fechasPesos = Object.keys(saldoPesosPorFecha).sort().filter((f) => !hasta || f <= hasta);
    const ultimaFechaPesos = fechasPesos.length ? fechasPesos[fechasPesos.length - 1] : null;
    const saldoPesos = ultimaFechaPesos ? saldoPesosPorFecha[ultimaFechaPesos] : aperturaArs;

    const monedasConPesos = ultimaFecha ? { ...resultado[ultimaFecha].monedas } : {};
    const idArs = Object.entries(codigoPorId).find(([, codigo]) => codigo === 'ARS');
    if (idArs) {
      monedasConPesos[idArs[0]] = { cantidad: saldoPesos, costo_promedio: 1 };
    }

    return {
      fechaCalculada: ultimaFecha || ultimaFechaPesos,
      monedas: monedasConPesos,
      utilidadDelDia: ultimaFecha ? resultado[ultimaFecha].utilidad_total : 0,
      utilidadPorMoneda: ultimaFecha ? resultado[ultimaFecha].utilidad_por_moneda : {},
      historial: fechasHasta.map((f) => ({ fecha: f, utilidad_total: resultado[f].utilidad_total })),
    };
  },

  /* ===================== DASHBOARD (agregaciones) ===================== */
  async _dashboard(path, params) {
    if (path === '/dashboard/resumen') return this._dashResumen(params);
    if (path === '/dashboard/evolucion') return this._dashEvolucion(params);
    if (path === '/dashboard/distribucion-monedas') return this._dashDistribucion(params);
    if (path === '/dashboard/gastos-por-concepto') return this._dashGastosConcepto(params);
    throw new Error(`Ruta de dashboard no soportada: ${path}`);
  },

  async _capitalEnFecha(hasta) {
    const { data: fechas, error: errFecha } = await supabaseClient
      .from('tenencias_diarias')
      .select('fecha')
      .lte('fecha', hasta)
      .order('fecha', { ascending: false })
      .limit(1);
    if (errFecha) throw new Error(errFecha.message);
    if (!fechas.length) return { fecha: null, total: 0, filas: [] };

    const fecha = fechas[0].fecha;
    const { data, error } = await supabaseClient
      .from('tenencias_diarias')
      .select('*, monedas(codigo,nombre)')
      .eq('fecha', fecha);
    if (error) throw new Error(error.message);
    const filas = data.map(aplanarModenaJoin);
    const total = filas.reduce((s, f) => s + Number(f.total_ars || 0), 0);
    return { fecha, total, filas };
  },

  async _dashResumen({ desde, hasta }) {
    const [capitalActual, resumenDiarios, gastosFilas, entradasFilas, operacionesFilas] =
      await Promise.all([
        this._capitalEnFecha(hasta),
        supabaseClient.from('resumen_diario').select('utilidad_diaria_ars').gte('fecha', desde).lte('fecha', hasta),
        supabaseClient.from('gastos').select('total_ars').gte('fecha', desde).lte('fecha', hasta),
        supabaseClient.from('entradas_prestamos').select('total_ars').gte('fecha', desde).lte('fecha', hasta),
        supabaseClient.from('operaciones_cambio').select('tipo,total_ars').gte('fecha', desde).lte('fecha', hasta),
      ]);

    if (resumenDiarios.error) throw new Error(resumenDiarios.error.message);
    if (gastosFilas.error) throw new Error(gastosFilas.error.message);
    if (entradasFilas.error) throw new Error(entradasFilas.error.message);
    if (operacionesFilas.error) throw new Error(operacionesFilas.error.message);

    const sumar = (arr, campo) => arr.reduce((s, r) => s + Number(r[campo] || 0), 0);

    const porTipo = {};
    (operacionesFilas.data || []).forEach((r) => {
      if (!porTipo[r.tipo]) porTipo[r.tipo] = { tipo: r.tipo, cantidad: 0, total_ars: 0 };
      porTipo[r.tipo].cantidad += 1;
      porTipo[r.tipo].total_ars += Number(r.total_ars || 0);
    });

    return {
      periodo: { desde, hasta },
      capital_actual_ars: capitalActual.total,
      utilidad_periodo_ars: sumar(resumenDiarios.data, 'utilidad_diaria_ars'),
      gastos_periodo_ars: sumar(gastosFilas.data, 'total_ars'),
      entradas_periodo_ars: sumar(entradasFilas.data, 'total_ars'),
      operaciones_periodo: Object.values(porTipo),
    };
  },

  async _dashEvolucion({ desde, hasta }) {
    const [resumenDiarios, tenencias] = await Promise.all([
      supabaseClient
        .from('resumen_diario')
        .select('fecha, utilidad_diaria_ars, total_ars')
        .gte('fecha', desde)
        .lte('fecha', hasta)
        .order('fecha', { ascending: true }),
      supabaseClient
        .from('tenencias_diarias')
        .select('fecha, total_ars')
        .gte('fecha', desde)
        .lte('fecha', hasta),
    ]);
    if (resumenDiarios.error) throw new Error(resumenDiarios.error.message);
    if (tenencias.error) throw new Error(tenencias.error.message);

    const capitalPorFecha = {};
    (tenencias.data || []).forEach((r) => {
      capitalPorFecha[r.fecha] = (capitalPorFecha[r.fecha] || 0) + Number(r.total_ars || 0);
    });
    const capital_diario = Object.entries(capitalPorFecha)
      .map(([fecha, capital_total_ars]) => ({ fecha, capital_total_ars }))
      .sort((a, b) => (a.fecha > b.fecha ? 1 : -1));

    return { periodo: { desde, hasta }, utilidad_diaria: resumenDiarios.data, capital_diario };
  },

  async _dashDistribucion({ hasta }) {
    const { filas } = await this._capitalEnFecha(hasta);
    return filas
      .map((f) => ({
        moneda_id: f.moneda_id,
        codigo: f.moneda_codigo,
        nombre: f.moneda_nombre,
        valor: f.valor,
        cotizacion: f.cotizacion,
        total_ars: f.total_ars,
      }))
      .sort((a, b) => b.total_ars - a.total_ars);
  },

  async _dashGastosConcepto({ desde, hasta }) {
    const { data, error } = await supabaseClient
      .from('gastos')
      .select('concepto, total_ars')
      .gte('fecha', desde)
      .lte('fecha', hasta);
    if (error) throw new Error(error.message);

    const porConcepto = {};
    (data || []).forEach((r) => {
      const c = r.concepto || 'Sin concepto';
      porConcepto[c] = (porConcepto[c] || 0) + Number(r.total_ars || 0);
    });
    return Object.entries(porConcepto)
      .map(([concepto, total_ars]) => ({ concepto, total_ars }))
      .sort((a, b) => b.total_ars - a.total_ars);
  },
};

function traducirErrorAuth(mensaje) {
  if (mensaje.includes('Invalid login credentials')) return 'Email o clave incorrectos.';
  if (mensaje.includes('Email not confirmed')) return 'El email todavia no fue confirmado.';
  return mensaje;
}
