/* Rotina da Ana — Início / painel principal */
'use strict';

Views.inicio = {
  render(root) {
    const k = D.today(), st = Store.state;
    const tday = Sel.taskStatsDay(k);
    const overdue = st.tasks.filter(t => Sel.isOverdue(t)).length;
    const pendingAll = st.tasks.filter(t => t.status !== 'done').length;
    const upcoming = Sel.upcomingEvents(5);
    const next7 = st.events.filter(e => e.date >= k && e.date <= D.add(k, 7)).length;
    const wkToday = Sel.workoutsOn(k);
    const wkStart = D.startOfWeek(k);
    const wkWeek = Sel.workoutStatsRange(wkStart, D.add(wkStart, 6));
    const nut = Sel.nutritionDay(k);
    const score = Sel.dayScore(k);
    const period = periodOfDay();
    const timeline = Sel.timeline(k);
    const nowM = D.nowMinutes();
    const habits = st.habits;

    // série semanal (últimos 7 dias)
    const days = D.range(D.add(k, -6), k);
    const taskSeries = days.map(d => ({ label: D.wdShort[D.dow(d)], value: Sel.tasksDoneOn(d).length }));
    const wkSeries = days.map(d => { const w = Sel.workoutsOn(d); return { label: D.wdShort[D.dow(d)], a: w.filter(x => !x.extra).length, b: w.filter(x => x.log).length }; });
    const scoreSeries = days.map(d => ({ label: D.wdShort[D.dow(d)], value: Sel.dayScore(d) }));
    const habitRows = habits.map(h => ({ label: h.name, cells: days.map(d => Sel.habitDone(d, h)) }));

    const summaryBits = [];
    summaryBits.push(tday.pending ? `<b>${tday.pending}</b> tarefa${tday.pending > 1 ? 's' : ''} para hoje` : 'nenhuma tarefa pendente para hoje');
    const evToday = Sel.eventsOn(k).length;
    if (evToday) summaryBits.push(`<b>${evToday}</b> compromisso${evToday > 1 ? 's' : ''}`);
    if (wkToday.length) summaryBits.push(`treino: <b>${esc(wkToday.map(w => w.template.name).join(', '))}</b>`);

    root.innerHTML = `
      ${App.deferredInstall && !st.settings.installDismissed ? `<div class="install-banner">${icon('install')}<div><b>Instale a Rotina da Ana</b><span>Abra como um aplicativo, direto da área de trabalho, mesmo sem internet.</span></div><button class="btn primary sm" id="ib-go">Instalar</button><button class="icon-btn sm" id="ib-x" aria-label="Dispensar">${icon('x')}</button></div>` : ''}
      <section class="hero card">
        <div class="hero-text">
          <p class="eyebrow">${icon('sparkles')} Frase do dia</p>
          <h2 class="quote">“${esc(quoteOfDay())}”</h2>
          <p class="hero-sum">Para hoje: ${summaryBits.join(' · ')}.</p>
          <div class="hero-actions">
            <button class="btn primary" id="q-task">${icon('plus')}Tarefa</button>
            <button class="btn soft" id="q-ev">${icon('calendar')}Compromisso</button>
            <a class="btn ghost" href="#/alimentacao">${icon('food')}Refeições</a>
          </div>
        </div>
        <div class="hero-visual">${heroArt(period)}
          <div class="hero-ring">${Charts.ring(score || 0, 100, { size: 108, stroke: 10, color: 'var(--rose-d)', label: score === null ? '—' : score + '%', sub: 'do dia' })}</div>
        </div>
      </section>

      <section class="stats">
        ${this.stat('tasks', 'Concluídas hoje', `${tday.done}<small>/${tday.total}</small>`, tday.total ? pct(tday.done, tday.total) + '% das tarefas de hoje' : 'Sem tarefas com prazo hoje', 'rose', '#/tarefas')}
        ${this.stat('clock', 'Pendentes', pendingAll, overdue ? `<span class="warn-t">${overdue} atrasada${overdue > 1 ? 's' : ''}</span>` : 'Nenhuma atrasada', 'peach', '#/tarefas')}
        ${this.stat('calendar', 'Próximos 7 dias', next7, upcoming[0] ? 'Próximo: ' + esc(upcoming[0].title) : 'Agenda livre', 'lav', '#/eventos')}
        ${this.stat('workout', 'Treinos na semana', `${wkWeek.done}<small>/${wkWeek.planned}</small>`, wkToday.length ? (wkToday.every(w => w.log) ? 'Treino de hoje concluído ✓' : 'Hoje: ' + esc(wkToday[0].template.name)) : (st.workouts.templates.some(t => t.days.length) ? 'Hoje é dia de descanso' : 'Defina os dias de treino'), 'sage', '#/treinos')}
        ${this.stat('food', 'Refeições hoje', `${nut.mealsDone}<small>/${nut.mealsTotal}</small>`, nut.consumed.known ? fmtNum(nut.consumed.kcal) + ' kcal registradas' : (nut.mealsTotal ? 'Marque o que já comeu' : 'Cadastre suas refeições'), 'butter', '#/alimentacao')}
        ${this.stat('target', 'Rotina do dia', score === null ? '—' : score + '<small>%</small>', 'Tarefas, refeições, treino e hábitos', 'sky', '#/relatorios')}
      </section>

      <section class="dash-grid">
        <div class="card timeline-card">
          <div class="card-head"><h3>${icon('clock')}Minha rotina de hoje</h3>
            <div class="row-gap"><button class="btn ghost sm" id="rt-add">${icon('plus')}Item fixo</button></div></div>
          ${timeline.length ? `<ol class="timeline">${timeline.map((it, i) => {
            const isNow = it.time && D.toMin(it.time) <= nowM && (!timeline[i + 1] || !timeline[i + 1].time || D.toMin(timeline[i + 1].time) > nowM);
            return `<li class="tl-item ${it.done ? 'is-done' : ''} ${isNow ? 'is-now' : ''}" data-kind="${it.kind}" data-id="${esc(it.id)}">
              <span class="tl-time">${it.time ? esc(it.time) : 'Dia'}</span>
              <span class="tl-dot" style="--c:${it.color}"></span>
              <button class="tl-body" data-open><b>${esc(it.title)}</b><span>${esc(it.sub)}</span></button>
              <button class="check ${it.done ? 'on' : ''}" data-check aria-label="${it.done ? 'Desmarcar' : 'Marcar como feito'}">${icon('check')}</button>
            </li>`; }).join('')}</ol>` : emptyState(emptyArt(), 'Seu dia está livre', 'Adicione tarefas, compromissos, refeições ou itens fixos para montar sua linha do tempo.')}
          <p class="hint">Toque em um item para editar horário e detalhes. Refeições e treinos vêm das abas Alimentação e Treinos.</p>
        </div>

        <div class="stack">
          <div class="card">
            <div class="card-head"><h3>${icon('events')}Próximos compromissos</h3><a href="#/eventos" class="link">Ver todos</a></div>
            ${upcoming.length ? `<div class="ev-mini-list">${upcoming.map(e => { const c = Sel.cat(e.category); return `
              <button class="ev-mini" data-ev="${esc(e.id)}" style="--c:${c.color}">
                <span class="ev-date"><b>${D.parse(e.date).getDate()}</b><em>${D.months[D.parse(e.date).getMonth()].slice(0, 3)}</em></span>
                <span class="ev-info"><b>${esc(e.title)}</b><span>${esc(D.relative(e.date))} · ${e.allDay ? 'Dia inteiro' : esc(e.start || '') + (e.end ? '–' + esc(e.end) : '')}</span>
                ${e.description ? `<em class="ev-note">${esc(e.description)}</em>` : ''}</span>
                <span class="tag" style="--c:${c.color}">${esc(c.name)}</span>
              </button>`; }).join('')}</div>` : emptyState(emptyArt('calendar'), 'Nenhum compromisso à vista', 'Que tal planejar algo especial?')}
          </div>

          <div class="card">
            <div class="card-head"><h3>${icon('heart')}Hábitos de hoje</h3><a href="#/configuracoes" class="link">Gerenciar</a></div>
            ${habits.length ? `<div class="habit-list">${habits.map(h => { const on = Sel.habitDone(k, h); return `
              <button class="habit ${on ? 'on' : ''}" data-habit="${esc(h.id)}" ${h.auto ? 'data-auto="1"' : ''}>${icon(h.icon || 'sparkles')}<span>${esc(h.name)}${h.auto === 'water' ? `<small>${fmtNum(nut.water)} / ${fmtNum(st.nutrition.goals.waterMl)} ml</small>` : ''}</span><i class="check ${on ? 'on' : ''}">${icon('check')}</i></button>`; }).join('')}</div>`
              : emptyState(emptyArt(), 'Sem hábitos ainda', 'Crie hábitos em Configurações para acompanhar sua evolução.')}
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h3>${icon('chart')}Progresso semanal</h3><a href="#/relatorios" class="link">Relatórios completos</a></div>
        <div class="week-grid">
          <div class="mini-chart"><h4>Tarefas concluídas por dia</h4>${taskSeries.some(x => x.value) ? Charts.bars(taskSeries, { height: 120, color: 'var(--rose)', highlight: 6 }) : '<p class="muted-p sm">Nenhuma tarefa concluída nos últimos 7 dias.</p>'}</div>
          <div class="mini-chart"><h4>Frequência de treinos</h4>${wkSeries.some(x => x.a || x.b) ? Charts.groupedBars(wkSeries, { height: 104, colorB: 'var(--sage-d)' }) : '<p class="muted-p sm">Defina os dias dos treinos para acompanhar a frequência.</p>'}</div>
          <div class="mini-chart"><h4>Regularidade da rotina (%)</h4>${scoreSeries.some(x => x.value !== null) ? Charts.line(scoreSeries, { height: 130, color: 'var(--lav-d)', unit: '%' }) : '<p class="muted-p sm">Ainda sem dados suficientes.</p>'}</div>
          <div class="mini-chart"><h4>Evolução dos hábitos</h4>${habitRows.length ? Charts.dotGrid(habitRows, days.map(d => D.wdShort[D.dow(d)].slice(0, 1).toUpperCase())) : '<p class="muted-p sm">Cadastre hábitos para ver a evolução.</p>'}</div>
        </div>
      </section>`;

    this.bind(root, k);
  },

  stat(ic, label, value, sub, tone, href) {
    return `<a class="stat tone-${tone}" href="${href}"><span class="stat-ic">${icon(ic)}</span><div><span class="stat-lbl">${label}</span><b class="stat-val">${value}</b><span class="stat-sub">${sub}</span></div></a>`;
  },

  bind(root, k) {
    $('#q-task', root).addEventListener('click', () => openTaskEditor(null, { date: k }));
    $('#q-ev', root).addEventListener('click', () => openEventEditor(null, { date: k }));
    $('#rt-add', root).addEventListener('click', () => openRoutineEditor(null));
    const ib = $('#ib-go', root); ib && ib.addEventListener('click', () => App.promptInstall());
    const ix = $('#ib-x', root); ix && ix.addEventListener('click', () => Store.update(s => { s.settings.installDismissed = true; }));
    $$('[data-ev]', root).forEach(b => b.addEventListener('click', () => openEventEditor(Store.state.events.find(e => e.id === b.dataset.ev))));
    $$('[data-habit]', root).forEach(b => b.addEventListener('click', () => {
      if (b.dataset.auto) { location.hash = '#/alimentacao'; toast('Registre a água na aba Alimentação.', 'info'); return; }
      toggleHabit(k, b.dataset.habit);
    }));
    $$('.tl-item', root).forEach(li => {
      const { kind, id } = li.dataset;
      $('[data-open]', li).addEventListener('click', () => {
        if (kind === 'task') openTaskEditor(Store.state.tasks.find(t => t.id === id));
        else if (kind === 'event') openEventEditor(Store.state.events.find(t => t.id === id));
        else if (kind === 'workout') openWorkoutDetail(id, k);
        else if (kind === 'meal') openMealEditor(Store.state.nutrition.meals.find(m => m.id === id));
        else if (kind === 'routine') openRoutineEditor(Store.state.routine.find(r => r.id === id));
      });
      $('[data-check]', li).addEventListener('click', () => {
        if (kind === 'task') toggleTask(id);
        else if (kind === 'event') Store.update(s => { const e = s.events.find(x => x.id === id); if (e) e.done = !e.done; });
        else if (kind === 'workout') {
          const log = Store.state.workouts.logs.find(l => l.templateId === id && l.date === k);
          if (log) openWorkoutDetail(id, k); else openWorkoutLog(id, k);
        }
        else if (kind === 'meal') toggleMealDone(k, id);
        else if (kind === 'routine') Store.update(s => {
          const key = k + ':routine'; const arr = s.habitLog[key] || (s.habitLog[key] = []);
          const i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id);
        });
      });
    });
  }
};

function toggleHabit(k, id) {
  Store.update(s => {
    const arr = s.habitLog[k] || (s.habitLog[k] = []);
    const i = arr.indexOf(id); if (i >= 0) arr.splice(i, 1); else arr.push(id);
  });
}
