/* ---------- Funciones de consulta ---------- */
const ABOGAO_NEED = { A: 'Abogado', AG: 'Abogado o gestor', G: 'Gestor', P: 'Perito o profesional' };

/** Devuelve un proceso como objeto a partir de "area/id" */
function findProceso(key) {
  const [a, id] = String(key).split('/');
  const row = (ABOGAO_PROCESOS[a] || []).find(r => r[0] === id);
  if (!row) return null;
  const area = ABOGAO_AREAS.find(x => x.id === a);
  return { key: a + '/' + id, area: a, areaObj: area, id, e: row[1], t: row[2], ante: row[3], need: row[4], u: row[5], kw: row[6], tn: row[7] || '', g: row[8] || '', pl: row[9] || '' };
}

/** Busca procesos por texto libre (sin tildes); devuelve los mejores primero */
function searchProcesos(texto, limit = 6, opts = {}) {
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const STOP = ['que','los','las','del','una','uno','con','por','para','pero','como','hace','hacer','mucho','muy','mas','tengo','quiero','estoy','esta','este','ese','esa','fue','ahora','hoy','ayer','donde','cuando','porque','sin','sus','mis','nos','les','soy','era','son','van','vamos','voy','tiene','tienen','quieren','hicieron'];
  const words = norm(texto).replace(/[^a-z0-9ñ\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.includes(w));
  if (!words.length) return [];
  const out = [];
  Object.keys(ABOGAO_PROCESOS).forEach(a => ABOGAO_PROCESOS[a].forEach(r => {
    const hay = norm(r[2] + ' ' + r[6] + ' ' + (r[7] || ''));
    let s = 0;
    words.forEach(w => { if (hay.includes(w)) s += 2; else if (w.length >= 6 && hay.includes(w.slice(0, Math.max(5, Math.min(6, w.length - 2))))) s += 1.5; });
    // Sin bonificación fija por área: el orden lo decide la coincidencia de palabras; la urgencia solo desempata.
    if (s) out.push({ key: a + '/' + r[0], s: s + r[5] * 0.1 });
  }));
  out.sort((x, y) => y.s - x.s);
  const top = out.length ? out[0].s : 0;
  // Solo lo relevante: descarta coincidencias débiles frente a la mejor
  // _score permite calcular la confianza de la clasificación sin volver a buscar
  return (opts.all ? out : out.filter(x => x.s >= top * 0.6)).slice(0, limit).map(x => Object.assign(findProceso(x.key), { _score: x.s }));
}

/** Ruta del proceso; si no tiene ruta detallada, devuelve una general honesta */
function getRuta(p) {
  const r = ABOGAO_RUTAS[p.key];
  if (r) return r;
  return { rev: '', generic: true, q: `Este asunto se atiende ante: ${p.ante}.`,
    pasos: ['Reúne los documentos y pruebas que tengas.', `Habla con un profesional de ${p.areaObj.n.toLowerCase()} para revisar tu caso.`, 'Él te dice los plazos y el camino exacto.'],
    docs: ['Documento de identidad', 'Cartas, notificaciones o contratos relacionados'], aviso: p.u === 2 ? 'Es un asunto urgente: no lo dejes para después.' : '' };
}

/** Nivel de urgencia legible */
const ABOGAO_NIVELES = {
  2: { e: '🚨', n: 'YA', d: 'Atención inmediata: persona detenida, riesgo, hecho en curso o plazo de horas' },
  1: { e: '⏰', n: 'Pronto', d: 'Corre un plazo corto: días o pocos meses' },
  0: { e: '📅', n: 'Con cita', d: 'Se puede programar sin perder derechos' }
};

/** Todos los procesos de un nivel de urgencia, agrupados por área */
function procesosPorNivel(u) {
  const out = [];
  ABOGAO_AREAS.forEach(a => ABOGAO_PROCESOS[a.id].forEach(r => { if (r[5] === u) out.push(findProceso(a.id + '/' + r[0])); }));
  return out;
}

/** Grupo de un proceso (cada área tiene los suyos) */
function grupoDe(p) { return p && p.g && ABOGAO_GRUPOS[p.area] ? ABOGAO_GRUPOS[p.area][p.g] || null : null; }
