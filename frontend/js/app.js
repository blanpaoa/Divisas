const RUTAS = {
  dashboard: vistaDashboard,
  tenencias: vistaTenencias,
  operaciones: vistaOperaciones,
  tasas: vistaTasas,
  entradas: vistaEntradas,
  salidas: vistaSalidas,
  gastos: vistaGastos,
  transferencias: vistaTransferencias,
  prestamos: vistaPrestamos,
  'resumen-diario': vistaResumenDiario,
  'utilidad-mensual': vistaUtilidadMensual,
  'comisiones-mensuales': vistaComisionesMensuales,
  monedas: vistaMonedas,
  apertura: vistaApertura,
  usuarios: vistaUsuarios,
};

function mostrarApp(perfil) {
  document.getElementById('vista-login').classList.add('oculto');
  document.getElementById('vista-app').classList.remove('oculto');
  document.getElementById('sb-nombre-usuario').textContent = perfil.nombre_completo || perfil.username;
  document.getElementById('sb-rol-usuario').textContent = perfil.rol;

  if (perfil.rol === 'admin') {
    document.getElementById('nav-usuarios').classList.remove('oculto');
    document.getElementById('nav-apertura').classList.remove('oculto');
  }

  navegarA('dashboard');
}

function mostrarLogin() {
  document.getElementById('vista-app').classList.add('oculto');
  document.getElementById('vista-login').classList.remove('oculto');
}

function navegarA(vista) {
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
