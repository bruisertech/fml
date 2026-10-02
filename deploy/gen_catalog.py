"""
Abogao – generador del catálogo. FUENTE ÚNICA DE VERDAD: deploy/catalogo.json
  - deploy/catalogo.json         datos: áreas, grupos, procesos, rutas, urgencias, oficios (se edita aquí)
  - deploy/catalogo_funciones.js funciones de consulta (búsqueda, rutas, niveles)
  - js/catalog.js                GENERADO: no se edita a mano
  - README.md                    el bloque entre <!-- CATALOGO:INICIO --> y <!-- CATALOGO:FIN --> se regenera

Uso desde la raíz:  python3 deploy/gen_catalog.py            (valida, genera y actualiza el README)
                    python3 deploy/gen_catalog.py --revisar  (solo valida; falla si js/catalog.js no está al día)

Cada proceso: [id, pictograma, título sencillo, ante quién, quién atiende (A|AG|G|P), urgencia (0|1|2),
               palabras clave, nombre técnico, grupo, plazo]
Urgencia: 2 = YA (detenido, riesgo, hecho en curso, término de horas) · 1 = PRONTO (plazo corto) · 0 = CON CITA.
"""
import json, re, sys

SRC, FUNCS, OUT, README = 'deploy/catalogo.json', 'deploy/catalogo_funciones.js', 'js/catalog.js', 'README.md'
d = json.load(open(SRC, encoding='utf-8'))
AREAS, GRUPOS, PROC, RUTAS, URG, OFICIOS = d['areas'], d['grupos'], d['procesos'], d['rutas'], d['urgencias'], d['oficios']

# ---------------- validación: el generador falla antes de escribir algo inconsistente
errores = []
area_ids = [a['id'] for a in AREAS]
if set(area_ids) != set(PROC): errores.append(f'áreas sin procesos o procesos sin área: {set(area_ids) ^ set(PROC)}')
claves, ids_por_area = set(), {}
for a, rows in PROC.items():
    for r in rows:
        if len(r) != 10: errores.append(f'{a}/{r[0]}: debe tener 10 campos, tiene {len(r)}')
        k = f'{a}/{r[0]}'
        if k in claves: errores.append(f'proceso duplicado: {k}')
        claves.add(k)
        if r[4] not in ('A', 'AG', 'G', 'P'): errores.append(f'{k}: quién atiende inválido {r[4]}')
        if r[5] not in (0, 1, 2): errores.append(f'{k}: urgencia inválida {r[5]}')
        if r[8] not in GRUPOS.get(a, {}): errores.append(f'{k}: grupo {r[8]} no existe en {a}')
        ids_por_area.setdefault(r[0], []).append(a)
for k in RUTAS:
    if k not in claves: errores.append(f'ruta sin proceso: {k}')
for u in URG:
    a, i = u['p'].split('/')
    row = next((r for r in PROC.get(a, []) if r[0] == i), None)
    if not row: errores.append(f'urgencia sin proceso: {u["p"]}')
    elif row[5] != 2: errores.append(f'urgencia {u["p"]} no tiene nivel YA')
# Mismo identificador en dos áreas con significado distinto (revisado): querella penal ≠ querella policiva;
# prescripción de la acción penal ≠ prescripción de una deuda con el Estado
PERMITIDOS = {'querella', 'prescripcion'}
repetidos = {k: v for k, v in ids_por_area.items() if len(v) > 1 and k not in PERMITIDOS}
if errores:
    print('CATÁLOGO INVÁLIDO:\n  ' + '\n  '.join(errores)); sys.exit(1)

# ---------------- escritura (formato estable: diferencias mínimas en git)
def js(v): return json.dumps(v, ensure_ascii=False)
lines = [f'''/**
 * ARCHIVO GENERADO por deploy/gen_catalog.py desde deploy/catalogo.json — no editar a mano.
 * Dependencias: ninguna
 * Expone:       ABOGAO_AREAS, ABOGAO_PROCESOS, ABOGAO_GRUPOS, ABOGAO_NIVELES, ABOGAO_RUTAS, ABOGAO_URGENCIAS,
 *               ABOGAO_OFICIOS, ABOGAO_NEED, findProceso(), searchProcesos(), getRuta(), procesosPorNivel(), grupoDe()
 *
 * Abogao – Catálogo del derecho colombiano por áreas, grupos y procesos (catálogo {d['version']}).
 * Cada proceso: [id, pictograma, título sencillo, ante quién, quién atiende, urgencia, palabras clave,
 *                nombre técnico, grupo, plazo]
 *   quién atiende: A = abogado · AG = abogado o gestor · G = gestor · P = perito u otro profesional
 *   urgencia (análisis por norma y por riesgo):
 *     2 = YA      → botón "Abogado YA": persona detenida, riesgo físico, hecho en curso o término de horas.
 *     1 = PRONTO  → botón "Se me vence un plazo": caducidad o término corto, o daño que crece.
 *     0 = CON CITA→ se programa sin perder derechos.
 *   Un proceso urgente también aparece en su área y en la búsqueda: el nivel decide el botón, no lo esconde.
 * Las rutas (ABOGAO_RUTAS) son información general revisada por abogados; cada una lleva fecha.
 */
''']
lines.append('const ABOGAO_AREAS = [\n' + ',\n'.join('  ' + js(a) for a in AREAS) + '\n];\n')
lines.append('/** Grupos por área: cada área se muestra en pocos grupos plegables, nunca como una lista larga */')
lines.append('const ABOGAO_GRUPOS = {\n' + ',\n'.join(f'  {k}: {{ ' + ', '.join(f"{g}: {{ e: {js(v['e'])}, n: {js(v['n'])} }}" for g, v in gs.items()) + ' }' for k, gs in GRUPOS.items()) + '\n};\n')
lines.append('const ABOGAO_PROCESOS = {\n' + ',\n'.join(f'  {a}: [\n' + ',\n'.join('    ' + js(r) for r in PROC[a]) + '\n  ]' for a in area_ids) + '\n};\n')
lines.append('/** Rutas detalladas: qué pasa, qué sigue, qué tener y el aviso de plazo. rev = fecha de revisión. */')
lines.append('const ABOGAO_RUTAS = {\n' + ',\n'.join(f'  {js(k)}: {js(v)}' for k, v in RUTAS.items()) + '\n};\n')
lines.append(f'/** Botón "Abogado YA": las {len(URG)} urgencias más frecuentes; el resto se busca en la misma pantalla */')
lines.append('const ABOGAO_URGENCIAS = ' + js(URG) + ';\n')
lines.append('/** Tipos de profesional que pueden vincularse */')
lines.append('const ABOGAO_OFICIOS = ' + js(OFICIOS) + ';\n')
lines.append(open(FUNCS, encoding='utf-8').read())
nuevo = '\n'.join(lines)

# ---------------- resumen (va al README)
niv = {0: 0, 1: 0, 2: 0}
for rows in PROC.values():
    for r in rows: niv[r[5]] += 1
total = sum(len(v) for v in PROC.values())
resumen = (f"<!-- CATALOGO:INICIO (generado por deploy/gen_catalog.py; no editar) -->\n"
           f"| Catálogo {d['version']} | Cantidad |\n| --- | --- |\n| Áreas | {len(AREAS)} |\n| Procesos | {total} |\n"
           f"| Penal | {len(PROC.get('penal', []))} |\n| 🚨 YA / ⏰ Pronto / 📅 Con cita | {niv[2]} / {niv[1]} / {niv[0]} |\n"
           f"| Rutas detalladas | {len(RUTAS)} |\n| Urgencias en el botón \"Abogado YA\" | {len(URG)} |\n"
           f"<!-- CATALOGO:FIN -->")

if '--revisar' in sys.argv:
    actual = open(OUT, encoding='utf-8').read()
    if actual != nuevo: print('js/catalog.js NO está al día con deploy/catalogo.json: ejecuta python3 deploy/gen_catalog.py'); sys.exit(1)
    print('catálogo al día'); sys.exit(0)

open(OUT, 'w', encoding='utf-8').write(nuevo)
rd = open(README, encoding='utf-8').read()
if '<!-- CATALOGO:INICIO' in rd:
    rd = re.sub(r'<!-- CATALOGO:INICIO.*?<!-- CATALOGO:FIN -->', resumen, rd, flags=re.S)
    open(README, 'w', encoding='utf-8').write(rd)
print(f'catálogo {d["version"]}: {len(AREAS)} áreas, {total} procesos (YA {niv[2]}, Pronto {niv[1]}, Con cita {niv[0]}), {len(RUTAS)} rutas, {len(URG)} urgencias')
if repetidos: print('aviso: identificadores repetidos entre áreas (revisar si significan lo mismo):', repetidos)
