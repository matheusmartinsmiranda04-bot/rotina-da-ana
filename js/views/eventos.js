/* Rotina da Ana — Eventos e compromissos */
'use strict';

Views.eventos = {
  q: '', cat: '', showPast: false,
  render(root) {
    const k = D.today();
    const all = Store.state.events.filter(e => (!this.cat || e.category === this.cat) && (!this.q || (e.title + ' ' + (e.description || '')).toLowerCase().includes(this.q.toLowerCase())))
      .sort((a, b) => (a.date + (a.start || '')).localeCompare(b.date + (b.start || '')));
    const today = all.filter(e => e.date === k || (e.endDate && e.date <= k && e.endDate >= k));
    const week = all.filter(e => e.date > k && e.date <= D.add(k, 7));
    const later = all.filter(e => e.date > D.add(k, 7));
    const past = all.filter(e => (e.endDate || e.date) < k).reverse();
    const counts = { total: Store.state.events.length, month: Store.state.events.filter(e => e.date.slice(0, 7) === k.slice(0, 7)).length, done: Store.state.events.filter(e => e.done).length };
    const group = (title, arr, cls = '') => arr.length ? `<section class="ev-group ${cls}"><h4 class="group-t">${title} <span>${arr.length}</span></h4><div class="ev-cards">${arr.map(e => this.card(e)).join('')}</div></section>` : '';
    root.innerHTML = `
      <div class="page-head">
        <div><p class="eyebrow">${icon('events')} Agenda</p><h2>Compromissos e eventos</h2></div>
        <button class="btn primary" id="ev-new">${icon('plus')}Novo compromisso</button>
      </div>
      <div class="mini-stats">
        <div><b>${counts.month}</b><span>neste mês</span></div><div><b>${week.length + today.length}</b><span>nos próximos 7 dias</span></div><div><b>${counts.done}</b><span>realizados</span></div>
      </div>
      <div class="card">
        <div class="toolbar">
          <label class="search">${icon('search')}<input id="ev-q" placeholder="Buscar compromisso" value="${esc(this.q)}"></label>
          <select id="ev-cat" aria-label="Filtrar por categoria">${selectOptions([{ value: '', label: 'Todas as categorias' }].concat(Sel.catOptions()), this.cat)}</select>
        </div>
        ${all.length ? `
          ${group('Hoje', today, 'today')}
          ${group('Próximos 7 dias', week)}
          ${group('Mais adiante', later)}
          ${past.length ? `<button class="btn ghost sm" id="ev-past">${icon(this.showPast ? 'left' : 'history')}${this.showPast ? 'Ocultar' : 'Mostrar'} compromissos passados (${past.length})</button>${this.showPast ? group('Passados', past, 'past') : ''}` : ''}
          ${!today.length && !week.length && !later.length && !this.showPast ? '<p class="muted-p">Nenhum compromisso futuro com esses filtros.</p>' : ''}`
        : emptyState(emptyArt('calendar'), 'Nenhum compromisso', 'Adicione consultas, aniversários, reuniões e tudo o que não pode esquecer.', `<button class="btn primary" data-new>${icon('plus')}Adicionar</button>`)}
      </div>`;
    $('#ev-new', root).addEventListener('click', () => openEventEditor(null));
    const q = $('#ev-q', root);
    q.addEventListener('change', () => { this.q = q.value; this.render(root); });
    q.addEventListener('keyup', e => { if (e.key === 'Enter') { this.q = q.value; this.render(root); } });
    $('#ev-cat', root).addEventListener('change', e => { this.cat = e.target.value; this.render(root); });
    const p = $('#ev-past', root); p && p.addEventListener('click', () => { this.showPast = !this.showPast; this.render(root); });
    root.querySelector('.card').addEventListener('click', e => {
      if (e.target.closest('[data-new]')) { openEventEditor(null); return; }
      const c = e.target.closest('[data-ev]'); if (!c) return;
      const ev = Store.state.events.find(x => x.id === c.dataset.ev);
      if (e.target.closest('[data-done]')) { const was = !!ev.done; Store.update(s => { const x = s.events.find(i => i.id === ev.id); x.done = !was; }); toast(was ? 'Marcado como não realizado.' : 'Compromisso realizado ✓'); }
      else openEventEditor(ev);
    });
  },
  card(e) {
    const c = Sel.cat(e.category), d = D.parse(e.date);
    return `<article class="ev-card ${e.done ? 'is-done' : ''}" data-ev="${esc(e.id)}" style="--c:${c.color}" tabindex="0">
      <div class="ev-date"><b>${d.getDate()}</b><em>${D.months[d.getMonth()].slice(0, 3)}</em><small>${D.wdShort[d.getDay()]}</small></div>
      <div class="ev-info">
        <b>${esc(e.title)}</b>
        <span>${icon('clock')}${e.allDay ? 'Dia inteiro' : esc(e.start || '') + (e.end ? ' – ' + esc(e.end) : '')}${e.endDate ? ' · até ' + D.short(e.endDate) : ''}${e.reminder !== '' && e.reminder !== undefined && e.reminder !== null ? ' · ' + icon('bell') : ''}</span>
        ${e.description ? `<p>${esc(e.description)}</p>` : ''}
      </div>
      <div class="ev-side"><span class="tag" style="--c:${c.color}">${icon(c.icon || 'tag')}${esc(c.name)}</span>
        <button class="check ${e.done ? 'on' : ''}" data-done aria-label="${e.done ? 'Desmarcar realizado' : 'Marcar como realizado'}" title="Realizado">${icon('check')}</button></div>
    </article>`;
  }
};
