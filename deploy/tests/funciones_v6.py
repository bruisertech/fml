# Pruebas de las funciones de la v6 (cuestionario, reenrutamiento, dosier, disponibilidad, ficha, PWA).
# Uso desde la raíz: python3 deploy/tests/funciones_v6.py [carpeta]
import asyncio, subprocess, sys
from playwright.async_api import async_playwright
ROOT=sys.argv[1] if len(sys.argv)>1 else '.'
async def route(r):
    u=r.request.url
    if u.startswith('http://localhost'): return await r.continue_()
    return await r.abort()
ok=[];bad=[]
def check(n,c): (ok if c else bad).append(n)
async def shot(pg,n): await pg.wait_for_timeout(300)
async def main():
    srv=subprocess.Popen(['python3','deploy/tests/servidor_gzip.py',ROOT,'8420'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); await asyncio.sleep(0.8)
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844}); pg=await ctx.new_page()
        await pg.route('**/*',route); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        U='http://localhost:8420/index.html'
        await pg.goto(U); await pg.wait_for_timeout(500); await pg.check('#cOk'); await pg.click('#cGo'); await shot(pg,1)
        check('contador de consulta', '/ 300' in await pg.inner_text('#askCount'))
        check('tarjeta de confianza', await pg.is_visible('.trust-card'))
        # Caso: laboral + entidad pública -> reenruta a administrativo
        await pg.goto(U+'#/proceso/laboral/despido'); await pg.wait_for_timeout(300)
        await pg.click('[data-flow="laboral/despido"] >> nth=0'); await pg.wait_for_timeout(300); await shot(pg,2)
        check('cuestionario abre', await pg.is_visible('#qGo'))
        await pg.click('[data-q=para][data-v=yo]'); await pg.click('[data-q=empleo][data-v=publica]'); await pg.click('[data-q=especial][data-v=ninguna]')
        await pg.click('[data-q=vez][data-v=primera]'); await pg.click('[data-q=necesita][data-v=documento]')
        await pg.fill('#qTxt','Trabajé 2 años en la alcaldía y no me renovaron'); await pg.click('#qGo'); await pg.wait_for_timeout(300); await shot(pg,3)
        check('recomienda derecho administrativo', 'administrativo' in (await pg.inner_text('#sheet')).lower())
        await pg.click('#rcYes'); await pg.wait_for_timeout(600); await shot(pg,4)
        check('resultados de Estado y entidades', 'empleado público' in (await pg.inner_text('#main')).lower() or 'Estado' in await pg.inner_text('#main'))
        # dosier
        await pg.click('[data-prof] >> nth=0'); await pg.wait_for_timeout(300); await shot(pg,5)
        t=await pg.inner_text('#main')
        check('dosier: verificación, formación, tarifas', all(k.lower() in t.lower() for k in ['Verificación','Formación','Tarifas publicadas','Asuntos que atiende']))
        await pg.click('#pfPick'); await pg.wait_for_timeout(300); await shot(pg,6)
        check('ficha visible en pago', 'Esto verá el abogado' in await pg.inner_text('#main') and 'Empleo' in await pg.inner_text('#main'))
        # Sin disponibles: migratorio (su abogado está no disponible)
        await pg.goto(U+'#/proceso/migratorio/visa'); await pg.wait_for_timeout(300)
        await pg.click('[data-flow="migratorio/visa"] >> nth=0'); await pg.wait_for_timeout(300); await pg.click('#qSkip'); await pg.wait_for_timeout(500); await shot(pg,7)
        t=await pg.inner_text('#main')
        check('aviso honesto sin disponibles', 'no contamos con abogados de migración' in t.lower())
        check('no muestra otra área sin avisar', not await pg.query_selector('#resCards'))
        await pg.click('[data-alt] >> nth=0'); await pg.wait_for_timeout(500); await shot(pg,8)
        check('área relacionada con aviso', 'Estás viendo abogados de' in await pg.inner_text('#main'))
        # Víctima en penal reenruta a representación de víctimas
        await pg.goto(U+'#/proceso/penal/hurto'); await pg.wait_for_timeout(300)
        await pg.click('[data-flow="penal/hurto"] >> nth=0'); await pg.wait_for_timeout(300)
        await pg.click('[data-q=rol][data-v=victima]'); await pg.click('#qGo'); await pg.wait_for_timeout(300)
        check('víctima → abogado de víctimas', 'víctima' in (await pg.inner_text('#sheet')).lower())
        # urgente con rol
        await pg.goto(U+'#/inicio'); await pg.click('[data-go=urgente]'); await pg.click('[data-u=seguro]'); await pg.click('[data-k="penal/lesiones"]'); await pg.wait_for_timeout(200); await shot(pg,9)
        check('urgencia: pelea con heridos en la cuadrícula y papel', await pg.is_visible('#segRol'))
        # confianza
        await pg.goto(U+'#/confianza'); await pg.wait_for_timeout(300); await shot(pg,10)
        check('pantalla de confianza', 'no es un bufete' in (await pg.inner_text('#main')).lower())
        # PWA
        man=await pg.evaluate("fetch('manifest.json').then(r=>r.json()).then(m=>m.short_name)")
        check('manifiesto', man=='Abogao')
        await pg.wait_for_timeout(1500)
        sw=await pg.evaluate("navigator.serviceWorker.getRegistrations().then(r=>r.length)")
        check('service worker registrado', sw>=1)
        await pg.goto(U+'#/pro-solicitudes'); await pg.wait_for_timeout(300)
        check('ficha en la solicitud del abogado', 'Ficha del caso' in await pg.inner_text('#main'))
        check('sin errores JS', not errs)
        if errs: print(errs[:3])
        await b.close()
    srv.terminate()
    print('OK',len(ok)); [print('  ✓',x) for x in ok]; print('FALLAS',len(bad)); [print('  ✗',x) for x in bad]
asyncio.run(main())
