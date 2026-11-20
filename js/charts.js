/* Rotina da Ana — gráficos leves em SVG (sem dependências, funcionam offline) */
'use strict';

const Charts = {
  /* Anel de progresso */
  ring(value, max, { size = 120, stroke = 11, color = 'var(--rose-d)', label = '', sub = '', track = 'var(--track)' } = {}) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const p = max > 0 ? clamp(value / max, 0, 1) : 0;
    return `<div class="ring" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)} ${esc(sub)}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}" transform="rotate(-90 ${size / 2} ${size / 2})" class="ring-arc"/>
      </svg>
      <div class="ring-label"><b>${label}</b>${sub ? `<span>${sub}</span>` : ''}</div></div>`;
  },

  /* Rosca com segmentos [{label, value, color}] */
  donut(segs, { size = 170, stroke = 22, center = '', centerSub = '' } = {}) {
    const total = segs.reduce((a, s) => a + s.value, 0);
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    let off = 0;
    const gap = total > 0 && segs.filter(s => s.value > 0).length > 1 ? 3 : 0;
    const arcs = total > 0 ? segs.filter(s => s.value > 0).map(s => {
      const len = (s.value / total) * c;
      const a = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}"
        stroke-dasharray="${Math.max(len - gap, 0.1)} ${c}" stroke-dashoffset="${-off}" transform="rotate(-90 ${size / 2} ${size / 2})"><title>${esc(s.label)}: ${fmtNum(s.value, 1)}</title></circle>`;
      off += len; return a;
    }).join('') : '';
    return `<div class="donut" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Distribuição">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${stroke}"/>${arcs}
      </svg><div class="ring-label"><b>${center}</b>${centerSub ? `<span>${centerSub}</span>` : ''}</div></div>`;
  },

  legend(segs, unit = '') {
    const total = segs.reduce((a, s) => a + s.value, 0);
    return `<ul class="legend">${segs.map(s => `<li><i style="background:${s.color}"></i><span>${esc(s.label)}</span><b>${fmtNum(s.value, 1)}${unit}</b>${total ? `<em>${pct(s.value, total)}%</em>` : ''}</li>`).join('')}</ul>`;
  },

  /* Barras verticais: data=[{label, value, color?, title?}] */
  bars(data, { height = 150, color = 'var(--lav-d)', max = null, unit = '', showValues = true, highlight = null } = {}) {
    const m = max || Math.max(1, ...data.map(d => d.value));
    return `<div class="bars" style="--h:${height}px">${data.map((d, i) => {
      const h = clamp((d.value / m) * 100, d.value > 0 ? 3 : 0, 100);
      return `<div class="bar-col ${highlight === i ? 'hl' : ''}" title="${esc(d.title || (d.label + ': ' + fmtNum(d.value, 1) + unit))}">
        <div class="bar-track">${showValues && d.value > 0 ? `<span class="bar-val">${fmtNum(d.value, 1)}</span>` : ''}
          <div class="bar" style="height:${h}%;background:${d.color || color}"></div></div>
        <span class="bar-lbl">${esc(d.label)}</span></div>`;
    }).join('')}</div>`;
  },

  /* Barras agrupadas: groups=[{label, a, b}] com séries nomeadas */
  groupedBars(groups, { height = 150, colorA = 'var(--track-strong)', colorB = 'var(--rose-d)', nameA = 'Planejado', nameB = 'Realizado' } = {}) {
    const m = Math.max(1, ...groups.map(g => Math.max(g.a, g.b)));
    return `<div class="bars grouped" style="--h:${height}px">${groups.map(g => `
      <div class="bar-col" title="${esc(g.label)} — ${nameA}: ${fmtNum(g.a, 1)} · ${nameB}: ${fmtNum(g.b, 1)}">
        <div class="bar-track pair">
          <div class="bar" style="height:${clamp(g.a / m * 100, g.a > 0 ? 3 : 0, 100)}%;background:${colorA}"></div>
          <div class="bar" style="height:${clamp(g.b / m * 100, g.b > 0 ? 3 : 0, 100)}%;background:${colorB}"></div>
        </div><span class="bar-lbl">${esc(g.label)}</span></div>`).join('')}</div>
      <ul class="legend inline"><li><i style="background:${colorA}"></i><span>${nameA}</span></li><li><i style="background:${colorB}"></i><span>${nameB}</span></li></ul>`;
  },

  /* Barras horizontais: rows=[{label, value, max?, color, right?}] */
  hbars(rows, { unit = '', max = null } = {}) {
    const m = max || Math.max(1, ...rows.map(r => r.max || r.value));
    return `<div class="hbars">${rows.map(r => {
      const mm = r.max || m;
      return `<div class="hbar-row"><div class="hbar-top"><span>${esc(r.label)}</span><b>${r.right !== undefined ? r.right : fmtNum(r.value, 1) + unit}</b></div>
        <div class="hbar-track"><div class="hbar" style="width:${clamp(r.value / mm * 100, r.value > 0 ? 2 : 0, 100)}%;background:${r.color}"></div></div></div>`;
    }).join('')}</div>`;
  },

  /* Linha suave com área: points=[{label, value|null}] */
  line(points, { height = 140, color = 'var(--rose-d)', max = 100, unit = '' } = {}) {
    const w = 320, h = height, pad = 14;
    const valid = points.map((p, i) => ({ ...p, i })).filter(p => p.value !== null && p.value !== undefined);
    const x = i => pad + (points.length > 1 ? i * (w - pad * 2) / (points.length - 1) : (w - pad * 2) / 2);
    const y = v => h - 22 - (clamp(v, 0, max) / max) * (h - 40);
    let path = '', area = '';
    if (valid.length) {
      path = valid.map((p, j) => (j ? 'L' : 'M') + x(p.i).toFixed(1) + ' ' + y(p.value).toFixed(1)).join(' ');
      area = path + ` L${x(valid[valid.length - 1].i).toFixed(1)} ${h - 22} L${x(valid[0].i).toFixed(1)} ${h - 22} Z`;
    }
    const gid = 'g' + Math.random().toString(36).slice(2, 7);
    return `<svg class="linechart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Gráfico de linha">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <line x1="${pad}" x2="${w - pad}" y1="${h - 22}" y2="${h - 22}" stroke="var(--line)"/>
      <line x1="${pad}" x2="${w - pad}" y1="${y(max / 2)}" y2="${y(max / 2)}" stroke="var(--line)" stroke-dasharray="3 4"/>
      ${area ? `<path d="${area}" fill="url(#${gid})"/>` : ''}
      ${path ? `<path d="${path}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>` : ''}
      ${valid.map(p => `<circle cx="${x(p.i)}" cy="${y(p.value)}" r="3.6" fill="var(--surface)" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"><title>${esc(p.label)}: ${fmtNum(p.value)}${unit}</title></circle>`).join('')}
      ${points.map((p, i) => `<text x="${x(i)}" y="${h - 6}" text-anchor="middle" class="lc-lbl">${esc(p.label)}</text>`).join('')}
    </svg>`;
  },

  /* Grade de hábitos/regularidade: rows=[{label, cells:[bool|null]}], cols=[labels] */
  dotGrid(rows, cols) {
    return `<div class="dotgrid" style="--cols:${cols.length}">
      <div class="dg-row dg-head"><span></span>${cols.map(c => `<em>${esc(c)}</em>`).join('')}</div>
      ${rows.map(r => `<div class="dg-row"><span title="${esc(r.label)}">${esc(r.label)}</span>${r.cells.map(v => `<i class="${v === null ? 'na' : v ? 'on' : ''}"></i>`).join('')}</div>`).join('')}
    </div>`;
  }
};
