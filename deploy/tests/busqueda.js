/**
 * Prueba de búsqueda: el proceso esperado debe salir PRIMERO para cada frase real de usuario.
 * Uso desde la raíz: node deploy/tests/busqueda.js   (termina con código 1 si alguna falla)
 * Al agregar procesos o palabras clave, ejecútala: evita que una palabra nueva desvíe otras búsquedas.
 */
const vm = require('vm'), fs = require('fs');
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('js/catalog.js', 'utf8') + ';this.S = searchProcesos', ctx);
const CASOS = {
  'capturaron a mi hermano': 'penal/captura',
  'me embargaron': 'coactivo/embargo',
  'me embargaron la cuenta': 'coactivo/embargo',
  'me citaron de la inspección': 'policivo/citacion_insp',
  'me pegó mi pareja': 'penal/vif',
  'choqué y se llevaron el carro a patios': 'penal/patios',
  'me despidieron embarazada': 'laboral/fuero',
  'la EPS no me da el medicamento': 'salud/eps',
  'el vecino hace mucho ruido': 'ph/ph_ruido',
  'me van a desalojar hoy': 'inmobiliario/lanzamiento',
  'me robaron el celular': 'penal/hurto',
  'me llegó una carta de la DIAN': 'tributario/requerimiento',
  'quiero apelar la condena': 'penal/apelacion',
  'me cortaron el agua en el conjunto': 'ph/ph_servicios',
  'me insultaron en redes sociales': 'penal/injuria',
  'me llegó un mandamiento de pago': 'coactivo/mandamiento',
  'me extorsionan por whatsapp': 'penal/extorsion',
  'invadieron mi lote': 'policivo/invasion',
  'no me pagan la cuota de alimentos de mi hijo': 'familia/alimentos',
  'archivaron mi denuncia': 'penal/desarchivo'
};
let fallas = 0;
for (const [q, esperado] of Object.entries(CASOS)) {
  const r = ctx.S(q, 3).map(p => p.key);
  const ok = r[0] === esperado;
  if (!ok) fallas++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + q.padEnd(46) + (ok ? r[0] : `esperado ${esperado}, obtuvo ${r.join(', ') || 'nada'}`));
}
console.log(fallas ? `FALLAS ${fallas}` : `OK ${Object.keys(CASOS).length}`);
process.exit(fallas ? 1 : 0);
