/* TLACHINOLLI · Wiki y Tlatelolco. Todo sale de window.TLACHINOLLI (generado desde Config.luau). */
(function () {
'use strict';
const D = window.TLACHINOLLI;
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const num = (n, d = 0) => Number(n).toLocaleString('es-MX', { maximumFractionDigits: d, minimumFractionDigits: d });
const pct = (n, d = 1) => num(n * 100, d) + '%';
const rgb = c => c ? `rgb(${c[0]},${c[1]},${c[2]})` : '#888';

// ------------------------------------------------------------------ catálogos y colores
const rarityById = Object.fromEntries(D.rarities.map(r => [r.Id, r]));
const classById = Object.fromEntries(D.classes.map(c => [c.Id, c]));
const deityById = Object.fromEntries(D.deities.map(d => [d.Id, d]));
const COS_RAR = { comun: ['Común', [150, 150, 150]], normal: ['Normal', [72, 170, 92]], epico: ['Épico', [150, 82, 205]], legendario: ['Legendario', [232, 150, 40]],
  mitico: ['Mítico', [220, 50, 70]], top_global: ['Exclusivo Top Global', [255, 226, 110]] };
const COS_CAT = { alas: 'Caja de Alas', ceremonial: 'Caja Ceremonial', comica: 'Caja Cómica', top_global: 'Top Global' };
const tag = (text, color) => `<span class="etiqueta" style="background:${color}22;border-color:${color};color:${color}">${esc(text)}</span>`;
const rarTag = id => rarityById[id] ? tag(rarityById[id].Name, rgb(rarityById[id].Color)) : COS_RAR[id] ? tag(COS_RAR[id][0], rgb(COS_RAR[id][1])) : '';
const classTag = id => classById[id] ? tag(classById[id].Name + ' · ' + classById[id].Theme, rgb(classById[id].Color)) : '';

// ------------------------------------------------------------------ valores de Tlatelolco (jade equivalente)
const V = D.valores;
const round = v => v >= 1000 ? Math.round(v / 50) * 50 : v >= 100 ? Math.round(v / 10) * 10 : Math.round(v);
function blessingOdds(b) {
  const cls = classById[b.Class]; const deity = cls && deityById[cls.Deity];
  const same = D.blessings.filter(x => x.Rarity === b.Rarity && classById[x.Class] && classById[x.Class].Deity === cls.Deity).length;
  const perCard = (D.ritual.RarityWeights[b.Rarity] || 0) / Math.max(1, same);
  const inThree = 1 - Math.pow(1 - perCard, D.ritual.Choices);
  return { deity, perCard, inThree, offerings: 1 / inThree };
}
const ITEMS = [];
function addItem(o) { const adj = V.ajustes[o.id] || {}; o.value = round((adj.valor ?? o.base) * (adj.demanda ?? 1)); ITEMS.push(o); }
for (const b of D.blessings) {
  const o = blessingOdds(b);
  addItem({ id: b.Id, name: b.Name, type: 'Bendición', sub: classById[b.Class].Name, rarity: b.Rarity, base: D.ritual.OfferingPriceJade / o.inThree, odds: o, ref: b });
}
for (const d of D.deities) addItem({ id: 'OFRENDA_' + d.Id.toUpperCase(), name: d.Offering, type: 'Ofrenda', sub: d.Name, rarity: null, base: V.ofrendas.valorPorOfrenda });
for (const t of D.boosts.Types) addItem({ id: 'POCIMA_' + t.Id.toUpperCase(), name: t.Name, type: 'Pócima', sub: '1 hora de juego', rarity: null, base: t.PriceJade });
for (const c of D.consumables) addItem({ id: 'CONSUMIBLE_' + c.Id.toUpperCase(), name: c.Name, type: 'Pócima', sub: 'Curación', rarity: null, base: c.PriceJade });
for (const c of D.cosmetics) {
  if ((V.cosmeticos.noComerciables || []).includes(c.rarity)) continue;
  const base = c.category === 'alas' ? V.cosmeticos.precioCaja.alas / (V.cosmeticos.probAlas[c.id] || 1) : V.cosmeticos.valorPorRareza[c.rarity] || 0;
  addItem({ id: c.id, name: c.name, type: 'Cosmético', sub: COS_CAT[c.category], rarity: c.rarity, base, ref: c });
}
const itemById = Object.fromEntries(ITEMS.map(i => [i.id, i]));

// ------------------------------------------------------------------ navegación
const PAGES = [
  ['', 'Inicio', inicio], ['jugar', 'Cómo jugar', jugar], ['misiones', 'Misiones', misiones], ['enemigos', 'Enemigos', enemigos],
  ['bendiciones', 'Bendiciones', bendiciones], ['ofrendas', 'Ofrendas', ofrendas], ['progresion', 'Progresión', progresion],
  ['mercado', 'Mercado', mercado], ['cosmeticos', 'Cosméticos', cosmeticos], ['tlatelolco', 'Tlatelolco', tlatelolco],
];
$('#nav').innerHTML = PAGES.map(([k, n]) => `<a href="#/${k}" data-k="${k}" class="${k === 'tlatelolco' ? 'tlatelolco' : ''}">${n}</a>`).join('');
$('#generado').textContent = `Datos del juego al ${D.generated}.`;
function route() {
  const [k, query] = (location.hash.replace(/^#\/?/, '') || '').split('?');
  const page = PAGES.find(p => p[0] === k) || PAGES[0];
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('activa', a.dataset.k === page[0]));
  document.body.classList.remove('nav-abierta');
  document.title = (page[0] ? page[1] + ' · ' : '') + 'TLACHINOLLI';
  const app = $('#app'); app.innerHTML = page[2](new URLSearchParams(query || '')); window.scrollTo(0, 0);
  if (page.after) page.after(); if (afterRender) { const f = afterRender; afterRender = null; f(); }
}
let afterRender = null;
window.addEventListener('hashchange', route);

const panel = (title, body, id = '') => `<section class="panel" ${id ? `id="${id}"` : ''}>${title ? `<h2>${esc(title)}</h2>` : ''}${body}</section>`;
const table = (heads, rows, numeric = []) => `<div class="tabla-wrap"><table><thead><tr>${heads.map((h, i) => `<th class="${numeric.includes(i) ? 'num' : ''}">${h}</th>`).join('')}</tr></thead><tbody>${
  rows.map(r => `<tr>${r.map((c, i) => `<td class="${numeric.includes(i) ? 'num' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

// ------------------------------------------------------------------ páginas
function inicio() {
  const cards = [
    ['misiones', 'Misiones e incursiones', `Recupera Tlacopan, Texcoco y Xochimilco y enfrenta a Miguel y Gabriel en ${D.difficulties.length} calaveras de dificultad.`],
    ['bendiciones', 'Bendiciones', `${D.blessings.length} bendiciones de tres dioses en seis categorías y seis rarezas.`],
    ['ofrendas', 'Ofrendas y santuario', 'Presenta ofrendas a Huitzilopochtli, Tezcatlipoca y Quetzalcóatl: tres cartas, eliges una.'],
    ['progresion', 'Progresión', 'Nivel, árbol de habilidades, atributos, mejoras de equipo y rango militar.'],
    ['cosmeticos', 'Cosméticos', `${D.cosmetics.length} cosméticos: alas, vestimentas ceremoniales, la caja cómica y los premios del Top Global.`],
    ['tlatelolco', 'Tlatelolco', 'Calcula el valor de tus trueques antes de cerrarlos en el juego.'],
  ];
  return `<div class="portada"><div class="dentro"><h1>${esc(D.game.Title)}</h1><p>${esc(D.game.Subtitle)}. Un juego de acción y cooperación en Roblox ambientado en el mundo nahua:
    defiende Tenochtitlan, recupera las ciudades del lago y gana las bendiciones de los dioses.</p>
    <a class="boton" href="#/jugar">Cómo jugar</a><a class="boton sec" href="#/tlatelolco">Calculadora de Tlatelolco</a></div></div>
    <div class="rejilla">${cards.map(([k, t, d]) => `<a class="tarjeta" href="#/${k}"><span class="acento" style="background:var(--oro)"></span><h3>${t}</h3><p class="tenue">${d}</p></a>`).join('')}</div>
    ${panel('En números', `<div class="rejilla chica">${[[D.missions.length, 'misiones'], [D.difficulties.length, 'calaveras'], [D.blessings.length, 'bendiciones'], [D.classes.length, 'categorías'],
      [D.deities.length, 'dioses'], [D.cosmetics.length, 'cosméticos'], [D.game.MaxPartyMembers, 'jugadores por grupo'], [D.prestige.Ranks.length, 'rangos militares']]
      .map(([n, t]) => `<div class="tarjeta"><div class="cifra">${n}</div><div class="tenue">${t}</div></div>`).join('')}</div>`)}`;
}

function jugar() {
  const c = D.combat;
  return panel('Controles', table(['Acción', 'PC', 'Control', 'Celular / tableta'], [
    ['Golpe ligero', '<kbd>Clic izq.</kbd>', '<kbd>R2</kbd> / <kbd>X</kbd>', 'Botón «Ligero»'],
    ['Golpe fuerte', '<kbd>Clic der.</kbd> / <kbd>E</kbd>', '<kbd>R1</kbd> / <kbd>Y</kbd>', 'Botón «Fuerte»'],
    ['Bloquear (mantener)', '<kbd>Q</kbd>', '<kbd>L2</kbd> / <kbd>L1</kbd>', 'Botón «Bloqueo»'],
    ['Esquivar', '<kbd>F</kbd>', '<kbd>B</kbd>', 'Botón «Esquiva»'],
    ['Poción de curación', '<kbd>R</kbd>', 'Cruceta ↑', 'Botón «Poción»'],
    ['Menú de partida', '<kbd>M</kbd>', 'Cruceta ↓', 'Botón «Menú»'],
    ['Menú del lobby', '<kbd>Tab</kbd>', '<kbd>Y</kbd>', 'Botón «Abrir menú»'],
  ])) + panel('Combate', `<div class="rejilla">
    <div class="tarjeta"><h3>Golpes</h3><p>Ligero: <b>${c.Light.Damage}</b> de daño cada ${c.Light.CooldownSeconds} s. Fuerte: <b>${c.Heavy.Damage}</b> cada ${c.Heavy.CooldownSeconds} s.
      Crítico base: ${pct(c.Crit.Chance, 0)} de probabilidad con +${pct(c.Crit.Extra, 0)} de daño.</p></div>
    <div class="tarjeta"><h3>Guardia y parada perfecta</h3><p>El chimalli bloquea un cono de ${c.Block.HalfAngleDegrees * 2}° al frente y reduce ${pct(c.Block.Reduction, 0)} del daño
      (máx. ${pct(c.Block.MaxReduction, 0)}). Si bloqueas en los primeros <b>${c.Block.ParryWindowSeconds} s</b> logras una <b>parada perfecta</b>: no recibes daño y aturdes al atacante.</p></div>
    <div class="tarjeta"><h3>Esquiva</h3><p>Cuesta ${c.Dodge.StaminaCost} de stamina y te hace invulnerable ${c.Dodge.InvulnerableSeconds} s. Si un golpe te alcanza en ese instante es una
      <b>esquiva perfecta</b>, y varias bendiciones se activan con ella.</p></div>
    <div class="tarjeta"><h3>Stamina</h3><p>${c.BaseStamina} de base. Se recupera ${c.Stamina.RegenPerSecond}/s tras ${c.Stamina.RegenDelaySeconds} s sin gastar. Bloquear golpes la consume; si se agota, la guardia se rompe.</p></div>
  </div>`) + panel('Consejos', `<ul>
    <li>Los avisos dorados en el suelo se pueden bloquear; los rojos solo se esquivan.</li>
    <li>Cada minuto los soldados se fortalecen ${pct(D.timeScaling.PerMinute, 0)} (hasta ${D.timeScaling.MaxMinutes} min) y a partir del minuto ${D.timeScaling.HuntAfterMinutes} salen a cazarte.</li>
    <li>Tomar puestos y abrir depósitos da más oro, pero el capitán se vuelve más fuerte.</li>
    <li>En grupo (hasta ${D.game.MaxPartyMembers}) la vida de los enemigos crece, el daño no.</li></ul>`);
}

function diffRows() {
  return D.difficulties.map((d, i) => [`<b>${ROMAN[i]}</b> · ${esc(d.Name.split('·')[1] || d.Name)}`, '×' + d.Health, '×' + d.Damage, '×' + d.Cadence, '×' + d.Enemies,
    '×' + d.Gold, '×' + d.XP, d.Respawns, d.MaxEngaged]);
}
function misiones() {
  const ms = D.missions.map(m => {
    const rec = m.Mode === 'Recuperacion';
    return `<div class="tarjeta mision"><div class="txt"><h3>${esc(m.Name)}</h3>${tag(rec ? 'Recuperación' : 'Incursión', rec ? '#d9a845' : '#e05a48')}
      <p>${esc(m.Description)}</p><p class="tenue">Oro base por victoria: <b>${m.GoldVictory}</b>${rec ? ` · ${m.Posts} puestos · ${m.Deposits} depósitos` : ' · da 1 ofrenda de un dios al azar'}
      · límite ${Math.round(m.DurationSeconds / 60)} min.</p></div><img src="img/misiones/${m.Id}.jpg" alt="${esc(m.Name)}" loading="lazy"></div>`;
  }).join('');
  const rewards = D.difficulties.map((d, i) => [ROMAN[i], ...D.missions.map(m => num(Math.round(m.GoldVictory * d.Gold))),
    D.economy.RecoveryJade[i] || '—', D.economy.RaidJade[i], D.economy.RaidOfferings[i]]);
  const roster = D.missions.filter(m => m.Roster).map(m => [esc(m.Name), ...D.difficulties.map((d, i) => `${m.Roster.soldado[i]}+${m.Roster.arcabucero[i]}`)]);
  return `<div class="rejilla" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr));margin-bottom:1.4rem">${ms}</div>` +
    panel('Calaveras de dificultad', `<p>Cada calavera se desbloquea venciendo la anterior en esa misión. De la VII a la IX (Update 1) la vida, el daño, el oro y la XP suben ×1.25 por calavera.</p>` +
      table(['Calavera', 'Vida', 'Daño', 'Cadencia', 'Enemigos', 'Oro', 'XP', 'Reapariciones', 'Máx. a la vez'], diffRows(), [1, 2, 3, 4, 5, 6, 7, 8])) +
    panel('Recompensas por victoria', `<p class="tenue">Oro base de victoria (sin bonos de capitán, rapidez ni primera victoria +${pct(D.economy.FirstVictoryBonus, 0)}). El oro de bajas y depósitos se suma aparte.</p>` +
      table(['Calavera', ...D.missions.map(m => esc(m.Name.replace('Recuperar ', '').replace('Incursión: ', ''))), 'Jade recuperación', 'Jade incursión', 'Ofrendas incursión'],
        rewards, [1, 2, 3, 4, 5, 6, 7, 8])) +
    panel('Soldados por calavera', `<p class="tenue">Soldados + arcabuceros (sin contar al capitán).</p>` + table(['Misión', ...ROMAN.slice(0, D.difficulties.length)], roster, [1, 2, 3, 4, 5, 6, 7, 8, 9]));
}

function enemigos() {
  const e = D.enemies;
  const card = (k, extra) => `<div class="tarjeta"><h3>${esc(e[k].Name)}</h3><p>Vida ${e[k].Health} · Daño ${e[k].Damage} · ataca cada ${e[k].IntervalSeconds} s · alcance ${e[k].Range}</p><p class="tenue">${extra}</p></div>`;
  const cap = D.difficulties.map((d, i) => [ROMAN[i], num(D.captain.Health[i]), D.captain.Damage[i], num(Math.round(D.angels.BaseHealth * D.angels.Factors[i])),
    num(Math.round(D.angels.BaseDamage * D.angels.Factors[i])), '×' + D.angels.Factors[i]]);
  return panel('Tropas invasoras', `<div class="rejilla">${card('soldado', 'Lucha cuerpo a cuerpo y avisa a sus compañeros cercanos.')}${card('arcabucero', 'Dispara desde lejos y retrocede para mantener la distancia.')}
    ${card('capitan', `Jefe de las recuperaciones. Se fortalece según tus bajas (${pct(D.captain.KillWeight, 0)}) y los puestos tomados (${pct(D.captain.PostWeight, 0)}). Vencerlo en menos de ${D.captain.FastKillSeconds} s da +${pct(D.captain.FastKillBonus, 0)} de oro.`)}</div>
    <p class="tenue">Los valores de soldados y arcabuceros son de la calavera I; se multiplican por la tabla de calaveras y crecen con el tiempo de partida.</p>`) +
    panel('Ángeles: Miguel y Gabriel', `<p>Jefes de las incursiones. Cambian de fase al ${pct(D.angels.PhaseThresholds[0], 0)} y al ${pct(D.angels.PhaseThresholds[1], 0)} de vida, y sus ataques se anuncian con marcas en el suelo.
      En la calavera VII su poder salta de ×2 a ×5.</p>` + table(['Calavera', 'Vida capitán', 'Daño capitán', 'Vida ángel', 'Daño ángel', 'Factor ángel'], cap, [1, 2, 3, 4, 5])) +
    panel('Cooperativo', table(['Jugadores', 'Vida de jefes', 'Vida de soldados'], D.coop.Boss.map((b, i) => [i + 1, '×' + b, '×' + D.coop.Soldier[i]]), [1, 2]));
}

let fB = { q: '', deity: '', cls: '', rar: '' };
function bendiciones() {
  afterRender = () => {
    const draw = () => {
      const list = D.blessings.filter(b => (!fB.q || (b.Name + ' ' + b.Description).toLowerCase().includes(fB.q.toLowerCase()))
        && (!fB.cls || b.Class === fB.cls) && (!fB.rar || b.Rarity === fB.rar) && (!fB.deity || classById[b.Class].Deity === fB.deity));
      $('#lista').innerHTML = list.map(b => {
        const r = rarityById[b.Rarity], it = itemById[b.Id];
        return `<div class="tarjeta bendicion" style="border-left-color:${rgb(r.Color)}"><span class="valor">${num(it.value)} jade</span><h3 style="padding-right:5rem">${esc(b.Name)}</h3>
          ${rarTag(b.Rarity)}${classTag(b.Class)}<p>${esc(b.Description)}</p><p class="tenue">${esc(deityById[classById[b.Class].Deity].Name)} · ${pct(it.odds.inThree, 2)} de verla en una ofrenda</p></div>`;
      }).join('') || '<p class="tenue">Sin resultados.</p>';
      $('#cuenta').textContent = `${list.length} de ${D.blessings.length}`;
    };
    $('#q').addEventListener('input', e => { fB.q = e.target.value; draw(); });
    document.querySelectorAll('[data-f]').forEach(el => el.addEventListener('click', () => {
      const [k, v] = el.dataset.f.split(':'); fB[k] = fB[k] === v ? '' : v;
      document.querySelectorAll(`[data-f^="${k}:"]`).forEach(x => x.classList.toggle('on', x.dataset.f === `${k}:${fB[k]}`)); draw();
    }));
    draw();
  };
  const chips = (k, list) => list.map(([v, t]) => `<button class="chip ${fB[k] === v ? 'on' : ''}" data-f="${k}:${v}">${esc(t)}</button>`).join('');
  return panel('Bendiciones', `<p>Se equipan en ranuras libres: ${D.prestige.BaseSlots} al inicio y una más por cada rango militar, hasta ${D.prestige.MaxSlots}. Una bendición no se equipa dos veces.
      Los efectos iguales de varias bendiciones se suman (los condicionales toman el mejor valor).</p>
    <div class="filtros"><input id="q" type="search" placeholder="Buscar por nombre o efecto…" value="${esc(fB.q)}"><span class="tenue" id="cuenta"></span></div>
    <div class="filtros">${chips('deity', D.deities.map(d => [d.Id, d.Name]))}</div>
    <div class="filtros">${chips('cls', D.classes.map(c => [c.Id, c.Name]))}</div>
    <div class="filtros">${chips('rar', D.rarities.map(r => [r.Id, r.Name]))}</div>
    <div class="rejilla" id="lista"></div>`);
}

function ofrendas() {
  const w = D.ritual.RarityWeights;
  const per = D.deities.map(d => {
    const rows = D.rarities.map(r => {
      const n = D.blessings.filter(b => b.Rarity === r.Id && d.Classes.includes(b.Class)).length;
      const p = w[r.Id] || 0;
      return [rarTag(r.Id), pct(p, 0), n, n ? pct(p / n, 2) : '—', pct(1 - Math.pow(1 - p, D.ritual.Choices), 1)];
    });
    return `<div class="tarjeta"><span class="acento" style="background:${rgb(d.Color)}"></span><h3>${esc(d.Offering)}</h3>
      <p>${d.Classes.map(classTag).join('')}</p>${table(['Rareza', 'Por carta', 'Bendiciones', 'Cada una', 'Al menos 1 en 3'], rows, [1, 2, 3, 4])}</div>`;
  }).join('');
  return panel('Altar de los dioses', `<p>Cada ofrenda muestra <b>${D.ritual.Choices} cartas al azar</b> de las categorías de su dios y conservas <b>una</b>. Las cartas se sortean por separado: puede repetirse
      una bendición. Las ofrendas se compran a <b>${D.ritual.OfferingPriceJade} jade</b> en el mercado o se ganan en las incursiones (1 por victoria, de un dios al azar).</p>
      <div class="rejilla dioses">${per}</div>`);
}

function progresion() {
  const t = D.skillTree; const maxLevel = t.Branches.reduce((a, b) => a + b.Paths.length * 6, 0) + 1;
  const tree = t.Branches.map(b => `<div class="tarjeta"><h3>${esc(b.Name)}</h3>${table(['Camino', 'Efecto por rango', 'Rangos'],
    b.Paths.map(p => [esc(p.Name), esc(p.Description), p.Names.map(esc).join(' → ')]))}</div>`).join('');
  const attr = D.attributes.List.map(a => [esc(a.Name), esc(a.Description), Array.from({ length: D.attributes.MaxRank }, (_, i) => num(Math.round(D.attributes.CostBase * Math.pow(i + 1, D.attributes.CostExponent) / 5) * 5)).join(' · ')]);
  return panel('Nivel y experiencia', `<p>Cada ${t.XPPerLevel} de XP es un nivel y cada nivel da 1 punto para el árbol de habilidades. El nivel máximo es <b>${maxLevel}</b>
      (${num((maxLevel - 1) * t.XPPerLevel)} XP). Ya en el máximo, la XP extra se convierte en oro a la mitad (redondeando .5 hacia arriba).</p>`) +
    panel('Árbol de habilidades', `<p class="tenue">Cada nodo cuesta 1 punto y oro: ${t.GoldCosts.map(num).join(' · ')} según su rango (I a VI).</p><div class="rejilla" style="grid-template-columns:1fr">${tree}</div>`) +
    panel('Atributos', `<p class="tenue">Rangos 0–${D.attributes.MaxRank}, se pagan con oro (costo de cada rango, del 1 al ${D.attributes.MaxRank}).</p>` + table(['Atributo', 'Efecto', 'Costo en oro por rango'], attr)) +
    panel('Mejoras de equipo', `<p>El macuahuitl y el chimalli suben hasta la calavera ${ROMAN[D.upgrades.MaxLevel - 1]}: +${pct(D.upgrades.PerLevel, 0)} por rango.</p>` +
      table(['Rango', ...D.upgrades.Costs.map((_, i) => ROMAN[i + 1])], [['Oro', ...D.upgrades.Costs.map(num)]], D.upgrades.Costs.map((_, i) => i + 1))) +
    panel('Rango militar', `<p>Al llegar al nivel máximo puedes ascender: tu oro se cambia por jade (1 por cada ${D.prestige.GoldPerJade}) y se reinician el oro, el nivel y el árbol.
      Conservas atributos, equipo, bendiciones y jade, y ganas una ranura de bendición.</p>` +
      table(['Rango', 'Ranuras de bendición'], D.prestige.Ranks.map((r, i) => [`${i}. ${esc(r)}`, Math.min(D.prestige.MaxSlots, D.prestige.BaseSlots + i)]), [1]));
}

function mercado() {
  const img = n => `<img src="img/mercado/${n}.png" alt="" style="width:110px;height:110px;object-fit:contain;display:block;margin:0 auto .3rem">`;
  const packs = c => D.robux.filter(p => p.Currency === c).map((p, i) => `<div class="tarjeta" style="text-align:center">${img((c === 'gold' ? 'Oro' : 'Jade') + (i + 1))}
    <h3>${num(p.Amount)} ${c === 'gold' ? 'oro' : 'jade'}</h3><p class="cifra" style="font-size:1.2rem">R$ ${p.BaseRobux}</p></div>`).join('');
  const pots = D.boosts.Types.map(t => `<div class="tarjeta"><h3>${esc(t.Name)}</h3><p>${esc(t.Description)}</p>${table(['Paquete', 'Precio'],
    D.boosts.Bundles.map(b => [b.Count + (b.Count === 1 ? ' pócima' : ' pócimas'), num(Math.floor(t.PriceJade * b.Factor + 0.5)) + ' jade']), [1])}</div>`).join('');
  return panel('Paquetes con Robux', `<div class="rejilla chica">${packs('gold')}${packs('jade')}</div>`) +
    panel('Pócimas ×3', `<p>Se compran con jade y se activan desde el inventario del lobby. Cada una dura <b>1 hora de juego real</b> (el tiempo solo corre mientras juegas y se guarda al salir).</p>
      <div class="rejilla">${pots}</div>`) +
    panel('Otros', table(['Objeto', 'Precio', 'Detalle'], [[esc(D.deities.map(d => d.Offering).join(', ')), D.ritual.OfferingPriceJade + ' jade', 'Tres cartas, conservas una'],
      ...D.consumables.map(c => [esc(c.Name), c.PriceJade + ' jade', esc(c.Description)])]));
}

let fC = { cat: '', rar: '' };
function cosmeticos() {
  afterRender = () => {
    const draw = () => {
      const list = D.cosmetics.filter(c => (!fC.cat || c.category === fC.cat) && (!fC.rar || c.rarity === fC.rar));
      $('#lista').innerHTML = list.map(c => `<div class="tarjeta cosmetico"><img src="${c.image}" alt="${esc(c.name)}" loading="lazy">
        <h3 style="margin-top:.5rem">${esc(c.name)}</h3>${rarTag(c.rarity)}${tag(COS_CAT[c.category], '#a89a84')}<p class="tenue">${esc(c.kind)}${itemById[c.id] ? ` · ${num(itemById[c.id].value)} jade` : ' · no comerciable'}</p></div>`).join('');
    };
    document.querySelectorAll('[data-c]').forEach(el => el.addEventListener('click', () => {
      const [k, v] = el.dataset.c.split(':'); fC[k] = fC[k] === v ? '' : v;
      document.querySelectorAll(`[data-c^="${k}:"]`).forEach(x => x.classList.toggle('on', x.dataset.c === `${k}:${fC[k]}`)); draw();
    }));
    draw();
  };
  const chips = (k, obj) => Object.entries(obj).map(([v, t]) => `<button class="chip ${fC[k] === v ? 'on' : ''}" data-c="${k}:${v}">${esc(Array.isArray(t) ? t[0] : t)}</button>`).join('');
  return panel('Cosméticos', `<div class="aviso">Las vistas son <b>provisionales</b>: los modelos finales pueden cambiar. Los cosméticos son solo visuales: no dan poder, vida ni velocidad.
      La Caja de Alas da Alas de Quetzalcóatl (Mítico, 1%) o Alas de Papálotl Nocturno (Común, 99%). Las probabilidades de las cajas Ceremonial y Cómica aún no se anuncian.</div>
    <div class="filtros">${chips('cat', COS_CAT)}</div><div class="filtros">${chips('rar', COS_RAR)}</div><div class="rejilla chica" id="lista"></div>`);
}

// ------------------------------------------------------------------ Tlatelolco
let trade = { das: [], recibes: [] };
function encodeTrade() { return ['das', 'recibes'].map(k => k[0] + '=' + trade[k].map(x => x.id + '*' + x.n).join(',')).join('&'); }
function tlatelolco(params) {
  ['das', 'recibes'].forEach(k => {
    const raw = params.get(k[0]);
    if (raw != null) trade[k] = raw.split(',').filter(Boolean).map(s => { const [id, n] = s.split('*'); return itemById[id] ? { id, n: Math.max(1, Math.min(999, parseInt(n) || 1)) } : null; }).filter(Boolean);
  });
  afterRender = setupTrade;
  const lado = (k, titulo) => `<div class="lado"><h3><span>${titulo}</span><span class="total" id="t-${k}">0</span></h3>
    <div class="buscador"><input type="search" id="b-${k}" placeholder="Agregar objeto… (bendición, ofrenda, pócima, cosmético)" autocomplete="off"><div class="sugerencias" id="s-${k}"></div></div>
    <div id="l-${k}"></div></div>`;
  return panel('Tlatelolco · calculadora de trueques', `<div class="aviso">Tlatelolco será la zona de trueque <b>dentro del juego</b>. Esta página no intercambia nada: solo te ayuda a ver
      cuánto vale lo que das y lo que recibes antes de aceptar.</div>
    <div class="trueque">${lado('das', 'Tú das')}${lado('recibes', 'Tú recibes')}</div><div id="veredicto"></div>
    <p style="margin-top:.8rem"><button class="boton sec" id="limpiar">Limpiar</button><button class="boton sec" id="compartir">Copiar enlace del trueque</button>
    <span class="tenue" id="copiado"></span></p>`) +
    panel('¿Cómo se calcula el valor?', `<ul>
      <li><b>Unidad:</b> todo se mide en <b>jade equivalente</b>.</li>
      <li><b>Bendiciones:</b> lo que cuesta, en promedio, conseguir esa bendición: precio de la ofrenda (${D.ritual.OfferingPriceJade} jade) ÷ probabilidad de verla entre las 3 cartas de su dios.
        Por eso una divina vale mucho más que una común, y una bendición vale más si su dios tiene pocas de esa rareza.</li>
      <li><b>Ofrendas y pócimas:</b> su precio en el mercado.</li>
      <li><b>Alas:</b> precio de la caja ÷ su probabilidad (Quetzalcóatl 1%). <b>Ceremoniales y cómicos:</b> valor por rareza mientras no se anuncien las probabilidades de sus cajas.</li>
      <li><b>Top Global:</b> no son comerciables.</li>
      <li>Un trueque se considera <b>justo</b> si la diferencia es menor al ${pct(V.umbralJusto, 0)}.</li></ul>
      <p class="tenue">Los valores son una guía: la demanda real de los jugadores puede subir o bajar el precio de un objeto.</p>`) +
    panel('Tabla de valores', `<div class="filtros"><input type="search" id="vq" placeholder="Buscar objeto…"><select id="vt"><option value="">Todos los tipos</option>
      ${[...new Set(ITEMS.map(i => i.type))].map(t => `<option>${t}</option>`).join('')}</select></div><div id="vtabla"></div>`);
}
function setupTrade() {
  const total = k => trade[k].reduce((a, x) => a + itemById[x.id].value * x.n, 0);
  const draw = () => {
    ['das', 'recibes'].forEach(k => {
      $('#l-' + k).innerHTML = trade[k].map((x, i) => { const it = itemById[x.id];
        return `<div class="renglon"><span>${esc(it.name)}<br><span class="tenue">${esc(it.type)}${it.rarity ? ' · ' + esc((rarityById[it.rarity] || {}).Name || (COS_RAR[it.rarity] || [it.rarity])[0]) : ''}</span></span>
          <input type="number" min="1" max="999" value="${x.n}" data-k="${k}" data-i="${i}"><span class="num">${num(it.value * x.n)}</span>
          <button class="quitar" data-k="${k}" data-i="${i}" title="Quitar">✕</button></div>`; }).join('') || '<p class="tenue">Aún no agregas nada.</p>';
      $('#t-' + k).textContent = num(total(k)) + ' jade';
    });
    const a = total('das'), b = total('recibes');
    const v = $('#veredicto');
    if (!a && !b) { v.innerHTML = ''; } else {
      const diff = b - a, rel = a ? diff / a : 1;
      const cls = Math.abs(rel) <= V.umbralJusto ? 'justo' : rel > 0 ? 'gana' : 'pierde';
      const txt = { justo: 'Trueque justo', gana: '¡Te conviene!', pierde: 'Pierdes valor' }[cls];
      const sum = a + b || 1;
      v.innerHTML = `<div class="veredicto ${cls}"><span class="grande">${txt}</span>
        ${diff >= 0 ? 'Ganas' : 'Pierdes'} <b>${num(Math.abs(diff))} jade</b>${a ? ` (${diff >= 0 ? '+' : '−'}${pct(Math.abs(rel), 0)})` : ''}
        <div class="balanza"><div style="width:${a / sum * 100}%;background:var(--rojo)"></div><div style="width:${b / sum * 100}%;background:var(--jade)"></div></div>
        <span class="tenue">Das ${num(a)} · Recibes ${num(b)}</span></div>`;
    }
    history.replaceState(null, '', '#/tlatelolco?' + encodeTrade());
  };
  ['das', 'recibes'].forEach(k => {
    const input = $('#b-' + k), box = $('#s-' + k); let sel = 0, found = [];
    const show = () => {
      const q = input.value.trim().toLowerCase();
      found = q ? ITEMS.filter(i => (i.name + ' ' + i.type + ' ' + (i.sub || '')).toLowerCase().includes(q)).slice(0, 30) : [];
      sel = 0; box.classList.toggle('abierta', found.length > 0);
      box.innerHTML = found.map((i, n) => `<button data-n="${n}" class="${n === 0 ? 'sel' : ''}"><span>${esc(i.name)} <span class="tenue">· ${esc(i.type)}${i.sub ? ' · ' + esc(i.sub) : ''}</span></span><span>${num(i.value)}</span></button>`).join('');
    };
    const add = n => { const it = found[n]; if (!it) return; const ex = trade[k].find(x => x.id === it.id); if (ex) ex.n++; else trade[k].push({ id: it.id, n: 1 }); input.value = ''; show(); draw(); };
    input.addEventListener('input', show);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, Math.min(found.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1)));
        box.querySelectorAll('button').forEach((b, i) => b.classList.toggle('sel', i === sel)); }
      if (e.key === 'Enter') { e.preventDefault(); add(sel); }
      if (e.key === 'Escape') { input.value = ''; show(); }
    });
    box.addEventListener('mousedown', e => { const b = e.target.closest('button'); if (b) { e.preventDefault(); add(+b.dataset.n); } });
    input.addEventListener('blur', () => setTimeout(() => box.classList.remove('abierta'), 150));
    $('#l-' + k).addEventListener('input', e => { if (e.target.dataset.k) { trade[k][+e.target.dataset.i].n = Math.max(1, Math.min(999, parseInt(e.target.value) || 1)); draw(); } });
    $('#l-' + k).addEventListener('click', e => { if (e.target.classList.contains('quitar')) { trade[k].splice(+e.target.dataset.i, 1); draw(); } });
  });
  $('#limpiar').onclick = () => { trade = { das: [], recibes: [] }; draw(); };
  $('#compartir').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(location.href).then(() => { $('#copiado').textContent = 'Enlace copiado.'; }); };
  // tabla de valores
  let sortKey = 'value', dir = -1;
  const drawTable = () => {
    const q = $('#vq').value.trim().toLowerCase(), t = $('#vt').value;
    const list = ITEMS.filter(i => (!q || i.name.toLowerCase().includes(q)) && (!t || i.type === t))
      .sort((x, y) => (sortKey === 'value' ? x.value - y.value : String(x[sortKey]).localeCompare(String(y[sortKey]))) * dir);
    $('#vtabla').innerHTML = `<div class="tabla-wrap" style="max-height:520px"><table><thead><tr><th class="ord" data-s="name">Objeto</th><th class="ord" data-s="type">Tipo</th>
      <th>Detalle</th><th>Rareza</th><th class="ord num" data-s="value">Valor (jade)</th></tr></thead><tbody>${list.map(i => `<tr><td>${esc(i.name)}</td><td>${esc(i.type)}</td>
      <td class="tenue">${esc(i.sub || '')}${i.odds ? ' · ' + num(i.odds.offerings, 1) + ' ofrendas en promedio' : ''}</td><td>${i.rarity ? rarTag(i.rarity) : ''}</td><td class="num">${num(i.value)}</td></tr>`).join('')}</tbody></table></div>`;
    document.querySelectorAll('#vtabla th.ord').forEach(th => th.onclick = () => { const s = th.dataset.s; dir = sortKey === s ? -dir : (s === 'value' ? -1 : 1); sortKey = s; drawTable(); });
  };
  $('#vq').addEventListener('input', drawTable); $('#vt').addEventListener('change', drawTable);
  drawTable(); draw();
}

route();
})();
