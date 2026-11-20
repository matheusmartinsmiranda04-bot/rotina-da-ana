/* Rotina da Ana — estrutura principal: navegação, topo, notificações, instalação e inicialização */
'use strict';

const Views = {};
const NAV = [
  { id: 'inicio', label: 'Início', icon: 'home' },
  { id: 'calendario', label: 'Calendário', icon: 'calendar' },
  { id: 'tarefas', label: 'Tarefas', icon: 'tasks' },
  { id: 'eventos', label: 'Compromissos', icon: 'events' },
  { id: 'treinos', label: 'Treinos', icon: 'workout' },
  { id: 'alimentacao', label: 'Alimentação', icon: 'food' },
  { id: 'relatorios', label: 'Relatórios', icon: 'chart' },
  { id: 'configuracoes', label: 'Configurações', icon: 'settings' }
];
const MOBILE_NAV = ['inicio', 'calendario', 'tarefas', 'treinos', 'alimentacao'];

const QUOTES = [
  'Pequenos passos também levam a grandes conquistas.',
  'Um dia de cada vez, com carinho e constância.',
  'Cuidar de você é a sua prioridade mais bonita.',
  'Constância vale mais do que perfeição.',
  'Você não precisa fazer tudo hoje — só o próximo passo.',
  'Seu corpo agradece cada escolha feita com amor.',
  'Organizar a rotina é abrir espaço para o que importa.',
  'Respire fundo: você está indo muito bem.',
  'O progresso mora nos detalhes do dia a dia.',
  'Faça hoje algo que a Ana de amanhã vai agradecer.',
  'Leveza também é produtividade.',
  'Celebre cada pequena vitória.',
  'Disciplina é uma forma de autocuidado.',
  'O melhor momento para recomeçar é agora.',
  'Mais calma, menos pressa, mais presença.',
  'Seu ritmo é único — respeite-o.',
  'Hoje é uma página em branco: escreva algo gentil nela.',
  'Treinar, nutrir e descansar: tudo faz parte.',
  'A rotina certa transforma o comum em extraordinário.',
  'Você é capaz de coisas incríveis, um hábito por vez.',
  'Gentileza consigo mesma também é meta.',
  'Planeje com leveza, execute com amor.',
  'Pequenos rituais, grandes resultados.',
  'Cada refeição é uma chance de se cuidar.',
  'Força não é só no treino — é na constância.',
  'Hoje vale a pena. Você também.',
  'Devagar também se chega longe.',
  'Seu bem-estar é a base de tudo.',
  'Acredite no processo e confie em você.',
  'Um sorriso e uma lista feita: dia perfeito.'
];
function quoteOfDay(k = D.today()) {
  const d = D.parse(k), start = new Date(d.getFullYear(), 0, 0);
  const n = Math.floor((d - start) / 86400000);
  return QUOTES[n % QUOTES.length];
}
function periodOfDay() { const h = new Date().getHours(); return h < 12 ? 'manha' : h < 18 ? 'tarde' : 'noite'; }
function greeting() { const p = periodOfDay(); return p === 'manha' ? 'Bom dia' : p === 'tarde' ? 'Boa tarde' : 'Boa noite'; }

const App = {
  current: 'inicio',
  deferredInstall: null,

  init() {
    Store.load();
    this.applyTheme();
    this.renderShell();
    Store.on(() => { this.renderHeader(); this.renderView(true); });
    window.addEventListener('hashchange', () => this.route());
    this.route();
    this.registerSW();
    this.setupInstall();
    this.startReminders();
    this.firstRun();
    // atualiza saudação/horário a cada minuto e vira o dia automaticamente
    let lastDay = D.today();
    setInterval(() => {
      this.renderHeader();
      if (D.today() !== lastDay) { lastDay = D.today(); this.renderView(true); }
    }, 60000);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.applyTheme());
  },

  applyTheme() {
    const t = Store.state.settings.theme;
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const meta = $('meta[name=theme-color]'); if (meta) meta.content = dark ? '#1C1920' : '#FBF8F5';
  },

  renderShell() {
    $('#app').innerHTML = `
      <aside class="sidebar" aria-label="Navegação principal">
        <a class="brand" href="#/inicio">${logoMark(38)}<div><b>Rotina da Ana</b><span>organização & bem-estar</span></div></a>
        <nav class="side-nav">${NAV.map(n => `<a href="#/${n.id}" data-nav="${n.id}">${icon(n.icon)}<span>${n.label}</span></a>`).join('')}</nav>
        <div class="side-foot">
          <button class="install-btn" id="install-side" hidden>${icon('install')}<span>Instalar aplicativo</span></button>
          <div class="side-quote">${icon('sparkles')}<p id="side-quote"></p></div>
        </div>
      </aside>
      <div class="main-col">
        <header class="topbar" id="topbar"></header>
        <main id="view" class="view" tabindex="-1"></main>
      </div>
      <nav class="bottom-nav" aria-label="Navegação">
        ${MOBILE_NAV.map(id => { const n = NAV.find(x => x.id === id); return `<a href="#/${n.id}" data-nav="${n.id}">${icon(n.icon)}<span>${n.label}</span></a>`; }).join('')}
        <button id="more-btn" data-nav="more">${icon('menu')}<span>Mais</span></button>
      </nav>`;
    $('#more-btn').addEventListener('click', () => this.openMoreSheet());
    $('#install-side').addEventListener('click', () => this.promptInstall());
    this.renderHeader();
  },

  openMoreSheet() {
    const items = NAV.filter(n => !MOBILE_NAV.includes(n.id));
    Modal.open({
      title: 'Mais opções', cls: 'sheet', size: 'sm',
      body: `<div class="more-grid">${items.map(n => `<a href="#/${n.id}" data-close>${icon(n.icon)}<span>${n.label}</span></a>`).join('')}
        ${this.deferredInstall ? `<button data-install>${icon('install')}<span>Instalar app</span></button>` : ''}</div>`,
      onMount: (root, api) => { const b = $('[data-install]', root); b && b.addEventListener('click', () => { api.close(); this.promptInstall(); }); }
    });
  },

  renderHeader() {
    const s = Store.state.settings, k = D.today();
    const notes = this.notifications();
    const unread = notes.filter(n => !Store.state.readNotifications[n.id]).length;
    $('#topbar').innerHTML = `
      <div class="tb-left">
        <span class="tb-logo">${logoMark(30)}</span>
        <div><p class="tb-date">${esc(D.long(k).replace(/^./, c => c.toUpperCase()))} <span class="pill-day">${esc(D.wdShort[D.dow(k)])}</span></p>
        <h1 class="tb-greet">${greeting()}, <em>${esc(s.name || 'Ana')}</em></h1></div>
      </div>
      <div class="tb-right">
        <span class="tb-brand">Rotina da Ana</span>
        <button class="icon-btn bell" id="bell" aria-label="Lembretes (${unread} novos)">${icon('bell')}${unread ? `<i class="badge">${unread > 9 ? '9+' : unread}</i>` : ''}</button>
        <a href="#/configuracoes" class="tb-avatar" aria-label="Perfil e configurações">${avatarHtml(s.avatar, 40)}</a>
      </div>`;
    $('#bell').addEventListener('click', () => this.openNotifications());
    const q = $('#side-quote'); if (q) q.textContent = quoteOfDay();
  },

  /* Lembretes internos gerados a partir dos dados */
  notifications() {
    const k = D.today(), tm = D.add(k, 1), out = [], nowM = D.nowMinutes();
    const st = Store.state;
    st.tasks.filter(t => Sel.isOverdue(t)).forEach(t => out.push({ id: 'ov:' + t.id + ':' + k, icon: 'alert', tone: 'warn', title: 'Tarefa atrasada: ' + t.title, sub: 'Prazo: ' + D.br(t.date), go: '#/tarefas' }));
    st.tasks.filter(t => t.date === k && t.status !== 'done').forEach(t => out.push({ id: 'td:' + t.id + ':' + k, icon: 'tasks', title: t.title, sub: 'Tarefa para hoje' + (t.time ? ' às ' + t.time : ''), go: '#/tarefas' }));
    Sel.eventsOn(k).filter(e => !e.done && (e.allDay || !e.end || D.toMin(e.end) >= nowM)).forEach(e => out.push({ id: 'ev:' + e.id + ':' + k, icon: 'events', title: e.title, sub: 'Hoje' + (e.allDay ? '' : ' · ' + e.start + (e.end ? '–' + e.end : '')), go: '#/eventos' }));
    Sel.eventsOn(tm).filter(e => e.reminder).forEach(e => out.push({ id: 'evt:' + e.id + ':' + tm, icon: 'calendar', title: e.title, sub: 'Amanhã' + (e.allDay ? '' : ' · ' + e.start), go: '#/eventos' }));
    Sel.workoutsOn(k).filter(w => !w.log && !w.extra).forEach(w => out.push({ id: 'wk:' + w.template.id + ':' + k, icon: 'workout', title: w.template.name + ' hoje', sub: w.template.time ? 'às ' + w.template.time : 'Treino programado', go: '#/treinos' }));
    const next = st.nutrition.meals.find(m => { const t = D.toMin(m.time); const log = Sel.mealLog(k, m.id); return t !== null && t >= nowM && t - nowM <= 90 && !(log && log.done); });
    if (next) out.push({ id: 'ml:' + next.id + ':' + k, icon: 'food', title: 'Próxima refeição: ' + next.name, sub: 'às ' + next.time, go: '#/alimentacao' });
    return out;
  },

  openNotifications() {
    const notes = this.notifications();
    const perm = 'Notification' in window ? Notification.permission : 'unsupported';
    Modal.open({
      title: 'Lembretes', size: 'sm', cls: 'notif-modal',
      body: (notes.length ? `<ul class="notif-list">${notes.map(n => `<li class="${Store.state.readNotifications[n.id] ? 'read' : ''} ${n.tone || ''}"><a href="${n.go}" data-close>${icon(n.icon)}<div><b>${esc(n.title)}</b><span>${esc(n.sub)}</span></div></a></li>`).join('')}</ul>`
        : emptyState(emptyArt(), 'Tudo em dia', 'Nenhum lembrete pendente agora.')) +
        (perm === 'default' ? `<button class="btn soft block" id="nt-perm">${icon('bell')}Receber avisos do sistema enquanto o app estiver aberto</button>` : ''),
      footer: notes.length ? `<span class="sp"></span><button class="btn ghost" id="nt-read">Marcar todos como lidos</button>` : '',
      onMount: (root, api) => {
        const r = $('#nt-read', root);
        r && r.addEventListener('click', () => { Store.update(s => { notes.forEach(n => s.readNotifications[n.id] = 1); }); api.close(); });
        const p = $('#nt-perm', root);
        p && p.addEventListener('click', async () => {
          const res = await Notification.requestPermission();
          Store.update(s => { s.settings.notifications = res === 'granted'; });
          toast(res === 'granted' ? 'Avisos ativados.' : 'Avisos não autorizados pelo navegador.', res === 'granted' ? 'success' : 'info');
          api.close();
        });
      }
    });
  },

  /* Dispara lembretes de compromissos/tarefas com horário */
  startReminders() {
    const fired = new Set(JSON.parse(sessionStorage.getItem('rda-fired') || '[]'));
    const check = () => {
      const now = new Date(), k = D.today(), nowM = now.getHours() * 60 + now.getMinutes();
      const due = [];
      Store.state.events.forEach(e => {
        if (e.reminder === '' || e.reminder === null || e.reminder === undefined) return;
        const start = e.allDay ? 8 * 60 : D.toMin(e.start || '08:00');
        const evDate = D.parse(e.date); evDate.setMinutes(start);
        const trigger = new Date(evDate.getTime() - Number(e.reminder) * 60000);
        if (now >= trigger && now - trigger < 10 * 60000) due.push({ id: 'r:' + e.id + ':' + e.date, title: e.title, body: (e.allDay ? 'Dia inteiro' : 'Às ' + e.start) + ' · ' + D.relative(e.date) });
      });
      Store.state.tasks.forEach(t => {
        if (t.status === 'done' || t.date !== k || !t.time) return;
        const tm = D.toMin(t.time);
        if (nowM >= tm && nowM - tm < 10) due.push({ id: 'rt:' + t.id + ':' + k, title: t.title, body: 'Tarefa · ' + t.time });
      });
      due.filter(d => !fired.has(d.id)).forEach(d => {
        fired.add(d.id);
        toast('Lembrete: ' + d.title, 'info', 6000);
        if (Store.state.settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
          try { new Notification('Rotina da Ana — ' + d.title, { body: d.body, icon: 'icons/icon-192.png' }); } catch (e) { /* alguns navegadores exigem service worker */ }
        }
      });
      sessionStorage.setItem('rda-fired', JSON.stringify([...fired]));
    };
    check(); setInterval(check, 30000);
  },

  route() {
    const id = (location.hash.replace(/^#\/?/, '').split('?')[0]) || 'inicio';
    this.current = Views[id] ? id : 'inicio';
    $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === this.current || (a.dataset.nav === 'more' && !MOBILE_NAV.includes(this.current))));
    this.renderView(false);
    const v = $('#view'); v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
    window.scrollTo(0, 0);
    document.title = (NAV.find(n => n.id === this.current) || NAV[0]).label + ' · Rotina da Ana';
  },

  renderView(keepScroll) {
    const v = $('#view'); if (!v) return;
    const y = window.scrollY;
    v.onclick = null; v.onchange = null; v.oninput = null;
    try { Views[this.current].render(v); }
    catch (e) { console.error(e); v.innerHTML = `<div class="card">${emptyState(emptyArt(), 'Algo deu errado nesta tela', 'Tente recarregar a página. Seus dados continuam salvos.')}</div>`; }
    if (keepScroll) window.scrollTo(0, y);
  },

  registerSW() {
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(e => console.warn('Service worker não registrado', e));
    }
  },
  setupInstall() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault(); this.deferredInstall = e;
      const b = $('#install-side'); if (b) b.hidden = false;
      if (this.current === 'inicio' || this.current === 'configuracoes') this.renderView(true);
    });
    window.addEventListener('appinstalled', () => { this.deferredInstall = null; const b = $('#install-side'); if (b) b.hidden = true; toast('Rotina da Ana instalada! 🎉'); });
  },
  async promptInstall() {
    if (!this.deferredInstall) {
      Modal.open({ title: 'Instalar aplicativo', size: 'sm', body: `<p class="muted-p">Para instalar, abra a Rotina da Ana pelo Chrome ou Edge (endereço <b>http://localhost:8787</b> ou pelo GitHub Pages) e clique no ícone de instalação ${icon('install')} na barra de endereço. No celular, use “Adicionar à tela inicial”.</p>`, footer: '<button class="btn primary" data-close>Entendi</button>' });
      return;
    }
    this.deferredInstall.prompt();
    await this.deferredInstall.userChoice.catch(() => {});
    this.deferredInstall = null; const b = $('#install-side'); if (b) b.hidden = true;
  },

  /* Primeiro acesso: oferece importar os dados iniciais da Ana (arquivo local, nunca publicado) */
  async firstRun() {
    if (!Store.isEmpty()) return;
    let seed = null;
    if (location.protocol.startsWith('http')) {
      try { const r = await fetch('dados-iniciais/rotina-da-ana-dados-iniciais.json', { cache: 'no-store' }); if (r.ok) seed = await r.json(); } catch (e) { /* sem arquivo local */ }
    }
    Modal.open({
      title: 'Bem-vinda à Rotina da Ana', size: 'md', cls: 'welcome',
      body: `<div class="welcome-art">${logoMark(64)}</div>
        <p class="lead">Seu cantinho para organizar tarefas, compromissos, treinos e alimentação — tudo salvo só neste navegador, sem login e sem internet.</p>
        ${seed ? `<div class="note-box ok">${icon('check')}<span>Encontrei seus <b>dados iniciais</b>: plano alimentar, treinos e compromissos.</span></div>`
          : `<p class="muted-p">Se você tem o arquivo <b>rotina-da-ana-dados-iniciais.json</b> (pasta <i>dados-iniciais</i>), importe-o para carregar sua dieta, seus treinos e seus compromissos.</p>`}`,
      footer: `<button class="btn ghost" id="wf-empty">Começar do zero</button><span class="sp"></span>
        ${seed ? `<button class="btn primary" id="wf-seed">${icon('download')}Carregar meus dados</button>` : `<button class="btn primary" id="wf-file">${icon('upload')}Escolher arquivo</button>`}`,
      onMount: (root, api) => {
        $('#wf-empty', root).addEventListener('click', () => { Store.save(true); api.close(); toast('Tudo pronto! Comece adicionando uma tarefa.', 'info'); });
        const s = $('#wf-seed', root);
        s && s.addEventListener('click', () => { Store.applySeed(seed); api.close(); toast('Dados carregados. Bem-vinda, ' + Store.state.settings.name + '!'); });
        const f = $('#wf-file', root);
        f && f.addEventListener('click', async () => {
          const file = await pickFile('.json,application/json'); if (!file) return;
          try { const obj = Store.parseImport(await file.text()); if (obj.kind === 'backup') Store.replace(obj.data); else Store.applySeed(obj); api.close(); toast('Dados importados com sucesso.'); }
          catch (e) { toast(e.message || 'Arquivo inválido.', 'error', 5000); }
        });
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
