/* Rotina da Ana — Alimentação: diário alimentar, macronutrientes, água e histórico */
'use strict';

const MACROS = [
  { key: 'protein', label: 'Proteínas', short: 'P', color: 'var(--rose-d)', hex: '#D98A9B', kcalPerG: 4 },
  { key: 'carbs', label: 'Carboidratos', short: 'C', color: 'var(--butter-d)', hex: '#E0B45C', kcalPerG: 4 },
  { key: 'fat', label: 'Gorduras', short: 'G', color: 'var(--lav-d)', hex: '#9D86D6', kcalPerG: 9 }
];
const FACTORS = [{ value: '0.5', label: '½ porção' }, { value: '1', label: '1 porção' }, { value: '1.5', label: '1½ porção' }, { value: '2', label: '2 porções' }];

function fmtQty(it, f = 1) {
  if (it.qty === null || it.qty === undefined || it.qty === '') return it.unit || '';
  return fmtNum(Number(it.qty) * f, 1) + ' ' + (it.unit || '');
}
function macroLine(it, f = 1) {
  if (it.kcal === null && it.protein === null && it.carbs === null && it.fat === null) return '<span class="ni">Valores nutricionais não informados</span>';
  const v = (x) => x === null ? 'n/i' : fmtNum(x * f, 1);
  return `<span>${v(it.kcal)} kcal</span><span>P ${v(it.protein)} g</span><span>C ${v(it.carbs)} g</span><span>G ${v(it.fat)} g</span>${it.source === 'referencia' ? '<em title="Estimado pela tabela de referência">estimado</em>' : ''}`;
}
function ensureLog(s, k, mealId) {
  const day = s.nutrition.logs[k] || (s.nutrition.logs[k] = { meals: {}, waterMl: 0 });
  day.meals = day.meals || {};
  return day.meals[mealId] || (day.meals[mealId] = { optionId: null, done: false, items: {} });
}
function toggleMealDone(k, mealId) {
  const meal = Store.state.nutrition.meals.find(m => m.id === mealId); if (!meal) return;
  const opt = Sel.mealOption(meal, k);
  const was = !!(Sel.mealLog(k, mealId) && Sel.mealLog(k, mealId).done);
  Store.update(s => {
    const l = ensureLog(s, k, mealId);
    l.optionId = opt.id;
    l.done = !was;
    l.items = {};
  });
  toast(was ? meal.name + ' desmarcada.' : meal.name + ' registrada ✓', was ? 'info' : 'success');
}

Views.alimentacao = {
  date: null, tab: 'refeicoes',
  render(root) {
    if (!this.date) this.date = D.today();
    const k = this.date, st = Store.state, n = Sel.nutritionDay(k), goals = st.nutrition.goals;
    const meals = st.nutrition.meals;
    const miss = Sel.missingNutritionCount();
    const fillable = [];
    meals.forEach(m => m.options.forEach(o => o.items.forEach(it => { if (it.kcal === null && it.ref && it.grams && NUTRI_REF[it.ref]) fillable.push(it); })));
    const hasEstimates = meals.some(m => m.options.some(o => o.items.some(it => it.source === 'referencia')));

    const dist = MACROS.map(m => ({ label: m.label, value: round1(n.consumed[m.key] * m.kcalPerG), color: m.hex }));
    const distTotal = dist.reduce((a, b) => a + b.value, 0);

    root.innerHTML = `
      <div class="page-head">
        <div><p class="eyebrow">${icon('food')} Diário alimentar</p><h2>Alimentação</h2></div>
        <div class="date-nav">
          <button class="icon-btn" data-dnav="-1" aria-label="Dia anterior">${icon('left')}</button>
          <label class="date-pill">${icon('calendar')}<input type="date" id="nu-date" value="${k}" aria-label="Escolher data"><span>${esc(D.relative(k))}</span></label>
          <button class="icon-btn" data-dnav="1" aria-label="Próximo dia">${icon('right')}</button>
          ${k !== D.today() ? '<button class="btn ghost sm" data-dnav="0">Hoje</button>' : ''}
        </div>
      </div>

      ${!meals.length ? `<div class="card">${emptyState(emptyArt('food'), 'Nenhuma refeição cadastrada', 'Importe seu plano alimentar em Configurações ou crie suas refeições.', `<button class="btn primary" id="nu-newmeal2">${icon('plus')}Nova refeição</button>`)}</div>` : ''}

      ${meals.length && miss.missing ? `<div class="note-box warn">${icon('info')}<div><b>${miss.missing} de ${miss.total} alimentos estão sem valores nutricionais.</b>
        <span>Seu plano alimentar informa apenas a meta total (${goals.kcal ? fmtNum(goals.kcal) + ' kcal' : 'não informada'}). Você pode digitar os valores de cada alimento (botão editar da refeição) ou preencher automaticamente com estimativas da Tabela Brasileira de Composição de Alimentos (TACO).</span>
        <div class="row-gap">${fillable.length ? `<button class="btn soft sm" id="nu-fill">${icon('sparkles')}Preencher ${fillable.length} com estimativas TACO</button>` : ''}</div></div></div>` : ''}
      ${hasEstimates ? `<p class="hint">${icon('info')} Alguns valores são <b>estimativas</b> da tabela de referência (marcados como “estimado”). <button class="link-btn" id="nu-unfill">Remover estimativas</button></p>` : ''}

      ${meals.length ? `<section class="nu-summary">
        <div class="card kcal-card">
          ${Charts.ring(n.consumed.kcal, goals.kcal || n.planned.kcal || 1, { size: 150, stroke: 13, color: 'var(--rose-d)', label: n.consumed.known ? fmtNum(n.consumed.kcal) : '—', sub: goals.kcal ? 'de ' + fmtNum(goals.kcal) + ' kcal' : 'kcal' })}
          <div class="kcal-info"><h3>Calorias do dia</h3>
            <p>${n.consumed.known ? `${pct(n.consumed.kcal, goals.kcal || n.planned.kcal)}% da meta${goals.kcal ? '' : ' (planejado)'}` : 'Marque as refeições realizadas para calcular.'}</p>
            <p class="muted-p sm">Refeições: <b>${n.mealsDone}/${n.mealsTotal}</b>${n.consumed.missing ? ` · ${n.consumed.missing} alimento(s) consumido(s) sem dados` : ''}</p></div>
        </div>
        ${MACROS.map(m => { const goal = goals[m.key] || n.planned[m.key]; return `<div class="card macro-card">${Charts.ring(n.consumed[m.key], goal || 1, { size: 96, stroke: 9, color: m.color, label: n.consumed.known ? fmtNum(n.consumed[m.key]) + 'g' : '—', sub: m.label })}
          <span class="macro-goal">${goals[m.key] ? 'Meta ' + fmtNum(goals[m.key]) + ' g' : n.planned.known ? 'Planejado ' + fmtNum(n.planned[m.key]) + ' g' : 'Meta não informada'}</span></div>`; }).join('')}
        <div class="card water-card">
          <div class="card-head"><h3>${icon('droplet')}Água</h3><b>${fmtNum(n.water / 1000, 2)} / ${fmtNum((goals.waterMl || 2000) / 1000, 1)} L</b></div>
          <div class="cups">${Array.from({ length: Math.ceil((goals.waterMl || 2000) / 250) }, (_, i) => `<i class="${(i + 1) * 250 <= n.water ? 'on' : ''}"></i>`).join('')}</div>
          <div class="row-gap"><button class="btn ghost sm" data-water="-250" aria-label="Remover um copo">−</button><button class="btn soft sm" data-water="250">${icon('plus')}Copo 250 ml</button><button class="btn soft sm" data-water="500">+500 ml</button></div>
        </div>
      </section>

      <section class="grid-3 nu-charts">
        <div class="card"><div class="card-head"><h3>Distribuição dos macronutrientes</h3></div>
          ${distTotal ? `<div class="donut-wrap">${Charts.donut(dist, { center: fmtNum(distTotal), centerSub: 'kcal de macros' })}${Charts.legend(dist, ' kcal')}</div>` : `<p class="muted-p">Sem dados ainda: marque refeições com valores nutricionais preenchidos.</p>`}</div>
        <div class="card"><div class="card-head"><h3>Consumo por refeição</h3></div>
          ${n.consumed.known ? `<div class="macro-tabs">${MACROS.map(m => `<div><h4 style="color:${m.color}">${m.label}</h4>${Charts.hbars(n.perMeal.filter(pm => pm.consumed[m.key] > 0).map(pm => ({ label: pm.meal.name, value: pm.consumed[m.key], color: m.color })), { unit: ' g' }) || ''}${!n.perMeal.some(pm => pm.consumed[m.key] > 0) ? '<p class="muted-p sm">—</p>' : ''}</div>`).join('')}</div>` : '<p class="muted-p">Os gráficos de proteínas, carboidratos e gorduras aparecem quando houver refeições registradas com valores.</p>'}</div>
        <div class="card"><div class="card-head"><h3>Planejado x registrado</h3></div>
          ${n.planned.known ? `<div class="compare">${[{ key: 'kcal', label: 'Calorias', unit: ' kcal', color: 'var(--rose-d)', goal: goals.kcal }].concat(MACROS.map(m => ({ key: m.key, label: m.label, unit: ' g', color: m.color, goal: goals[m.key] }))).map(r => {
            const plan = r.goal || n.planned[r.key], max = Math.max(plan, n.consumed[r.key], 1);
            return `<div class="cmp-row"><div class="hbar-top"><span>${r.label}</span><b>${fmtNum(n.consumed[r.key])} / ${fmtNum(plan)}${r.unit}</b></div>
              <div class="hbar-track"><div class="hbar ghostbar" style="width:${plan / max * 100}%"></div><div class="hbar over" style="width:${n.consumed[r.key] / max * 100}%;background:${r.color}"></div></div>
              <span class="cmp-src">${r.goal ? 'meta definida' : 'cardápio escolhido'}</span></div>`; }).join('')}</div>`
            : '<p class="muted-p">A comparação aparece quando os alimentos tiverem valores nutricionais.</p>'}</div>
      </section>` : ''}

      ${meals.length ? `<div class="tabs">${[['refeicoes', 'Refeições'], ['historico', 'Histórico'], ['guia', 'Substituições e receitas']].map(([v, l]) => `<button class="${this.tab === v ? 'on' : ''}" data-tab="${v}">${l}</button>`).join('')}
        <span class="sp"></span><button class="btn ghost sm" id="nu-newmeal">${icon('plus')}Nova refeição</button></div>
      <div id="nu-body">${this.tab === 'refeicoes' ? this.mealsView(k, n) : this.tab === 'historico' ? this.historyView(k) : this.guideView()}</div>` : ''}`;

    this.bind(root, k);
  },

  mealsView(k, n) {
    return `<div class="meal-grid">${n.perMeal.map(pm => {
      const m = pm.meal, opt = pm.option, log = Sel.mealLog(k, m.id);
      const arts = opt.items.slice(0, 3).map(it => foodArt(it.img, 44, it.photo)).join('');
      return `<article class="meal-card ${pm.done ? 'is-done' : ''}" data-meal="${esc(m.id)}">
        <header class="meal-head">
          <div class="meal-arts">${arts}</div>
          <div class="meal-title"><span class="meal-time">${icon('clock')}${esc(m.time || '--:--')}</span><h3>${esc(m.name)}</h3></div>
          <button class="icon-btn sm" data-editmeal aria-label="Editar refeição">${icon('edit')}</button>
        </header>
        ${m.options.length > 1 ? `<div class="opt-tabs" role="tablist">${m.options.map(o => `<button class="${o.id === opt.id ? 'on' : ''}" data-opt="${esc(o.id)}">${esc(o.label)}</button>`).join('')}</div>` : ''}
        ${opt.note ? `<p class="meal-note">${esc(opt.note)}</p>` : ''}
        <ul class="food-list">${opt.items.map(it => {
          const f = Sel.itemFactor(k, m, opt, it), on = f > 0;
          return `<li class="food ${on ? 'eaten' : ''}" data-item="${esc(it.id)}">
            ${foodArt(it.img, 46, it.photo)}
            <div class="food-main"><b>${esc(it.name)}</b><span class="food-qty">${esc(fmtQty(it, on ? f : 1))}</span><span class="macros">${macroLine(it, on ? f : 1)}</span></div>
            <div class="food-ctl">
              ${on ? `<select data-factor aria-label="Quantidade consumida">${selectOptions(FACTORS, String(f))}</select>` : ''}
              <button class="check ${on ? 'on' : ''}" data-eat aria-label="${on ? 'Desmarcar' : 'Marcar como consumido'}">${icon('check')}</button>
            </div></li>`; }).join('')}</ul>
        <footer class="meal-foot">
          <span class="muted">${pm.planned.known ? fmtNum(pm.planned.kcal) + ' kcal planejadas' : 'kcal não informadas'}</span>
          <button class="btn ${pm.done ? 'soft done-btn' : 'primary'} sm" data-done>${icon('check')}${pm.done ? 'Realizada' : 'Marcar como realizada'}</button>
        </footer>
      </article>`; }).join('')}</div>`;
  },

  historyView(k) {
    const days = D.range(D.add(k, -6), k);
    const data = days.map(d => ({ d, n: Sel.nutritionDay(d) }));
    const n = Sel.nutritionDay(k);
    const done = n.perMeal.filter(pm => pm.done), notDone = n.perMeal.filter(pm => !pm.done);
    return `<div class="grid-2">
      <div class="card"><div class="card-head"><h3>${icon('flame')}Calorias registradas (7 dias)</h3></div>
        ${data.some(x => x.n.consumed.kcal) ? Charts.bars(data.map((x, i) => ({ label: D.wdShort[D.dow(x.d)], value: x.n.consumed.kcal, title: D.br(x.d) + ': ' + fmtNum(x.n.consumed.kcal) + ' kcal' })), { color: 'var(--rose)', height: 140, highlight: 6 }) : '<p class="muted-p">Sem calorias registradas nesta semana.</p>'}
        <div class="week-strip">${data.map(x => `<button class="${x.d === k ? 'on' : ''}" data-goto="${x.d}"><span>${D.wdShort[D.dow(x.d)]}</span><b>${D.parse(x.d).getDate()}</b><em>${x.n.mealsDone}/${x.n.mealsTotal}</em></button>`).join('')}</div>
      </div>
      <div class="card"><div class="card-head"><h3>${icon('list')}Resumo de ${esc(D.relative(k).toLowerCase())}</h3></div>
        <div class="big-nums"><div><b>${n.consumed.known ? fmtNum(n.consumed.kcal) : '—'}</b><span>kcal</span></div>${MACROS.map(m => `<div><b>${n.consumed.known ? fmtNum(n.consumed[m.key]) : '—'}</b><span>${m.label.toLowerCase()} (g)</span></div>`).join('')}</div>
        <h4 class="group-t">Refeições realizadas <span>${done.length}</span></h4>
        ${done.length ? `<ul class="hist-list">${done.map(pm => `<li><b>${esc(pm.meal.name)}</b> <em>${esc(pm.option.label)}</em><span>${pm.option.items.filter(it => Sel.itemFactor(k, pm.meal, pm.option, it) > 0).map(it => esc(it.name) + ' (' + esc(fmtQty(it, Sel.itemFactor(k, pm.meal, pm.option, it))) + ')').join(', ')}</span></li>`).join('')}</ul>` : '<p class="muted-p sm">Nenhuma refeição registrada.</p>'}
        <h4 class="group-t">Não realizadas <span>${notDone.length}</span></h4>
        ${notDone.length ? `<p class="muted-p sm">${notDone.map(pm => esc(pm.meal.name)).join(' · ')}</p>` : '<p class="muted-p sm">Todas realizadas! 🎉</p>'}
      </div></div>`;
  },

  guideView() {
    const x = Store.state.nutrition.extras;
    if (!x) return `<div class="card">${emptyState(emptyArt('food'), 'Sem guia alimentar', 'Importe seus dados iniciais para ver substituições, saladas e receitas do seu plano.')}</div>`;
    return `<div class="guide">
      <div class="card"><div class="card-head"><h3>${icon('refresh')}Lista de substituições</h3></div>
        <div class="subs-grid">${(x.substitutions || []).map(g => `<div class="subs-col"><h4>${esc(g.group)}</h4><p class="muted-p sm">${esc(g.hint || '')}</p><ul>${g.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}</div>
        ${x.preparation ? `<p class="muted-p sm"><b>Formas de preparo:</b> ${x.preparation.map(esc).join(', ')}</p>` : ''}</div>
      <div class="grid-2">
        <div class="card"><div class="card-head"><h3>${icon('leaf')}Variedades de saladas</h3></div>
          <div class="salads">${(x.salads || []).map(s => `<div class="salad">${foodArt('salad', 40)}<div><b>${esc(s.name)}</b><span>${s.items.map(esc).join(' · ')}</span></div></div>`).join('')}</div>
          ${x.dressings ? `<p class="muted-p sm">${esc(x.dressings)}</p>` : ''}</div>
        <div class="card"><div class="card-head"><h3>${icon('sparkles')}Suplementação e hidratação</h3></div>
          <ul class="plain-list">${(x.supplements || []).map(s => `<li>${foodArt(s.toLowerCase().includes('whey') ? 'whey' : 'creatine', 36)}<span>${esc(s)}</span></li>`).join('')}<li>${foodArt('milk', 36)}<span>${esc(x.hydration || '')}</span></li></ul>
          ${x.motto ? `<p class="motto">${esc(x.motto)}</p>` : ''}</div>
      </div>
      <div class="card"><div class="card-head"><h3>${icon('heart')}Receitas fitness</h3></div>
        <div class="recipes">${(x.recipes || []).map(r => `<details class="recipe"><summary><span class="tag" style="--c:var(--butter)">${esc(r.kind)}</span><b>${esc(r.name)}</b>${icon('right')}</summary>
          <div><h5>Ingredientes</h5><ul>${r.ingredients.map(i => `<li>${esc(i)}</li>`).join('')}</ul><h5>Preparo</h5><p>${esc(r.prep)}</p></div></details>`).join('')}</div></div>
    </div>`;
  },

  bind(root, k) {
    const go = d => { this.date = d; this.render(root); };
    $$('[data-dnav]', root).forEach(b => b.addEventListener('click', () => go(b.dataset.dnav === '0' ? D.today() : D.add(k, Number(b.dataset.dnav)))));
    const di = $('#nu-date', root); di && di.addEventListener('change', () => di.value && go(di.value));
    $$('[data-tab]', root).forEach(b => b.addEventListener('click', () => { this.tab = b.dataset.tab; this.render(root); }));
    [$('#nu-newmeal', root), $('#nu-newmeal2', root)].forEach(b => b && b.addEventListener('click', () => openMealEditor(null)));
    $$('[data-water]', root).forEach(b => b.addEventListener('click', () => Store.update(s => {
      const day = s.nutrition.logs[k] || (s.nutrition.logs[k] = { meals: {}, waterMl: 0 });
      day.waterMl = Math.max(0, (day.waterMl || 0) + Number(b.dataset.water));
    })));
    const fill = $('#nu-fill', root);
    fill && fill.addEventListener('click', async () => {
      const ok = await confirmDialog({ title: 'Preencher com estimativas', message: 'Os alimentos sem valores receberão <b>estimativas</b> calculadas pela Tabela Brasileira de Composição de Alimentos (TACO) e médias de rótulos, com base na quantidade em gramas de cada porção. Itens como “fruta”, “salada à vontade” e “brócolis” continuam sem valor, pois o plano não informa qual/quanto. Você pode editar ou remover as estimativas depois.', confirmText: 'Preencher' });
      if (!ok) return;
      let c = 0;
      Store.update(s => s.nutrition.meals.forEach(m => m.options.forEach(o => o.items.forEach(it => { if (it.kcal === null && fillFromReference(it)) c++; }))));
      toast(c + ' alimentos preenchidos com estimativas.');
    });
    const unfill = $('#nu-unfill', root);
    unfill && unfill.addEventListener('click', async () => {
      if (!await confirmDialog({ title: 'Remover estimativas', message: 'Os valores estimados voltarão a ficar como “não informado”. Valores digitados por você serão mantidos.', confirmText: 'Remover', danger: true })) return;
      Store.update(s => s.nutrition.meals.forEach(m => m.options.forEach(o => o.items.forEach(it => { if (it.source === 'referencia') { it.kcal = it.protein = it.carbs = it.fat = null; it.source = null; } }))));
      toast('Estimativas removidas.', 'info');
    });
    $$('[data-goto]', root).forEach(b => b.addEventListener('click', () => go(b.dataset.goto)));
    const body = $('#nu-body', root);
    if (!body) return;
    body.onclick = e => {
      const card = e.target.closest('[data-meal]'); if (!card) return;
      const meal = Store.state.nutrition.meals.find(m => m.id === card.dataset.meal); if (!meal) return;
      if (e.target.closest('[data-editmeal]')) { openMealEditor(meal); return; }
      if (e.target.closest('[data-done]')) { toggleMealDone(k, meal.id); return; }
      const ob = e.target.closest('[data-opt]');
      if (ob) {
        Store.update(s => { const l = ensureLog(s, k, meal.id); if (l.optionId !== ob.dataset.opt) { l.optionId = ob.dataset.opt; l.items = {}; } });
        return;
      }
      const eat = e.target.closest('[data-eat]');
      if (eat) {
        const itemId = eat.closest('[data-item]').dataset.item;
        const opt = Sel.mealOption(meal, k);
        const cur = Sel.itemFactor(k, meal, opt, opt.items.find(i => i.id === itemId));
        Store.update(s => {
          const l = ensureLog(s, k, meal.id);
          if (l.optionId !== opt.id) { l.optionId = opt.id; l.items = {}; l.done = false; }
          l.items[itemId] = cur > 0 ? 0 : 1;
          // refeição é considerada realizada quando todos os itens foram consumidos
          const allOn = opt.items.every(i => (l.items[i.id] !== undefined ? Number(l.items[i.id]) : (l.done ? 1 : 0)) > 0);
          const noneOn = opt.items.every(i => (l.items[i.id] !== undefined ? Number(l.items[i.id]) : (l.done ? 1 : 0)) === 0);
          if (allOn) l.done = true; if (noneOn) { l.done = false; l.items = {}; }
        });
      }
    };
    body.onchange = e => {
      const sel = e.target.closest('[data-factor]'); if (!sel) return;
      const card = sel.closest('[data-meal]'), itemId = sel.closest('[data-item]').dataset.item;
      const meal = Store.state.nutrition.meals.find(m => m.id === card.dataset.meal);
      const opt = Sel.mealOption(meal, k);
      Store.update(s => { const l = ensureLog(s, k, meal.id); l.optionId = opt.id; l.items[itemId] = Number(sel.value); });
    };
  }
};

/* ---------------- Editor de refeição (nome, horário, opções e alimentos) ---------------- */
function foodItemEditor(it) {
  return `<div class="fi-card" data-id="${esc(it.id)}">
    <div class="fi-top">
      <button type="button" class="fi-art" data-photo title="Trocar imagem">${foodArt(it.img, 52, it.photo)}<span>${icon('camera')}</span></button>
      <label class="field grow"><span>Alimento</span><input data-k="name" value="${esc(it.name || '')}" placeholder="Nome do alimento"></label>
      <button type="button" class="icon-btn sm" data-rmitem aria-label="Remover alimento">${icon('trash')}</button>
    </div>
    <div class="fi-grid">
      <label class="field"><span>Quantidade</span><input data-k="qty" type="number" step="any" min="0" value="${it.qty === null || it.qty === undefined ? '' : esc(it.qty)}" placeholder="—"></label>
      <label class="field"><span>Unidade</span><input data-k="unit" value="${esc(it.unit || '')}" placeholder="g, colher, unidade…"></label>
      <label class="field"><span>Peso (g/ml)</span><input data-k="grams" type="number" step="any" min="0" value="${it.grams === null || it.grams === undefined ? '' : esc(it.grams)}" placeholder="—"></label>
      <label class="field"><span>Calorias</span><input data-k="kcal" type="number" step="any" min="0" value="${it.kcal === null ? '' : esc(it.kcal)}" placeholder="não inf."></label>
      <label class="field"><span>Proteínas (g)</span><input data-k="protein" type="number" step="any" min="0" value="${it.protein === null ? '' : esc(it.protein)}" placeholder="não inf."></label>
      <label class="field"><span>Carboidratos (g)</span><input data-k="carbs" type="number" step="any" min="0" value="${it.carbs === null ? '' : esc(it.carbs)}" placeholder="não inf."></label>
      <label class="field"><span>Gorduras (g)</span><input data-k="fat" type="number" step="any" min="0" value="${it.fat === null ? '' : esc(it.fat)}" placeholder="não inf."></label>
      <label class="field"><span>Ilustração</span><select data-k="img">${selectOptions(FOOD_KEYS.map(k => ({ value: k, label: FOOD_LABELS[k] })), it.img || 'plate')}</select></label>
      <label class="field"><span>Referência (estimativa)</span><select data-k="ref">${selectOptions([{ value: '', label: 'Nenhuma' }].concat(Object.entries(NUTRI_REF).map(([k, r]) => ({ value: k, label: r.name }))), it.ref || '')}</select></label>
    </div>
    <div class="fi-actions"><button type="button" class="btn ghost xs" data-calc>${icon('sparkles')}Calcular pela referência</button>
      ${it.photo ? `<button type="button" class="btn ghost xs" data-rmphoto>${icon('x')}Remover foto</button>` : ''}
      <span class="muted sm">${it.source === 'referencia' ? 'valores estimados' : it.source === 'usuario' ? 'valores digitados' : ''}</span></div>
  </div>`;
}

function openMealEditor(meal) {
  const isNew = !meal;
  const m = meal ? clone(meal) : { id: uid('m'), name: '', time: '12:00', icon: 'plate', options: [{ id: uid('o'), label: 'Cardápio principal', note: '', items: [] }] };
  let active = 0;
  const readActive = root => {
    const o = m.options[active]; if (!o) return;
    const lbl = $('#me-optlabel', root), note = $('#me-optnote', root);
    if (lbl) o.label = lbl.value.trim() || o.label;
    if (note) o.note = note.value.trim();
    o.items = $$('.fi-card', root).map(card => {
      const old = o.items.find(x => x.id === card.dataset.id) || {};
      const it = Object.assign({}, old, { id: card.dataset.id });
      $$('[data-k]', card).forEach(inp => {
        const k = inp.dataset.k, v = inp.value.trim();
        if (['qty', 'grams', 'kcal', 'protein', 'carbs', 'fat'].includes(k)) it[k] = v === '' ? null : Number(v);
        else it[k] = v || (k === 'ref' ? null : '');
      });
      const changed = ['kcal', 'protein', 'carbs', 'fat'].some(k => it[k] !== (old[k] === undefined ? null : old[k]));
      if (changed) it.source = ['kcal', 'protein', 'carbs', 'fat'].every(k => it[k] === null) ? null : 'usuario';
      return it;
    }).filter(it => it.name);
  };
  const drawOptions = root => {
    const o = m.options[active];
    $('#me-opts', root).innerHTML = `<div class="opt-tabs">${m.options.map((x, i) => `<button type="button" class="${i === active ? 'on' : ''}" data-oi="${i}">${esc(x.label)}</button>`).join('')}<button type="button" class="add" data-addopt>${icon('plus')}Opção</button></div>
      <div class="grid2"><label class="field"><span>Nome da opção</span><input id="me-optlabel" value="${esc(o.label)}"></label>
      <label class="field"><span>Observação</span><input id="me-optnote" value="${esc(o.note || '')}" placeholder="Ex.: modo de preparo"></label></div>
      <div id="me-items">${o.items.map(foodItemEditor).join('')}</div>
      <div class="row-gap"><button type="button" class="btn soft sm" data-additem>${icon('plus')}Adicionar alimento</button>
      ${m.options.length > 1 ? `<button type="button" class="btn ghost sm danger-text" data-rmopt>${icon('trash')}Excluir esta opção</button>` : ''}</div>`;
  };
  Modal.open({
    title: isNew ? 'Nova refeição' : 'Editar ' + m.name, size: 'xl',
    body: `<form class="form" id="me-form" onsubmit="return false">
      <div class="grid2"><label class="field"><span>Nome da refeição *</span><input id="me-name" value="${esc(m.name)}" placeholder="Ex.: Café da manhã"></label>
      <label class="field"><span>Horário</span><input type="time" id="me-time" value="${esc(m.time || '')}"></label></div>
      <div id="me-opts"></div></form>`,
    footer: `${!isNew ? `<button class="btn ghost danger-text" id="me-del">${icon('trash')}Excluir refeição</button>` : ''}<span class="sp"></span><button class="btn ghost" data-close>Cancelar</button><button class="btn primary" id="me-save">${icon('check')}Salvar</button>`,
    onMount(root, api) {
      drawOptions(root);
      root.addEventListener('click', async e => {
        const oi = e.target.closest('[data-oi]');
        if (oi) { readActive(root); active = Number(oi.dataset.oi); drawOptions(root); return; }
        if (e.target.closest('[data-addopt]')) { readActive(root); m.options.push({ id: uid('o'), label: 'Opção ' + m.options.length, note: '', items: [] }); active = m.options.length - 1; drawOptions(root); return; }
        if (e.target.closest('[data-rmopt]')) { readActive(root); m.options.splice(active, 1); active = 0; drawOptions(root); return; }
        if (e.target.closest('[data-additem]')) { readActive(root); m.options[active].items.push({ id: uid('i'), name: '', qty: null, unit: '', grams: null, kcal: null, protein: null, carbs: null, fat: null, img: 'plate', ref: null, source: null }); drawOptions(root); const last = $$('.fi-card', root).pop(); last && $('[data-k=name]', last).focus(); return; }
        const card = e.target.closest('.fi-card'); if (!card) return;
        if (e.target.closest('[data-rmitem]')) { card.remove(); return; }
        if (e.target.closest('[data-calc]')) {
          readActive(root);
          const it = m.options[active].items.find(x => x.id === card.dataset.id) || { ref: $('[data-k=ref]', card).value, grams: Number($('[data-k=grams]', card).value) };
          if (!it.ref) { toast('Escolha um alimento de referência.', 'error'); return; }
          if (!it.grams) { toast('Informe o peso em gramas/ml da porção.', 'error'); return; }
          fillFromReference(it); drawOptions(root); toast('Valores estimados calculados.', 'info'); return;
        }
        if (e.target.closest('[data-rmphoto]')) { readActive(root); const it = m.options[active].items.find(x => x.id === card.dataset.id); if (it) delete it.photo; drawOptions(root); return; }
        if (e.target.closest('[data-photo]')) {
          const file = await pickFile('image/*'); if (!file) return;
          try { const data = await resizeImage(file, 160, 0.8); readActive(root); const it = m.options[active].items.find(x => x.id === card.dataset.id); if (it) { it.photo = data; drawOptions(root); } else toast('Dê um nome ao alimento antes de adicionar a foto.', 'error'); }
          catch (err) { toast('Não foi possível ler a imagem.', 'error'); }
        }
      });
      root.addEventListener('change', e => { if (e.target.matches('[data-k=img]')) { const card = e.target.closest('.fi-card'); $('.fi-art .food-art', card).outerHTML = foodArt(e.target.value, 52); } });
      $('#me-save', root).addEventListener('click', () => {
        readActive(root);
        const name = $('#me-name', root).value.trim();
        if (!name) { toast('Dê um nome à refeição.', 'error'); return; }
        m.name = name; m.time = $('#me-time', root).value;
        Store.update(s => {
          if (isNew) s.nutrition.meals.push(m);
          else { const i = s.nutrition.meals.findIndex(x => x.id === meal.id); s.nutrition.meals[i] = m; }
          s.nutrition.meals.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        });
        api.close(); toast(isNew ? 'Refeição criada.' : 'Refeição atualizada.');
      });
      const del = $('#me-del', root);
      del && del.addEventListener('click', async () => {
        if (await confirmDialog({ title: 'Excluir refeição', message: `Excluir “${esc(meal.name)}” e todas as suas opções?`, confirmText: 'Excluir', danger: true })) {
          Store.update(s => { s.nutrition.meals = s.nutrition.meals.filter(x => x.id !== meal.id); });
          api.close(); toast('Refeição excluída.');
        }
      });
    }
  });
}
