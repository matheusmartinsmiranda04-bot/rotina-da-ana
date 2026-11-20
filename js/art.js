/* Rotina da Ana — ilustrações em SVG (leves, offline, sem imagens externas) */
'use strict';

const FOOD_ART = {
  bread: '<path d="M14 30c0-9 8-14 18-14s18 5 18 14c0 3-2 4-4 4v16a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3V34c-2 0-4-1-4-4z" fill="#E8B77A"/><path d="M20 34v15a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V34" fill="#F6DDB4"/><circle cx="27" cy="40" r="1.2" fill="#C99B5E"/><circle cx="36" cy="44" r="1.2" fill="#C99B5E"/><circle cx="31" cy="47" r="1" fill="#C99B5E"/>',
  baguette: '<ellipse cx="32" cy="36" rx="20" ry="12" fill="#E3A866"/><path d="M20 30l5 6M28 27l5 6M36 26l5 6" stroke="#F6DDB4" stroke-width="3" stroke-linecap="round"/>',
  egg: '<ellipse cx="32" cy="36" rx="20" ry="16" fill="#FFFFFF" stroke="#EFE6DA"/><circle cx="34" cy="35" r="8" fill="#F5C044"/><circle cx="31.5" cy="32.5" r="2.2" fill="#FFE29A"/>',
  omelet: '<path d="M10 36a22 14 0 0 1 44 0z" fill="#F7D36A"/><path d="M10 36h44a22 10 0 0 1-44 0z" fill="#EFC04F"/><circle cx="24" cy="31" r="2" fill="#E5735E"/><circle cx="36" cy="29" r="2" fill="#7FB47A"/><circle cx="42" cy="33" r="1.6" fill="#E5735E"/>',
  chicken: '<path d="M18 40c-4-10 4-22 16-20 10 2 14 12 10 20-3 6-10 8-16 7z" fill="#E9B98A"/><path d="M28 47l-6 6" stroke="#F3E6D6" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="54" r="3.4" fill="#F3E6D6"/><path d="M26 30c3-3 9-4 13 0" stroke="#D49A66" stroke-width="2" fill="none" stroke-linecap="round"/>',
  meat: '<path d="M14 34c0-9 9-15 19-15 11 0 18 6 18 14 0 10-10 14-19 14-10 0-18-4-18-13z" fill="#C9635A"/><path d="M20 33c4-6 14-8 22-3" stroke="#F1B6A8" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="40" cy="38" r="3" fill="#F6D2C8"/>',
  fish: '<path d="M12 32c8-10 22-12 32-4l8-6v20l-8-6c-10 8-24 6-32-4z" fill="#9FC3E0"/><circle cx="21" cy="30" r="1.8" fill="#3F5A73"/><path d="M28 27c2 3 2 7 0 10" stroke="#7DA6C9" stroke-width="2" fill="none"/>',
  coffee: '<path d="M16 26h28v12a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z" fill="#F4ECE4" stroke="#E5D6C6"/><ellipse cx="30" cy="27" rx="13" ry="3" fill="#8A5A3B"/><path d="M44 30h3a5 5 0 0 1 0 10h-4" stroke="#E5D6C6" stroke-width="3" fill="none"/><path d="M25 14c-2 3 2 4 0 8M32 12c-2 3 2 5 0 9" stroke="#CDB7A4" stroke-width="2" fill="none" stroke-linecap="round"/>',
  banana: '<path d="M14 22c2 18 14 28 34 24 3-1 3-4 0-4-14 2-24-6-28-21-1-3-6-3-6 1z" fill="#F6D45B"/><path d="M14 22c-1-2 0-5 2-5" stroke="#8B6B2E" stroke-width="2.5" stroke-linecap="round"/><path d="M20 26c4 9 11 14 22 15" stroke="#E2B93B" stroke-width="2" fill="none" stroke-linecap="round"/>',
  apple: '<path d="M32 22c-4-3-16-3-17 10-1 12 8 22 17 20 9 2 18-8 17-20-1-13-13-13-17-10z" fill="#E66B6B"/><path d="M32 22c0-4 1-7 4-9" stroke="#7A5233" stroke-width="2.4" stroke-linecap="round"/><path d="M34 17c4-4 9-3 10-2-3 4-7 4-10 2z" fill="#7FB47A"/><ellipse cx="23" cy="32" rx="3" ry="5" fill="#F29A9A"/>',
  orange: '<circle cx="32" cy="35" r="17" fill="#F5A35B"/><circle cx="32" cy="35" r="12" fill="#FBC888"/><path d="M32 23v24M20 35h24M24 27l16 16M40 27 24 43" stroke="#F5A35B" stroke-width="1.5"/><path d="M33 18c3-4 8-4 10-3-2 3-6 5-10 3z" fill="#7FB47A"/>',
  papaya: '<path d="M32 14c12 0 18 12 18 22s-8 16-18 16-18-6-18-16 6-22 18-22z" fill="#F29C5B"/><path d="M32 22c7 0 10 8 10 14s-4 10-10 10-10-4-10-10 3-14 10-14z" fill="#F7C08A"/><circle cx="30" cy="34" r="1.6" fill="#3B2B26"/><circle cx="34" cy="37" r="1.6" fill="#3B2B26"/><circle cx="31" cy="40" r="1.6" fill="#3B2B26"/><circle cx="35" cy="31" r="1.4" fill="#3B2B26"/>',
  fruit: '<circle cx="24" cy="38" r="11" fill="#E66B6B"/><circle cx="40" cy="38" r="11" fill="#F5A35B"/><path d="M30 22c5-6 12-4 13-3-3 5-9 6-13 3z" fill="#7FB47A"/><circle cx="32" cy="27" r="6" fill="#B07CC6"/>',
  oats: '<path d="M12 34h40a20 16 0 0 1-40 0z" fill="#E7D7C3"/><ellipse cx="32" cy="34" rx="20" ry="5" fill="#F3E3C8"/><g fill="#D9BE94"><ellipse cx="25" cy="33" rx="3" ry="1.6"/><ellipse cx="33" cy="32" rx="3" ry="1.6"/><ellipse cx="40" cy="34" rx="3" ry="1.6"/><ellipse cx="29" cy="35.5" rx="3" ry="1.6"/></g>',
  yogurt: '<path d="M18 22h28l-3 28a4 4 0 0 1-4 3H25a4 4 0 0 1-4-3z" fill="#FFFFFF" stroke="#E7DDF2"/><rect x="16" y="18" width="32" height="6" rx="3" fill="#C9B6EC"/><path d="M20 34h24" stroke="#E7DDF2" stroke-width="2"/>',
  peanut: '<rect x="18" y="20" width="28" height="32" rx="6" fill="#C98B4E"/><rect x="18" y="16" width="28" height="8" rx="3" fill="#7A4E2B"/><rect x="22" y="30" width="20" height="12" rx="3" fill="#F6E3C8"/><path d="M28 36c2-3 6-3 8 0" stroke="#C98B4E" stroke-width="2" fill="none"/>',
  rice: '<path d="M10 34h44a22 16 0 0 1-44 0z" fill="#B9D6E8"/><path d="M14 34c0-8 8-13 18-13s18 5 18 13z" fill="#FFFFFF"/><g fill="#EEE8DE"><ellipse cx="24" cy="28" rx="2" ry="1"/><ellipse cx="32" cy="25" rx="2" ry="1"/><ellipse cx="38" cy="29" rx="2" ry="1"/><ellipse cx="29" cy="31" rx="2" ry="1"/></g>',
  beans: '<path d="M10 34h44a22 16 0 0 1-44 0z" fill="#E7D7C3"/><ellipse cx="32" cy="34" rx="20" ry="5.5" fill="#7A4A36"/><g fill="#9B5E44"><ellipse cx="24" cy="33" rx="3" ry="1.8"/><ellipse cx="33" cy="35" rx="3" ry="1.8"/><ellipse cx="40" cy="33" rx="3" ry="1.8"/></g>',
  veggies: '<path d="M18 46 30 22c2-3 6-1 5 2L26 48c-2 4-9 2-8-2z" fill="#F29C4B"/><path d="M33 22c1-4 5-6 8-5-1 3-4 5-8 5z" fill="#7FB47A"/><circle cx="42" cy="40" r="9" fill="#7FB47A"/><circle cx="38" cy="36" r="5" fill="#94C68E"/><circle cx="46" cy="36" r="5" fill="#94C68E"/><rect x="40.5" y="44" width="3" height="8" rx="1.5" fill="#6B9E66"/>',
  broccoli: '<circle cx="24" cy="28" r="9" fill="#6FAE6B"/><circle cx="38" cy="26" r="10" fill="#7FB47A"/><circle cx="31" cy="20" r="8" fill="#94C68E"/><path d="M28 33h8l-1 18h-6z" fill="#B9D9A6"/>',
  carrot: '<path d="M20 48 36 24c3-4 9 0 6 4L26 52c-3 3-8-0-6-4z" fill="#F29C4B"/><path d="M38 24c0-6 4-9 8-9-1 4-3 7-8 9zM40 26c4-3 9-3 11-1-3 3-7 3-11 1z" fill="#7FB47A"/><path d="M30 36l3 2M26 42l3 2" stroke="#D97F33" stroke-width="2" stroke-linecap="round"/>',
  salad: '<path d="M10 34h44a22 16 0 0 1-44 0z" fill="#F4ECE4"/><path d="M14 34c0-6 5-12 10-12 3-4 9-5 13-1 6-1 11 5 13 13z" fill="#94C68E"/><circle cx="26" cy="29" r="3.4" fill="#E66B6B"/><circle cx="38" cy="28" r="3" fill="#E66B6B"/><path d="M30 24c2 3 2 6 0 9" stroke="#6FAE6B" stroke-width="2" fill="none"/>',
  oil: '<path d="M27 12h10v8c6 3 9 9 9 16v12a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V36c0-7 3-13 9-16z" fill="#E6D873" opacity=".9"/><rect x="26" y="9" width="12" height="5" rx="1.5" fill="#8EA463"/><path d="M24 38h16" stroke="#F6EFB0" stroke-width="3" stroke-linecap="round"/>',
  sweetpotato: '<path d="M12 36c2-10 14-16 26-14 10 2 16 8 14 14-2 7-14 12-26 10-9-1-15-5-14-10z" fill="#B5655A"/><path d="M22 32c6-3 14-3 20 0" stroke="#D88A7E" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="44" cy="35" rx="6" ry="4" fill="#F2A65A"/>',
  milk: '<path d="M22 16h20v6l4 6v22a3 3 0 0 1-3 3H21a3 3 0 0 1-3-3V28l4-6z" fill="#FFFFFF" stroke="#DDE7F2"/><path d="M18 34h28v10H18z" fill="#B9D6E8"/><rect x="22" y="12" width="20" height="5" rx="1.5" fill="#9FC3E0"/>',
  smoothie: '<path d="M18 20h28l-4 32a3 3 0 0 1-3 2H25a3 3 0 0 1-3-2z" fill="#F2C3CF"/><path d="M19 27h26" stroke="#FFFFFF" stroke-width="2" opacity=".7"/><path d="M36 20l6-10" stroke="#B6A2E3" stroke-width="3" stroke-linecap="round"/><ellipse cx="32" cy="20" rx="14" ry="3" fill="#F8DCE3"/>',
  creatine: '<rect x="18" y="20" width="28" height="32" rx="5" fill="#FFFFFF" stroke="#E7DDF2"/><rect x="18" y="16" width="28" height="8" rx="3" fill="#B6A2E3"/><rect x="23" y="31" width="18" height="10" rx="2" fill="#EEE7FA"/>',
  whey: '<path d="M18 22h28v28a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="#2F2A3A"/><rect x="16" y="15" width="32" height="9" rx="3" fill="#E7A9B6"/><rect x="22" y="31" width="20" height="13" rx="2" fill="#F8DCE3"/><path d="M27 37h10" stroke="#C97B8B" stroke-width="2" stroke-linecap="round"/>',
  cocoa: '<path d="M12 36h40a20 14 0 0 1-40 0z" fill="#F4ECE4"/><ellipse cx="32" cy="36" rx="20" ry="5" fill="#6B3F2A"/><path d="M28 22c3-6 10-6 12 0" stroke="#8A5A3B" stroke-width="3" fill="none" stroke-linecap="round"/>',
  chia: '<path d="M12 36h40a20 14 0 0 1-40 0z" fill="#EAF2F6"/><ellipse cx="32" cy="36" rx="20" ry="5" fill="#DDE3E6"/><g fill="#55525C"><circle cx="24" cy="35" r="1"/><circle cx="28" cy="37" r="1"/><circle cx="33" cy="35" r="1"/><circle cx="37" cy="37" r="1"/><circle cx="41" cy="35" r="1"/><circle cx="30" cy="34" r="1"/></g>',
  plate: '<circle cx="32" cy="34" r="20" fill="#FFFFFF" stroke="#EFE6DA"/><circle cx="32" cy="34" r="14" fill="#F7F1EA"/><path d="M22 34a10 10 0 0 1 10-10v10z" fill="#94C68E"/><path d="M32 24a10 10 0 0 1 10 10H32z" fill="#F6E3C8"/><path d="M42 34a10 10 0 0 1-20 0z" fill="#E9B98A"/>'
};
const FOOD_KEYS = Object.keys(FOOD_ART);
const FOOD_LABELS = { bread: 'Pão', baguette: 'Pão francês', egg: 'Ovo', omelet: 'Omelete', chicken: 'Frango', meat: 'Carne', fish: 'Peixe', coffee: 'Café', banana: 'Banana', apple: 'Maçã', orange: 'Laranja', papaya: 'Mamão', fruit: 'Frutas', oats: 'Aveia', yogurt: 'Iogurte', peanut: 'Pasta de amendoim', rice: 'Arroz', beans: 'Feijão', veggies: 'Legumes', broccoli: 'Brócolis', carrot: 'Cenoura', salad: 'Salada', oil: 'Azeite', sweetpotato: 'Batata-doce', milk: 'Leite', smoothie: 'Vitamina', creatine: 'Creatina', whey: 'Whey', cocoa: 'Cacau', chia: 'Chia', plate: 'Prato' };
const FOOD_BG = { bread: '#FBEEDD', baguette: '#FBEEDD', egg: '#FFF6DC', omelet: '#FFF6DC', chicken: '#FBEBDD', meat: '#FBE3E0', fish: '#E6F0F8', coffee: '#F4ECE4', banana: '#FFF6D6', apple: '#FCE6E6', orange: '#FFEEDD', papaya: '#FFEADB', fruit: '#F5EAF8', oats: '#F7F0E6', yogurt: '#F1ECFA', peanut: '#F7EADB', rice: '#EEF5FA', beans: '#F4ECE4', veggies: '#EAF5E6', broccoli: '#EAF5E6', carrot: '#FFF0E2', salad: '#EAF5E6', oil: '#F8F6DE', sweetpotato: '#FBE9E4', milk: '#EEF5FA', smoothie: '#FCEAF0', creatine: '#F1ECFA', whey: '#FCEAF0', cocoa: '#F4ECE4', chia: '#EEF3F5', plate: '#F7F1EA' };

function foodArt(key, size = 48, photo = null) {
  if (photo) return `<span class="food-art photo" style="width:${size}px;height:${size}px"><img src="${photo}" alt="" loading="lazy"></span>`;
  const k = FOOD_ART[key] ? key : 'plate';
  return `<span class="food-art" style="width:${size}px;height:${size}px;background:${FOOD_BG[k]}"><svg viewBox="0 0 64 64" aria-hidden="true">${FOOD_ART[k]}</svg></span>`;
}

/* Ilustrações de modalidades de treino */
const WORKOUT_ART = {
  musculacao: '<rect x="8" y="27" width="6" height="10" rx="2" fill="currentColor" opacity=".55"/><rect x="14" y="22" width="7" height="20" rx="2.5" fill="currentColor"/><rect x="21" y="30" width="22" height="4" rx="2" fill="currentColor" opacity=".7"/><rect x="43" y="22" width="7" height="20" rx="2.5" fill="currentColor"/><rect x="50" y="27" width="6" height="10" rx="2" fill="currentColor" opacity=".55"/>',
  aerobico: '<circle cx="38" cy="14" r="5" fill="currentColor"/><path d="M36 22l-8 10 8 6-4 14M28 32l-10 2M36 26l10 6 6-4" stroke="currentColor" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  funcional: '<circle cx="32" cy="38" r="14" fill="currentColor" opacity=".85"/><path d="M24 24c0-6 16-6 16 0" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>',
  corrida: '<path d="M14 44c6 0 10-6 18-6s10 6 18 6" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M20 34l6-14 10 4 8-6" stroke="currentColor" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  pilates: '<circle cx="32" cy="16" r="5" fill="currentColor"/><path d="M32 22v14M18 30l14 6 14-6M22 48l10-12 10 12" stroke="currentColor" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  alongamento: '<circle cx="22" cy="16" r="5" fill="currentColor"/><path d="M22 22l6 14 14 4M28 36l-6 14M20 26l-8 6M42 40l10-2" stroke="currentColor" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  outro: '<path d="M32 12l5.5 11.4 12.5 1.8-9 8.8 2.1 12.4L32 40.6l-11.1 5.8 2.1-12.4-9-8.8 12.5-1.8z" fill="currentColor"/>'
};
function workoutArt(type, color = 'var(--rose-d)', size = 44) {
  return `<span class="wk-art" style="width:${size}px;height:${size}px;color:${color}"><svg viewBox="0 0 64 64" aria-hidden="true">${WORKOUT_ART[type] || WORKOUT_ART.outro}</svg></span>`;
}

/* Avatares ilustrados delicados */
const AVATARS = {
  1: { bg: '#F8DCE3', hair: '#5B3A31', skin: '#F2C7A8', top: '#E7A9B6' },
  2: { bg: '#EEE7FA', hair: '#2F2A3A', skin: '#D9A07E', top: '#B6A2E3' },
  3: { bg: '#E7F3EA', hair: '#8A5A3B', skin: '#F5D2B8', top: '#8FC6A8' },
  4: { bg: '#FBEEDD', hair: '#3B2B26', skin: '#B97F5B', top: '#E3C9A8' }
};
function avatarSvg(n = 1) {
  const a = AVATARS[n] || AVATARS[1];
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="32" fill="${a.bg}"/>
    <path d="M14 64c1-12 9-18 18-18s17 6 18 18z" fill="${a.top}"/>
    <path d="M17 34c-2-14 5-23 15-23s17 9 15 23c-1 6-3 10-3 10H20s-2-4-3-10z" fill="${a.hair}"/>
    <rect x="28" y="38" width="8" height="9" rx="3" fill="${a.skin}"/>
    <ellipse cx="32" cy="30" rx="10" ry="11.5" fill="${a.skin}"/>
    <path d="M22 26c3-7 13-10 20-4-4 0-12 0-20 4z" fill="${a.hair}"/>
    <circle cx="28" cy="31" r="1.2" fill="#3B2B26"/><circle cx="36" cy="31" r="1.2" fill="#3B2B26"/>
    <path d="M29.5 35.5c1.5 1.4 3.5 1.4 5 0" stroke="#B8665E" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="25.5" cy="34" r="2" fill="#F2A3A8" opacity=".5"/><circle cx="38.5" cy="34" r="2" fill="#F2A3A8" opacity=".5"/>
    <circle cx="44" cy="20" r="3" fill="#F2A3B6"/><circle cx="46.5" cy="22" r="2" fill="#F8DCE3"/></svg>`;
}
function avatarHtml(avatar, size = 40) {
  if (avatar && avatar.startsWith('data:')) return `<span class="avatar" style="width:${size}px;height:${size}px"><img src="${avatar}" alt="Foto de perfil"></span>`;
  const n = avatar && avatar.startsWith('preset:') ? avatar.split(':')[1] : 1;
  return `<span class="avatar" style="width:${size}px;height:${size}px">${avatarSvg(n)}</span>`;
}

/* Marca da aplicação */
let logoSeq = 0;
function logoMark(size = 34) {
  const gid = 'lg-' + (++logoSeq);
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="18" fill="url(#${gid})"/>
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3C3CE"/><stop offset="1" stop-color="#C6B4EE"/></linearGradient></defs>
    <g fill="#fff" opacity=".95"><ellipse cx="32" cy="22" rx="6" ry="9"/><ellipse cx="32" cy="42" rx="6" ry="9"/><ellipse cx="22" cy="32" rx="9" ry="6"/><ellipse cx="42" cy="32" rx="9" ry="6"/></g>
    <circle cx="32" cy="32" r="5" fill="#E7A9B6"/></svg>`;
}

/* Ilustração principal do painel (manhã/tarde/noite) */
function heroArt(period) {
  const sky = period === 'noite' ? ['#3D3657', '#6B5B8E'] : period === 'tarde' ? ['#F9D9CF', '#F3C3CE'] : ['#FCE9E3', '#EADFF8'];
  const orb = period === 'noite' ? '<circle cx="232" cy="46" r="18" fill="#F6EFD9"/><circle cx="240" cy="40" r="16" fill="' + sky[0] + '"/>' : `<circle cx="232" cy="48" r="20" fill="${period === 'tarde' ? '#F7B98F' : '#FBD58C'}" opacity=".95"/>`;
  const gid = 'hs-' + (++logoSeq);
  return `<svg class="hero-art" viewBox="0 0 300 170" aria-hidden="true">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
    <rect width="300" height="170" rx="24" fill="url(#${gid})"/>${orb}
    ${period === 'noite' ? '<g fill="#fff" opacity=".7"><circle cx="60" cy="30" r="1.4"/><circle cx="120" cy="20" r="1"/><circle cx="170" cy="40" r="1.3"/><circle cx="90" cy="60" r="1"/></g>' : '<g fill="#fff" opacity=".8"><ellipse cx="70" cy="40" rx="26" ry="8"/><ellipse cx="160" cy="28" rx="20" ry="6"/></g>'}
    <path d="M0 130c40-22 80-26 130-14s100 6 170-14v68H0z" fill="${period === 'noite' ? '#4E4470' : '#F6E7DA'}"/>
    <path d="M0 146c60-16 120-14 170-4s90 6 130-8v36H0z" fill="${period === 'noite' ? '#5C5182' : '#EFDCCB'}"/>
    <g transform="translate(46 70)"><path d="M10 70V40" stroke="#8FB59A" stroke-width="3"/><path d="M10 52c-12-2-16-12-14-20 10 2 16 10 14 20zM10 46c10-4 18-2 22 4-8 6-18 4-22-4z" fill="#A8CBB2"/></g>
    <g transform="translate(110 64)"><rect x="0" y="40" width="44" height="34" rx="6" fill="#FFFFFF" opacity=".92"/><rect x="0" y="40" width="44" height="9" rx="4" fill="#E7A9B6"/><g fill="#E8DFF5"><rect x="6" y="54" width="7" height="6" rx="1.5"/><rect x="18" y="54" width="7" height="6" rx="1.5"/><rect x="30" y="54" width="7" height="6" rx="1.5"/><rect x="6" y="63" width="7" height="6" rx="1.5"/><rect x="18" y="63" width="7" height="6" rx="1.5" fill="#B6A2E3"/></g></g>
    <g transform="translate(176 82)"><path d="M6 10h26v20a8 8 0 0 1-8 8h-10a8 8 0 0 1-8-8z" fill="#FFFFFF" opacity=".92"/><path d="M32 14h4a5 5 0 0 1 0 10h-4" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".92"/><path d="M14 0c-2 3 2 4 0 7M22 0c-2 3 2 4 0 7" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/></g>
  </svg>`;
}

/* Arte para estados vazios */
function emptyArt(kind = 'default') {
  const c = { tasks: '#E7A9B6', calendar: '#B6A2E3', workout: '#8FC6A8', food: '#E9C77E', default: '#E7A9B6' }[kind] || '#E7A9B6';
  return `<svg class="empty-art" viewBox="0 0 120 90" aria-hidden="true">
    <ellipse cx="60" cy="80" rx="42" ry="6" fill="var(--track)"/>
    <rect x="30" y="14" width="60" height="58" rx="12" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/>
    <rect x="30" y="14" width="60" height="14" rx="10" fill="${c}" opacity=".55"/>
    <path d="M42 42h36M42 52h24" stroke="var(--line)" stroke-width="4" stroke-linecap="round"/>
    <circle cx="92" cy="20" r="8" fill="${c}" opacity=".35"/><path d="M18 40c4-2 6-6 6-10" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}
