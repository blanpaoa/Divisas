-- Esquema de base de datos para la app de gestion de casa de cambio
-- Basado en la estructura de las planillas de Google Sheets originales

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- USUARIOS Y ROLES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nombre_completo TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'operador', 'visor')),
  activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- MONEDAS (catalogo fijo, tomado de las columnas de las planillas)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monedas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE,      -- ej: USD, USD_PEQ, EUR, REAL, ARS...
  nombre TEXT NOT NULL,             -- ej: "Dolar cara grande"
  activa INTEGER NOT NULL DEFAULT 1
);

-- ---------------------------------------------------------------------
-- TENENCIAS DIARIAS (tabla "MONEDA / VALOR / % / TOTAL AR" de la planilla 1
-- y la tabla de saldos de la planilla 2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenencias_diarias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,              -- formato YYYY-MM-DD
  moneda_id INTEGER NOT NULL REFERENCES monedas(id),
  valor REAL NOT NULL DEFAULT 0,        -- cantidad en esa moneda
  cotizacion REAL NOT NULL DEFAULT 0,   -- valor de cambio a ARS ese dia
  total_ars REAL NOT NULL DEFAULT 0,    -- valor * cotizacion
  usuario_id INTEGER REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(fecha, moneda_id)
);

-- ---------------------------------------------------------------------
-- ENTRADAS Y PRESTAMOS (capital, prestamos recibidos, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entradas_prestamos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,
  concepto TEXT NOT NULL,           -- ej: CAPITAL, ULTIMA UTILIDAD, INGRESOS TRANSF COLOMBIA...
  moneda_id INTEGER NOT NULL REFERENCES monedas(id),
  valor REAL NOT NULL DEFAULT 0,
  porcentaje REAL NOT NULL DEFAULT 0,
  total_ars REAL NOT NULL DEFAULT 0,
  usuario_id INTEGER REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- SALIDA - PRESTAMOS (prestamos otorgados / gastos de casa / locales)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS salidas_prestamos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,
  concepto TEXT NOT NULL,           -- ej: LILI GASTOS CASA, GASTOS LOCAL 58...
  moneda_id INTEGER NOT NULL REFERENCES monedas(id),
  valor REAL NOT NULL DEFAULT 0,
  porcentaje REAL NOT NULL DEFAULT 0,
  total_ars REAL NOT NULL DEFAULT 0,
  usuario_id INTEGER REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- GASTOS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gastos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,
  concepto TEXT,
  moneda_id INTEGER NOT NULL REFERENCES monedas(id),
  valor REAL NOT NULL DEFAULT 0,
  porcentaje REAL NOT NULL DEFAULT 0,
  total_ars REAL NOT NULL DEFAULT 0,
  usuario_id INTEGER REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- OPERACIONES DE COMPRA / VENTA DE DIVISAS (planilla 2, libro diario)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS operaciones_cambio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'venta')),
  moneda_id INTEGER NOT NULL REFERENCES monedas(id),
  cantidad REAL NOT NULL DEFAULT 0,
  cotizacion REAL NOT NULL DEFAULT 0,
  total_ars REAL NOT NULL DEFAULT 0,
  usuario_id INTEGER REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- TRANSFERENCIAS (Venezuela / Colombia / otros destinos)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transferencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,
  destino TEXT NOT NULL,            -- ej: VENEZUELA, COLOMBIA
  tipo TEXT NOT NULL CHECK (tipo IN ('debemos', 'abonos', 'ingreso', 'egreso')),
  moneda_id INTEGER NOT NULL REFERENCES monedas(id),
  valor REAL NOT NULL DEFAULT 0,
  total_ars REAL NOT NULL DEFAULT 0,
  notas TEXT,
  usuario_id INTEGER REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- RESUMEN DIARIO (saldo dia anterior, utilidad diaria, faltante/sobrante)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resumen_diario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL UNIQUE,
  saldo_dia_anterior_ars REAL NOT NULL DEFAULT 0,
  utilidad_diaria_ars REAL NOT NULL DEFAULT 0,
  descuentos_ars REAL NOT NULL DEFAULT 0,
  utilidad_adicional_ars REAL NOT NULL DEFAULT 0,
  faltante_sobrante_ars REAL NOT NULL DEFAULT 0,
  tasa_us_cierre REAL NOT NULL DEFAULT 0,
  total_ars REAL NOT NULL DEFAULT 0,
  notas TEXT,
  usuario_id INTEGER REFERENCES usuarios(id),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------
-- UTILIDAD MENSUAL (tabla ENERO..DICIEMBRE de la planilla 1)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilidad_mensual (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anio INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  utilidad_us REAL NOT NULL DEFAULT 0,
  utilidad_ars REAL NOT NULL DEFAULT 0,
  notas TEXT,
  UNIQUE(anio, mes)
);

-- ---------------------------------------------------------------------
-- INDICES para acelerar las consultas de dashboard por rango de fechas
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tenencias_fecha ON tenencias_diarias(fecha);
CREATE INDEX IF NOT EXISTS idx_entradas_fecha ON entradas_prestamos(fecha);
CREATE INDEX IF NOT EXISTS idx_salidas_fecha ON salidas_prestamos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_operaciones_fecha ON operaciones_cambio(fecha);
CREATE INDEX IF NOT EXISTS idx_transferencias_fecha ON transferencias(fecha);
CREATE INDEX IF NOT EXISTS idx_resumen_fecha ON resumen_diario(fecha);
