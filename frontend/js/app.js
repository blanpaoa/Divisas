const RUTAS = {
  dashboard: vistaDashboard,
  'cierre-completo': vistaCierreCompleto,
  tenencias: vistaTenencias,
  operaciones: vistaOperaciones,
  tasas: vistaTasas,
  entradas: vistaEntradas,
  salidas: vistaSalidas,
  gastos: vistaGastos,
  transferencias: vistaTransferencias,
  'movimientos-pesos': vistaMovimientosPesos,
  'ajustes-libres': vistaAjustesLibres,
  'cierres-venezuela': vistaCierresVenezuela,
  'resumen-venezuela': vistaResumenVenezuela,
  prestamos: vistaPrestamos,
  'resumen-diario': vistaResumenDiario,
  'utilidad-mensual': vistaUtilidadMensual,
  'comisiones-mensuales': vistaComisionesMensuales,
  monedas: vistaMonedas,
  apertura: vistaApertura,
  usuarios: vistaUsuarios,
};

// Vistas que el operador NO puede ver (solo admin) -- ademas de Apertura y
// Usuarios (que ya estaban ocultas por defecto), estas se ocultan para
// operador especificamente. Doble proteccion: se ocultan del menu Y se
// bloquea la navegacion directa (por si escriben la ruta a mano).
const VISTAS_SOLO_ADMIN = ['dashboard', 'cierre-completo', 'tenencias', 'tasas', 'resumen-venezuela', 'utilidad-mensual', 'monedas', 'apertura', 'usuarios'];
let _rolActual = null;

function mostrarApp(perfil) {
  document.getElementById('vista-login').classList.add('oculto');
  document.getElementById('vista-app').classList.remove('oculto');
  document.getElementById('sb-nombre-usuario').textContent = perfil.nombre_completo || perfil.username;
  document.getElementById('sb-rol-usuario').textContent = perfil.rol;
  _rolActual = perfil.rol;

  if (perfil.rol === 'admin') {
    document.getElementById('nav-usuarios').classList.remove('oculto');
    document.getElementById('nav-apertura').classList.remove('oculto');
  } else {
    VISTAS_SOLO_ADMIN.forEach((v) => {
      const btn = document.querySelector(`.nav-item[data-vista="${v}"]`);
      if (btn) btn.classList.add('oculto');
    });
  }

  navegarA(perfil.rol === 'admin' ? 'dashboard' : 'operaciones');
}

function mostrarLogin() {
  document.getElementById('vista-app').classList.add('oculto');
  document.getElementById('vista-login').classList.remove('oculto');
}

function navegarA(vista) {
  if (_rolActual !== 'admin' && VISTAS_SOLO_ADMIN.includes(vista)) {
    vista = 'operaciones'; // bloquea navegacion directa (ej: escribiendo la ruta a mano)
  }
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.vista === vista);
  });
  const contenedor = document.getElementById('contenido');
  contenedor.innerHTML = '<div class="empty-state">Cargando...</div>';
  const render = RUTAS[vista];
  if (render) {
    render(contenedor).catch((err) => {
      contenedor.innerHTML = `<div class="empty-state">Error: ${err.message}</div>`;
    });
  }
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-usuario').value.trim();
  const clave = document.getElementById('login-clave').value;
  const errorBox = document.getElementById('login-error');
  errorBox.textContent = '';

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  try {
    const perfil = await Api.login(email, clave);
    mostrarApp(perfil);
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
  await Api.cerrarSesion();
  mostrarLogin();
});

document.getElementById('nav-menu').addEventListener('click', (e) => {
  const btn = e.target.closest('.nav-item');
  if (btn) navegarA(btn.dataset.vista);
});

// Al cargar la pagina, revisamos si ya hay una sesion activa de Supabase
(async function init() {
  try {
    const perfil = await Api.cargarPerfilActual();
    if (perfil) {
      mostrarApp(perfil);
    } else {
      mostrarLogin();
    }
  } catch (err) {
    console.error(err);
    mostrarLogin();
  }
})();

// Si la sesion se cierra o expira en otra pestaña, volvemos al login
supabaseClient.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    mostrarLogin();
  }
});
