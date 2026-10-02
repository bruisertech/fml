# Prueba de regresión de Abogao. Requiere: pip install playwright && playwright install chromium
# Uso desde la raíz: python3 deploy/tests/regresion.py [carpeta]   (por defecto ".", o "dist" tras compilar)
import asyncio, subprocess, time, sys
from playwright.async_api import async_playwright
ROOT=sys.argv[1] if len(sys.argv)>1 else '.'
async def route(r):
    u=r.request.url
    if u.startswith('http://localhost'):
        if '/api/clasificar' in u:
            await asyncio.sleep(6); return await r.fulfill(status=200, body='{"procesos":[]}', content_type='application/json')
        return await r.continue_()
    return await r.abort()
ok=[]; bad=[]
def check(name, cond): (ok if cond else bad).append(name)
async def main():
    srv=subprocess.Popen(['python3','deploy/tests/servidor_gzip.py',ROOT,'8400'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    await asyncio.sleep(0.8)
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':844},geolocation={'latitude':3.44,'longitude':-76.53},permissions=['geolocation'])
        pg=await ctx.new_page(); await pg.route('**/*',route)
        errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        csp=[]; pg.on('console',lambda m: csp.append(m.text) if 'Content Security Policy' in m.text else None)
        U='http://localhost:8400/index.html'
        await pg.goto(U); await pg.wait_for_timeout(500)
        check('franja demo visible', await pg.is_visible('.demo-bar'))
        check('Leaflet NO se carga al inicio (se carga al abrir un mapa)', await pg.evaluate('typeof L==="undefined"'))
        await pg.check('#cOk'); await pg.click('#cGo')
        # borrador
        await pg.fill('#askText','capturaron a mi hermano'); await pg.wait_for_timeout(600)
        await pg.reload(); await pg.wait_for_timeout(600)
        check('borrador recuperado tras recargar', (await pg.input_value('#askText'))=='capturaron a mi hermano')
        # clasificación local
        await pg.click('#askGo'); await pg.wait_for_timeout(400)
        check('reglas encuentran captura', 'Capturaron a alguien' in await pg.inner_text('#sheet'))
        await pg.click('#sheet [data-sheet-go^="spec:"]'); await pg.wait_for_timeout(300)
        # flujo urgente con modalidad sugerida
        await pg.click('[data-u=seguro]'); await pg.wait_for_timeout(200)
        check('captura: salta la modalidad (presencial preseleccionada)', await pg.is_visible('#uLoc') and 'Que venga' in await pg.inner_text('#main'))
        await pg.click('#uLoc'); await pg.wait_for_timeout(1200)
        check('letras en tarjetas', (await pg.inner_text('#resCards')).find('A · ')>=0)
        await pg.wait_for_function('typeof L!=="undefined" && !!MapController.map', timeout=8000)
        check('Leaflet cargado al abrir los resultados', await pg.evaluate('typeof L!=="undefined"'))
        check('T.P. marcada demo', '(demo)' in await pg.inner_text('#resCards'))
        await pg.evaluate('window.__mapRef = MapController.map')
        first=await pg.inner_text('#resCards h3 >> nth=0')
        await pg.click('[data-omit] >> nth=0'); await pg.wait_for_timeout(300)
        check('omitir no recrea el mapa', await pg.evaluate('window.__mapRef === MapController.map && !!MapController.map'))
        check('omitir cambia la lista', first != await pg.inner_text('#resCards h3 >> nth=0'))
        # continuidad del flujo tras recarga
        await pg.click('[data-pick] >> nth=0'); await pg.wait_for_timeout(300)
        await pg.reload(); await pg.wait_for_timeout(600)
        check('flujo recuperado en pago tras recargar', await pg.is_visible('#pGo'))
        await pg.fill('#pN','Ana'); await pg.fill('#pT','300'); await pg.fill('#pD','Cra 1'); await pg.check('#pOk'); await pg.click('#pGo'); await pg.wait_for_timeout(5200)
        check('caso aceptado y sala abierta', await pg.is_visible('#chatIn'))
        # mapa: chips sin recrear
        await pg.click('nav [data-go=mapa]'); await pg.wait_for_timeout(600)
        await pg.evaluate('window.__m2 = MapController.map')
        await pg.click('[data-marea=penal]'); await pg.wait_for_timeout(300)
        check('filtro del mapa no recrea el mapa', await pg.evaluate('window.__m2 === MapController.map'))
        check('lista del mapa filtrada', 'Penal' in await pg.inner_text('#mapList') or 'Abogado' in await pg.inner_text('#mapList'))
        # admin deshabilitado
        await pg.goto(U+'?admin=1#/yo'); await pg.wait_for_timeout(500)
        check('?admin=1 no muestra configuración de IA', not await pg.is_visible('#yAi'))
        # abogado: No puedo ahora
        await pg.goto(U+'#/pro-solicitudes'); await pg.wait_for_timeout(300)
        check('botón No puedo ahora', await pg.is_visible('#nopuedo'))
        # IA con proxy lento: debe caer a reglas en ~3 s
        await pg.goto(U+'#/inicio'); await pg.wait_for_timeout(300)
        await pg.evaluate("ABOGAO_CONFIG.aiEndpoint='/api/clasificar'")
        t0=time.time()
        r=await pg.evaluate("GoogleApiTest.analyzeCaseAudioOrText({textPrompt:'problema con la plata del negocio y un contrato'}).then(r=>({s:r.source,e:r.error||'',n:r.procesos.length}))")
        dt=time.time()-t0
        check(f'IA lenta cae a reglas en <3,5 s ({dt:.1f}s, {r["s"]})', dt<3.5 and r['s']=='reglas')
        r2=await pg.evaluate("GoogleApiTest.analyzeCaseAudioOrText({textPrompt:'capturaron a mi hermano'}).then(r=>r.source)")
        check('caso claro no llama a la IA', r2=='reglas')
        # regresión general de pantallas
        for h in ['#/temas','#/tema/penal','#/tema/ph','#/proceso/policivo/invasion','#/plazos','#/urgentes','#/casos','#/unirme','#/pro','#/condiciones']:
            await pg.goto(U+h); await pg.wait_for_timeout(250)
            check('pantalla '+h, len(await pg.inner_text('#main'))>50)
        check('sin errores de JavaScript', not errs); check('sin bloqueos de CSP', not csp)
        if errs: print(errs[:3])
        if csp: print(csp[:3])
        await b.close()
    srv.terminate()
    print('OK', len(ok)); [print('  ✓',x) for x in ok]; print('FALLAS', len(bad)); [print('  ✗',x) for x in bad]
asyncio.run(main())
