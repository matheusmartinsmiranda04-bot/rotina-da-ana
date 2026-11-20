/* Rotina da Ana — Calendário (mês, semana e dia), integrado a compromissos, tarefas e treinos */
'use strict';

Views.calendario = {
  mode: 'mes', cursor: null, hidden: {}, showTasks: true, showWorkouts: true,
  render(root) {
    if (!this.cursor) this.cursor = D.today();
    const cats = Store.state.settings.categories;
    root.innerHTML = `
      <div class="page-head">
        <div><p class="eyebrow">${icon('calendar')} Organização mensal</p><h2>Calendário</h2></div>
        <div class="row-gap"><button class="btn primary" id="cal-new">${icon('plus')}Novo compromisso</button></div>
      </div>
      <div class="card cal-card">
        <div class="cal-toolbar">
          <div class="row-gap">
            <button class="icon-btn" id="cal-prev" aria-label="Anterior">${icon('left')}</button>
            <h3 class="cal-title" id="cal-title"></h3>
            <button class="icon-btn" id="cal-next" aria-label="Próximo">${icon('right')}</button>
            <button class="btn ghost sm" id="cal-today">Hoje</button>
          </div>
          <div class="seg" role="tablist">${[['mes', 'Mês'], ['semana', 'Semana'], ['dia', 'Dia']].map(([v, l]) => `<button class="${this.mode === v ? 'on' : ''}" data-mode="${v}">${l}</button>`).join('')}</div>
        </div>
        <div class="cal-filters">
          ${cats.map(c => `<button class="chip ${this.hidden[c.id] ? 'off' : ''}" data-cat="${c.id}" style="--c:${c.color}"><i></i>${esc(c.name)}</button>`).join('')}
          <span class="sep"></span>
          <button class="chip ${this.showTasks ? '' : 'off'}" data-toggle="tasks" style="--c:var(--ink-3)"><i></i>Tarefas</button>
          <button class="chip ${this.showWorkouts ? '' : 'off'}" data-toggle="workouts" style="--c:${Sel.cat('treino').color}"><i></i>Treinos</button>
        </div>
        <div id="cal-body"></div>
      </div>`;
    this.draw(root);
    $('#cal-new', root).addEventListener('click', () => openEventEditor(null, { date: this.mode === 'mes' ? (this.cursor.slice(0, 7) === D.today().slice(0, 7) ? D.today() : this.cursor) : this.cursor }));
    $('#cal-prev', root).addEventListener('click', () => this.move(-1, root));
    $('#cal-next', root).addEventListener('click', () => this.move(1, root));
    $('#cal-today', root).addEventListener('click', () => { this.cursor = D.today(); this.draw(root); });
    $$('[data-mode]', root).forEach(b => b.addEventListener('click', () => { this.mode = b.dataset.mode; $$('[data-mode]', root).forEach(x => x.classList.toggle('on', x === b)); this.draw(root); }));
    $$('[data-cat]', root).forEach(b => b.addEventListener('click', () => { this.hidden[b.dataset.cat] = !this.hidden[b.dataset.cat]; b.classList.toggle('off'); this.draw(root); }));
    $$('[data-toggle]', root).forEach(b => b.addEventListener('click', () => {
      if (b.dataset.toggle === 'tasks') this.showTasks = !this.showTasks; else this.showWorkouts = !this.showWorkouts;
      b.classList.toggle('off'); this.draw(root);
    }));
  },
  move(n, root) {
    this.cursor = this.mode === 'mes' ? D.addMonths(this.cursor, n) : D.add(this.cursor, this.mode === 'semana' ? 7 * n : n);
    this.draw(root);
  },
  items(k) {
    return dayItems(k, { tasks: this.showTasks, workouts: this.showWorkouts }).filter(it => it.kind !== 'event' || !this.hidden[it.ref.category]);
  },
  chip(it) {
    const color = it.color || it.cat.color;
    const id = it.kind === 'workout' ? it.ref.template.id : it.ref.id;
    return `<button class="cal-chip ${it.kind} ${it.done ? 'is-done' : ''}" data-kind="${it.kind}" data-id="${esc(id)}" style="--c:${color}" title="${esc((it.time ? it.time + ' · ' : '') + it.title)}">
      ${it.kind === 'workout' ? icon('workout') : it.kind === 'task' ? icon(it.done ? 'check' : 'tasks') : ''}${it.time && it.kind !== 'task' ? `<em>${esc(it.time)}</em>` : ''}<span>${esc(it.title)}</span></button>`;
  },
  draw(root) {
    const body = $('#cal-body', root), title = $('#cal-title', root), today = D.today();
    if (this.mode === 'mes') {
      title.textContent = D.monthTitle(this.cursor);
      const first = D.startOfMonth(this.cursor), start = D.startOfWeek(first);
      const last = D.endOfMonth(this.cursor);
      const weeks = Math.ceil((D.diff(start, last) + 1) / 7);
      const cells = D.range(start, D.add(start, weeks * 7 - 1));
      body.innerHTML = `<div class="month">
        ${D.wdShort.map(d => `<div class="m-head">${d}</div>`).join('')}
        ${cells.map(k => { const its = this.items(k); const out = k.slice(0, 7) !== this.cursor.slice(0, 7);
          return `<div class="m-cell ${out ? 'out' : ''} ${k === today ? 'today' : ''} ${D.dow(k) === 0 || D.dow(k) === 6 ? 'wkend' : ''}" data-day="${k}" tabindex="0" role="button" aria-label="${D.long(k)}, ${its.length} itens">
            <span class="m-num">${D.parse(k).getDate()}</span>
            <div class="m-items">${its.slice(0, 3).map(it => this.chip(it)).join('')}${its.length > 3 ? `<span class="more">+${its.length - 3} mais</span>` : ''}</div>
            <div class="m-dots">${its.slice(0, 5).map(it => `<i style="background:${it.color || it.cat.color}"></i>`).join('')}</div>
          </div>`; }).join('')}
      </div>`;
    } else if (this.mode === 'semana') {
      const s = D.startOfWeek(this.cursor), e = D.add(s, 6);
      title.textContent = `${D.parse(s).getDate()} ${D.months[D.parse(s).getMonth()].slice(0, 3)} – ${D.parse(e).getDate()} ${D.months[D.parse(e).getMonth()].slice(0, 3)} ${D.parse(e).getFullYear()}`;
      body.innerHTML = `<div class="week">${D.range(s, e).map(k => { const its = this.items(k); return `
        <div class="w-col ${k === today ? 'today' : ''}">
          <button class="w-head" data-day="${k}"><span>${D.wdShort[D.dow(k)]}</span><b>${D.parse(k).getDate()}</b></button>
          <div class="w-items">${its.map(it => this.chip(it)).join('') || '<span class="w-empty">livre</span>'}</div>
          <button class="w-add" data-add="${k}" aria-label="Adicionar em ${D.br(k)}">${icon('plus')}</button>
        </div>`; }).join('')}</div>`;
    } else {
      const k = this.cursor;
      title.textContent = D.long(k).replace(/^./, c => c.toUpperCase());
      const its = this.items(k);
      const allDay = its.filter(i => !i.time);
      const hours = []; for (let h = 5; h <= 23; h++) hours.push(h);
      const nowH = new Date().getHours();
      body.innerHTML = `<div class="dayview">
        ${allDay.length ? `<div class="dv-allday"><span>Dia inteiro</span><div>${allDay.map(it => this.chip(it)).join('')}</div></div>` : ''}
        ${hours.map(h => { const hi = its.filter(i => i.time && Number(i.time.slice(0, 2)) === h); return `
          <div class="dv-row ${k === today && h === nowH ? 'now' : ''}" data-hour="${h}"><span class="dv-h">${D.pad(h)}:00</span>
            <div class="dv-slot">${hi.map(it => this.chip(it)).join('')}<button class="dv-add" data-addh="${D.pad(h)}:00" aria-label="Adicionar às ${h}h">${icon('plus')}</button></div></div>`; }).join('')}
      </div>`;
    }
    body.onclick = e => {
      const chip = e.target.closest('.cal-chip');
      if (chip) {
        e.stopPropagation();
        const { kind, id } = chip.dataset;
        const dayEl = chip.closest('[data-day]');
        const k = (dayEl && dayEl.dataset.day) || (chip.closest('.w-col') && $('.w-head', chip.closest('.w-col')).dataset.day) || this.cursor;
        if (kind === 'event') openEventEditor(Store.state.events.find(x => x.id === id));
        else if (kind === 'task') openTaskEditor(Store.state.tasks.find(x => x.id === id));
        else openWorkoutDetail(id, k);
        return;
      }
      const add = e.target.closest('[data-add]');
      if (add) { openEventEditor(null, { date: add.dataset.add }); return; }
      const addh = e.target.closest('[data-addh]');
      if (addh) { const h = addh.dataset.addh; openEventEditor(null, { date: this.cursor, start: h, end: D.pad(Math.min(23, Number(h.slice(0, 2)) + 1)) + ':00' }); return; }
      const day = e.target.closest('[data-day]');
      if (day) openDayModal(day.dataset.day);
    };
    body.onkeydown = e => { if (e.key === 'Enter' && e.target.dataset.day) openDayModal(e.target.dataset.day); };
  }
};
