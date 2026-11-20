/* Rotina da Ana — janelas de edição compartilhadas (eventos, tarefas, treinos, rotina) */
'use strict';

const REMINDERS = [
  { value: '', label: 'Sem lembrete' }, { value: '0', label: 'No horário' }, { value: '15', label: '15 min antes' },
  { value: '30', label: '30 min antes' }, { value: '60', label: '1 hora antes' }, { value: '1440', label: '1 dia antes' }
];

/* ---------------- Evento / compromisso ---------------- */
function openEventEditor(ev, defaults = {}) {
  const isNew = !ev;
  const e = ev ? clone(ev) : Object.assign({ title: '', date: D.today(), endDate: '', allDay: false, start: '09:00', end: '10:00', category: 'compromissos', description: '', reminder: '' }, defaults);
  Modal.open({
    title: isNew ? 'Novo compromisso' : 'Editar compromisso',
    body: `<form class="form" id="ev-form" novalidate>
      <label class="field"><span>Título *</span><input name="title" value="${esc(e.title)}" placeholder="Ex.: Consulta, aniversário, reunião" maxlength="120"></label>
      <div class="grid2">
        <label class="field"><span>Data</span><input type="date" name="date" value="${esc(e.date)}"></label>
        <label class="field"><span>Até (opcional)</span><input type="date" name="endDate" value="${esc(e.endDate || '')}"></label>
      </div>
      <label class="switch"><input type="checkbox" name="allDay" ${e.allDay ? 'checked' : ''}><i></i><span>Dia inteiro</span></label>
      <div class="grid2 time-fields" ${e.allDay ? 'hidden' : ''}>
        <label class="field"><span>Início</span><input type="time" name="start" value="${esc(e.start || '')}"></label>
        <label class="field"><span>Término</span><input type="time" name="end" value="${esc(e.end || '')}"></label>
      </div>
      <div class="grid2">
        <label class="field"><span>Categoria</span><select name="category">${selectOptions(Sel.catOptions(), e.category)}</select></label>
        <label class="field"><span>Lembrete</span><select name="reminder">${selectOptions(REMINDERS, e.reminder === null || e.reminder === undefined ? '' : e.reminder)}</select></label>
      </div>
      <label class="field"><span>Descrição / observações</span><textarea name="description" rows="3" placeholder="Endereço, o que levar, detalhes…">${esc(e.description || '')}</textarea></label>
      ${!isNew ? `<label class="switch"><input type="checkbox" name="done" ${e.done ? 'checked' : ''}><i></i><span>Compromisso realizado</span></label>` : ''}
    </form>`,
    footer: `${!isNew ? `<button class="btn ghost danger-text" id="ev-del">${icon('trash')}Excluir</button>` : ''}<span class="sp"></span>
      <button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="ev-save">${icon('check')}Salvar</button>`,
    onMount(root, api) {
      const form = $('#ev-form', root);
      form.allDay.addEventListener('change', () => { $('.time-fields', root).hidden = form.allDay.checked; });
      form.addEventListener('submit', ev2 => { ev2.preventDefault(); $('#ev-save', root).click(); });
      $('#ev-save', root).addEventListener('click', () => {
        const f = formData(form);
        if (!f.title) { toast('Informe um título para o compromisso.', 'error'); form.title.focus(); return; }
        if (!f.date) { toast('Escolha uma data.', 'error'); return; }
        if (f.endDate && f.endDate < f.date) { toast('A data final não pode ser antes da inicial.', 'error'); return; }
        if (!f.allDay && f.start && f.end && f.end < f.start && (!f.endDate || f.endDate === f.date)) { toast('O término deve ser depois do início.', 'error'); return; }
        const data = { title: f.title, date: f.date, endDate: f.endDate && f.endDate !== f.date ? f.endDate : '', allDay: f.allDay, start: f.allDay ? '' : f.start, end: f.allDay ? '' : f.end, category: f.category, description: f.description, reminder: f.reminder, done: !!f.done };
        Store.update(s => {
          if (isNew) s.events.push(Object.assign({ id: uid('ev'), createdAt: new Date().toISOString() }, data));
          else { const x = s.events.find(i => i.id === ev.id); if (x) Object.assign(x, data); }
        });
        api.close(); toast(isNew ? 'Compromisso adicionado.' : 'Compromisso atualizado.');
      });
      const del = $('#ev-del', root);
      del && del.addEventListener('click', async () => {
        if (await confirmDialog({ title: 'Excluir compromisso', message: `Excluir “${esc(ev.title)}”? Esta ação não pode ser desfeita.`, confirmText: 'Excluir', danger: true })) {
          Store.update(s => { s.events = s.events.filter(i => i.id !== ev.id); });
          api.close(); toast('Compromisso excluído.');
        }
      });
    }
  });
}

/* ---------------- Tarefa ---------------- */
function openTaskEditor(task, defaults = {}) {
  const isNew = !task;
  const t = task ? clone(task) : Object.assign({ title: '', notes: '', date: D.today(), time: '', priority: 'media', category: 'pessoal', status: 'todo' }, defaults);
  Modal.open({
    title: isNew ? 'Nova tarefa' : 'Editar tarefa',
    body: `<form class="form" id="tk-form" novalidate>
      <label class="field"><span>O que precisa ser feito? *</span><input name="title" value="${esc(t.title)}" placeholder="Ex.: Comprar frutas da semana" maxlength="140"></label>
      <div class="grid2">
        <label class="field"><span>Prazo</span><input type="date" name="date" value="${esc(t.date || '')}"></label>
        <label class="field"><span>Horário</span><input type="time" name="time" value="${esc(t.time || '')}"></label>
      </div>
      <div class="field"><span>Prioridade</span><div class="seg prio-seg">${PRIORITIES.map(p => `<label class="prio-${p.value}"><input type="radio" name="priority" value="${p.value}" ${t.priority === p.value ? 'checked' : ''}><span>${p.label}</span></label>`).join('')}</div></div>
      <div class="grid2">
        <label class="field"><span>Categoria</span><select name="category">${selectOptions(Sel.catOptions(), t.category)}</select></label>
        <label class="field"><span>Status</span><select name="status">${selectOptions(TASK_STATUS, t.status)}</select></label>
      </div>
      <label class="field"><span>Observações</span><textarea name="notes" rows="3" placeholder="Detalhes, links, lembretes…">${esc(t.notes || '')}</textarea></label>
    </form>`,
    footer: `${!isNew ? `<button class="btn ghost danger-text" id="tk-del">${icon('trash')}Excluir</button>` : ''}<span class="sp"></span>
      <button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="tk-save">${icon('check')}Salvar</button>`,
    onMount(root, api) {
      const form = $('#tk-form', root);
      form.addEventListener('submit', e => { e.preventDefault(); $('#tk-save', root).click(); });
      $('#tk-save', root).addEventListener('click', () => {
        const f = formData(form);
        if (!f.title) { toast('Escreva o nome da tarefa.', 'error'); form.title.focus(); return; }
        Store.update(s => {
          const data = { title: f.title, date: f.date, time: f.time, priority: f.priority || 'media', category: f.category, status: f.status, notes: f.notes };
          if (isNew) s.tasks.push(Object.assign({ id: uid('tk'), createdAt: new Date().toISOString(), completedAt: f.status === 'done' ? new Date().toISOString() : null }, data));
          else {
            const x = s.tasks.find(i => i.id === task.id);
            if (x) {
              if (x.status !== 'done' && data.status === 'done') x.completedAt = new Date().toISOString();
              if (data.status !== 'done') x.completedAt = null;
              Object.assign(x, data);
            }
          }
        });
        api.close(); toast(isNew ? 'Tarefa criada.' : 'Tarefa atualizada.');
      });
      const del = $('#tk-del', root);
      del && del.addEventListener('click', async () => {
        if (await confirmDialog({ title: 'Excluir tarefa', message: `Excluir “${esc(task.title)}”?`, confirmText: 'Excluir', danger: true })) {
          Store.update(s => { s.tasks = s.tasks.filter(i => i.id !== task.id); });
          api.close(); toast('Tarefa excluída.');
        }
      });
    }
  });
}
function setTaskStatus(id, status) {
  Store.update(s => {
    const t = s.tasks.find(x => x.id === id); if (!t) return;
    t.status = status;
    t.completedAt = status === 'done' ? new Date().toISOString() : null;
  });
}
function toggleTask(id) {
  const t = Store.state.tasks.find(x => x.id === id); if (!t) return;
  setTaskStatus(id, t.status === 'done' ? 'todo' : 'done');
  if (t.status === 'done') toast('Tarefa concluída. Muito bem!');
}

/* ---------------- Treinos ---------------- */
function workoutColor(t) { return SWATCHES[t.color] || t.color || SWATCHES.rose; }

function openWorkoutDetail(templateId, k = D.today()) {
  const t = Store.state.workouts.templates.find(x => x.id === templateId);
  if (!t) return;
  const log = Store.state.workouts.logs.find(l => l.templateId === t.id && l.date === k);
  const type = (WORKOUT_TYPES.find(x => x.value === t.type) || WORKOUT_TYPES[6]).label;
  Modal.open({
    title: t.name, size: 'lg',
    body: `<div class="wk-detail-head" style="--c:${workoutColor(t)}">${workoutArt(t.type, workoutColor(t), 56)}
        <div><p class="eyebrow">${esc(type)}</p><h4>${esc(t.description || t.name)}</h4>
        <p class="muted-p">${t.days.length ? t.days.map(d => D.wdShort[d]).join(' · ') : 'Sem dia definido'} ${t.time ? '· ' + esc(t.time) : ''} · Duração: ${t.duration ? esc(t.duration) + ' min' : 'não informada'}</p></div></div>
      ${t.exercises.length ? `<div class="table-wrap"><table class="ex-table"><thead><tr><th>Exercício</th><th>Séries</th><th>Repetições</th><th>Carga</th><th>Descanso</th></tr></thead><tbody>
        ${t.exercises.map(x => `<tr><td>${esc(x.name)}${x.notes ? `<small>${esc(x.notes)}</small>` : ''}</td><td>${esc(x.sets || '—')}</td><td>${esc(x.reps || '—')}</td><td>${esc(x.load || '—')}</td><td>${esc(x.rest || '—')}</td></tr>`).join('')}
      </tbody></table></div>` : '<p class="muted-p">Nenhum exercício cadastrado.</p>'}
      ${t.notes ? `<p class="note-box">${icon('info')}${esc(t.notes)}</p>` : ''}
      ${log ? `<div class="done-box">${icon('check')}<div><b>Concluído em ${D.br(k)}</b>${log.duration ? ` · ${esc(log.duration)} min` : ''}${log.feeling ? ` · ${'★'.repeat(log.feeling)}` : ''}${log.notes ? `<p>${esc(log.notes)}</p>` : ''}</div></div>` : ''}`,
    footer: `<button class="btn ghost" id="wd-edit">${icon('edit')}Editar treino</button><span class="sp"></span>
      ${log ? `<button class="btn ghost" id="wd-undo">Desmarcar</button><button class="btn soft" id="wd-log">${icon('edit')}Editar registro</button>` : `<button class="btn primary" id="wd-log">${icon('check')}Concluir treino</button>`}`,
    onMount(root, api) {
      $('#wd-edit', root).addEventListener('click', () => { api.close(); openTemplateEditor(t); });
      $('#wd-log', root).addEventListener('click', () => { api.close(); openWorkoutLog(t.id, k); });
      const u = $('#wd-undo', root);
      u && u.addEventListener('click', () => { Store.update(s => { s.workouts.logs = s.workouts.logs.filter(l => l !== undefined && !(l.templateId === t.id && l.date === k)); }); api.close(); toast('Registro removido.', 'info'); });
    }
  });
}

function openWorkoutLog(templateId, k = D.today(), extraLog = null) {
  const t = templateId ? Store.state.workouts.templates.find(x => x.id === templateId) : null;
  const existing = extraLog || Store.state.workouts.logs.find(l => l.templateId === templateId && l.date === k && templateId);
  const l = existing ? clone(existing) : { date: k, duration: t && t.duration ? t.duration : '', notes: '', feeling: 0, name: '' };
  Modal.open({
    title: existing ? 'Registro do treino' : (t ? 'Concluir ' + t.name : 'Registrar treino avulso'), size: 'sm',
    body: `<form class="form" id="wl-form">
      ${!t ? `<label class="field"><span>Atividade *</span><input name="name" value="${esc(l.name || '')}" placeholder="Ex.: Caminhada, pilates"></label>` : ''}
      <div class="grid2">
        <label class="field"><span>Data</span><input type="date" name="date" value="${esc(l.date)}"></label>
        <label class="field"><span>Duração (min)</span><input type="number" min="0" max="600" name="duration" value="${esc(l.duration || '')}" placeholder="Ex.: 60"></label>
      </div>
      <div class="field"><span>Como foi?</span><div class="stars" role="radiogroup">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="feeling" value="${n}" ${Number(l.feeling) === n ? 'checked' : ''}><span>★</span></label>`).join('')}</div></div>
      <label class="field"><span>Observações pós-treino</span><textarea name="notes" rows="3" placeholder="Cargas usadas, como se sentiu, ajustes…">${esc(l.notes || '')}</textarea></label>
    </form>`,
    footer: `${existing ? `<button class="btn ghost danger-text" id="wl-del">${icon('trash')}Excluir</button>` : ''}<span class="sp"></span><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="wl-save">${icon('check')}Salvar</button>`,
    onMount(root, api) {
      // permite desmarcar estrela clicando novamente
      $$('.stars input', root).forEach(inp => inp.addEventListener('click', () => {}));
      $('#wl-save', root).addEventListener('click', () => {
        const f = formData($('#wl-form', root));
        if (!t && !f.name) { toast('Informe a atividade.', 'error'); return; }
        if (!f.date) { toast('Escolha a data.', 'error'); return; }
        Store.update(s => {
          if (existing) {
            const x = s.workouts.logs.find(i => i.id === existing.id);
            Object.assign(x, { date: f.date, duration: f.duration, notes: f.notes, feeling: Number(f.feeling) || 0, name: f.name || x.name });
          } else {
            if (t) s.workouts.logs = s.workouts.logs.filter(i => !(i.templateId === t.id && i.date === f.date));
            s.workouts.logs.push({ id: uid('wl'), templateId: t ? t.id : null, name: t ? t.name : f.name, date: f.date, duration: f.duration, notes: f.notes, feeling: Number(f.feeling) || 0, completedAt: new Date().toISOString() });
          }
        });
        api.close(); toast(existing ? 'Registro atualizado.' : 'Treino concluído! Arrasou 💪');
      });
      const del = $('#wl-del', root);
      del && del.addEventListener('click', async () => {
        if (await confirmDialog({ title: 'Excluir registro', message: 'Excluir este registro de treino?', confirmText: 'Excluir', danger: true })) {
          Store.update(s => { s.workouts.logs = s.workouts.logs.filter(i => i.id !== existing.id); });
          api.close(); toast('Registro excluído.');
        }
      });
    }
  });
}

function exerciseRow(x = {}) {
  return `<div class="ex-row">
    <span class="ex-grip" title="Arraste para reordenar">${icon('grip')}</span>
    <input data-k="name" value="${esc(x.name || '')}" placeholder="Exercício" class="ex-name">
    <input data-k="sets" value="${esc(x.sets || '')}" placeholder="Séries">
    <input data-k="reps" value="${esc(x.reps || '')}" placeholder="Repetições">
    <input data-k="load" value="${esc(x.load || '')}" placeholder="Carga">
    <input data-k="rest" value="${esc(x.rest || '')}" placeholder="Descanso">
    <input data-k="notes" value="${esc(x.notes || '')}" placeholder="Obs." class="ex-notes">
    <div class="ex-actions"><button type="button" class="icon-btn sm" data-up title="Subir">${icon('left', 'rot90')}</button><button type="button" class="icon-btn sm" data-rm title="Remover">${icon('x')}</button></div>
  </div>`;
}

function openTemplateEditor(tpl) {
  const isNew = !tpl;
  const t = tpl ? clone(tpl) : { name: '', type: 'musculacao', days: [], time: '18:00', duration: '', description: '', notes: '', color: 'rose', exercises: [] };
  Modal.open({
    title: isNew ? 'Novo treino' : 'Editar ' + t.name, size: 'xl',
    body: `<form class="form" id="tp-form">
      <div class="grid3">
        <label class="field"><span>Nome do treino *</span><input name="name" value="${esc(t.name)}" placeholder="Ex.: Treino A — Inferiores"></label>
        <label class="field"><span>Tipo de atividade</span><select name="type">${selectOptions(WORKOUT_TYPES, t.type)}</select></label>
        <div class="field"><span>Cor</span><div class="swatches">${Object.keys(SWATCHES).map(k => `<label><input type="radio" name="color" value="${k}" ${t.color === k ? 'checked' : ''}><i style="background:${SWATCHES[k]}"></i></label>`).join('')}</div></div>
      </div>
      <div class="field"><span>Dias da semana</span><div class="daychips">${D.wdShort.map((d, i) => `<label><input type="checkbox" data-day="${i}" ${t.days.includes(i) ? 'checked' : ''}><span>${d}</span></label>`).join('')}</div></div>
      <div class="grid2">
        <label class="field"><span>Horário</span><input type="time" name="time" value="${esc(t.time || '')}"></label>
        <label class="field"><span>Duração prevista (min)</span><input type="number" min="0" max="600" name="duration" value="${esc(t.duration || '')}" placeholder="Não informada"></label>
      </div>
      <label class="field"><span>Descrição</span><input name="description" value="${esc(t.description || '')}" placeholder="Foco do treino"></label>
      <div class="field"><span>Exercícios</span>
        <div class="ex-head"><span></span><span>Exercício</span><span>Séries</span><span>Repetições</span><span>Carga</span><span>Descanso</span><span>Obs.</span><span></span></div>
        <div id="ex-list">${t.exercises.map(exerciseRow).join('')}</div>
        <button type="button" class="btn soft sm" id="ex-add">${icon('plus')}Adicionar exercício</button>
      </div>
      <label class="field"><span>Observações</span><textarea name="notes" rows="2">${esc(t.notes || '')}</textarea></label>
    </form>`,
    footer: `${!isNew ? `<button class="btn ghost danger-text" id="tp-del">${icon('trash')}Excluir treino</button>` : ''}<span class="sp"></span><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="tp-save">${icon('check')}Salvar treino</button>`,
    onMount(root, api) {
      const list = $('#ex-list', root);
      $('#ex-add', root).addEventListener('click', () => { list.insertAdjacentHTML('beforeend', exerciseRow()); $('.ex-row:last-child .ex-name', list).focus(); });
      list.addEventListener('click', e => {
        const row = e.target.closest('.ex-row'); if (!row) return;
        if (e.target.closest('[data-rm]')) row.remove();
        if (e.target.closest('[data-up]') && row.previousElementSibling) row.parentNode.insertBefore(row, row.previousElementSibling);
      });
      $('#tp-save', root).addEventListener('click', () => {
        const form = $('#tp-form', root);
        const f = formData(form);
        if (!f.name) { toast('Dê um nome ao treino.', 'error'); return; }
        const days = $$('[data-day]', root).filter(c => c.checked).map(c => Number(c.dataset.day));
        const exercises = $$('.ex-row', list).map(r => {
          const o = {}; $$('input[data-k]', r).forEach(i => o[i.dataset.k] = i.value.trim()); return o;
        }).filter(x => x.name);
        const data = { name: f.name, type: f.type, color: $('input[name=color]:checked', root) ? $('input[name=color]:checked', root).value : 'rose', days, time: f.time, duration: f.duration ? Number(f.duration) : null, description: f.description, notes: f.notes, exercises };
        Store.update(s => {
          if (isNew) s.workouts.templates.push(Object.assign({ id: uid('tp'), createdAt: D.today() }, data));
          else Object.assign(s.workouts.templates.find(x => x.id === tpl.id), data);
        });
        api.close(); toast(isNew ? 'Treino criado. Ele já aparece no calendário.' : 'Treino atualizado.');
      });
      const del = $('#tp-del', root);
      del && del.addEventListener('click', async () => {
        if (await confirmDialog({ title: 'Excluir treino', message: `Excluir “${esc(t.name)}”? O histórico de treinos concluídos será mantido.`, confirmText: 'Excluir', danger: true })) {
          Store.update(s => { s.workouts.templates = s.workouts.templates.filter(x => x.id !== tpl.id); });
          api.close(); toast('Treino excluído.');
        }
      });
    }
  });
}

/* ---------------- Item fixo da rotina diária ---------------- */
function openRoutineEditor(item) {
  const isNew = !item;
  const r = item ? clone(item) : { time: '08:00', title: '', days: [] };
  Modal.open({
    title: isNew ? 'Novo item da rotina' : 'Editar item da rotina', size: 'sm',
    body: `<form class="form" id="rt-form">
      <label class="field"><span>Atividade *</span><input name="title" value="${esc(r.title)}" placeholder="Ex.: Meditação, leitura, skincare"></label>
      <label class="field"><span>Horário</span><input type="time" name="time" value="${esc(r.time)}"></label>
      <div class="field"><span>Dias (vazio = todos os dias)</span><div class="daychips">${D.wdShort.map((d, i) => `<label><input type="checkbox" data-day="${i}" ${r.days.includes(i) ? 'checked' : ''}><span>${d}</span></label>`).join('')}</div></div>
    </form>`,
    footer: `${!isNew ? `<button class="btn ghost danger-text" id="rt-del">${icon('trash')}Excluir</button>` : ''}<span class="sp"></span><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="rt-save">Salvar</button>`,
    onMount(root, api) {
      $('#rt-save', root).addEventListener('click', () => {
        const f = formData($('#rt-form', root));
        if (!f.title) { toast('Informe a atividade.', 'error'); return; }
        const days = $$('[data-day]', root).filter(c => c.checked).map(c => Number(c.dataset.day));
        Store.update(s => {
          if (isNew) s.routine.push({ id: uid('rt'), title: f.title, time: f.time, days });
          else Object.assign(s.routine.find(x => x.id === item.id), { title: f.title, time: f.time, days });
        });
        api.close(); toast('Rotina atualizada.');
      });
      const del = $('#rt-del', root);
      del && del.addEventListener('click', () => { Store.update(s => { s.routine = s.routine.filter(x => x.id !== item.id); }); api.close(); toast('Item removido da rotina.'); });
    }
  });
}

/* ---------------- Detalhes de um dia (usado pelo calendário e pelo painel) ---------------- */
function dayItems(k, { tasks = true, events = true, workouts = true } = {}) {
  const out = [];
  if (events) Sel.eventsOn(k).forEach(e => out.push({ kind: 'event', time: e.allDay ? '' : e.start, end: e.end, title: e.title, cat: Sel.cat(e.category), ref: e, done: !!e.done }));
  if (workouts) Sel.workoutsOn(k).forEach(w => out.push({ kind: 'workout', time: w.template.time, title: w.template.name, cat: Sel.cat('treino'), ref: w, done: !!w.log, color: w.template.color ? workoutColor(w.template) : null }));
  if (tasks) Sel.tasksDueOn(k).forEach(t => out.push({ kind: 'task', time: t.time, title: t.title, cat: Sel.cat(t.category), ref: t, done: t.status === 'done' }));
  return out.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
}

function openDayModal(k) {
  const render = () => {
    const items = dayItems(k);
    return items.length ? `<ul class="day-list">${items.map(it => `
      <li class="day-item ${it.done ? 'is-done' : ''}" data-kind="${it.kind}" data-id="${esc(it.kind === 'workout' ? it.ref.template.id : it.ref.id)}">
        <i class="dot" style="background:${it.color || it.cat.color}"></i>
        <div class="di-time">${it.time ? esc(it.time) : 'Dia todo'}</div>
        <div class="di-main"><b>${esc(it.title)}</b><span>${it.kind === 'task' ? 'Tarefa' : it.kind === 'workout' ? 'Treino' : esc(it.cat.name)}${it.kind === 'event' && it.ref.end ? ' · até ' + esc(it.ref.end) : ''}${it.done ? ' · ✓ concluído' : ''}</span>
        ${it.kind === 'event' && it.ref.description ? `<p>${esc(it.ref.description)}</p>` : ''}</div>
        ${it.kind === 'task' ? `<button class="check ${it.done ? 'on' : ''}" data-toggle aria-label="Concluir tarefa">${icon('check')}</button>` : `<span class="chev">${icon('right')}</span>`}
      </li>`).join('')}</ul>` : emptyState(emptyArt('calendar'), 'Dia livre', 'Nenhum compromisso, tarefa ou treino para este dia.');
  };
  let off = null;
  const m = Modal.open({
    title: D.long(k).replace(/^./, c => c.toUpperCase()), size: 'md',
    onClose: () => off && off(),
    body: `<div id="day-body">${render()}</div>`,
    footer: `<button class="btn ghost" id="dm-task">${icon('tasks')}Nova tarefa</button><span class="sp"></span><button class="btn primary" id="dm-ev">${icon('plus')}Novo compromisso</button>`,
    onMount(root, api) {
      const body = $('#day-body', root);
      const refresh = () => { if (document.body.contains(root)) body.innerHTML = render(); };
      off = Store.on(refresh);
      body.addEventListener('click', e => {
        const li = e.target.closest('.day-item'); if (!li) return;
        const { kind, id } = li.dataset;
        if (kind === 'task' && e.target.closest('[data-toggle]')) { toggleTask(id); return; }
        if (kind === 'task') openTaskEditor(Store.state.tasks.find(t => t.id === id));
        if (kind === 'event') openEventEditor(Store.state.events.find(t => t.id === id));
        if (kind === 'workout') openWorkoutDetail(id, k);
      });
      $('#dm-ev', root).addEventListener('click', () => openEventEditor(null, { date: k }));
      $('#dm-task', root).addEventListener('click', () => openTaskEditor(null, { date: k }));
    }
  });
  return m;
}
