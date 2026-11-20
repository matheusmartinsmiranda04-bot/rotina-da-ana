/* Rotina da Ana — dados, persistência local e cálculos compartilhados por todas as abas */
'use strict';

const STORAGE_KEY = 'rotina-da-ana:dados';
const APP_ID = 'rotina-da-ana';
const DATA_VERSION = 1;

const DEFAULT_CATEGORIES = [
  { id: 'pessoal', name: 'Pessoal', color: '#E7A9B6', icon: 'heart' },
  { id: 'trabalho', name: 'Trabalho', color: '#9FB4E0', icon: 'briefcase' },
  { id: 'saude', name: 'Saúde', color: '#8FC6A8', icon: 'leaf' },
  { id: 'treino', name: 'Treino', color: '#F0A48A', icon: 'workout' },
  { id: 'alimentacao', name: 'Alimentação', color: '#E9C77E', icon: 'food' },
  { id: 'estudos', name: 'Estudos', color: '#B6A2E3', icon: 'book' },
  { id: 'compromissos', name: 'Compromissos', color: '#7FC4CC', icon: 'pin' },
  { id: 'feriado', name: 'Feriado', color: '#D6B8E8', icon: 'gift' },
  { id: 'outros', name: 'Outros', color: '#C9C1BA', icon: 'tag' }
];

const PRIORITIES = [
  { value: 'baixa', label: 'Baixa', w: 1 },
  { value: 'media', label: 'Média', w: 2 },
  { value: 'alta', label: 'Alta', w: 3 },
  { value: 'urgente', label: 'Urgente', w: 4 }
];
const TASK_STATUS = [
  { value: 'todo', label: 'A fazer' },
  { value: 'doing', label: 'Em andamento' },
  { value: 'done', label: 'Concluída' }
];
const WORKOUT_TYPES = [
  { value: 'musculacao', label: 'Musculação' },
  { value: 'aerobico', label: 'Aeróbico' },
  { value: 'funcional', label: 'Funcional' },
  { value: 'corrida', label: 'Corrida / caminhada' },
  { value: 'pilates', label: 'Pilates / yoga' },
  { value: 'alongamento', label: 'Alongamento' },
  { value: 'outro', label: 'Outro' }
];
const SWATCHES = { rose: '#E7A9B6', lavender: '#B6A2E3', sage: '#8FC6A8', beige: '#E3C9A8', sky: '#9FC3E0', peach: '#F0B48A' };

/*
  Tabela de REFERÊNCIA (valores por 100 g / 100 ml), usada SOMENTE quando a Ana pede para
  preencher campos "não informados". Baseada na Tabela Brasileira de Composição de Alimentos
  (TACO/UNICAMP) e, quando o item não existe na TACO, em médias de rótulos. São estimativas.
*/
const NUTRI_REF = {
  pao_integral: { name: 'Pão de forma integral', kcal: 253, p: 9.4, c: 49.9, f: 3.7, src: 'TACO' },
  pao_frances: { name: 'Pão francês', kcal: 300, p: 8.0, c: 58.6, f: 3.1, src: 'TACO' },
  ovo: { name: 'Ovo de galinha inteiro cozido', kcal: 146, p: 13.3, c: 0.6, f: 9.5, src: 'TACO' },
  frango: { name: 'Peito de frango sem pele grelhado', kcal: 159, p: 32.0, c: 0, f: 2.5, src: 'TACO' },
  cafe: { name: 'Café infusão (sem açúcar)', kcal: 9, p: 0.7, c: 1.5, f: 0.1, src: 'TACO' },
  banana: { name: 'Banana prata', kcal: 98, p: 1.3, c: 26.0, f: 0.1, src: 'TACO' },
  maca: { name: 'Maçã fuji com casca', kcal: 56, p: 0.3, c: 15.2, f: 0, src: 'TACO' },
  mamao: { name: 'Mamão papaia', kcal: 40, p: 0.5, c: 10.4, f: 0.1, src: 'TACO' },
  laranja: { name: 'Laranja pera', kcal: 37, p: 1.0, c: 8.9, f: 0.1, src: 'TACO' },
  aveia: { name: 'Aveia em flocos', kcal: 394, p: 13.9, c: 66.6, f: 8.5, src: 'TACO' },
  iogurte_zero: { name: 'Iogurte natural desnatado', kcal: 41, p: 3.8, c: 5.8, f: 0.3, src: 'TACO (aprox.)' },
  pasta_amendoim: { name: 'Pasta de amendoim integral', kcal: 588, p: 25.0, c: 20.0, f: 50.0, src: 'média de rótulos' },
  arroz: { name: 'Arroz branco cozido', kcal: 128, p: 2.5, c: 28.1, f: 0.2, src: 'TACO' },
  feijao: { name: 'Feijão carioca cozido', kcal: 76, p: 4.8, c: 13.6, f: 0.5, src: 'TACO' },
  legumes: { name: 'Legumes cozidos (média)', kcal: 30, p: 1.2, c: 6.0, f: 0.2, src: 'média TACO' },
  azeite: { name: 'Azeite de oliva', kcal: 884, p: 0, c: 0, f: 100, src: 'TACO' },
  carne_magra: { name: 'Carne bovina magra (patinho grelhado)', kcal: 219, p: 35.9, c: 0, f: 7.3, src: 'TACO' },
  batata_doce: { name: 'Batata-doce cozida', kcal: 77, p: 0.6, c: 18.4, f: 0.1, src: 'TACO' },
  peixe: { name: 'Peixe branco grelhado (tilápia)', kcal: 128, p: 26.2, c: 0, f: 2.7, src: 'USDA (aprox.)' },
  leite: { name: 'Leite (integral, sem lactose)', kcal: 61, p: 3.2, c: 4.7, f: 3.3, src: 'TACO (aprox.)' },
  creatina: { name: 'Creatina', kcal: 0, p: 0, c: 0, f: 0, src: 'rótulo' },
  cacau: { name: 'Cacau em pó 100%', kcal: 228, p: 19.6, c: 57.9, f: 13.7, src: 'USDA (aprox.)' },
  chia: { name: 'Semente de chia', kcal: 486, p: 16.5, c: 42.1, f: 30.7, src: 'USDA (aprox.)' },
  whey: { name: 'Whey protein isolado', kcal: 370, p: 86.7, c: 3.3, f: 1.7, src: 'média de rótulos' }
};

function defaultState() {
  return {
    app: APP_ID, version: DATA_VERSION,
    createdAt: new Date().toISOString(),
    settings: {
      name: 'Ana', avatar: 'preset:1', theme: 'light',
      categories: clone(DEFAULT_CATEGORIES),
      goals: { tasksPerDay: 3, workoutsPerWeek: 4 },
      notifications: false,
      seedImported: false,
      installDismissed: false
    },
    profile: {},
    tasks: [],
    events: [],
    routine: [], // itens fixos da rotina diária: {id,time,title,days:[0..6]}
    habits: [],
    habitLog: {}, // { 'AAAA-MM-DD': ['habitId'] }
    workouts: { templates: [], logs: [] },
    nutrition: {
      goals: { kcal: null, protein: null, carbs: null, fat: null, waterMl: 2000 },
      meals: [],
      logs: {}, // { data: { meals: { mealId: { optionId, done, items: { itemId: fator } } }, waterMl } }
      extras: null
    },
    readNotifications: {}
  };
}

/* Garante que dados antigos/importados tenham todos os campos esperados */
function normalize(s) {
  const d = defaultState();
  const out = Object.assign({}, d, s || {});
  out.settings = Object.assign({}, d.settings, out.settings || {});
  out.settings.goals = Object.assign({}, d.settings.goals, out.settings.goals || {});
  if (!Array.isArray(out.settings.categories) || !out.settings.categories.length) out.settings.categories = clone(DEFAULT_CATEGORIES);
  out.workouts = Object.assign({ templates: [], logs: [] }, out.workouts || {});
  out.nutrition = Object.assign({}, d.nutrition, out.nutrition || {});
  out.nutrition.goals = Object.assign({}, d.nutrition.goals, out.nutrition.goals || {});
  out.nutrition.logs = out.nutrition.logs || {};
  ['tasks', 'events', 'routine', 'habits'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
  out.habitLog = out.habitLog || {};
  out.readNotifications = out.readNotifications || {};
  out.app = APP_ID; out.version = DATA_VERSION;
  // completa itens de alimentos com campos nutricionais (null = não informado)
  out.nutrition.meals.forEach(m => (m.options || []).forEach(o => (o.items || []).forEach(it => {
    ['kcal', 'protein', 'carbs', 'fat'].forEach(k => { if (it[k] === undefined || it[k] === '') it[k] = null; });
    if (!it.source) it.source = (it.kcal !== null) ? 'usuario' : null;
  })));
  out.workouts.templates.forEach(t => { if (!t.createdAt) t.createdAt = D.today(); if (!Array.isArray(t.days)) t.days = []; });
  return out;
}

const Store = {
  state: null,
  listeners: [],
  saveTimer: null,
  storageOk: true,
  load() {
    let raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { this.storageOk = false; }
    try { this.state = normalize(raw ? JSON.parse(raw) : null); }
    catch (e) { console.warn('Dados corrompidos, iniciando vazio', e); this.state = normalize(null); }
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    return this.state;
  },
  isEmpty() { try { return !localStorage.getItem(STORAGE_KEY); } catch (e) { return true; } },
  save(now = false) {
    clearTimeout(this.saveTimer);
    const write = () => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)); this.storageOk = true; }
      catch (e) { this.storageOk = false; toast('Não foi possível salvar no navegador (armazenamento cheio ou bloqueado). Faça um backup.', 'error', 6000); }
    };
    if (now) write(); else this.saveTimer = setTimeout(write, 120);
  },
  update(fn, opts = {}) {
    fn(this.state);
    this.save(opts.now);
    if (!opts.silent) this.emit();
  },
  on(fn) { this.listeners.push(fn); return () => { this.listeners = this.listeners.filter(f => f !== fn); }; },
  emit() { this.listeners.forEach(fn => { try { fn(this.state); } catch (e) { console.error(e); } }); },
  replace(newState) { this.state = normalize(newState); this.save(true); this.emit(); },
  exportBackup() {
    return JSON.stringify({ app: APP_ID, kind: 'backup', version: DATA_VERSION, exportedAt: new Date().toISOString(), data: this.state }, null, 2);
  },
  /* Lê um backup ou o arquivo de dados iniciais. mode: 'replace' | 'merge' */
  parseImport(text) {
    const obj = JSON.parse(text);
    if (!obj || (obj.app !== APP_ID && !obj.data)) throw new Error('Este arquivo não parece ser um backup da Rotina da Ana.');
    return obj;
  },
  applySeed(seedObj) {
    const seed = seedObj.data || seedObj;
    this.update(s => {
      if (seed.settings && seed.settings.name) s.settings.name = seed.settings.name;
      if (seed.profile) s.profile = Object.assign({}, s.profile, seed.profile);
      const byId = (arr, items) => { const ids = new Set(arr.map(x => x.id)); items.forEach(x => { if (!ids.has(x.id)) arr.push(clone(x)); }); };
      if (seed.events) byId(s.events, seed.events);
      if (seed.habits) byId(s.habits, seed.habits);
      if (seed.tasks) byId(s.tasks, seed.tasks);
      if (seed.routine) byId(s.routine, seed.routine);
      if (seed.workouts) {
        byId(s.workouts.templates, (seed.workouts.templates || []).map(t => Object.assign({ createdAt: D.today() }, t)));
        byId(s.workouts.logs, seed.workouts.logs || []);
      }
      if (seed.nutrition) {
        if (seed.nutrition.meals && seed.nutrition.meals.length) s.nutrition.meals = clone(seed.nutrition.meals);
        if (seed.nutrition.goals) s.nutrition.goals = Object.assign({}, s.nutrition.goals, seed.nutrition.goals);
        if (seed.nutrition.extras) s.nutrition.extras = clone(seed.nutrition.extras);
      }
      s.settings.seedImported = true;
      const n = normalize(s); Object.assign(s, n);
    }, { now: true });
  }
};

/* grava imediatamente ao fechar/ocultar a página, para não perder a última alteração */
window.addEventListener('pagehide', () => { if (Store.state && Store.saveTimer) Store.save(true); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && Store.state && Store.saveTimer) Store.save(true); });

/* ================== Seletores e cálculos ================== */
const Sel = {
  cat(id) { return Store.state.settings.categories.find(c => c.id === id) || Store.state.settings.categories.find(c => c.id === 'outros') || DEFAULT_CATEGORIES[8]; },
  catOptions() { return Store.state.settings.categories.map(c => ({ value: c.id, label: c.name })); },

  /* ----- Eventos ----- */
  eventsOn(k) {
    return Store.state.events.filter(e => e.date === k || (e.endDate && e.date <= k && e.endDate >= k))
      .sort((a, b) => (a.allDay ? -1 : 0) - (b.allDay ? -1 : 0) || (a.start || '').localeCompare(b.start || ''));
  },
  upcomingEvents(limit = 5) {
    const t = D.today(), nowM = D.nowMinutes();
    return Store.state.events
      .filter(e => (e.endDate || e.date) > t || ((e.endDate || e.date) === t && (e.allDay || !e.end || D.toMin(e.end) >= nowM)))
      .sort((a, b) => (a.date + (a.start || '00:00')).localeCompare(b.date + (b.start || '00:00')))
      .slice(0, limit);
  },

  /* ----- Tarefas ----- */
  tasksDueOn(k) { return Store.state.tasks.filter(t => t.date === k); },
  isOverdue(t) { return t.status !== 'done' && t.date && t.date < D.today(); },
  tasksDoneOn(k) { return Store.state.tasks.filter(t => t.status === 'done' && t.completedAt && t.completedAt.slice(0, 10) === k); },
  taskStatsDay(k) {
    const due = this.tasksDueOn(k);
    const done = due.filter(t => t.status === 'done').length;
    return { total: due.length, done, pending: due.length - done };
  },
  taskStatsRange(a, b) {
    const due = Store.state.tasks.filter(t => t.date && t.date >= a && t.date <= b);
    const done = due.filter(t => t.status === 'done').length;
    return { total: due.length, done };
  },

  /* ----- Treinos ----- */
  workoutsOn(k) {
    const dow = D.dow(k);
    const logs = Store.state.workouts.logs.filter(l => l.date === k);
    const planned = Store.state.workouts.templates.filter(t => t.days.includes(dow) && (!t.createdAt || t.createdAt <= k || k >= D.today()))
      .map(t => ({ template: t, log: logs.find(l => l.templateId === t.id) || null }));
    const extra = logs.filter(l => !planned.some(p => p.template.id === l.templateId))
      .map(l => ({ template: Store.state.workouts.templates.find(t => t.id === l.templateId) || { id: null, name: l.name || 'Treino avulso', type: 'outro', exercises: [], time: '' }, log: l, extra: true }));
    return planned.concat(extra).sort((a, b) => (a.template.time || '').localeCompare(b.template.time || ''));
  },
  workoutStatsRange(a, b) {
    let planned = 0, done = 0, minutes = 0;
    D.range(a, b).forEach(k => {
      this.workoutsOn(k).forEach(w => { if (!w.extra) planned++; if (w.log) { done++; minutes += Number(w.log.duration || w.template.duration || 0); } });
    });
    return { planned, done, minutes };
  },

  /* ----- Alimentação ----- */
  mealLog(k, mealId) {
    const l = Store.state.nutrition.logs[k];
    return l && l.meals && l.meals[mealId] ? l.meals[mealId] : null;
  },
  mealOption(meal, k) {
    const log = this.mealLog(k, meal.id);
    return (log && meal.options.find(o => o.id === log.optionId)) || meal.options[0];
  },
  itemFactor(k, meal, opt, item) {
    const log = this.mealLog(k, meal.id);
    if (!log || log.optionId !== opt.id) return 0;
    if (log.items && log.items[item.id] !== undefined) return Number(log.items[item.id]) || 0;
    return log.done ? 1 : 0;
  },
  sumItems(items, factorFn) {
    const tot = { kcal: 0, protein: 0, carbs: 0, fat: 0, missing: 0, known: 0 };
    items.forEach(it => {
      const f = factorFn(it);
      if (!f) return;
      if (it.kcal === null && it.protein === null && it.carbs === null && it.fat === null) { tot.missing++; return; }
      tot.known++;
      ['kcal', 'protein', 'carbs', 'fat'].forEach(m => { if (it[m] !== null) tot[m] += Number(it[m]) * f; });
    });
    ['kcal', 'protein', 'carbs', 'fat'].forEach(m => tot[m] = round1(tot[m]));
    return tot;
  },
  nutritionDay(k) {
    const meals = Store.state.nutrition.meals;
    const consumed = { kcal: 0, protein: 0, carbs: 0, fat: 0, missing: 0, known: 0 };
    const planned = { kcal: 0, protein: 0, carbs: 0, fat: 0, missing: 0, known: 0 };
    let mealsDone = 0;
    const perMeal = [];
    meals.forEach(m => {
      const opt = this.mealOption(m, k);
      const log = this.mealLog(k, m.id);
      const c = this.sumItems(opt.items, it => this.itemFactor(k, m, opt, it));
      const p = this.sumItems(opt.items, () => 1);
      const anyEaten = opt.items.some(it => this.itemFactor(k, m, opt, it) > 0);
      if (log && (log.done || anyEaten)) mealsDone++;
      ['kcal', 'protein', 'carbs', 'fat', 'missing', 'known'].forEach(x => { consumed[x] += c[x]; planned[x] += p[x]; });
      perMeal.push({ meal: m, option: opt, consumed: c, planned: p, done: !!(log && (log.done || anyEaten)) });
    });
    ['kcal', 'protein', 'carbs', 'fat'].forEach(x => { consumed[x] = round1(consumed[x]); planned[x] = round1(planned[x]); });
    const water = (Store.state.nutrition.logs[k] && Store.state.nutrition.logs[k].waterMl) || 0;
    return { consumed, planned, mealsDone, mealsTotal: meals.length, perMeal, water };
  },
  missingNutritionCount() {
    let n = 0, total = 0;
    Store.state.nutrition.meals.forEach(m => m.options.forEach(o => o.items.forEach(it => { total++; if (it.kcal === null) n++; })));
    return { missing: n, total };
  },

  /* ----- Hábitos ----- */
  habitDone(k, h) {
    if (h.auto === 'water') {
      const goal = Store.state.nutrition.goals.waterMl || 2000;
      const w = (Store.state.nutrition.logs[k] && Store.state.nutrition.logs[k].waterMl) || 0;
      return w >= goal;
    }
    return (Store.state.habitLog[k] || []).includes(h.id);
  },
  habitsDay(k) {
    const hs = Store.state.habits;
    const done = hs.filter(h => this.habitDone(k, h)).length;
    return { total: hs.length, done };
  },

  /* ----- Pontuação geral do dia (0–100) — média das áreas que têm algo planejado ----- */
  dayScore(k) {
    const parts = [];
    const t = this.taskStatsDay(k); if (t.total) parts.push(t.done / t.total);
    const n = this.nutritionDay(k); if (n.mealsTotal) parts.push(n.mealsDone / n.mealsTotal);
    const w = this.workoutsOn(k).filter(x => !x.extra); if (w.length) parts.push(w.filter(x => x.log).length / w.length);
    const h = this.habitsDay(k); if (h.total) parts.push(h.done / h.total);
    if (!parts.length) return null;
    return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length * 100);
  },

  /* ----- Linha do tempo do dia ----- */
  timeline(k) {
    const items = [];
    const dow = D.dow(k);
    this.eventsOn(k).forEach(e => items.push({ kind: 'event', id: e.id, time: e.allDay ? '' : (e.start || ''), end: e.end || '', title: e.title, sub: Sel.cat(e.category).name, color: Sel.cat(e.category).color, done: !!e.done }));
    this.tasksDueOn(k).forEach(t => items.push({ kind: 'task', id: t.id, time: t.time || '', title: t.title, sub: 'Tarefa · ' + (PRIORITIES.find(p => p.value === t.priority) || PRIORITIES[1]).label, color: Sel.cat(t.category).color, done: t.status === 'done' }));
    this.workoutsOn(k).forEach(w => items.push({ kind: 'workout', id: w.template.id, logId: w.log && w.log.id, time: w.template.time || '', title: w.template.name, sub: 'Treino', color: Sel.cat('treino').color, done: !!w.log }));
    const nd = this.nutritionDay(k);
    nd.perMeal.forEach(pm => items.push({ kind: 'meal', id: pm.meal.id, time: pm.meal.time || '', title: pm.meal.name, sub: 'Refeição · ' + pm.option.label, color: Sel.cat('alimentacao').color, done: pm.done }));
    Store.state.routine.filter(r => !r.days || !r.days.length || r.days.includes(dow)).forEach(r => {
      const doneList = (Store.state.habitLog[k + ':routine'] || []);
      items.push({ kind: 'routine', id: r.id, time: r.time || '', title: r.title, sub: 'Rotina', color: '#C8B6E2', done: doneList.includes(r.id) });
    });
    return items.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
  }
};

/* Preenche campos nutricionais vazios usando a tabela de referência */
function fillFromReference(item) {
  const r = item.ref && NUTRI_REF[item.ref];
  if (!r || !item.grams) return false;
  const f = Number(item.grams) / 100;
  item.kcal = round1(r.kcal * f); item.protein = round1(r.p * f); item.carbs = round1(r.c * f); item.fat = round1(r.f * f);
  item.source = 'referencia';
  return true;
}
