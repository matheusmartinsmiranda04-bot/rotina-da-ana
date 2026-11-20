/* Rotina da Ana — Tarefas (lista, quadro kanban e calendário de tarefas) */
'use strict';

Views.tarefas = {
  mode: 'lista', f: { date: 'todas', priority: '', category: '', status: '', q: '' }, calCursor: null,
  filtered() {
    const k = D.today(), ws = D.startOfWeek(k), we = D.add(ws, 6), f = this.f;
    return Store.state.tasks.filter(t => {
      if (f.q && !(t.title + ' ' + (t.notes || '')).toLowerCase().includes(f.q.toLowerCase())) return false;
      if (f.priority && t.priority !== f.priority) return false;
      if (f.category && t.category !== f.category) return false;
      if (f.status && t.status !== f.status) return false;
      if (f.date === 'hoje' && t.date !== k) return false;
      if (f.date === 'semana' && !(t.date >= ws && t.date <= we)) return false;
      if (f.date === 'atrasadas' && !Sel.isOverdue(t)) return false;
      if (f.date === 'sem' && t.date) return false;
      return true;
    }).sort((a, b) => (a.status === 'done') - (b.status === 'done') || (a.date || '9999').localeCompare(b.date || '9999') || (a.time || '99').localeCompare(b.time || '99') ||
      (PRIORITIES.find(p => p.value === b.priority) || PRIORITIES[1]).w - (PRIORITIES.find(p => p.value === a.priority) || PRIORITIES[1]).w);
  },
  render(root) {
    const k = D.today(), ws = D.startOfWeek(k);
    const d = Sel.taskStatsDay(k), w = Sel.taskStatsRange(ws, D.add(ws, 6));
    const f = this.f;
    root.innerHTML = `
      <div class="page-head">
        <div><p class="eyebrow">${icon('tasks')} Gerenciador de atividades</p><h2>Tarefas</h2></div>
        <button class="btn primary" id="tk-new">${icon('plus')}Nova tarefa</button>
      </div>
      <div class="progress-duo">
        <div class="card prog"><div class="prog-top"><span>Hoje</span><b>${d.done}/${d.total} · ${pct(d.done, d.total)}%</b></div><div class="hbar-track lg"><div class="hbar" style="width:${pct(d.done, d.total)}%;background:var(--rose-d)"></div></div></div>
        <div class="card prog"><div class="prog-top"><span>Esta semana</span><b>${w.done}/${w.total} · ${pct(w.done, w.total)}%</b></div><div class="hbar-track lg"><div class="hbar" style="width:${pct(w.done, w.total)}%;background:var(--lav-d)"></div></div></div>
      </div>
      <div class="card">
        <div class="toolbar">
          <div class="seg">${[['lista', 'list', 'Lista'], ['kanban', 'kanban', 'Quadro'], ['calendario', 'calendar', 'Calendário']].map(([v, ic, l]) => `<button class="${this.mode === v ? 'on' : ''}" data-mode="${v}">${icon(ic)}<span>${l}</span></button>`).join('')}</div>
          <label class="search">${icon('search')}<input id="tk-q" placeholder="Buscar tarefa" value="${esc(f.q)}"></label>
        </div>
        <div class="filters">
          <select data-f="date" aria-label="Filtrar por data">${selectOptions([{ value: 'todas', label: 'Todas as datas' }, { value: 'hoje', label: 'Hoje' }, { value: 'semana', label: 'Esta semana' }, { value: 'atrasadas', label: 'Atrasadas' }, { value: 'sem', label: 'Sem prazo' }], f.date)}</select>
          <select data-f="priority" aria-label="Filtrar por prioridade">${selectOptions([{ value: '', label: 'Todas as prioridades' }].concat(PRIORITIES), f.priority)}</select>
          <select data-f="category" aria-label="Filtrar por categoria">${selectOptions([{ value: '', label: 'Todas as categorias' }].concat(Sel.catOptions()), f.category)}</select>
          ${this.mode !== 'kanban' ? `<select data-f="status" aria-label="Filtrar por status">${selectOptions([{ value: '', label: 'Todos os status' }].concat(TASK_STATUS), f.status)}</select>` : ''}
          ${Object.entries(f).some(([key, v]) => key === 'date' ? v !== 'todas' : v) ? `<button class="btn ghost sm" id="tk-clear">${icon('x')}Limpar filtros</button>` : ''}
        </div>
        <div id="tk-body"></div>
      </div>`;
    this.drawBody(root);
    $('#tk-new', root).addEventListener('click', () => openTaskEditor(null, { date: f.date === 'sem' ? '' : k }));
    $$('[data-mode]', root).forEach(b => b.addEventListener('click', () => { this.mode = b.dataset.mode; this.render(root); }));
    $$('[data-f]', root).forEach(s => s.addEventListener('change', () => { this.f[s.dataset.f] = s.value; this.render(root); }));
    const q = $('#tk-q', root);
    q.addEventListener('input', () => { this.f.q = q.value; this.drawBody(root); });
    const c = $('#tk-clear', root); c && c.addEventListener('click', () => { this.f = { date: 'todas', priority: '', category: '', status: '', q: '' }; this.render(root); });
  },
  taskCard(t, compact = false) {
    const c = Sel.cat(t.category), p = PRIORITIES.find(x => x.value === t.priority) || PRIORITIES[1];
    const overdue = Sel.isOverdue(t);
    return `<div class="task ${t.status === 'done' ? 'is-done' : ''} ${compact ? 'compact' : ''}" data-id="${esc(t.id)}" ${compact ? 'draggable="true"' : ''}>
      <button class="check ${t.status === 'done' ? 'on' : ''}" data-check aria-label="Concluir">${icon('check')}</button>
      <button class="task-main" data-edit>
        <b>${esc(t.title)}</b>
        <span class="task-meta">
          <span class="prio prio-${p.value}">${p.label}</span>
          <span class="tag" style="--c:${c.color}">${esc(c.name)}</span>
          ${t.date ? `<span class="${overdue ? 'warn-t' : ''}">${icon('calendar')}${esc(D.relative(t.date))}${t.time ? ' · ' + esc(t.time) : ''}</span>` : '<span class="muted">Sem prazo</span>'}
          ${t.status === 'doing' ? '<span class="doing">Em andamento</span>' : ''}
        </span>
        ${t.notes && !compact ? `<em class="task-notes">${esc(t.notes)}</em>` : ''}
      </button>
      ${compact ? `<div class="kb-move">${t.status !== 'todo' ? `<button class="icon-btn sm" data-mv="-1" aria-label="Mover para a coluna anterior">${icon('left')}</button>` : ''}${t.status !== 'done' ? `<button class="icon-btn sm" data-mv="1" aria-label="Mover para a próxima coluna">${icon('right')}</button>` : ''}</div>` : `<button class="icon-btn sm" data-del aria-label="Excluir">${icon('trash')}</button>`}
    </div>`;
  },
  drawBody(root) {
    const body = $('#tk-body', root);
    const list = this.filtered();
    if (this.mode === 'lista') {
      if (!list.length) { body.innerHTML = emptyState(emptyArt('tasks'), Store.state.tasks.length ? 'Nenhuma tarefa com esses filtros' : 'Nenhuma tarefa ainda', Store.state.tasks.length ? 'Ajuste os filtros para ver mais.' : 'Crie sua primeira tarefa e acompanhe seu progresso aqui.', Store.state.tasks.length ? '' : `<button class="btn primary" data-new>${icon('plus')}Criar tarefa</button>`); }
      else {
        const groups = [['Pendentes', list.filter(t => t.status !== 'done')], ['Concluídas', list.filter(t => t.status === 'done')]];
        body.innerHTML = groups.filter(g => g[1].length).map(([g, arr]) => `<h4 class="group-t">${g} <span>${arr.length}</span></h4><div class="task-list">${arr.map(t => this.taskCard(t)).join('')}</div>`).join('');
      }
    } else if (this.mode === 'kanban') {
      body.innerHTML = `<div class="kanban">${TASK_STATUS.map(s => { const arr = list.filter(t => t.status === s.value); return `
        <div class="kb-col" data-status="${s.value}"><div class="kb-head"><b>${s.label}</b><span>${arr.length}</span></div>
          <div class="kb-drop">${arr.map(t => this.taskCard(t, true)).join('') || '<p class="kb-empty">Arraste tarefas para cá</p>'}</div>
          ${s.value === 'todo' ? `<button class="btn ghost sm block" data-new>${icon('plus')}Adicionar</button>` : ''}</div>`; }).join('')}</div>`;
      this.bindDnD(body);
    } else {
      if (!this.calCursor) this.calCursor = D.today();
      const first = D.startOfMonth(this.calCursor), start = D.startOfWeek(first), last = D.endOfMonth(this.calCursor);
      const weeks = Math.ceil((D.diff(start, last) + 1) / 7);
      body.innerHTML = `<div class="cal-toolbar sm"><div class="row-gap"><button class="icon-btn" data-cm="-1" aria-label="Mês anterior">${icon('left')}</button><h3 class="cal-title">${D.monthTitle(this.calCursor)}</h3><button class="icon-btn" data-cm="1" aria-label="Próximo mês">${icon('right')}</button></div></div>
        <div class="month tasks-month">${D.wdShort.map(d => `<div class="m-head">${d}</div>`).join('')}
        ${D.range(start, D.add(start, weeks * 7 - 1)).map(k => { const ts = list.filter(t => t.date === k); return `<div class="m-cell ${k.slice(0, 7) !== this.calCursor.slice(0, 7) ? 'out' : ''} ${k === D.today() ? 'today' : ''}" data-newday="${k}">
          <span class="m-num">${D.parse(k).getDate()}</span><div class="m-items">${ts.slice(0, 3).map(t => `<button class="cal-chip task ${t.status === 'done' ? 'is-done' : ''}" data-id="${esc(t.id)}" style="--c:${Sel.cat(t.category).color}">${icon(t.status === 'done' ? 'check' : 'tasks')}<span>${esc(t.title)}</span></button>`).join('')}${ts.length > 3 ? `<span class="more">+${ts.length - 3}</span>` : ''}</div></div>`; }).join('')}</div>
        <p class="hint">Clique em um dia para criar uma tarefa nessa data.</p>`;
      $$('[data-cm]', body).forEach(b => b.addEventListener('click', () => { this.calCursor = D.addMonths(this.calCursor, Number(b.dataset.cm)); this.drawBody(root); }));
    }
    body.onclick = async e => {
      if (e.target.closest('[data-new]')) { openTaskEditor(null); return; }
      const chip = e.target.closest('.cal-chip'); if (chip) { e.stopPropagation(); openTaskEditor(Store.state.tasks.find(t => t.id === chip.dataset.id)); return; }
      const nd = e.target.closest('[data-newday]'); if (nd && this.mode === 'calendario') { openTaskEditor(null, { date: nd.dataset.newday }); return; }
      const el = e.target.closest('.task'); if (!el) return;
      const t = Store.state.tasks.find(x => x.id === el.dataset.id); if (!t) return;
      if (e.target.closest('[data-check]')) toggleTask(t.id);
      else if (e.target.closest('[data-edit]')) openTaskEditor(t);
      else if (e.target.closest('[data-mv]')) {
        const order = TASK_STATUS.map(s => s.value), i = order.indexOf(t.status) + Number(e.target.closest('[data-mv]').dataset.mv);
        setTaskStatus(t.id, order[clamp(i, 0, 2)]);
      } else if (e.target.closest('[data-del]')) {
        if (await confirmDialog({ title: 'Excluir tarefa', message: `Excluir “${esc(t.title)}”?`, confirmText: 'Excluir', danger: true })) { Store.update(s => { s.tasks = s.tasks.filter(x => x.id !== t.id); }); toast('Tarefa excluída.'); }
      }
    };
  },
  bindDnD(body) {
    let dragId = null;
    $$('.task[draggable]', body).forEach(el => {
      el.addEventListener('dragstart', e => { dragId = el.dataset.id; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragId); });
      el.addEventListener('dragend', () => { el.classList.remove('dragging'); $$('.kb-col', body).forEach(c => c.classList.remove('over')); });
    });
    $$('.kb-col', body).forEach(col => {
      col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over'); });
      col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('over'); });
      col.addEventListener('drop', e => {
        e.preventDefault(); col.classList.remove('over');
        const id = dragId || e.dataTransfer.getData('text/plain');
        const t = Store.state.tasks.find(x => x.id === id);
        if (t && t.status !== col.dataset.status) { setTaskStatus(id, col.dataset.status); toast('Tarefa movida para “' + TASK_STATUS.find(s => s.value === col.dataset.status).label + '”.'); }
      });
    });
  }
};
