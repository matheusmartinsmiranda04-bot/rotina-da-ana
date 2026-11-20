/* Rotina da Ana — Treinos: semana, biblioteca, histórico e evolução */
'use strict';

Views.treinos = {
  tab: 'semana', weekCursor: null,
  render(root) {
    if (!this.weekCursor) this.weekCursor = D.startOfWeek(D.today());
    const st = Store.state, k = D.today();
    const tpls = st.workouts.templates;
    const ws = this.weekCursor, we = D.add(ws, 6);
    const week = Sel.workoutStatsRange(ws, we);
    const ms = D.startOfMonth(k), me = D.endOfMonth(k);
    const month = Sel.workoutStatsRange(ms, me < k ? me : k);
    const monthLogs = st.workouts.logs.filter(l => l.date >= ms && l.date <= me);
    const unscheduled = tpls.filter(t => !t.days.length);
    const prof = st.profile || {};

    root.innerHTML = `
      <div class="page-head">
        <div><p class="eyebrow">${icon('workout')} Atividades físicas</p><h2>Treinos</h2></div>
        <div class="row-gap"><button class="btn ghost" id="wk-extra">${icon('plus')}Registrar avulso</button><button class="btn primary" id="wk-new">${icon('plus')}Novo treino</button></div>
      </div>

      <section class="fit-hero card">
        <div class="fit-hero-art">${workoutArt('musculacao', '#fff', 64)}</div>
        <div class="fit-hero-text">
          <h3>${week.done ? 'Você já treinou ' + week.done + 'x nesta semana!' : 'Bora movimentar o corpo?'}</h3>
          <p>${prof.goal ? 'Objetivo: ' + esc(prof.goal) + '.' : 'Cada treino conta. Marque como concluído para acompanhar sua evolução.'}${prof.trainingPerWeek ? ' · ' + esc(prof.trainingPerWeek) : ''}</p>
        </div>
        <div class="fit-hero-rings">
          ${Charts.ring(week.done, Math.max(week.planned, 1), { size: 92, stroke: 9, color: '#fff', track: 'rgba(255,255,255,.3)', label: `${week.done}/${week.planned}`, sub: 'semana' })}
          ${Charts.ring(month.done, Math.max(month.planned, 1), { size: 92, stroke: 9, color: '#fff', track: 'rgba(255,255,255,.3)', label: String(monthLogs.length), sub: 'no mês' })}
        </div>
      </section>

      ${unscheduled.length && tpls.length ? `<div class="card onboard">
        <div class="card-head"><h3>${icon('calendar')}Em quais dias você faz cada treino?</h3></div>
        <p class="muted-p">Seu plano indica ${esc(prof.trainingPerWeek || 'os treinos')}, mas não define os dias da semana. Toque nos dias de cada treino — eles aparecem automaticamente no calendário e no painel.</p>
        <div class="assign-grid">${unscheduled.map(t => `<div class="assign-row"><span class="assign-name" style="--c:${workoutColor(t)}"><i></i>${esc(t.name)}</span>
          <div class="daychips sm">${D.wdShort.map((d, i) => `<label><input type="checkbox" data-assign="${esc(t.id)}" data-day="${i}"><span>${d}</span></label>`).join('')}</div></div>`).join('')}</div>
        <div class="row-gap end"><button class="btn primary sm" id="assign-save">${icon('check')}Salvar dias</button></div>
      </div>` : ''}

      <div class="tabs">${[['semana', 'Minha semana'], ['treinos', 'Meus treinos'], ['historico', 'Histórico e evolução']].map(([v, l]) => `<button class="${this.tab === v ? 'on' : ''}" data-tab="${v}">${l}</button>`).join('')}</div>
      <div id="wk-body"></div>`;

    const body = $('#wk-body', root);
    if (this.tab === 'semana') body.innerHTML = this.weekView(ws);
    else if (this.tab === 'treinos') body.innerHTML = this.libraryView();
    else body.innerHTML = this.historyView();

    $('#wk-new', root).addEventListener('click', () => openTemplateEditor(null));
    $('#wk-extra', root).addEventListener('click', () => openWorkoutLog(null, D.today()));
    $$('[data-tab]', root).forEach(b => b.addEventListener('click', () => { this.tab = b.dataset.tab; this.render(root); }));
    const as = $('#assign-save', root);
    as && as.addEventListener('click', () => {
      const map = {};
      $$('[data-assign]', root).forEach(c => { if (c.checked) (map[c.dataset.assign] = map[c.dataset.assign] || []).push(Number(c.dataset.day)); });
      if (!Object.keys(map).length) { toast('Marque pelo menos um dia.', 'error'); return; }
      Store.update(s => { Object.entries(map).forEach(([id, days]) => { const t = s.workouts.templates.find(x => x.id === id); if (t) t.days = days.sort(); }); });
      toast('Dias salvos! Seus treinos já estão no calendário.');
    });
    root.onclick = e => {
      const nav = e.target.closest('[data-wnav]');
      if (nav) { this.weekCursor = nav.dataset.wnav === '0' ? D.startOfWeek(D.today()) : D.add(this.weekCursor, 7 * Number(nav.dataset.wnav)); this.render(root); return; }
      const card = e.target.closest('[data-wk]');
      if (card) {
        const { wk, date } = card.dataset;
        if (e.target.closest('[data-finish]')) { openWorkoutLog(wk, date); return; }
        if (e.target.closest('[data-edit]')) { openTemplateEditor(Store.state.workouts.templates.find(t => t.id === wk)); return; }
        openWorkoutDetail(wk, date || D.today());
        return;
      }
      const lg = e.target.closest('[data-log]');
      if (lg) {
        const l = Store.state.workouts.logs.find(x => x.id === lg.dataset.log);
        if (l) openWorkoutLog(l.templateId, l.date, l);
      }
    };
  },

  weekView(ws) {
    const today = D.today();
    const days = D.range(ws, D.add(ws, 6));
    const tpls = Store.state.workouts.templates;
    if (!tpls.length) return `<div class="card">${emptyState(emptyArt('workout'), 'Nenhum treino cadastrado', 'Cadastre seus treinos com exercícios, séries e repetições.', `<button class="btn primary" onclick="openTemplateEditor(null)">${icon('plus')}Cadastrar treino</button>`)}</div>`;
    return `<div class="card">
      <div class="cal-toolbar sm"><div class="row-gap"><button class="icon-btn" data-wnav="-1" aria-label="Semana anterior">${icon('left')}</button>
        <h3 class="cal-title">${D.short(ws)} – ${D.short(D.add(ws, 6))}</h3><button class="icon-btn" data-wnav="1" aria-label="Próxima semana">${icon('right')}</button>
        <button class="btn ghost sm" data-wnav="0">Esta semana</button></div></div>
      <div class="wk-board">${days.map(k => { const ws2 = Sel.workoutsOn(k); return `
        <div class="wk-day ${k === today ? 'today' : ''} ${k < today ? 'past' : ''}">
          <div class="wk-day-head"><span>${D.wdShort[D.dow(k)]}</span><b>${D.parse(k).getDate()}</b></div>
          ${ws2.length ? ws2.map(w => { const t = w.template, col = workoutColor(t); return `
            <div class="wk-card ${w.log ? 'is-done' : ''}" data-wk="${esc(t.id || '')}" data-date="${k}" style="--c:${col}" role="button" tabindex="0">
              ${workoutArt(t.type, col, 36)}
              <b>${esc(t.name)}</b>
              <span>${t.time ? esc(t.time) : ''}${t.duration ? ' · ' + t.duration + ' min' : ''}</span>
              <span class="wk-ex">${t.exercises.length} exercício${t.exercises.length === 1 ? '' : 's'}</span>
              ${w.log ? `<span class="wk-status">${icon('check')}Concluído</span>` : (t.id ? `<button class="btn soft xs" data-finish>${icon('check')}Concluir</button>` : '')}
            </div>`; }).join('') : `<div class="wk-rest">${icon('leaf')}<span>Descanso</span></div>`}
        </div>`; }).join('')}</div>
    </div>`;
  },

  libraryView() {
    const tpls = Store.state.workouts.templates;
    if (!tpls.length) return `<div class="card">${emptyState(emptyArt('workout'), 'Nenhum treino cadastrado', 'Crie seu primeiro treino.', `<button class="btn primary" onclick="openTemplateEditor(null)">${icon('plus')}Novo treino</button>`)}</div>`;
    return `<div class="lib-grid">${tpls.map(t => { const col = workoutColor(t); const type = (WORKOUT_TYPES.find(x => x.value === t.type) || WORKOUT_TYPES[6]).label; return `
      <article class="card lib-card" style="--c:${col}" data-wk="${esc(t.id)}">
        <div class="lib-top">${workoutArt(t.type, col, 48)}<div><p class="eyebrow">${esc(type)}</p><h3>${esc(t.name)}</h3></div>
          <button class="icon-btn sm" data-edit aria-label="Editar">${icon('edit')}</button></div>
        <p class="muted-p">${esc(t.description || '')}</p>
        <div class="lib-meta"><span>${icon('calendar')}${t.days.length ? t.days.map(d => D.wdShort[d]).join(', ') : 'Sem dia definido'}</span><span>${icon('clock')}${t.time || '—'}${t.duration ? ' · ' + t.duration + ' min' : ''}</span></div>
        <ol class="lib-ex">${t.exercises.slice(0, 4).map(x => `<li><span>${esc(x.name)}</span><em>${esc([x.sets && x.sets + 'x', x.reps].filter(Boolean).join(' '))}</em></li>`).join('')}${t.exercises.length > 4 ? `<li class="muted">+ ${t.exercises.length - 4} exercício(s)</li>` : ''}</ol>
        <div class="row-gap"><button class="btn soft sm">${icon('list')}Ver treino</button><button class="btn primary sm" data-finish data-date="${D.today()}">${icon('check')}Concluir hoje</button></div>
      </article>`; }).join('')}</div>`;
  },

  historyView() {
    const st = Store.state, k = D.today();
    const logs = st.workouts.logs.slice().sort((a, b) => b.date.localeCompare(a.date));
    // últimas 8 semanas
    const weeks = []; let s = D.add(D.startOfWeek(k), -7 * 7);
    for (let i = 0; i < 8; i++) { const e = D.add(s, 6); const r = Sel.workoutStatsRange(s, e < k ? e : k); weeks.push({ label: D.short(s), a: r.planned, b: r.done, min: r.minutes }); s = D.add(s, 7); }
    // frequência mensal (dias do mês atual)
    const ms = D.startOfMonth(k), me = D.endOfMonth(k);
    const monthDays = D.range(ms, me);
    const totalMin = logs.reduce((a, l) => a + Number(l.duration || 0), 0);
    const monthMin = logs.filter(l => l.date >= ms && l.date <= me).reduce((a, l) => a + Number(l.duration || 0), 0);
    return `<div class="grid-2">
      <div class="card"><div class="card-head"><h3>${icon('chart')}Treinos por semana</h3></div>${weeks.some(w => w.b) ? Charts.bars(weeks.map(w => ({ label: w.label, value: w.b })), { color: 'var(--sage-d)', height: 150 }) : '<p class="muted-p">Conclua treinos para ver a quantidade por semana.</p>'}</div>
      <div class="card"><div class="card-head"><h3>${icon('target')}Concluídos x planejados</h3></div>${weeks.some(w => w.a || w.b) ? Charts.groupedBars(weeks.map(w => ({ label: w.label, a: w.a, b: w.b })), { colorB: 'var(--rose-d)', height: 130 }) : '<p class="muted-p">Defina os dias dos treinos para comparar o planejado com o realizado.</p>'}</div>
      <div class="card"><div class="card-head"><h3>${icon('calendar')}Frequência em ${D.months[D.parse(k).getMonth()]}</h3></div>
        <div class="freq-month">${D.wdShort.map(d => `<em>${d.slice(0, 1)}</em>`).join('')}${'<i class="blank"></i>'.repeat(D.dow(ms))}${monthDays.map(d => { const w = Sel.workoutsOn(d); const done = w.some(x => x.log); const planned = w.some(x => !x.extra); return `<i class="${done ? 'on' : planned && d < k ? 'miss' : planned ? 'plan' : ''} ${d === k ? 'today' : ''}" title="${D.br(d)}${done ? ' · treinou' : planned ? ' · planejado' : ''}">${D.parse(d).getDate()}</i>`; }).join('')}</div>
        <ul class="legend inline"><li><i style="background:var(--sage-d)"></i><span>Treinou</span></li><li><i style="background:var(--track-strong)"></i><span>Planejado</span></li><li><i style="background:var(--rose)"></i><span>Não realizado</span></li></ul></div>
      <div class="card"><div class="card-head"><h3>${icon('clock')}Tempo total de atividade</h3></div>
        <div class="big-nums"><div><b>${fmtNum(monthMin)}</b><span>min neste mês</span></div><div><b>${fmtNum(totalMin / 60, 1)}</b><span>horas no total</span></div><div><b>${logs.length}</b><span>treinos registrados</span></div></div>
        ${weeks.some(w => w.min) ? Charts.bars(weeks.map(w => ({ label: w.label, value: w.min })), { color: 'var(--lav-d)', height: 100, unit: ' min' }) : '<p class="muted-p sm">Informe a duração ao concluir um treino para somar o tempo.</p>'}</div>
    </div>
    <div class="card"><div class="card-head"><h3>${icon('history')}Histórico</h3></div>
      ${logs.length ? `<ul class="log-list">${logs.slice(0, 60).map(l => { const t = st.workouts.templates.find(x => x.id === l.templateId); return `<li data-log="${esc(l.id)}" role="button" tabindex="0">
        ${workoutArt(t ? t.type : 'outro', t ? workoutColor(t) : 'var(--ink-3)', 34)}
        <div><b>${esc(t ? t.name : (l.name || 'Treino avulso'))}</b><span>${D.long(l.date)}${l.duration ? ' · ' + esc(l.duration) + ' min' : ''}${l.feeling ? ' · ' + '★'.repeat(l.feeling) : ''}</span>${l.notes ? `<p>${esc(l.notes)}</p>` : ''}</div>${icon('edit')}</li>`; }).join('')}</ul>`
        : emptyState(emptyArt('workout'), 'Nenhum treino registrado', 'Quando concluir um treino, ele aparece aqui com suas observações.')}
    </div>`;
  }
};
