const UI = {
  formatoARS(valor) {
    const n = Number(valor) || 0;
    return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  },
  formatoNumero(valor, decimales = 2) {
    const n = Number(valor) || 0;
    return n.toLocaleString('es-AR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
  },
  hoy() {
    return new Date().toISOString().slice(0, 10);
  },
  haceDias(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  },
  toast(mensaje, tipo = 'ok') {
    const el = document.getElementById('toast');
    el.textContent = mensaje;
    el.className = `toast ${tipo}`;
    el.classList.remove('oculto');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.add('oculto'), 3000);
  },
  el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  },
};
