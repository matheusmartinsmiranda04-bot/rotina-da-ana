/* Rotina da Ana — Relatórios com filtros de período e exportação CSV/JSON */
'use strict';

Views.relatorios = {
  period: '7', from: null, to: null,
  range() {
    const t = D.today();
    if (this.period === '7') return [D.add(t, -6), t];
    if (this.period === '30') return [D.add(t, -29), t];
    if (this.period === 'mes') return [D.startOfMonth(t), t];
    const a = this.from || D.add(t, -6), b = this.to || t;
    return a <= b ? [a, b] : [b, a];
  },
  render(root) {
    const [a, b] = this.range();
    const days = D.range(a, b);
    const st = Store.state, today = D.today();
    const step = Math.ceil(days.length / 10);
    const lbl = (d, i) => days.length <= 7 ? D.wdShort[D.dow(d)] : (i % step === 0 ? D.short(d) : '');

    const tasksDone = st.tasks.filter(t => t.status === 'done' && t.completedAt && t.completedAt.slice(0, 10) >= a && t.completedAt.slice(0, 10) <= b);
    const tr = Sel.taskStatsRange(a, b);
    const evs = st.events.filter(e => e.date >= a && e.date <= b);
    const evPast = evs.filter(e => e.date <= today);
    const wk = Sel.workoutStatsRange(a, b);
    const nutr = days.map(d => ({ d, n: Sel.nutritionDay(d) }));
    const mealsTotal = nutr.reduce((s, x) => s + x.n.mealsTotal, 0), mealsDone = nutr.reduce((s, x) => s + x.n.mealsDone, 0);
    const kcalDays = nutr.filter(x => x.n.consumed.known);
    const avgKcal = kcalDays.length ? kcalDays.reduce((s, x) => s + x.n.consumed.kcal, 0) / kcalDays.length : null;
    const habits = st.habits;
    const habTotal = habits.length * days.length, habDone = days.reduce((s, d) => s + Sel.habitsDay(d).done, 0);
    const scores = days.map(d => Sel.dayScore(d));
    const validScores = scores.filter(x => x !== null);
    const avgScore = validScores.length ? Math.round(validScores.reduce((x, y) => x + y, 0) / validScores.length) : null;
    // por semana
    const weeks = []; for (let s = D.startOfWeek(a); s <= b; s = D.add(s, 7)) { const e = D.add(s, 6); const r = Sel.workoutStatsRange(s < a ? a : s, e > b ? b : e); weeks.push({ label: D.short(s < a ? a : s), a: r.planned, b: r.done }); }
    const catSegs = st.settings.categories.map(c => ({ label: c.name, value: evs.filter(e => e.category === c.id).length, color: c.color })).filter(x => x.value);

    root.innerHTML = `
      <div class="page-head">
        <div><p class="eyebrow">${icon('chart')} Acompanhamento</p><h2>Relatórios</h2></div>
        <div class="row-gap"><button class="btn ghost" id="rp-csv">${icon('download')}Exportar CSV</button><button class="btn soft" id="rp-json">${icon('download')}Exportar JSON</button></div>
      </div>
      <div class="card period-bar">
        <div class="seg">${[['7', 'Últimos 7 dias'], ['30', 'Últimos 30 dias'], ['mes', 'Mês atual'], ['custom', 'Personalizado']].map(([v, l]) => `<button class="${this.period === v ? 'on' : ''}" data-p="${v}">${l}</button>`).join('')}</div>
        ${this.period === 'custom' ? `<div class="row-gap"><label class="field inline"><span>De</span><input type="date" id="rp-from" value="${a}"></label><label class="field inline"><span>Até</span><input type="date" id="rp-to" value="${b}"></label></div>` : `<span class="muted">${D.br(a)} a ${D.br(b)} · ${days.length} dias</span>`}
      </div>

      <section class="stats">
        ${this.kpi('target', 'Regularidade média', avgScore === null ? '—' : avgScore + '%', 'pontuação diária da rotina', 'rose')}
        ${this.kpi('tasks', 'Tarefas concluídas', tasksDone.length, tr.total ? `${pct(tr.done, tr.total)}% das ${tr.total} com prazo no período` : 'sem tarefas com prazo no período', 'peach')}
        ${this.kpi('events', 'Compromissos', `${evPast.filter(e => e.done).length}<small>/${evPast.length}</small>`, 'realizados até hoje · ' + evs.length + ' no período', 'lav')}
        ${this.kpi('workout', 'Treinos', `${wk.done}<small>/${wk.planned}</small>`, wk.minutes ? fmtNum(wk.minutes) + ' min de atividade' : 'concluídos / planejados', 'sage')}
        ${this.kpi('food', 'Refeições', mealsTotal ? pct(mealsDone, mealsTotal) + '%' : '—', mealsDone + ' realizadas' + (avgKcal !== null ? ' · média ' + fmtNum(avgKcal) + ' kcal' : ''), 'butter')}
        ${this.kpi('heart', 'Hábitos', habTotal ? pct(habDone, habTotal) + '%' : '—', habTotal ? habDone + ' de ' + habTotal + ' marcações' : 'nenhum hábito cadastrado', 'sky')}
      </section>

      <section class="grid-2">
        <div class="card"><div class="card-head"><h3>Produtividade diária</h3><span class="muted sm">tarefas concluídas</span></div>
          ${tasksDone.length ? Charts.bars(days.map((d, i) => ({ label: lbl(d, i), value: Sel.tasksDoneOn(d).length, title: D.br(d) + ': ' + Sel.tasksDoneOn(d).length })), { color: 'var(--rose)', height: 150, showValues: days.length <= 14 }) : '<p class="muted-p">Nenhuma tarefa concluída no período.</p>'}</div>
        <div class="card"><div class="card-head"><h3>Regularidade da rotina</h3><span class="muted sm">% por dia</span></div>
          ${validScores.length ? Charts.line(days.map((d, i) => ({ label: lbl(d, i), value: scores[i] })), { color: 'var(--lav-d)', height: 150, unit: '%' }) : '<p class="muted-p">Sem dados no período.</p>'}</div>
        <div class="card"><div class="card-head"><h3>Frequência de treinos</h3><span class="muted sm">por semana</span></div>
          ${wk.planned || wk.done ? Charts.groupedBars(weeks, { colorB: 'var(--sage-d)', height: 130 }) : '<p class="muted-p">Sem treinos planejados ou concluídos no período.</p>'}</div>
        <div class="card"><div class="card-head"><h3>Histórico de alimentação</h3><span class="muted sm">refeições realizadas por dia</span></div>
          ${mealsDone ? Charts.bars(nutr.map((x, i) => ({ label: lbl(x.d, i), value: x.n.mealsDone, title: D.br(x.d) + ': ' + x.n.mealsDone + '/' + x.n.mealsTotal + (x.n.consumed.known ? ' · ' + fmtNum(x.n.consumed.kcal) + ' kcal' : '') })), { color: 'var(--butter-d)', height: 150, max: Math.max(1, ...nutr.map(x => x.n.mealsTotal)), showValues: days.length <= 14 }) : '<p class="muted-p">Nenhuma refeição registrada no período.</p>'}</div>
        <div class="card"><div class="card-head"><h3>Compromissos por categoria</h3></div>
          ${catSegs.length ? `<div class="donut-wrap">${Charts.donut(catSegs, { center: evs.length, centerSub: 'no período', size: 150, stroke: 20 })}${Charts.legend(catSegs)}</div>` : '<p class="muted-p">Nenhum compromisso no período.</p>'}</div>
        <div class="card"><div class="card-head"><h3>Regularidade dos hábitos</h3></div>
          ${habits.length ? (days.length <= 31 ? Charts.dotGrid(habits.map(h => ({ label: h.name, cells: days.map(d => d > today ? null : Sel.habitDone(d, h)) })), days.map((d, i) => days.length <= 7 ? D.wdShort[D.dow(d)].slice(0, 1).toUpperCase() : (i % 5 === 0 ? String(D.parse(d).getDate()) : ''))) : Charts.hbars(habits.map(h => { const c = days.filter(d => Sel.habitDone(d, h)).length; return { label: h.name, value: c, max: days.length, color: 'var(--sky-d)', right: c + '/' + days.length }; }))) : '<p class="muted-p">Cadastre hábitos em Configurações.</p>'}</div>
      </section>`;

    $$('[data-p]', root).forEach(btn => btn.addEventListener('click', () => { this.period = btn.dataset.p; if (this.period === 'custom' && !this.from) { this.from = a; this.to = b; } this.render(root); }));
    const f = $('#rp-from', root), t = $('#rp-to', root);
    f && f.addEventListener('change', () => { this.from = f.value; this.render(root); });
    t && t.addEventListener('change', () => { this.to = t.value; this.render(root); });
    $('#rp-csv', root).addEventListener('click', () => this.exportCsv(a, b));
    $('#rp-json', root).addEventListener('click', () => this.exportJson(a, b));
  },
  kpi(ic, label, value, sub, tone) {
    return `<div class="stat tone-${tone}"><span class="stat-ic">${icon(ic)}</span><div><span class="stat-lbl">${label}</span><b class="stat-val">${value}</b><span class="stat-sub">${sub}</span></div></div>`;
  },
  exportCsv(a, b) {
    Modal.open({
      title: 'Exportar CSV', size: 'sm',
      body: `<p class="muted-p">Período: ${D.br(a)} a ${D.br(b)}. O arquivo abre no Excel ou Google Planilhas.</p>
        <div class="radio-list">${[['tarefas', 'Tarefas'], ['compromissos', 'Compromissos'], ['treinos', 'Treinos realizados'], ['alimentacao', 'Resumo diário de alimentação'], ['refeicoes', 'Refeições e alimentos consumidos'], ['habitos', 'Hábitos']].map(([v, l], i) => `<label><input type="radio" name="ds" value="${v}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`,
      footer: '<span class="sp"></span><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="csv-go">Baixar CSV</button>',
      onMount: (root, api) => $('#csv-go', root).addEventListener('click', () => {
        const ds = $('input[name=ds]:checked', root).value;
        const rows = this.dataset(ds, a, b);
        const csv = '﻿' + rows.map(r => r.map(v => { const s = v === null || v === undefined ? '' : String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\r\n');
        downloadFile(`rotina-da-ana_${ds}_${a}_a_${b}.csv`, csv, 'text/csv;charset=utf-8');
        api.close(); toast('CSV exportado.');
      })
    });
  },
  dataset(ds, a, b) {
    const st = Store.state, n = v => v === null || v === undefined ? '' : String(v).replace('.', ',');
    const inR = d => d && d >= a && d <= b;
    if (ds === 'tarefas') return [['Título', 'Prazo', 'Horário', 'Prioridade', 'Categoria', 'Status', 'Concluída em', 'Observações']].concat(
      st.tasks.filter(t => inR(t.date) || inR(t.completedAt && t.completedAt.slice(0, 10)) || (!t.date && inR(t.createdAt && t.createdAt.slice(0, 10)))).map(t => [t.title, t.date && D.br(t.date), t.time, (PRIORITIES.find(p => p.value === t.priority) || {}).label, Sel.cat(t.category).name, (TASK_STATUS.find(s => s.value === t.status) || {}).label, t.completedAt ? new Date(t.completedAt).toLocaleString('pt-BR') : '', t.notes]));
    if (ds === 'compromissos') return [['Título', 'Data', 'Até', 'Dia inteiro', 'Início', 'Término', 'Categoria', 'Realizado', 'Descrição']].concat(
      st.events.filter(e => inR(e.date)).sort((x, y) => x.date.localeCompare(y.date)).map(e => [e.title, D.br(e.date), e.endDate ? D.br(e.endDate) : '', e.allDay ? 'sim' : 'não', e.start, e.end, Sel.cat(e.category).name, e.done ? 'sim' : 'não', e.description]));
    if (ds === 'treinos') return [['Data', 'Treino', 'Duração (min)', 'Avaliação', 'Observações']].concat(
      st.workouts.logs.filter(l => inR(l.date)).sort((x, y) => x.date.localeCompare(y.date)).map(l => { const t = st.workouts.templates.find(x => x.id === l.templateId); return [D.br(l.date), t ? t.name : l.name, l.duration, l.feeling || '', l.notes]; }));
    if (ds === 'alimentacao') return [['Data', 'Refeições realizadas', 'Total de refeições', 'Calorias (kcal)', 'Proteínas (g)', 'Carboidratos (g)', 'Gorduras (g)', 'Itens sem dados', 'Água (ml)']].concat(
      D.range(a, b).map(d => { const x = Sel.nutritionDay(d); return [D.br(d), x.mealsDone, x.mealsTotal, n(x.consumed.kcal), n(x.consumed.protein), n(x.consumed.carbs), n(x.consumed.fat), x.consumed.missing, x.water]; }));
    if (ds === 'refeicoes') {
      const rows = [['Data', 'Refeição', 'Opção', 'Alimento', 'Quantidade consumida', 'Calorias', 'Proteínas (g)', 'Carboidratos (g)', 'Gorduras (g)']];
      D.range(a, b).forEach(d => Sel.nutritionDay(d).perMeal.forEach(pm => pm.option.items.forEach(it => {
        const f = Sel.itemFactor(d, pm.meal, pm.option, it); if (!f) return;
        const v = x => it[x] === null ? 'não informado' : n(round1(it[x] * f));
        rows.push([D.br(d), pm.meal.name, pm.option.label, it.name, fmtQty(it, f), v('kcal'), v('protein'), v('carbs'), v('fat')]);
      })));
      return rows;
    }
    return [['Data'].concat(st.habits.map(h => h.name))].concat(D.range(a, b).map(d => [D.br(d)].concat(st.habits.map(h => Sel.habitDone(d, h) ? 'sim' : 'não'))));
  },
  exportJson(a, b) {
    const st = Store.state;
    const data = {
      app: APP_ID, kind: 'relatorio', periodo: { de: a, ate: b }, geradoEm: new Date().toISOString(),
      tarefas: this.dataset('tarefas', a, b), compromissos: this.dataset('compromissos', a, b), treinos: this.dataset('treinos', a, b),
      alimentacao: D.range(a, b).map(d => { const x = Sel.nutritionDay(d); return { data: d, refeicoesRealizadas: x.mealsDone, totalRefeicoes: x.mealsTotal, consumido: x.consumed, aguaMl: x.water }; }),
      habitos: D.range(a, b).map(d => ({ data: d, feitos: st.habits.filter(h => Sel.habitDone(d, h)).map(h => h.name) })),
      pontuacaoDiaria: D.range(a, b).map(d => ({ data: d, pontuacao: Sel.dayScore(d) }))
    };
    downloadFile(`rotina-da-ana_relatorio_${a}_a_${b}.json`, JSON.stringify(data, null, 2));
    toast('Relatório JSON exportado. Para backup completo, use Configurações.');
  }
};
