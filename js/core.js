/* Rotina da Ana — utilitários base (DOM, datas, ícones, modais, avisos) */
'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function uid(prefix = 'id') {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function round1(n) { return Math.round(n * 10) / 10; }
function fmtNum(n, dec = 0) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: dec });
}
function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

/* ---------- Datas (sempre em horário local, chave AAAA-MM-DD) ---------- */
const D = {
  pad: n => String(n).padStart(2, '0'),
  key(d = new Date()) { return d.getFullYear() + '-' + D.pad(d.getMonth() + 1) + '-' + D.pad(d.getDate()); },
  today() { return D.key(new Date()); },
  parse(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); },
  add(k, n) { const d = D.parse(k); d.setDate(d.getDate() + n); return D.key(d); },
  addMonths(k, n) { const d = D.parse(k); d.setDate(1); d.setMonth(d.getMonth() + n); return D.key(d); },
  dow(k) { return D.parse(k).getDay(); },
  diff(a, b) { return Math.round((D.parse(b) - D.parse(a)) / 86400000); },
  startOfWeek(k) { return D.add(k, -D.dow(k)); }, // domingo
  startOfMonth(k) { return k.slice(0, 8) + '01'; },
  endOfMonth(k) { const d = D.parse(k); return D.key(new Date(d.getFullYear(), d.getMonth() + 1, 0)); },
  range(a, b) { const out = []; let k = a; while (k <= b) { out.push(k); k = D.add(k, 1); } return out; },
  weekdays: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  wdShort: ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  months: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  long(k) { const d = D.parse(k); return D.weekdays[d.getDay()] + ', ' + d.getDate() + ' de ' + D.months[d.getMonth()]; },
  medium(k) { const d = D.parse(k); return d.getDate() + ' de ' + D.months[d.getMonth()].slice(0, 3) + '.'; },
  short(k) { const d = D.parse(k); return D.pad(d.getDate()) + '/' + D.pad(d.getMonth() + 1); },
  br(k) { const d = D.parse(k); return D.pad(d.getDate()) + '/' + D.pad(d.getMonth() + 1) + '/' + d.getFullYear(); },
  monthTitle(k) { const d = D.parse(k); return D.months[d.getMonth()] + ' ' + d.getFullYear(); },
  relative(k) {
    const t = D.today(), n = D.diff(t, k);
    if (n === 0) return 'Hoje';
    if (n === 1) return 'Amanhã';
    if (n === -1) return 'Ontem';
    if (n > 1 && n < 7) return D.weekdays[D.dow(k)].replace('-feira', '');
    return D.medium(k);
  },
  nowMinutes() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); },
  toMin(t) { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); }
};

/* ---------- Ícones (traço fino, estilo minimalista) ---------- */
const ICON_PATHS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  tasks: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="m8 12 3 3 5-6"/>',
  events: '<path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10z"/><circle cx="12" cy="11" r="2.5"/>',
  workout: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  food: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 1.5-3 4-3 7h3v11"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  kanban: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M4 4h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  flame: '<path d="M12 21c-3.9 0-7-2.9-7-6.6 0-3.1 2.2-5.3 3.6-7.4.6 1.6 1.6 2.7 2.7 3.3C11.5 7 13 4.3 15.2 3c-.3 2.6.9 4.6 2.2 6.3A7 7 0 0 1 19 14.4c0 3.7-3.1 6.6-7 6.6z"/>',
  heart: '<path d="M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.5-7.5 10-7.5 10z"/>',
  sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.5"/>',
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  play: '<path d="M7 5v14l12-7z"/>',
  leaf: '<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19 13 11"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8S10.5 3 8 4s0 4 4 4zM12 8s1.5-5 4-4 0 4-4 4z"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8" r="1.3"/>',
  install: '<rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="M12 7v7M9 11l3 3 3-3M10 18.5h4"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  scale: '<path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>'
};
function icon(name, cls = '') {
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.sparkles}</svg>`;
}

/* ---------- Avisos (toast) ---------- */
function toast(msg, type = 'success', ms = 2600) {
  let wrap = $('#toasts');
  if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toasts'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.setAttribute('role', type === 'error' ? 'alert' : 'status');
  t.innerHTML = icon(type === 'error' ? 'alert' : type === 'info' ? 'info' : 'check') + `<span>${esc(msg)}</span>`;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, ms);
}

/* ---------- Modal ---------- */
const Modal = {
  stack: [],
  open({ title = '', body = '', footer = '', size = '', onMount, onClose, cls = '' }) {
    const root = document.createElement('div');
    root.className = 'modal-root';
    root.innerHTML = `
      <div class="modal-backdrop" data-close></div>
      <div class="modal ${size} ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <header class="modal-head"><h3>${esc(title)}</h3>
          <button class="icon-btn" data-close aria-label="Fechar">${icon('x')}</button></header>
        <div class="modal-body">${body}</div>
        ${footer ? `<footer class="modal-foot">${footer}</footer>` : ''}
      </div>`;
    document.body.appendChild(root);
    document.body.classList.add('no-scroll');
    const api = {
      el: root,
      close: () => {
        root.classList.remove('show');
        setTimeout(() => root.remove(), 200);
        Modal.stack = Modal.stack.filter(m => m !== api);
        if (!Modal.stack.length) document.body.classList.remove('no-scroll');
        onClose && onClose();
      }
    };
    root.addEventListener('click', e => { if (e.target.closest('[data-close]')) api.close(); });
    Modal.stack.push(api);
    requestAnimationFrame(() => root.classList.add('show'));
    onMount && onMount(root, api);
    const first = root.querySelector('.modal-body input:not([type=hidden]):not([type=checkbox]), .modal-body textarea, .modal-body select');
    if (first && !('ontouchstart' in window)) setTimeout(() => first.focus(), 60);
    return api;
  },
  closeTop() { const m = Modal.stack[Modal.stack.length - 1]; m && m.close(); }
};
document.addEventListener('keydown', e => { if (e.key === 'Escape' && Modal.stack.length) Modal.closeTop(); });

function confirmDialog({ title = 'Confirmar', message = '', confirmText = 'Confirmar', danger = false, requireText = '' }) {
  return new Promise(resolve => {
    let done = false;
    const m = Modal.open({
      title, size: 'sm',
      body: `<p class="muted-p">${message}</p>${requireText ? `<label class="field"><span>Digite <b>${esc(requireText)}</b> para confirmar</span><input id="cf-text" autocomplete="off"></label>` : ''}`,
      footer: `<button class="btn ghost" data-close>Cancelar</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cf-ok">${esc(confirmText)}</button>`,
      onClose: () => { if (!done) resolve(false); },
      onMount: (root, api) => {
        $('#cf-ok', root).addEventListener('click', () => {
          if (requireText && $('#cf-text', root).value.trim().toUpperCase() !== requireText.toUpperCase()) {
            toast('Texto de confirmação incorreto.', 'error'); return;
          }
          done = true; resolve(true); api.close();
        });
      }
    });
  });
}

/* ---------- Formulários ---------- */
function formData(root) {
  const o = {};
  $$('[name]', root).forEach(el => {
    if (el.type === 'checkbox') o[el.name] = el.checked;
    else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
    else o[el.name] = el.value.trim();
  });
  return o;
}
function selectOptions(list, selected) {
  return list.map(o => `<option value="${esc(o.value)}" ${String(o.value) === String(selected) ? 'selected' : ''}>${esc(o.label)}</option>`).join('');
}
function downloadFile(name, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function pickFile(accept) {
  return new Promise(resolve => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = accept;
    inp.onchange = () => resolve(inp.files[0] || null);
    inp.click();
  });
}
/* Redimensiona imagens enviadas para não pesar no armazenamento */
function resizeImage(file, max = 256, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  });
}
function emptyState(art, title, text, action = '') {
  return `<div class="empty">${art}<h4>${esc(title)}</h4><p>${esc(text)}</p>${action}</div>`;
}
