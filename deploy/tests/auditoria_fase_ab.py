# Pruebas de los cambios de la auditoría (fases A y B, v6.1): datos demo, atribución, escapado HTML, Leaflet
# bajo demanda, métricas, clasificación estructurada, id de solicitud, retención local, versión del service worker
# y presupuesto de peso. Uso desde la raíz: python3 deploy/tests/auditoria_fase_ab.py [carpeta]
import asyncio, subprocess, sys, re, json
from playwright.async_api import async_playwright
ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
PRESUPUESTO_KB = 75 if 'dist' in ROOT else 95   # KB al abrir el inicio con gzip: 75 en la versión publicada (dist), 95 en el código fuente
ok, bad = [], []
def check(n, c): (ok if c else bad).append(n)
XSS = '<img src=x onerror="window.__xss=1">'
async def main():
    srv = subprocess.Popen(['python3', 'deploy/tests/servidor_gzip.py', ROOT, '8440'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    await asyncio.sleep(0.8)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, geolocation={'latitude': 3.44, 'longitude': -76.53}, permissions=['geolocation'])
        pg = await ctx.new_page()
        reqs = []
        pg.on('request', lambda r: reqs.append(r.url))
        await pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith('http://localhost') else r.abort())
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        dialogs = []; pg.on('dialog', lambda d: (dialogs.append(d.message), asyncio.ensure_future(d.dismiss())))
        U = 'http://localhost:8440/index.html'
        await pg.goto(U, wait_until='load'); await pg.wait_for_timeout(600)
        kb = await pg.evaluate("(performance.getEntriesByType('resource').reduce((a,r)=>a+r.transferSize,0)+performance.getEntriesByType('navigation')[0].transferSize)/1024")
        check(f'presupuesto: inicio ≤ {PRESUPUESTO_KB} KB (medido {kb:.1f} KB)', kb <= PRESUPUESTO_KB)
        check('Leaflet no se descarga en el inicio', not any('leaflet' in u for u in reqs))
        await pg.check('#cOk'); await pg.click('#cGo')
        check('métrica primera pantalla útil', any(m['marca'] == 'primera-pantalla-util' for m in await pg.evaluate('AbogaoMetricas()')))
        # Escapado: el texto del usuario nunca se ejecuta como HTML
        await pg.fill('#askText', 'capturaron a mi hermano ' + XSS); await pg.click('#askGo'); await pg.wait_for_timeout(400)
        await pg.click('#sheet [data-sheet-go^="spec:"]'); await pg.wait_for_timeout(300)
        check('clasificación estructurada en la solicitud', await pg.evaluate("!!(JSON.parse(localStorage.getItem('abogao3:flow')).f.clasificacion && JSON.parse(localStorage.getItem('abogao3:flow')).f.clasificacion.proceso==='penal/captura' && JSON.parse(localStorage.getItem('abogao3:flow')).f.clasificacion.confianza>0)"))
        check('id de solicitud (para idempotencia)', await pg.evaluate("typeof JSON.parse(localStorage.getItem('abogao3:flow')).f.requestId==='string' && JSON.parse(localStorage.getItem('abogao3:flow')).f.requestId.length>8"))
        await pg.click('[data-u=seguro]'); await pg.click('#uLoc'); await pg.wait_for_timeout(1500)
        await pg.wait_for_function('!!MapController.map', timeout=8000)
        attr = await pg.inner_text('.leaflet-control-attribution')
        check('atribución "OpenStreetMap contributors"', 'OpenStreetMap contributors' in attr)
        check('T.P. de demostración con prefijo DEMO-', 'DEMO-' in await pg.evaluate("JSON.stringify(PROFESIONALES.filter(p=>p.kind==='abogado').map(p=>p.doc))") and await pg.evaluate("PROFESIONALES.filter(p=>p.kind==='abogado').every(p=>p.doc.includes('DEMO-'))"))
        # Escapado en las ventanas del mapa con un nombre malicioso
        await pg.evaluate(f"MapController.show([Object.assign({{}}, PROFESIONALES[0], {{name: {json.dumps(XSS)}, neighborhood: {json.dumps(XSS)}, distanceKm: 1}})])")
        await pg.evaluate("MapController.layer.eachLayer(l => l.getPopup && l.getPopup() && l.openPopup())"); await pg.wait_for_timeout(300)
        await pg.click('[data-pick] >> nth=0'); await pg.wait_for_timeout(300)
        await pg.fill('#pN', XSS); await pg.fill('#pT', '300'); await pg.fill('#pD', XSS); await pg.check('#pOk'); await pg.click('#pGo'); await pg.wait_for_timeout(5200)
        await pg.fill('#chatIn', XSS); await pg.click('#chatGo'); await pg.wait_for_timeout(300)
        check('el caso guarda clasificación e id de solicitud', await pg.evaluate("!!(JSON.parse(localStorage.getItem('abogao3:cases'))[0].clasificacion && JSON.parse(localStorage.getItem('abogao3:cases'))[0].requestId)"))
        await pg.goto(U + '#/unirme'); await pg.wait_for_timeout(300); await pg.fill('#rName', XSS)
        await pg.goto(U + '#/inicio'); await pg.wait_for_timeout(300)
        check('sin ejecución de HTML inyectado (XSS)', not await pg.evaluate('window.__xss===1') and not dialogs)
        # Retención: un caso de hace 40 días se borra al abrir la app
        await pg.evaluate("(()=>{const k='abogao3:cases';const c=JSON.parse(localStorage.getItem(k)||'[]');c.push({id:1,pro:'pro-1',title:'viejo',e:'x',mod:'llamada',price:1,days:1,created:new Date(Date.now()-40*864e5).toISOString(),msgs:[]});localStorage.setItem(k,JSON.stringify(c));})()")
        await pg.reload(); await pg.wait_for_timeout(500)
        check('retención: casos de más de 30 días se borran', await pg.evaluate("!JSON.parse(localStorage.getItem('abogao3:cases')||'[]').some(c=>c.title==='viejo')"))
        # Duplicado retirado
        check('citacion_insp solo en Policía', await pg.evaluate("!findProceso('alcaldia/citacion_insp') && !!findProceso('policivo/citacion_insp')"))
        # Versión del service worker = versión de la app
        sw = await (await pg.request.get('http://localhost:8440/sw.js')).text()
        ver = await pg.evaluate('ABOGAO_CONFIG.version')
        check(f'service worker con la versión de la app ({ver})', f"abogao-{ver}" in sw)
        check('sin errores de JavaScript', not errs)
        if errs: print(errs[:3])
        await b.close()
    srv.terminate()
    print('OK', len(ok)); [print('  ✓', x) for x in ok]; print('FALLAS', len(bad)); [print('  ✗', x) for x in bad]
    sys.exit(1 if bad else 0)
asyncio.run(main())
