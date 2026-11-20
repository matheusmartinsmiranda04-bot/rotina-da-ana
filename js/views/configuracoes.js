/* Rotina da Ana — Configurações, personalização, metas e backup */
'use strict';

Views.configuracoes = {
  render(root) {
    const st = Store.state, s = st.settings, g = st.nutrition.goals, prof = st.profile || {};
    let usedKb = 0; try { usedKb = Math.round((localStorage.getItem(STORAGE_KEY) || '').length / 1024); } catch (e) { /* */ }
    root.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">${icon('settings')} Personalização</p><h2>Configurações</h2></div></div>
      <div class="settings">
        <section class="card">
          <div class="card-head"><h3>${icon('user')}Perfil</h3></div>
          <div class="profile-row">
            <div class="avatar-big">${avatarHtml(s.avatar, 84)}</div>
            <div class="grow">
              <label class="field"><span>Nome exibido</span><div class="row-gap"><input id="cf-name" value="${esc(s.name)}" maxlength="40"><button class="btn primary sm" id="cf-name-save">Salvar</button></div></label>
              <div class="field"><span>Avatar</span><div class="avatar-pick">${[1, 2, 3, 4].map(n => `<button class="${s.avatar === 'preset:' + n ? 'on' : ''}" data-av="preset:${n}" aria-label="Avatar ${n}">${avatarHtml('preset:' + n, 44)}</button>`).join('')}
                <button class="btn ghost sm" id="cf-photo">${icon('camera')}Usar foto</button></div></div>
            </div>
          </div>
          ${Object.keys(prof).length ? `<div class="profile-info">${[['Nome', prof.fullName], ['Idade', prof.age], ['Altura', prof.height], ['Peso', prof.weight], ['Objetivo', prof.goal], ['Meta', prof.target], ['Nível de atividade', prof.activityLevel], ['Treinos', prof.trainingPerWeek], ['Data do plano', prof.planDate]].filter(x => x[1]).map(([l, v]) => `<div><span>${l}</span><b>${esc(v)}</b></div>`).join('')}</div>
            ${prof.source ? `<p class="muted-p sm">${esc(prof.source)}</p>` : ''}` : ''}
        </section>

        <section class="card">
          <div class="card-head"><h3>${icon('sun')}Aparência</h3></div>
          <div class="theme-pick">${[['light', 'sun', 'Tema claro'], ['dark', 'moon', 'Tema escuro'], ['auto', 'refresh', 'Automático']].map(([v, ic, l]) => `<button class="${s.theme === v ? 'on' : ''}" data-theme="${v}">${icon(ic)}<span>${l}</span></button>`).join('')}</div>
          <label class="switch"><input type="checkbox" id="cf-notif" ${s.notifications ? 'checked' : ''}><i></i><span>Avisos do sistema para lembretes (enquanto o app estiver aberto)</span></label>
          ${App.deferredInstall ? `<button class="btn soft" id="cf-install">${icon('install')}Instalar como aplicativo</button>` : `<p class="muted-p sm">${icon('install')} Para instalar como aplicativo, use o Chrome/Edge pelo endereço http://localhost:8787 (ou GitHub Pages) e clique no ícone de instalação da barra de endereço.</p>`}
        </section>

        <section class="card">
          <div class="card-head"><h3>${icon('target')}Metas</h3></div>
          <div class="grid3">
            <label class="field"><span>Calorias por dia (kcal)</span><input type="number" min="0" id="g-kcal" value="${g.kcal ?? ''}" placeholder="não informado"></label>
            <label class="field"><span>Proteínas (g)</span><input type="number" min="0" id="g-protein" value="${g.protein ?? ''}" placeholder="não informado"></label>
            <label class="field"><span>Carboidratos (g)</span><input type="number" min="0" id="g-carbs" value="${g.carbs ?? ''}" placeholder="não informado"></label>
            <label class="field"><span>Gorduras (g)</span><input type="number" min="0" id="g-fat" value="${g.fat ?? ''}" placeholder="não informado"></label>
            <label class="field"><span>Água por dia (ml)</span><input type="number" min="0" step="250" id="g-water" value="${g.waterMl ?? ''}"></label>
            <label class="field"><span>Treinos por semana</span><input type="number" min="0" max="14" id="g-wk" value="${s.goals.workoutsPerWeek ?? ''}"></label>
          </div>
          <p class="muted-p sm">Deixe em branco o que o seu plano alimentar não informa; as metas podem ser preenchidas quando sua nutricionista/consultora definir.</p>
          <div class="row-gap end"><button class="btn primary sm" id="g-save">${icon('check')}Salvar metas</button></div>
        </section>

        <section class="card">
          <div class="card-head"><h3>${icon('clock')}Horários</h3></div>
          <h4 class="group-t">Refeições</h4>
          ${st.nutrition.meals.length ? `<div class="time-list">${st.nutrition.meals.map(m => `<label><span>${esc(m.name)}</span><input type="time" data-mealtime="${esc(m.id)}" value="${esc(m.time || '')}"></label>`).join('')}</div>` : '<p class="muted-p sm">Nenhuma refeição cadastrada.</p>'}
          <h4 class="group-t">Treinos</h4>
          ${st.workouts.templates.length ? `<div class="time-list">${st.workouts.templates.map(t => `<label><span>${esc(t.name)}</span><input type="time" data-wktime="${esc(t.id)}" value="${esc(t.time || '')}"></label>`).join('')}</div>` : '<p class="muted-p sm">Nenhum treino cadastrado.</p>'}
          <div class="row-gap end"><button class="btn primary sm" id="times-save">${icon('check')}Salvar horários</button></div>
          <h4 class="group-t">Itens fixos da rotina <span>${st.routine.length}</span></h4>
          ${st.routine.length ? `<ul class="simple-list">${st.routine.slice().sort((x, y) => (x.time || '').localeCompare(y.time || '')).map(r => `<li><b>${esc(r.time)}</b><span>${esc(r.title)}</span><em>${r.days && r.days.length ? r.days.map(d => D.wdShort[d]).join(', ') : 'todos os dias'}</em><button class="icon-btn sm" data-rt="${esc(r.id)}" aria-label="Editar">${icon('edit')}</button></li>`).join('')}</ul>` : '<p class="muted-p sm">Adicione hábitos com horário (ex.: skincare, leitura) para aparecerem na linha do tempo.</p>'}
          <button class="btn soft sm" id="rt-new">${icon('plus')}Novo item da rotina</button>
        </section>

        <section class="card">
          <div class="card-head"><h3>${icon('tag')}Categorias</h3></div>
          <ul class="cat-list">${s.categories.map(c => `<li data-cat="${esc(c.id)}"><input type="color" value="${esc(c.color)}" data-cc aria-label="Cor"><input value="${esc(c.name)}" data-cn aria-label="Nome" maxlength="30">
            ${c.id !== 'outros' ? `<button class="icon-btn sm" data-cdel aria-label="Excluir categoria">${icon('trash')}</button>` : '<span class="muted sm">padrão</span>'}</li>`).join('')}</ul>
          <div class="row-gap"><button class="btn soft sm" id="cat-add">${icon('plus')}Nova categoria</button><span class="sp"></span><button class="btn primary sm" id="cat-save">${icon('check')}Salvar categorias</button></div>
        </section>

        <section class="card">
          <div class="card-head"><h3>${icon('heart')}Hábitos</h3></div>
          <ul class="simple-list">${st.habits.map(h => `<li>${icon(h.icon || 'sparkles')}<span>${esc(h.name)}</span><em>${h.auto === 'water' ? 'automático (água)' : ''}</em><button class="icon-btn sm" data-hdel="${esc(h.id)}" aria-label="Excluir hábito">${icon('trash')}</button></li>`).join('') || '<li class="muted">Nenhum hábito.</li>'}</ul>
          <div class="row-gap"><input id="h-name" placeholder="Ex.: Dormir 8 horas, ler 10 páginas" maxlength="50" class="grow"><button class="btn soft sm" id="h-add">${icon('plus')}Adicionar</button></div>
        </section>

        <section class="card danger-zone">
          <div class="card-head"><h3>${icon('download')}Backup e dados</h3><span class="muted sm">${usedKb} KB usados neste navegador</span></div>
          <p class="muted-p">Seus dados ficam salvos <b>somente neste navegador</b>. Faça backups regulares (por exemplo, uma vez por semana) e guarde o arquivo em local seguro.</p>
          <div class="btn-grid">
            <button class="btn primary" id="bk-export">${icon('download')}Exportar backup</button>
            <button class="btn soft" id="bk-import">${icon('upload')}Importar backup</button>
            <button class="btn ghost" id="bk-seed">${icon('refresh')}Restaurar dados iniciais</button>
            <button class="btn ghost danger-text" id="bk-reset">${icon('trash')}Apagar todos os dados</button>
          </div>
          <p class="muted-p sm">“Restaurar dados iniciais” recarrega o plano alimentar, os treinos e os compromissos do arquivo <i>rotina-da-ana-dados-iniciais.json</i>, sem apagar tarefas e registros.</p>
        </section>
      </div>`;
    this.bind(root);
  },
  bind(root) {
    $('#cf-name-save', root).addEventListener('click', () => { const v = $('#cf-name', root).value.trim(); if (!v) { toast('Informe um nome.', 'error'); return; } Store.update(s => { s.settings.name = v; }); toast('Nome atualizado.'); });
    $$('[data-av]', root).forEach(b => b.addEventListener('click', () => Store.update(s => { s.settings.avatar = b.dataset.av; })));
    $('#cf-photo', root).addEventListener('click', async () => {
      const f = await pickFile('image/*'); if (!f) return;
      try { const data = await resizeImage(f, 200, 0.85); Store.update(s => { s.settings.avatar = data; }); toast('Foto atualizada.'); } catch (e) { toast('Não foi possível usar esta imagem.', 'error'); }
    });
    $$('[data-theme]', root).forEach(b => b.addEventListener('click', () => { Store.update(s => { s.settings.theme = b.dataset.theme; }); App.applyTheme(); }));
    $('#cf-notif', root).addEventListener('change', async e => {
      if (e.target.checked && 'Notification' in window && Notification.permission !== 'granted') {
        const r = await Notification.requestPermission();
        if (r !== 'granted') { e.target.checked = false; toast('O navegador não autorizou avisos.', 'info'); return; }
      }
      Store.update(s => { s.settings.notifications = e.target.checked; });
      toast(e.target.checked ? 'Avisos ativados.' : 'Avisos desativados.', 'info');
    });
    const inst = $('#cf-install', root); inst && inst.addEventListener('click', () => App.promptInstall());
    $('#g-save', root).addEventListener('click', () => {
      const num = id => { const v = $(id, root).value.trim(); return v === '' ? null : Math.max(0, Number(v)); };
      Store.update(s => {
        Object.assign(s.nutrition.goals, { kcal: num('#g-kcal'), protein: num('#g-protein'), carbs: num('#g-carbs'), fat: num('#g-fat'), waterMl: num('#g-water') || 2000 });
        s.settings.goals.workoutsPerWeek = num('#g-wk');
      });
      toast('Metas salvas.');
    });
    $('#times-save', root).addEventListener('click', () => {
      Store.update(s => {
        $$('[data-mealtime]', root).forEach(i => { const m = s.nutrition.meals.find(x => x.id === i.dataset.mealtime); if (m) m.time = i.value; });
        s.nutrition.meals.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        $$('[data-wktime]', root).forEach(i => { const t = s.workouts.templates.find(x => x.id === i.dataset.wktime); if (t) t.time = i.value; });
      });
      toast('Horários salvos.');
    });
    $('#rt-new', root).addEventListener('click', () => openRoutineEditor(null));
    $$('[data-rt]', root).forEach(b => b.addEventListener('click', () => openRoutineEditor(Store.state.routine.find(r => r.id === b.dataset.rt))));
    $('#cat-add', root).addEventListener('click', () => {
      $('.cat-list', root).insertAdjacentHTML('beforeend', `<li data-cat="new"><input type="color" value="#C8B6E2" data-cc aria-label="Cor"><input value="" data-cn placeholder="Nome da categoria" maxlength="30"><button class="icon-btn sm" data-cdel aria-label="Remover">${icon('trash')}</button></li>`);
      $('.cat-list li:last-child [data-cn]', root).focus();
    });
    $('.cat-list', root).addEventListener('click', async e => {
      const del = e.target.closest('[data-cdel]'); if (!del) return;
      const li = del.closest('li'), id = li.dataset.cat;
      if (id === 'new') { li.remove(); return; }
      const used = Store.state.events.filter(x => x.category === id).length + Store.state.tasks.filter(x => x.category === id).length;
      if (await confirmDialog({ title: 'Excluir categoria', message: used ? `${used} item(ns) usam esta categoria e passarão para “Outros”. Continuar?` : 'Excluir esta categoria?', confirmText: 'Excluir', danger: true })) {
        Store.update(s => {
          s.settings.categories = s.settings.categories.filter(c => c.id !== id);
          s.events.forEach(x => { if (x.category === id) x.category = 'outros'; });
          s.tasks.forEach(x => { if (x.category === id) x.category = 'outros'; });
        });
        toast('Categoria excluída.');
      }
    });
    $('#cat-save', root).addEventListener('click', () => {
      const rows = $$('.cat-list li', root);
      if (rows.some(li => !$('[data-cn]', li).value.trim())) { toast('Todas as categorias precisam de nome.', 'error'); return; }
      Store.update(s => {
        rows.forEach(li => {
          const name = $('[data-cn]', li).value.trim(), color = $('[data-cc]', li).value;
          if (li.dataset.cat === 'new') s.settings.categories.push({ id: uid('cat'), name, color, icon: 'tag' });
          else { const c = s.settings.categories.find(x => x.id === li.dataset.cat); if (c) Object.assign(c, { name, color }); }
        });
      });
      toast('Categorias salvas.');
    });
    $('#h-add', root).addEventListener('click', () => {
      const v = $('#h-name', root).value.trim(); if (!v) { toast('Escreva o hábito.', 'error'); return; }
      Store.update(s => { s.habits.push({ id: uid('h'), name: v, icon: 'sparkles' }); }); toast('Hábito adicionado.');
    });
    $('#h-name', root).addEventListener('keydown', e => { if (e.key === 'Enter') $('#h-add', root).click(); });
    $$('[data-hdel]', root).forEach(b => b.addEventListener('click', async () => {
      if (await confirmDialog({ title: 'Excluir hábito', message: 'Excluir este hábito? O histórico de marcações dele deixará de aparecer.', confirmText: 'Excluir', danger: true })) Store.update(s => { s.habits = s.habits.filter(h => h.id !== b.dataset.hdel); });
    }));
    $('#bk-export', root).addEventListener('click', () => { downloadFile(`rotina-da-ana_backup_${D.today()}.json`, Store.exportBackup()); toast('Backup exportado. Guarde o arquivo em local seguro.'); });
    $('#bk-import', root).addEventListener('click', async () => {
      const f = await pickFile('.json,application/json'); if (!f) return;
      let obj; try { obj = Store.parseImport(await f.text()); } catch (e) { toast(e.message || 'Arquivo inválido.', 'error', 5000); return; }
      if (obj.kind === 'seed') { Store.applySeed(obj); toast('Dados iniciais importados.'); return; }
      if (obj.kind !== 'backup') { toast('Este arquivo é um relatório, não um backup. Use “Exportar backup” para gerar um backup.', 'error', 6000); return; }
      if (await confirmDialog({ title: 'Importar backup', message: `Substituir todos os dados atuais pelo backup de <b>${obj.exportedAt ? new Date(obj.exportedAt).toLocaleString('pt-BR') : 'data desconhecida'}</b>? Recomendo exportar um backup do estado atual antes.`, confirmText: 'Substituir dados', danger: true })) {
        Store.replace(obj.data); App.applyTheme(); toast('Backup restaurado com sucesso.');
      }
    });
    $('#bk-seed', root).addEventListener('click', async () => {
      let seed = null;
      if (location.protocol.startsWith('http')) { try { const r = await fetch('dados-iniciais/rotina-da-ana-dados-iniciais.json', { cache: 'no-store' }); if (r.ok) seed = await r.json(); } catch (e) { /* */ } }
      if (!seed) {
        toast('Escolha o arquivo rotina-da-ana-dados-iniciais.json.', 'info');
        const f = await pickFile('.json,application/json'); if (!f) return;
        try { seed = Store.parseImport(await f.text()); } catch (e) { toast('Arquivo inválido.', 'error'); return; }
      }
      if (await confirmDialog({ title: 'Restaurar dados iniciais', message: 'O plano alimentar será recarregado do arquivo (edições nas refeições serão substituídas). Treinos e compromissos que faltarem serão recriados. Tarefas, registros e histórico são mantidos.', confirmText: 'Restaurar' })) {
        Store.applySeed(seed); toast('Dados iniciais restaurados.');
      }
    });
    $('#bk-reset', root).addEventListener('click', async () => {
      if (await confirmDialog({ title: 'Apagar todos os dados', message: 'Isso apaga <b>tudo</b>: tarefas, compromissos, treinos, alimentação, hábitos e configurações deste navegador. Não pode ser desfeito. Exporte um backup antes!', confirmText: 'Apagar tudo', danger: true, requireText: 'APAGAR' })) {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* */ }
        Store.state = normalize(null); Store.emit(); App.applyTheme();
        toast('Dados apagados.', 'info');
        setTimeout(() => location.reload(), 900);
      }
    });
  }
};
