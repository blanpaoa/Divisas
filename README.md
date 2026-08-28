# Casa de Cambio — Sistema de gestion (Supabase + Vercel)

Aplicacion web para reemplazar las planillas de Google Sheets de gestion de la casa de cambio.

- **Base de datos + autenticacion**: [Supabase](https://supabase.com) (Postgres gestionado,
  con seguridad a nivel de fila para los roles).
- **Hosting del frontend**: [Vercel](https://vercel.com) (sitio estatico, sin servidor que
  mantener).
- **Frontend**: HTML + CSS + JavaScript plano (sin build, sin frameworks).

No hace falta administrar ningun servidor propio: Supabase y Vercel corren todo por vos.

## Estructura del proyecto

```
casa-cambio-app/
├── supabase/
│   └── schema.sql        -> TODO el esquema: tablas, roles, RLS y catalogo de monedas
├── frontend/               -> esto es lo que se despliega en Vercel
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── config.js        -> ACA van tu URL y anon key de Supabase
│       ├── supabaseClient.js
│       ├── api.js           -> toda la logica de acceso a datos (usa Supabase)
│       ├── ui.js
│       ├── vistas.js        -> pantallas de la app
│       └── app.js           -> login y navegacion
└── backend/                -> version alternativa con Node + Express + SQLite,
                                 por si en el futuro preferis un servidor propio en vez
                                 de Supabase. No se usa para este despliegue.
```

---

## Paso 1 — Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta / iniciá sesión.
2. **New project** → elegí un nombre, una contraseña de base de datos (guardala) y la región
   más cercana (por ejemplo, alguna de Sudamérica si está disponible).
3. Cuando el proyecto termine de crearse, andá a **SQL Editor** (menú izquierdo) → **New query**.
4. Abrí el archivo `supabase/schema.sql` de este proyecto, copiá **todo** el contenido, pegalo
   en el editor y tocá **Run**. Esto crea todas las tablas, el catálogo de monedas y las
   políticas de seguridad (RLS) que controlan qué puede hacer cada rol.
5. Corré tambien, en orden, estas dos migraciones (mismo lugar: SQL Editor → New query → pegar
   → Run):
   - `supabase/migrations/002_tasas_diarias.sql` — tabla de tasa del día por moneda.
   - `supabase/migrations/003_motor_costeo.sql` — el motor de costeo promedio ponderado que
     calcula solo la utilidad y el acumulado (ver más abajo, sección "Cómo funciona el cierre
     de caja").

### Crear tu primer usuario admin

1. En Supabase, andá a **Authentication → Users → Add user**. Cargá tu email y una contraseña.
2. Andá a **Table Editor → perfiles**. Vas a ver una fila creada automáticamente para vos con
   `rol = visor`. Hacé click en esa celda y cambiala a `admin`.
3. Listo — con ese usuario ya podés entrar a la aplicación con permisos totales.

### Conseguir las credenciales para el frontend

En **Project Settings → API** vas a encontrar:
- **Project URL**
- **anon public** key

Estos dos valores se configuran mediante variables de entorno (`SUPABASE_URL` y `SUPABASE_ANON_KEY`).

---

## Paso 2 — Configurar el frontend

Crea un archivo `.env` en la carpeta `frontend/` (o configura las variables de entorno en tu servidor/hosting) tomando como base `frontend/.env.example`:

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_ANON_KEY=TU_ANON_KEY_ACA
```

El archivo `frontend/js/config.js` obtendrá automáticamente estos valores.

### Probarlo en tu computadora antes de desplegar (opcional)

No hace falta instalar nada especial. Desde la carpeta `frontend/`, cualquier servidor
estático sirve, por ejemplo:

```bash
cd frontend
npx serve .
```

Y abrís la URL que te muestre en la terminal.

---

## Paso 3 — Desplegar en Vercel

1. Subí este proyecto a un repositorio de GitHub (o GitLab/Bitbucket).
2. Entra a [vercel.com](https://vercel.com) → **Add New… → Project** → importá ese repositorio.
3. En la pantalla de configuración del proyecto:
   - **Root Directory**: elegí `frontend` (importante — ahí es donde está el `index.html`).
   - **Framework Preset**: dejalo en "Other" / ninguno — no hace falta build.
   - **Build Command**: dejalo vacío.
   - **Output Directory**: dejalo vacío (usa la raíz de `frontend`).
   - **Environment Variables**: agrega `SUPABASE_URL` y `SUPABASE_ANON_KEY` con los valores de tu proyecto.
4. Deploy. En un minuto vas a tener una URL tipo `tu-proyecto.vercel.app` funcionando.

### Actualizaciones futuras

Cada vez que hagas `git push` a la rama conectada, Vercel vuelve a desplegar automáticamente.

---

## Cómo funciona el cierre de caja (motor de costeo)

Esto reemplaza los cálculos que antes hacían las fórmulas de Google Sheets. Se reconstruyó
analizando 173 días reales de la planilla original hasta encontrar las fórmulas exactas que
usaban — están confirmadas contra esos datos, no son una aproximación.

**Costeo promedio ponderado (WAC).** Las tenencias de cada moneda no se valúan "al precio de
hoy" — se valúan al **costo promedio de compra**. Cada vez que se carga una compra en
*Compra / Venta*, se recalcula el costo promedio de esa moneda:

```
costo_promedio_nuevo = (cantidad_anterior × costo_anterior + cantidad_comprada × precio_compra)
                        / (cantidad_anterior + cantidad_comprada)
```

Y cada vez que se carga una venta, se calcula la **utilidad realizada** de esa operación:

```
utilidad = cantidad_vendida × (precio_venta − costo_promedio_vigente)
```

Por eso **"Posición actual" ya no se carga a mano**: se calcula sola sumando la *Apertura de
saldos* con todo el historial de *Compra / Venta*.

**El "Cierre diario" es un acumulado, no un número que arranca de cero cada día:**

```
TOTAL(hoy) = TOTAL(ayer) + utilidad_del_día − gastos_del_día [+ ajustes manuales opcionales]
```

Si necesitás resetear el acumulado (por ejemplo, en un corte de mes — en la planilla original
lo hacían de vez en cuando), tildá "Resetear acumulado" ese día.

**Chequeo automático.** La pantalla de Cierre diario muestra también `EXISTENCIA` (lo que se
tiene: tenencias + salidas/préstamos del día) contra `DEBEMOS` (lo que se debe: entradas +
utilidad del día + faltante/sobrante). Si no coinciden, avisa — es la misma auditoría cruzada
que tenía la planilla original.

### ⚠️ Paso obligatorio antes de cargar el primer día: Apertura de saldos

El motor necesita un punto de partida. Andá a **Apertura de saldos** (solo lo ve el admin) y
cargá, para cada moneda, cuánto tenían y a qué costo promedio **el día antes de empezar a usar
la app**. Sin esto, la utilidad del primer día va a salir mal (parte de cero en vez de partir
de lo que ya tenían).

### Qué quedó fuera del modelo (a propósito, por ahora)

La planilla original también lleva una cuenta corriente histórica con servicios de remesas
(Latin Express / MoneyGram, con saldos acumulados de cientos de millones — otro orden de
magnitud que la caja diaria), un conteo físico de billetes (arqueos) independiente del
"faltante y sobrante" del cierre diario, y un par de logs de transferencias a Colombia y
depósitos bancarios. Se agregó un lugar simple para cargar Latin/MoneyGram si hace falta
(**Cierre diario → "Otros saldos"**), pero el resto no se modeló todavía — si se usan
activamente, se pueden sumar como módulos aparte.

---

## Roles de usuario

- **admin**: acceso total, incluida la asignación de roles a otros usuarios y el catálogo de
  monedas.
- **operador**: puede cargar y editar todos los datos del día a día (tenencias, operaciones,
  gastos, préstamos, transferencias, resumen diario, utilidad mensual).
- **visor**: solo puede ver el dashboard y los historiales, no puede cargar ni editar nada.

### Cómo agregar gente nueva

Como la creación de cuentas requiere una clave privada que nunca debe quedar expuesta en el
frontend, se hace en dos pasos:

1. Vos (admin) creás la cuenta desde **Supabase → Authentication → Users → Add user** (email +
   contraseña provisoria).
2. Esa persona va a aparecer sola en la sección **Usuarios** de la app (con rol "visor" por
   defecto) — desde ahí le cambiás el rol que corresponda.

---

## Qué reemplaza esto de las planillas originales

- **Tenencias diarias** (tabla "MONEDA / VALOR / % / TOTAL AR")
- **Entradas y préstamos** (CAPITAL, ingresos de transferencias, etc.)
- **Salidas / préstamos** (gastos de casa, gastos de local, etc.)
- **Gastos**
- **Compra / venta de divisas** (libro diario de operaciones)
- **Transferencias** hacia Venezuela / Colombia / otros destinos
- **Resumen diario** (saldo día anterior, utilidad diaria, faltante/sobrante)
- **Utilidad mensual** (tabla Enero-Diciembre)

## Backups

Supabase hace backups automáticos según tu plan. Además, en cualquier momento podés exportar
toda la base desde **Database → Backups**, o correr `pg_dump` apuntando a la connection string
del proyecto (en Project Settings → Database) si querés un respaldo propio.

## Proximos pasos sugeridos

- **Migrar el historial** de tus planillas actuales a Supabase (puedo armar un script que lea
  lo que ya cargaste y lo vuelque directo con `INSERT`s).
- **Edición de registros** (hoy se pueden crear y eliminar; para editar se borra y se vuelve a
  cargar — es una mejora chica de agregar más adelante).
- **Dominio propio**: en Vercel podés conectar un dominio propio (ej. `casadecambio.tudominio.com`)
  desde **Project → Settings → Domains**.

## Alternativa: backend propio (Node + Express + SQLite)

Si en algún momento preferís no depender de Supabase y tener tu propio servidor Node corriendo
en un VPS, la carpeta `backend/` tiene una versión funcionalmente equivalente con Express +
SQLite + JWT. No es necesaria para el despliegue en Vercel/Supabase — quedó ahí como opción B.
