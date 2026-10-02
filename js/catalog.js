/**
 * ARCHIVO GENERADO por deploy/gen_catalog.py desde deploy/catalogo.json — no editar a mano.
 * Dependencias: ninguna
 * Expone:       ABOGAO_AREAS, ABOGAO_PROCESOS, ABOGAO_GRUPOS, ABOGAO_NIVELES, ABOGAO_RUTAS, ABOGAO_URGENCIAS,
 *               ABOGAO_OFICIOS, ABOGAO_NEED, findProceso(), searchProcesos(), getRuta(), procesosPorNivel(), grupoDe()
 *
 * Abogao – Catálogo del derecho colombiano por áreas, grupos y procesos (catálogo 6.1.0).
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

const ABOGAO_AREAS = [
  {"id": "penal", "e": "⚖️", "n": "Penal", "c": "#C2362B", "d": "Capturas, Fiscalía, víctimas y defensa 24 horas", "fuerte": true},
  {"id": "transito", "e": "🚗", "n": "Tránsito", "c": "#2F6FDE", "d": "Comparendos, choques, patios y licencias"},
  {"id": "familia", "e": "👨‍👩‍👧", "n": "Familia", "c": "#B8307A", "d": "Violencia, hijos, alimentos, divorcio, herencias"},
  {"id": "laboral", "e": "👷", "n": "Laboral y pensiones", "c": "#D2562B", "d": "Despidos, salarios, accidentes, pensión"},
  {"id": "civil", "e": "📜", "n": "Civil y contratos", "c": "#8A4FD8", "d": "Deudas, demandas, contratos, daños"},
  {"id": "inmobiliario", "e": "🏠", "n": "Vivienda y urbanismo", "c": "#6B7A12", "d": "Arriendos, predios, licencias, conjuntos"},
  {"id": "ph", "e": "🏢", "n": "Conjuntos y edificios", "c": "#7C2D12", "d": "Propiedad horizontal: administración, asamblea, vecinos"},
  {"id": "policivo", "e": "👮", "n": "Policía y convivencia", "c": "#1F5673", "d": "Código de Policía: invasiones, vecinos, comparendos"},
  {"id": "alcaldia", "e": "🏛️", "n": "Alcaldía y municipio", "c": "#0F7C95", "d": "Negocios, permisos, impuestos locales"},
  {"id": "administrativo", "e": "🏢", "n": "Estado y entidades", "c": "#475569", "d": "Peticiones, demandas al Estado, sanciones"},
  {"id": "constitucional", "e": "🛡️", "n": "Tutelas y derechos", "c": "#0E8A6E", "d": "Tutela, acción popular, datos personales"},
  {"id": "salud", "e": "🏥", "n": "Salud", "c": "#DB2777", "d": "EPS, medicamentos, errores médicos"},
  {"id": "tributario", "e": "🧾", "n": "Impuestos y DIAN", "c": "#A16207", "d": "Requerimientos, sanciones, devoluciones"},
  {"id": "coactivo", "e": "💸", "n": "Cobros y embargos", "c": "#B45309", "d": "Cobro coactivo, cuentas embargadas"},
  {"id": "aduanero", "e": "📦", "n": "Aduanas y divisas", "c": "#7C3AED", "d": "Mercancía retenida, importaciones"},
  {"id": "disciplinario", "e": "🧑‍⚖️", "n": "Disciplinario", "c": "#9A3412", "d": "Servidores públicos, abogados, policías"},
  {"id": "comercial", "e": "🏪", "n": "Empresas y comercio", "c": "#0369A1", "d": "Sociedades, socios, marcas, facturas"},
  {"id": "consumidor", "e": "🛒", "n": "Consumidor y bancos", "c": "#15803D", "d": "Garantías, bancos, Datacrédito, servicios"},
  {"id": "insolvencia", "e": "📉", "n": "Deudas e insolvencia", "c": "#BE123C", "d": "No puedo pagar, remates, hipotecas"},
  {"id": "migratorio", "e": "🛂", "n": "Migración", "c": "#4F46E5", "d": "Visas, PPT, nacionalidad"},
  {"id": "victimas", "e": "🕊️", "n": "Víctimas y tierras", "c": "#0D9488", "d": "Conflicto armado, reparación, restitución"},
  {"id": "ambiental", "e": "🌳", "n": "Ambiental y rural", "c": "#3F6212", "d": "Sanciones ambientales, baldíos, animales"},
  {"id": "notarial", "e": "🖋️", "n": "Notaría y registro", "c": "#57534E", "d": "Escrituras, poderes, registro civil"},
  {"id": "tramites", "e": "🗂️", "n": "Gestores y peritos", "c": "#64748B", "d": "Trámites, avalúos, traductores, peritos"}
];

/** Grupos por área: cada área se muestra en pocos grupos plegables, nunca como una lista larga */
const ABOGAO_GRUPOS = {
  penal: { urg: { e: "🚨", n: "Detenidos y allanamientos" }, inv: { e: "🔎", n: "Me investigan o me acusan" }, vic: { e: "🕊️", n: "Soy víctima" }, fin: { e: "🤝", n: "Terminar el proceso antes" }, con: { e: "⚖️", n: "Después de la sentencia" }, esp: { e: "🏛️", n: "Procesos especiales" }, del: { e: "📚", n: "Por delito" } },
  transito: { via: { e: "🚨", n: "En la vía, ahora" }, multas: { e: "🎫", n: "Comparendos y multas" }, veh: { e: "🚙", n: "Vehículo y licencia" }, danos: { e: "🩹", n: "Daños y seguros" } },
  familia: { prot: { e: "🛡️", n: "Violencia y protección (Comisaría 24 h)" }, ninos: { e: "🧸", n: "Niños, niñas y adolescentes" }, pareja: { e: "💑", n: "Pareja y matrimonio" }, bienes: { e: "🕯️", n: "Herencias y bienes" }, apoyos: { e: "🤲", n: "Personas con discapacidad y adultos mayores" } },
  laboral: { desp: { e: "📤", n: "Despido y terminación" }, pagos: { e: "💵", n: "Salarios y prestaciones" }, salud: { e: "🦺", n: "Accidentes, salud y estabilidad" }, trato: { e: "😣", n: "Acoso y trato" }, pens: { e: "👴", n: "Pensiones y seguridad social" }, sind: { e: "✊", n: "Sindicatos" }, emp: { e: "🏢", n: "Para empleadores" } },
  civil: { dem: { e: "📬", n: "Me demandaron o me embargan" }, cob: { e: "💰", n: "Cobrar dinero" }, cont: { e: "✍️", n: "Contratos y daños" }, bien: { e: "📐", n: "Bienes y linderos" }, otros: { e: "🗂️", n: "Otros trámites judiciales" } },
  inmobiliario: { arr: { e: "🔑", n: "Arriendos" }, comp: { e: "🏘️", n: "Comprar, vender y títulos" }, pred: { e: "🌾", n: "Predios y posesión" }, urb: { e: "🏗️", n: "Urbanismo y construcción" } },
  ph: { emer: { e: "🚨", n: "Emergencias en el conjunto" }, conv: { e: "🗣️", n: "Convivencia y sanciones" }, asam: { e: "🗳️", n: "Asamblea y administración" }, cuot: { e: "💳", n: "Cuotas y cobros" }, zon: { e: "🌳", n: "Zonas comunes y obras" } },
  policivo: { calle: { e: "👮", n: "Con la Policía en la calle" }, insp: { e: "🏛️", n: "Ante el inspector de Policía" }, bien: { e: "🏠", n: "Invasiones y posesión" }, neg: { e: "🏪", n: "Negocios" }, mult: { e: "🎫", n: "Comparendos y multas" } },
  alcaldia: { neg: { e: "🏪", n: "Negocios y permisos" }, imp: { e: "🧮", n: "Impuestos locales" }, soc: { e: "📋", n: "Programas y citaciones" } },
  administrativo: { ped: { e: "📨", n: "Peticiones y sanciones" }, dem: { e: "⚖️", n: "Demandas contra el Estado" }, emp: { e: "👔", n: "Empleo público y contratos" } },
  constitucional: { tut: { e: "🛡️", n: "Tutela y datos" }, col: { e: "👥", n: "Acciones colectivas" } },
  salud: { aten: { e: "🏥", n: "Atención y EPS" }, resp: { e: "🩺", n: "Responsabilidad médica" } },
  tributario: { dian: { e: "📬", n: "La DIAN me requiere" }, dec: { e: "🧮", n: "Declaraciones y devoluciones" }, loc: { e: "🏙️", n: "Impuestos locales" } },
  coactivo: { emb: { e: "🏦", n: "Embargos" }, cob: { e: "📄", n: "Cobros del Estado" }, sal: { e: "🤝", n: "Soluciones" } },
  aduanero: { ret: { e: "📦", n: "Mercancía retenida" }, ope: { e: "🚢", n: "Operaciones y sanciones" } },
  disciplinario: { serv: { e: "🏛️", n: "Servidores públicos" }, prof: { e: "🎓", n: "Profesiones" }, que: { e: "📣", n: "Quejas" } },
  comercial: { emp: { e: "🏢", n: "Empresa y socios" }, mer: { e: "🏁", n: "Mercado y marcas" } },
  consumidor: { prod: { e: "🔧", n: "Productos y servicios" }, fin: { e: "🏦", n: "Bancos y datos" } },
  insolvencia: { deu: { e: "📉", n: "No puedo pagar" }, bie: { e: "🔨", n: "Bienes en riesgo" } },
  migratorio: { est: { e: "🛂", n: "Estancia y permisos" }, san: { e: "⛔", n: "Sanciones" } },
  victimas: { reg: { e: "📋", n: "Registro y ayudas" }, rep: { e: "🕊️", n: "Reparación y tierras" } },
  ambiental: { amb: { e: "🌳", n: "Ambiente" }, rur: { e: "🌱", n: "Tierras rurales y animales" } },
  notarial: { esc: { e: "🖋️", n: "Escrituras y poderes" }, reg: { e: "📚", n: "Registros" } },
  tramites: { ges: { e: "🗂️", n: "Gestores" }, pro: { e: "🔬", n: "Peritos y especialistas" } }
};

const ABOGAO_PROCESOS = {
  penal: [
    ["captura", "🚔", "Capturaron a alguien", "Juez de control de garantías", "A", 2, "captur capturaron detuv detenido preso flagrancia calabozo uri estacion llevaron", "Legalización de captura", "urg", "36 horas para ponerlo ante un juez"],
    ["orden_captura", "📜", "Hay una orden de captura contra mí", "Fiscalía y juez de control de garantías", "A", 2, "orden captura buscan pedido requerido presentarme", "Orden de captura: defensa y presentación voluntaria", "urg", ""],
    ["allanamiento", "🚪", "Allanaron mi casa o interceptaron mi celular", "Juez de control de garantías", "A", 2, "allanamiento allanaron registro orden entraron interceptacion chuzada celular", "Control de legalidad de allanamiento, registro e interceptación", "urg", "Control de legalidad en 36 horas"],
    ["habeas", "🆘", "Detención ilegal", "Cualquier juez", "AG", 2, "habeas corpus ilegal detenido sin orden mucho tiempo", "Hábeas corpus (Ley 1095 de 2006)", "urg", "El juez decide en 36 horas"],
    ["medida", "🔒", "Piden cárcel o casa por cárcel", "Juez de control de garantías", "A", 2, "medida aseguramiento carcel domiciliaria intramural detencion preventiva", "Audiencia de medida de aseguramiento", "urg", ""],
    ["libertad", "🔓", "Pedir la libertad de un detenido", "Juez de control de garantías", "A", 2, "libertad salir carcel vencimiento terminos liberar", "Solicitud de libertad (vencimiento de términos y otras causales)", "urg", ""],
    ["imputacion", "🧑‍⚖️", "Me van a imputar cargos", "Juez de control de garantías", "A", 1, "imputacion imputar imputaron cargos audiencia", "Audiencia de formulación de imputación", "inv", "Audiencia con fecha fijada"],
    ["citacion", "📨", "Me citó la Fiscalía", "Fiscalía", "A", 1, "fiscal citaron citacion interrogatorio entrevista indiciado", "Interrogatorio al indiciado y defensa en la indagación", "inv", ""],
    ["sustitucion", "🏠", "Cambiar la cárcel por casa por cárcel", "Juez de control de garantías", "A", 1, "sustitucion revocatoria cambiar medida domiciliaria casa por carcel", "Sustitución o revocatoria de la medida de aseguramiento", "inv", ""],
    ["cautelares", "🧊", "Me embargaron bienes en un proceso penal", "Juez de control de garantías", "A", 1, "embargo secuestro bienes comiso incautaron proceso penal", "Medidas cautelares reales (embargo, secuestro, comiso)", "inv", ""],
    ["abreviado", "📄", "Me entregaron un escrito de acusación", "Fiscalía y juez de conocimiento", "A", 1, "escrito acusacion traslado abreviado", "Procedimiento penal abreviado (Ley 1826 de 2017)", "inv", "Plazo corto desde el traslado"],
    ["juicio", "🏛️", "Me van a hacer juicio", "Juez de conocimiento", "A", 1, "juicio acusacion preparatoria juicio oral audiencia", "Acusación, audiencia preparatoria y juicio oral", "inv", ""],
    ["prueba_anticipada", "🎙️", "Asegurar una prueba antes del juicio", "Juez de control de garantías", "A", 1, "prueba anticipada testigo enfermo viaja", "Audiencia de prueba anticipada", "inv", ""],
    ["denuncia", "📝", "Quiero denunciar un delito", "Fiscalía (URI o denuncia virtual)", "A", 1, "denunciar denuncia delito", "Denuncia penal", "vic", ""],
    ["querella", "🗣️", "Delito que requiere querella (lesiones leves, injuria…)", "Fiscalía", "A", 1, "querella querellable lesiones leves injuria calumnia conciliacion", "Querella y conciliación previa (art. 522 CPP)", "vic", "6 meses desde el hecho"],
    ["victima", "🕊️", "Soy víctima y quiero un abogado", "Fiscalía y jueces penales", "A", 0, "victima representacion abogado victima", "Representación judicial de víctimas", "vic", ""],
    ["proteccion_v", "🛡️", "Me amenazan por el proceso", "Fiscalía y juez de control de garantías", "A", 2, "amenaza amenazan proteccion testigo miedo", "Medidas de protección a víctimas y testigos", "vic", ""],
    ["acusador_privado", "🙋", "Quiero llevar la acusación con mi abogado", "Fiscalía (autoriza) y juez", "A", 1, "acusador privado conversion accion privada", "Acusador privado: conversión de la acción penal (Ley 1826 de 2017)", "vic", "Antes del traslado de la acusación"],
    ["desarchivo", "📂", "Archivaron mi denuncia", "Fiscalía", "A", 0, "archivaron archivo desarchivo denuncia quieta no avanza", "Solicitud de desarchivo", "vic", ""],
    ["restablecimiento", "↩️", "Recuperar lo que me quitaron", "Fiscalía y juez de control de garantías", "A", 1, "recuperar devolver restablecimiento bien casa quitaron", "Restablecimiento del derecho (art. 22 CPP)", "vic", ""],
    ["incidente", "💵", "Cobrar los daños al condenado", "Juez de conocimiento", "A", 1, "indemnizacion perjuicios reparacion cobrar daños condenado", "Incidente de reparación integral", "vic", "30 días después del fallo"],
    ["preacuerdo", "🤝", "Negociar con la Fiscalía", "Fiscalía y juez de conocimiento", "A", 1, "preacuerdo negociar rebaja", "Preacuerdo", "fin", ""],
    ["allanamiento_cargos", "✋", "Aceptar los cargos", "Juez", "A", 1, "aceptar cargos allanarse allanamiento a cargos rebaja", "Allanamiento a cargos", "fin", ""],
    ["oportunidad", "🚦", "Que la Fiscalía no siga con el caso", "Fiscalía y juez de control de garantías", "A", 0, "principio oportunidad suspension prueba renuncia", "Principio de oportunidad y suspensión del procedimiento a prueba", "fin", ""],
    ["conciliacion_penal", "🤲", "Conciliar o hacer mediación con la otra parte", "Fiscalía o centro de conciliación", "A", 0, "conciliar conciliacion mediacion arreglar acuerdo victima", "Conciliación preprocesal y mediación (justicia restaurativa)", "fin", ""],
    ["reparacion_integral", "💰", "Reparar el daño para cerrar el proceso", "Juez", "A", 1, "reparar pagar pagarle indemnizar daño cerrar acabe acabar terminar arreglar extincion reparacion integral", "Extinción de la acción penal por reparación integral (art. 78A CPP, Ley 2477 de 2025)", "fin", "Antes de decidirse la casación"],
    ["preclusion", "🚫", "Pedir que se cierre el proceso", "Juez de conocimiento", "A", 0, "preclusion cerrar proceso inocente no hay pruebas", "Preclusión", "fin", ""],
    ["prescripcion", "⏳", "El caso es muy viejo", "Juez", "A", 0, "prescripcion viejo años hace mucho", "Prescripción de la acción penal", "fin", ""],
    ["apelacion", "🔁", "No estoy de acuerdo con la sentencia", "Tribunal superior", "A", 1, "apelar apelacion sentencia condena condenaron injusta desacuerdo", "Recurso de apelación", "con", "Se anuncia al leer el fallo"],
    ["impugnacion", "⚖️", "Me condenaron por primera vez en segunda instancia", "Corte Suprema o tribunal", "A", 1, "primera condena segunda instancia doble conformidad", "Impugnación especial (doble conformidad)", "con", ""],
    ["casacion", "🏛️", "Llevar el caso a la Corte Suprema", "Corte Suprema de Justicia, Sala Penal", "A", 1, "casacion corte suprema", "Demanda de casación", "con", "Plazo corto tras el fallo"],
    ["revision", "🔍", "Hay pruebas nuevas después de la condena", "Corte Suprema o tribunal", "A", 0, "revision pruebas nuevas inocente condenado", "Acción de revisión", "con", ""],
    ["suspension", "🗓️", "Cumplir la condena sin ir a la cárcel", "Juez de conocimiento", "A", 0, "suspension condicional sin carcel", "Suspensión condicional de la ejecución de la pena", "con", ""],
    ["ejecucion", "⛓️", "Condenado: domiciliaria o libertad condicional", "Juez de ejecución de penas", "A", 0, "condenado pena domiciliaria libertad condicional", "Prisión domiciliaria y libertad condicional", "con", ""],
    ["redencion", "📚", "Rebajar la pena estudiando o trabajando", "Juez de ejecución de penas", "A", 0, "redencion estudiar trabajar rebaja pena", "Redención de pena", "con", ""],
    ["permiso", "⏱️", "Permiso de 72 horas", "Juez de ejecución de penas e INPEC", "A", 0, "permiso 72 horas salir", "Permiso administrativo de hasta 72 horas", "con", ""],
    ["acumulacion", "➕", "Tengo varias condenas", "Juez de ejecución de penas", "A", 0, "varias condenas acumulacion penas", "Acumulación jurídica de penas", "con", ""],
    ["rehabilitacion", "🧾", "Terminé la condena: recuperar mis derechos", "Juez de ejecución de penas", "A", 0, "rehabilitacion extincion pena derechos antecedentes", "Extinción de la pena y rehabilitación", "con", ""],
    ["adolescentes", "🧒", "Menor de edad acusado de un delito", "Fiscalía y juez de adolescentes", "A", 2, "menor adolescente hijo capturado srpa", "Sistema de Responsabilidad Penal para Adolescentes (Ley 1098 de 2006)", "esp", ""],
    ["extincion", "🏚️", "Me quieren quitar bienes (extinción de dominio)", "Fiscalía y juez de extinción de dominio", "A", 1, "extincion dominio bienes incautados", "Extinción de dominio (Ley 1708 de 2014)", "esp", ""],
    ["tutela_penal", "🛡️", "Tutela contra una decisión penal", "Tribunal o Corte", "A", 1, "tutela decision penal juez violo", "Tutela contra providencia judicial", "esp", ""],
    ["extradicion", "✈️", "Me piden en extradición", "Corte Suprema y Gobierno nacional", "A", 2, "extradicion pedido otro pais", "Extradición", "esp", ""],
    ["militar", "🎖️", "Proceso penal militar o policial", "Justicia Penal Militar y Policial", "A", 1, "militar soldado policia penal militar investigan servicio", "Justicia penal militar y policial (Ley 1407 de 2010)", "esp", ""],
    ["aforados", "🏛️", "Proceso contra congresista o alto funcionario", "Corte Suprema de Justicia", "A", 0, "congresista aforado alto funcionario", "Proceso penal de aforados", "esp", ""],
    ["justicia_paz", "🕊️", "Justicia y Paz", "Tribunales de Justicia y Paz", "A", 0, "justicia y paz desmovilizado paramilitar", "Justicia y Paz (Ley 975 de 2005)", "esp", ""],
    ["culposo", "💥", "Accidente con heridos o muertos", "Fiscalía", "A", 2, "accidente herido muerto atropello homicidio culposo lesiones culposas", "Homicidio y lesiones personales culposas", "del", ""],
    ["homicidio", "⚰️", "Homicidio", "Fiscalía", "A", 2, "homicidio mataron asesinato", "Homicidio", "del", ""],
    ["vif", "🏠", "Violencia intrafamiliar", "Fiscalía y Comisaría de Familia", "A", 2, "violencia intrafamiliar pego golpeo maltrato pareja", "Violencia intrafamiliar (art. 229 CP)", "del", ""],
    ["sexual", "🚫", "Delito sexual (víctima o defensa)", "Fiscalía", "A", 2, "sexual abuso acceso carnal acoso", "Delitos contra la libertad, integridad y formación sexuales", "del", ""],
    ["extorsion", "📞", "Me extorsionan o secuestraron a alguien", "Fiscalía (Gaula)", "A", 2, "extorsion vacuna secuestro secuestraron llamada amenaza plata", "Extorsión y secuestro", "del", ""],
    ["patios", "🚙", "Sacar mi carro de patios (accidente con heridos)", "Fiscalía y juez de control de garantías", "A", 1, "patios carro moto vehiculo sacar entrega provisional", "Entrega provisional de vehículo (art. 100 CPP)", "del", ""],
    ["lesiones", "🤕", "Pelea o agresión con heridos (lesiones personales)", "Fiscalía", "A", 2, "pelea riña golpes heridas lesiones", "Lesiones personales dolosas", "del", "Ve a Medicina Legal y denuncia pronto"],
    ["hurto", "👜", "Robo, estafa o abuso de confianza", "Fiscalía", "A", 1, "robo robaron hurto estafa fraude engaño abuso confianza celular billetera cartera moto", "Hurto, estafa y abuso de confianza", "del", ""],
    ["estupefacientes", "💊", "Porte de drogas", "Fiscalía", "A", 1, "droga marihuana estupefacientes porte dosis", "Tráfico, fabricación o porte de estupefacientes (art. 376 CP)", "del", ""],
    ["armas", "🔫", "Porte de armas", "Fiscalía", "A", 1, "arma revolver pistola porte salvoconducto", "Fabricación, tráfico y porte de armas (art. 365 CP)", "del", ""],
    ["informatico", "💻", "Fraude por internet o celular", "Fiscalía", "A", 1, "internet celular hackeo suplantacion informatico transferencia", "Delitos informáticos (Ley 1273 de 2009)", "del", "Bloquea cuentas y denuncia de inmediato"],
    ["alimentaria", "🍼", "No pagan la cuota de alimentos", "Fiscalía (querella)", "A", 0, "inasistencia alimentaria no paga cuota", "Inasistencia alimentaria (art. 233 CP)", "del", ""],
    ["injuria", "🗯️", "Me insultaron o acusaron falsamente en público", "Fiscalía (querella)", "A", 1, "injuria calumnia redes sociales insulto honra", "Injuria y calumnia", "del", "Querella: 6 meses"],
    ["falsedad", "📑", "Documento falso o fraude en un proceso", "Fiscalía", "A", 0, "falso falsos falsa papeles falsedad firma falsificada fraude procesal", "Falsedad en documentos y fraude procesal", "del", ""],
    ["adm_publica", "🏛️", "Delitos de funcionarios (peculado, cohecho)", "Fiscalía", "A", 0, "peculado cohecho soborno funcionario corrupcion contratacion", "Delitos contra la administración pública", "del", ""],
    ["fiscal_penal", "🧮", "IVA o retenciones sin pagar, contrabando", "Fiscalía", "A", 0, "omision agente retenedor iva contrabando penal tributario", "Omisión del agente retenedor, omisión de activos y contrabando", "del", ""],
    ["lavado", "🧺", "Lavado de activos", "Fiscalía", "A", 0, "lavado activos enriquecimiento ilicito", "Lavado de activos y enriquecimiento ilícito", "del", ""],
    ["ambiental_penal", "🌳", "Delito ambiental", "Fiscalía", "A", 0, "tala mineria ilegal contaminacion delito ambiental", "Delitos contra los recursos naturales y el medio ambiente", "del", ""]
  ],
  transito: [
    ["accidente_via", "🚨", "Tuve un accidente de tránsito ahora", "Policía de Tránsito", "A", 2, "accidente ahora choque via informe policial agente", "Atención en el lugar e informe policial de accidente de tránsito", "via", ""],
    ["choque", "🚗", "Choque con otro vehículo (solo daños)", "Aseguradora, conciliación o juez civil", "AG", 2, "choque choqué choco daños latonería", "", "via", ""],
    ["embriaguez", "🍺", "Prueba de alcohol o embriaguez", "Secretaría de Movilidad", "A", 2, "alcoholemia embriaguez borracho prueba", "", "via", ""],
    ["inmovilizacion", "🚧", "Me inmovilizaron el vehículo (sin heridos)", "Secretaría de Movilidad", "AG", 2, "inmovilizaron grua patios sin licencia soat vencido", "Inmovilización de vehículo", "veh", ""],
    ["comparendo", "🎫", "Me pusieron un comparendo", "Secretaría de Movilidad", "AG", 1, "comparendo multa transito infraccion", "Impugnación de comparendo (audiencia ante la autoridad de tránsito)", "multas", "Pocos días hábiles"],
    ["fotomulta", "📸", "Fotomulta", "Secretaría de Movilidad", "AG", 1, "fotomulta camara", "Impugnación de fotomulta", "multas", "Pocos días hábiles desde la notificación"],
    ["multas_viejas", "⏳", "Multas viejas que siguen cobrando", "Secretaría de Movilidad", "AG", 0, "multas viejas prescripcion caducidad simit", "Prescripción de multas de tránsito", "multas", "3 años sin mandamiento de pago"],
    ["licencia", "🪪", "Suspensión o cancelación de licencia", "Secretaría de Movilidad", "A", 1, "licencia pase suspendida cancelada", "Suspensión o cancelación de licencia de conducción", "veh", ""],
    ["soat", "🩹", "Reclamar SOAT o seguro", "Aseguradora o ADRES", "AG", 0, "soat seguro reclamar indemnizacion", "Reclamación de SOAT y pólizas", "danos", ""],
    ["reclamo_danos", "🧾", "Cobrar los daños del choque", "Conciliación o juez civil", "A", 0, "cobrar daños choque responsabilidad civil extracontractual", "Responsabilidad civil extracontractual por accidente de tránsito", "danos", ""]
  ],
  familia: [
    ["proteccion", "🛡️", "Medida de protección por violencia", "Comisaría de Familia", "A", 2, "proteccion violencia comisaria amenaza pego golpeo pareja esposo miedo", "Medida de protección provisional (Ley 2126 de 2021)", "prot", "La Comisaría atiende 24 horas"],
    ["incumple_medida", "⛔", "El agresor no cumple la medida de protección", "Comisaría de Familia y juez", "A", 2, "incumple medida proteccion agresor volvio arresto", "Incumplimiento de medida de protección (arresto, trámite preferente)", "prot", ""],
    ["mayor_maltrato", "👵", "Maltrato o abandono de un adulto mayor", "Comisaría de Familia", "A", 2, "adulto mayor abuelo maltrato abandono", "Protección a adulto mayor en el contexto familiar", "prot", ""],
    ["nna_riesgo", "🚸", "Un niño está en peligro o sin cuidado", "Defensoría de Familia (ICBF) o Comisaría", "A", 2, "niño peligro abandono maltrato icbf", "Proceso administrativo de restablecimiento de derechos (PARD)", "ninos", ""],
    ["retencion_nino", "🏃", "No me devuelven a mi hijo o se lo llevaron", "Comisaría, ICBF o juez de familia", "A", 2, "no me devuelve hijo se llevo niño sustraccion retencion", "Custodia provisional y restitución de menor (incluida la internacional)", "ninos", ""],
    ["alimentos", "🍽️", "Cuota alimentaria", "ICBF, Comisaría o juez de familia", "A", 1, "alimentos cuota manutencion hijos plata", "Fijación, aumento o disminución de cuota alimentaria", "ninos", ""],
    ["custodia", "🧸", "Custodia y visitas de hijos", "ICBF, Comisaría o juez de familia", "A", 1, "custodia visitas hijos niño", "Custodia, cuidado personal y regulación de visitas", "ninos", ""],
    ["salida_pais", "✈️", "Permiso para que mi hijo salga del país", "Notaría o juez de familia", "A", 1, "permiso salida pais viajar hijo", "Permiso de salida del país de menor", "ninos", ""],
    ["paternidad", "🧬", "Reconocer o impugnar paternidad", "Juez de familia", "A", 0, "paternidad adn reconocer", "Investigación o impugnación de paternidad", "ninos", ""],
    ["adopcion", "🏡", "Adopción", "ICBF y juez de familia", "A", 0, "adopcion adoptar", "Adopción", "ninos", ""],
    ["divorcio", "💔", "Divorcio o separación", "Notaría o juez de familia", "A", 0, "divorcio separacion matrimonio", "Divorcio y cesación de efectos civiles", "pareja", ""],
    ["union", "💑", "Unión marital de hecho", "Notaría o juez de familia", "A", 0, "union libre marital compañero", "Declaración de unión marital de hecho", "pareja", ""],
    ["sociedad", "⚖️", "Repartir los bienes de la pareja", "Notaría o juez de familia", "A", 1, "repartir bienes pareja separacion sociedad conyugal patrimonial", "Liquidación de sociedad conyugal o patrimonial", "pareja", "Unión libre: 1 año desde la separación"],
    ["sucesion", "🕯️", "Herencia o sucesión", "Notaría o juez", "A", 0, "herencia sucesion murio fallecio bienes", "Proceso de sucesión (notarial o judicial)", "bienes", ""],
    ["apoyos", "🤲", "Apoyos para persona con discapacidad", "Notaría, conciliación o juez", "A", 0, "discapacidad apoyos interdiccion", "Adjudicación de apoyos (Ley 1996 de 2019)", "apoyos", ""]
  ],
  laboral: [
    ["despido", "📤", "Me despidieron", "Ministerio del Trabajo o juez laboral", "A", 0, "despid echaron despido sin justa causa", "Despido sin justa causa: indemnización", "desp", "3 años para reclamar"],
    ["descargos", "📋", "Me citaron a descargos", "Empleador", "A", 1, "descargos citacion proceso disciplinario empresa", "Diligencia de descargos (debido proceso laboral)", "desp", ""],
    ["renuncia_forzada", "🚪", "Me obligaron a renunciar", "Juez laboral", "A", 0, "renuncia obligada presionaron renunciar", "Despido indirecto", "desp", ""],
    ["fuero", "🤰", "Despido en embarazo o con problemas de salud", "Juez laboral o de tutela", "A", 1, "embarazo fuero estabilidad salud incapacidad", "Estabilidad laboral reforzada (embarazo, salud, discapacidad)", "salud", ""],
    ["accidente_lab", "🦺", "Me accidenté trabajando", "ARL y juntas de calificación", "A", 2, "accidente trabajo arl enfermedad laboral", "Accidente de trabajo: atención y reporte a la ARL", "salud", "El empleador debe reportarlo en 2 días hábiles"],
    ["calificacion", "📊", "No estoy de acuerdo con mi calificación de invalidez", "Juntas de calificación", "A", 1, "calificacion perdida capacidad junta invalidez porcentaje", "Recursos contra el dictamen de pérdida de capacidad laboral", "salud", "Plazo corto (días hábiles)"],
    ["salarios", "💵", "No me pagan salario o liquidación", "Ministerio del Trabajo o juez laboral", "A", 0, "salario liquidacion prestaciones no me pagan", "Reclamación de salarios, prestaciones e indemnización moratoria", "pagos", ""],
    ["realidad", "🧾", "Contrato de prestación que es laboral", "Juez laboral", "A", 0, "prestacion servicios contrato realidad", "Contrato realidad", "pagos", ""],
    ["acoso", "😣", "Acoso laboral", "Comité de convivencia o juez", "A", 1, "acoso laboral jefe maltrato", "Acoso laboral (Ley 1010 de 2006)", "trato", "6 meses desde el último hecho"],
    ["pension", "👴", "Pensión de vejez, invalidez o sobrevivientes", "Colpensiones, fondos o juez laboral", "A", 0, "pension colpensiones jubilacion invalidez", "Reconocimiento de pensión", "pens", ""],
    ["sustitucion_pens", "🕯️", "Murió quien tenía la pensión", "Colpensiones o fondo", "A", 0, "murio pensionado sustitucion sobrevivientes viuda", "Sustitución pensional", "pens", ""],
    ["ugpp", "📑", "Requerimiento de la UGPP", "UGPP", "A", 1, "ugpp aportes seguridad social", "Respuesta a requerimiento de la UGPP", "pens", ""],
    ["fuero_sindical", "✊", "Me despidieron teniendo fuero sindical", "Juez laboral", "A", 1, "fuero sindical sindicato despido reintegro", "Acción de reintegro por fuero sindical", "sind", "2 meses desde el despido"],
    ["sindicato", "🤝", "Crear o afiliarme a un sindicato", "Ministerio del Trabajo", "A", 0, "crear sindicato afiliar", "Derecho de asociación sindical", "sind", ""],
    ["inspeccion", "🔍", "Visita o sanción del Ministerio del Trabajo", "Ministerio del Trabajo", "A", 1, "inspeccion ministerio trabajo sancion empresa", "Procedimiento administrativo sancionatorio laboral", "emp", ""],
    ["empleador", "👔", "Soy empleador: despedir o sancionar bien", "Empresa", "A", 0, "empleador despedir sancionar trabajador", "Asesoría al empleador: terminación y régimen disciplinario", "emp", ""]
  ],
  civil: [
    ["secuestro_bienes", "🚚", "Llegaron a embargar o secuestrar mis cosas", "Juez o comisionado (diligencia)", "A", 2, "llegaron secuestro diligencia embargar cosas muebles", "Oposición en la diligencia de secuestro", "dem", ""],
    ["demandado", "📬", "Me demandaron", "Juez civil", "A", 1, "demandaron demanda notificaron juzgado", "Contestación de demanda y excepciones", "dem", "Normalmente 10 a 20 días hábiles"],
    ["deuda", "💰", "Me deben dinero (pagaré, letra, factura)", "Juez civil (proceso ejecutivo)", "A", 0, "deben plata pagare letra cobrar prestamo", "Proceso ejecutivo", "cob", ""],
    ["monitorio", "📨", "Me deben pero no tengo un papel firmado", "Juez civil", "A", 0, "deben sin papel sin titulo monitorio", "Proceso monitorio", "cob", ""],
    ["pequenas", "🪙", "Cobro pequeño (mínima cuantía)", "Juez de pequeñas causas", "AG", 0, "minima cuantia pequeñas causas", "Proceso de mínima cuantía", "cob", ""],
    ["cautelar_civil", "🧊", "Que el deudor no esconda sus bienes", "Juez civil", "A", 1, "esconder bienes deudor medida cautelar embargo preventivo", "Medidas cautelares", "cob", ""],
    ["contrato", "✍️", "Incumplieron un contrato", "Conciliación o juez civil", "A", 0, "contrato incumplio", "Incumplimiento contractual", "cont", ""],
    ["danos", "🤕", "Me causaron daños (responsabilidad civil)", "Juez civil", "A", 0, "daños perjuicios responsabilidad", "Responsabilidad civil extracontractual", "cont", ""],
    ["conciliacion", "🤝", "Conciliar antes de demandar", "Centro de conciliación", "A", 0, "conciliar conciliacion acuerdo", "Conciliación extrajudicial en derecho", "cont", ""],
    ["deslinde", "📏", "Problema de linderos con el vecino", "Juez civil", "A", 0, "linderos lindero cerca limite vecino deslinde", "Deslinde y amojonamiento", "bien", ""],
    ["divisorio", "➗", "Vender o dividir un bien que tengo con otros", "Juez civil", "A", 0, "dividir vender bien comun copropietarios coherederos", "Proceso divisorio", "bien", ""],
    ["servidumbre", "🚶", "Paso, agua o servidumbre", "Juez civil", "A", 0, "servidumbre paso camino agua", "Proceso de servidumbres", "bien", ""],
    ["prueba_extra", "🎙️", "Asegurar una prueba antes de demandar", "Juez civil o notaría", "A", 1, "prueba antes demandar interrogatorio inspeccion", "Prueba extraprocesal", "otros", ""],
    ["rendicion", "📒", "Que me rindan cuentas de un negocio o bien", "Juez civil", "A", 0, "rendir cuentas administrador mandato", "Rendición provocada de cuentas", "otros", ""]
  ],
  inmobiliario: [
    ["lanzamiento", "🚨", "Hoy me van a desalojar", "Juez o inspector comisionado", "A", 2, "desalojo hoy lanzamiento sacar casa diligencia", "Diligencia de lanzamiento (entrega del inmueble)", "arr", ""],
    ["arriendo", "🔑", "Arriendo: no pagan o me quieren sacar", "Conciliación o juez civil", "A", 1, "arriendo arrendatario inquilino canon desalojo restitucion", "Restitución de inmueble arrendado", "arr", ""],
    ["inquilino", "🧳", "Soy inquilino: depósito, aumento o reparaciones", "Conciliación o juez civil", "AG", 0, "inquilino deposito aumento arriendo reparaciones arrendador", "Derechos del arrendatario de vivienda urbana", "arr", ""],
    ["compraventa", "🏘️", "Comprar o vender casa (estudio de títulos)", "Notaría y Registro", "AG", 0, "comprar vender casa lote promesa titulos", "Estudio de títulos y compraventa", "comp", ""],
    ["promesa", "📝", "Incumplieron la promesa de compraventa", "Juez civil", "A", 0, "promesa compraventa incumplio arras", "Incumplimiento de promesa de compraventa", "comp", ""],
    ["constructora", "🏗️", "La constructora no entrega o hay fallas", "SIC o juez", "A", 0, "constructora no entrega fallas vivienda nueva garantia", "Garantía de vivienda nueva y protección al consumidor inmobiliario", "comp", ""],
    ["pertenencia", "🌾", "Quedarme con un predio que ocupo (pertenencia)", "Juez civil", "A", 0, "pertenencia prescripcion posesion lote", "Declaración de pertenencia (prescripción adquisitiva)", "pred", ""],
    ["legalizar", "📐", "Legalizar o titular un predio", "Alcaldía, ANT o Registro", "AG", 0, "legalizar titular predio escriturar", "Titulación y legalización de predios", "pred", ""],
    ["catastro", "📏", "Catastro, avalúo, englobe o desenglobe", "Gestor catastral y Registro", "AG", 0, "catastro avaluo englobe desenglobe", "Actualización catastral, englobe y desenglobe", "pred", ""],
    ["licencia_obra", "🏗️", "Licencia de construcción o remodelación", "Curaduría urbana", "AG", 0, "licencia construccion curaduria remodelar", "Licencia urbanística ante curaduría", "urb", ""],
    ["uso_suelo", "🗺️", "Uso del suelo y POT", "Planeación municipal", "AG", 0, "uso suelo pot planeacion", "Concepto de uso del suelo (POT)", "urb", ""],
    ["sancion_urb", "🚫", "Construcción sin licencia o sanción urbanística", "Inspección o Alcaldía", "A", 1, "sin licencia sancion urbanistica demolicion", "Proceso por infracción urbanística", "urb", ""],
    ["obra_vecina", "🧱", "Una obra vecina está dañando mi casa", "Inspección de Policía y curaduría", "A", 1, "obra vecino daña grietas construccion al lado", "Querella por obra que causa daño y responsabilidad del constructor", "urb", ""]
  ],
  ph: [
    ["ph_servicios", "🚱", "Me cortaron el agua o la luz en el conjunto", "Juez de tutela, Superservicios o inspección", "A", 2, "cortaron agua luz administracion corte servicios mora", "Suspensión ilegal de servicios públicos por la administración", "emer", ""],
    ["ph_acceso", "🚫", "No me dejan entrar a mi apartamento o sacar mis cosas", "Inspección de Policía o juez de tutela", "A", 2, "no dejan entrar porteria bloquean trasteo acceso", "Restricción ilegal de acceso y uso de la unidad privada", "emer", ""],
    ["ph_filtracion", "💧", "Filtración o daño grave desde otro apartamento", "Administración, Inspección de Policía o juez", "A", 2, "filtracion humedad agua daño techo vecino arriba tuberia", "Daños a bien privado por bien común o unidad vecina", "emer", ""],
    ["ph_riesgo", "⚠️", "Riesgo en el edificio (estructura, ascensor, incendio)", "Administración, Bomberos y Alcaldía", "A", 2, "riesgo edificio grietas ascensor incendio estructura", "Responsabilidad de la copropiedad por mantenimiento y seguridad", "emer", "Si hay peligro, primero el 123"],
    ["ph_ruido", "🔊", "Ruido, mascotas o problemas con vecinos", "Comité de convivencia e Inspección de Policía", "AG", 1, "ruido fiesta mascota perro vecino convivencia olor humo", "Conflictos de convivencia en propiedad horizontal", "conv", ""],
    ["ph_sancion", "🧾", "Me sancionaron o multaron en el conjunto", "Asamblea o consejo; juez civil", "A", 1, "multa sancion conjunto administracion reglamento", "Sanciones por incumplimiento del reglamento (debido proceso, Ley 675 de 2001)", "conv", ""],
    ["ph_asamblea", "🗳️", "No estoy de acuerdo con una decisión de la asamblea", "Juez civil", "A", 1, "asamblea decision impugnar acta votacion aprobo aprobaron cuota extraordinaria", "Impugnación de decisiones de asamblea (art. 49 Ley 675 y art. 382 CGP)", "asam", "2 meses desde la decisión"],
    ["ph_admin", "📒", "Mala administración o cuentas poco claras", "Asamblea, revisor fiscal o juez", "A", 0, "administrador cuentas malversacion rendicion revisor fiscal", "Rendición de cuentas del administrador", "asam", ""],
    ["ph_reglamento", "📘", "Reformar el reglamento del conjunto", "Asamblea y notaría", "A", 0, "reforma reglamento propiedad horizontal", "Reforma del reglamento de propiedad horizontal", "asam", ""],
    ["ph_cuotas_deuda", "💳", "Me cobran cuotas de administración atrasadas", "Administración o juez civil", "A", 1, "cobran cuotas atrasadas administracion mora deuda conjunto", "Proceso ejecutivo por expensas comunes (defensa y acuerdo)", "cuot", ""],
    ["ph_morosos", "🏦", "Soy administrador: cobrar a morosos", "Juez civil", "A", 0, "administrador cobrar morosos cuotas", "Cobro de expensas comunes", "cuot", ""],
    ["ph_zonas", "🅿️", "Parqueaderos, zonas comunes o fachada", "Asamblea, consejo o juez", "A", 0, "parqueadero zonas comunes fachada piscina salon", "Uso de bienes comunes", "zon", ""],
    ["ph_obra", "🔨", "Obras o remodelaciones en el conjunto", "Administración y curaduría", "AG", 0, "remodelar obra apartamento conjunto licencia", "Obras en bienes privados y comunes", "zon", ""]
  ],
  policivo: [
    ["traslado", "🚓", "Me llevan en \"traslado por protección\"", "Policía Nacional", "A", 2, "traslado proteccion llevan cai estacion", "Traslado por protección (art. 155 Ley 1801 de 2016)", "calle", ""],
    ["requisa", "🔦", "Requisa, traslado o abuso policial", "Policía, Procuraduría o Personería", "A", 2, "requisa traslado proteccion abuso policial", "Registro a persona, requisa y control a la actuación policial", "calle", ""],
    ["orden_policia", "📋", "La Policía me impuso una orden o medida en la calle", "Policía e inspector (apelación)", "AG", 1, "orden policia medida correctiva calle apelacion", "Proceso verbal inmediato (art. 222 Ley 1801)", "calle", "La apelación se resuelve en 3 días hábiles"],
    ["invasion", "🚷", "Están invadiendo mi predio", "Inspección de Policía", "A", 2, "invadieron invasion lote ocupacion", "Protección contra ocupación de hecho (art. 81 Ley 1801)", "bien", "La Policía debe actuar dentro de las 48 horas"],
    ["perturbacion", "🚧", "Me perturban la posesión (cercas, paso, servidumbre)", "Inspector de Policía", "A", 1, "perturbacion posesion cerca paso tumbaron amparo", "Amparo a la posesión, mera tenencia y servidumbre (arts. 77-80 Ley 1801)", "bien", "4 meses desde la perturbación"],
    ["querella", "🗣️", "Problema de convivencia con un vecino", "Inspección de Policía", "AG", 1, "vecino ruido lindero perturbacion querella inspector", "Proceso verbal abreviado (art. 223 Ley 1801)", "insp", ""],
    ["citacion_insp", "📨", "Me citaron a audiencia en la inspección", "Inspector de Policía", "AG", 1, "citacion audiencia inspeccion policia", "Audiencia pública del proceso verbal abreviado", "insp", ""],
    ["cierre", "🔒", "Cierre o suspensión de mi negocio", "Inspección o Alcaldía", "A", 2, "cierre sellaron negocio establecimiento", "Suspensión temporal de actividad o cierre de establecimiento", "neg", ""],
    ["negocio_req", "📜", "Requisitos de mi negocio (uso del suelo, horarios)", "Alcaldía e inspección", "AG", 0, "requisitos negocio uso suelo horario bomberos", "Requisitos para actividad económica (art. 87 Ley 1801)", "neg", ""],
    ["espacio", "🛒", "Venta en la calle o decomiso", "Alcaldía o Inspección", "AG", 1, "espacio publico vendedor decomiso", "Ocupación del espacio público y decomiso", "neg", ""],
    ["comparendo_pol", "👮", "Comparendo de policía (Código de Convivencia)", "Inspección de Policía", "AG", 1, "comparendo policia convivencia multa", "Comparendo por comportamiento contrario a la convivencia", "mult", ""],
    ["multa_pol", "💸", "Me llegó una multa del Código de Policía", "Inspección de Policía", "AG", 1, "multa codigo policia pagar objetar descuento", "Objeción y pago de multas generales (Ley 1801)", "mult", "Plazo corto para objetar o pagar con descuento"]
  ],
  alcaldia: [
    ["negocio", "🏪", "Requisitos para abrir un negocio", "Alcaldía, Cámara de Comercio y Bomberos", "G", 0, "abrir negocio requisitos funcionamiento", "", "neg", ""],
    ["predial", "🏠", "Impuesto predial (pagos, acuerdos, reclamos)", "Hacienda municipal", "AG", 0, "predial impuesto casa", "", "imp", ""],
    ["ica", "🧮", "Industria y comercio (ICA)", "Hacienda municipal", "AG", 0, "ica industria comercio", "", "imp", ""],
    ["eventos", "🎪", "Permiso para eventos", "Alcaldía", "G", 0, "permiso evento", "", "neg", ""],
    ["sisben", "📋", "Sisbén y programas sociales", "Alcaldía", "G", 0, "sisben subsidio programa", "", "soc", ""]
  ],
  administrativo: [
    ["peticion", "📨", "Derecho de petición sin respuesta", "Cualquier entidad", "AG", 1, "derecho peticion no responden entidad", "Derecho de petición (Ley 1755 de 2015)", "ped", "15 días hábiles para que respondan"],
    ["sancion_adm", "⚠️", "Me sancionó una entidad o superintendencia", "La entidad que sancionó", "A", 1, "sancion superintendencia multa entidad", "Recursos de reposición y apelación (CPACA)", "ped", "10 días hábiles para los recursos"],
    ["nulidad", "⚖️", "Demandar una decisión del Estado", "Juez administrativo", "A", 1, "nulidad restablecimiento acto administrativo", "Nulidad y restablecimiento del derecho", "dem", "4 meses"],
    ["reparacion", "🩼", "El Estado me causó un daño", "Juez administrativo", "A", 0, "reparacion directa estado daño", "Reparación directa", "dem", "2 años"],
    ["contratacion", "📑", "Contratación estatal y licitaciones", "Entidad o juez administrativo", "A", 0, "contrato estatal licitacion secop", "Controversias contractuales", "emp", ""],
    ["servidor", "👔", "Soy empleado público (carrera, retiro)", "Entidad, CNSC o juez", "A", 0, "empleado publico carrera cnsc retiro", "Carrera administrativa y retiro del servicio", "emp", ""]
  ],
  constitucional: [
    ["tutela", "🛡️", "Tutela: me violan un derecho fundamental", "Cualquier juez", "AG", 1, "tutela derecho fundamental", "Acción de tutela", "tut", "El juez decide en 10 días"],
    ["habeas_data", "🗂️", "Mis datos personales (habeas data)", "La entidad y la SIC", "AG", 0, "datos personales habeas data borrar", "Habeas data", "tut", ""],
    ["popular", "🌆", "Acción popular (derechos colectivos)", "Juez administrativo", "A", 0, "accion popular colectivo", "Acción popular", "col", ""],
    ["grupo", "👥", "Acción de grupo (daño a muchas personas)", "Juez", "A", 0, "accion grupo", "Acción de grupo", "col", "2 años"],
    ["cumplimiento", "📜", "Que una entidad cumpla una ley", "Juez administrativo", "A", 0, "accion cumplimiento", "Acción de cumplimiento", "col", ""]
  ],
  salud: [
    ["eps", "🏥", "La EPS me niega un servicio o medicamento", "EPS, Supersalud o juez de tutela", "AG", 2, "eps niega medicamento cirugia cita autorizacion", "Tutela en salud y queja ante la EPS", "aten", ""],
    ["supersalud", "📞", "Queja ante la Supersalud", "Superintendencia de Salud", "AG", 1, "supersalud queja", "Función jurisdiccional de la Supersalud", "aten", ""],
    ["incapacidad", "🛌", "No me pagan la incapacidad", "EPS o ARL", "AG", 1, "incapacidad pago", "", "aten", ""],
    ["mala_praxis", "🩺", "Error médico", "Juez civil, administrativo o penal", "A", 0, "error medico negligencia mala praxis", "Responsabilidad médica", "resp", ""],
    ["urgencias_negada", "🚑", "No me atienden en urgencias", "Hospital, Supersalud o juez de tutela", "AG", 2, "no me atienden urgencias hospital clinica negaron", "Atención inicial de urgencias obligatoria", "aten", "Si hay riesgo para la vida, primero el 123"]
  ],
  tributario: [
    ["requerimiento", "📬", "Me llegó un requerimiento de la DIAN", "DIAN", "A", 1, "requerimiento dian carta", "", "dian", "Requerimiento especial: 3 meses"],
    ["liquidacion", "🧾", "Liquidación oficial o sanción de la DIAN", "DIAN o juez administrativo", "A", 1, "liquidacion oficial sancion dian", "", "dian", "2 meses para el recurso de reconsideración"],
    ["reconsideracion", "🔁", "Recurso de reconsideración", "DIAN", "A", 1, "recurso reconsideracion", "", "dian", "2 meses"],
    ["devolucion", "💰", "Devolución de saldo a favor", "DIAN", "AG", 0, "devolucion saldo favor", "", "dec", ""],
    ["renta", "🧮", "Declaración de renta", "DIAN", "AG", 0, "renta declaracion", "", "dec", ""],
    ["rut", "🆔", "RUT y factura electrónica", "DIAN", "AG", 0, "rut factura electronica", "", "dec", ""],
    ["impuesto_local", "🏙️", "Impuestos de vehículo, predial o ICA", "Hacienda municipal o departamental", "AG", 0, "impuesto vehiculo predial ica", "", "loc", ""],
    ["emplazamiento", "📯", "Me emplazaron para declarar", "DIAN", "A", 1, "emplazamiento declarar dian omiso", "Emplazamiento para declarar", "dian", "1 mes para responder"]
  ],
  coactivo: [
    ["embargo", "🏦", "Me embargaron la cuenta", "La entidad que cobra", "A", 2, "embargo embargaron cuenta congelada", "Levantamiento o reducción de embargos", "emb", ""],
    ["mandamiento", "📄", "Me llegó un mandamiento de pago", "La entidad que cobra", "A", 1, "mandamiento pago coactivo", "Excepciones contra el mandamiento de pago", "cob", "15 días (Estatuto Tributario)"],
    ["coac_transito", "🚗", "Cobro coactivo por multas de tránsito", "Secretaría de Movilidad", "A", 1, "coactivo multas transito", "", "cob", ""],
    ["coac_predial", "🏠", "Cobro coactivo de predial", "Hacienda municipal", "A", 1, "coactivo predial", "", "cob", ""],
    ["coac_ugpp", "📑", "Cobro de UGPP o Colpensiones", "UGPP o Colpensiones", "A", 1, "ugpp colpensiones cobro", "", "cob", ""],
    ["prescripcion", "⏳", "Deuda vieja con el Estado (prescripción)", "La entidad que cobra", "A", 0, "prescripcion deuda vieja", "Prescripción de la acción de cobro", "sal", ""],
    ["acuerdo", "🤝", "Acuerdo de pago con la entidad", "La entidad que cobra", "AG", 0, "acuerdo pago cuotas", "Facilidad o acuerdo de pago", "sal", ""]
  ],
  aduanero: [
    ["aprehension", "📦", "Me retuvieron mercancía", "DIAN (aduanas)", "A", 2, "mercancia retenida aprehension aduana", "Aprehensión y decomiso de mercancías (defensa)", "ret", ""],
    ["viajero", "🧳", "Retención en aeropuerto", "DIAN (aduanas)", "A", 2, "aeropuerto viajero equipaje retencion", "", "ret", ""],
    ["decomiso", "🚫", "Decomiso de mercancía", "DIAN", "A", 1, "decomiso", "", "ret", ""],
    ["importar", "🚢", "Importar o exportar", "DIAN y agencias de aduanas", "AG", 0, "importar exportar", "", "ope", ""],
    ["cambiario", "💱", "Sanción cambiaria (divisas)", "DIAN o Supersociedades", "A", 1, "cambiario divisas dolares", "Régimen sancionatorio cambiario", "ope", ""]
  ],
  disciplinario: [
    ["servidor_pub", "🏛️", "Investigación a servidor público", "Procuraduría o control interno", "A", 1, "disciplinario servidor publico procuraduria", "Proceso disciplinario (Ley 1952 de 2019)", "serv", "Plazos cortos para descargos y recursos"],
    ["abogado", "⚖️", "Queja o proceso contra un abogado", "Comisión de Disciplina Judicial", "A", 1, "queja abogado disciplina", "Proceso disciplinario de abogados (Ley 1123 de 2007)", "prof", ""],
    ["policia_mil", "🎖️", "Disciplinario policial o militar", "Inspección de Policía o Fuerzas Militares", "A", 1, "policia militar disciplinario investigan", "Régimen disciplinario policial y militar", "serv", ""],
    ["etica_medica", "🩺", "Tribunal de ética médica", "Tribunal de Ética Médica", "A", 1, "etica medica tribunal", "Proceso ético-disciplinario médico", "prof", ""],
    ["docente", "🍎", "Disciplinario docente", "Secretaría de Educación o Procuraduría", "A", 1, "docente profesor disciplinario", "", "serv", ""],
    ["queja_func", "📣", "Quejarme de un funcionario", "Procuraduría o Personería", "AG", 0, "queja funcionario personeria", "", "que", ""]
  ],
  comercial: [
    ["empresa", "🏢", "Crear empresa o sociedad (SAS)", "Cámara de Comercio", "AG", 0, "crear empresa sas sociedad", "", "emp", ""],
    ["socios", "🤼", "Conflicto entre socios", "Supersociedades o juez", "A", 1, "socios conflicto", "", "emp", ""],
    ["marca", "™️", "Registrar o defender una marca", "Superintendencia de Industria y Comercio", "AG", 0, "marca registro sic", "Registro y oposición de marcas", "mer", ""],
    ["facturas", "🧾", "Cobrar facturas a clientes", "Juez civil", "A", 0, "facturas cobrar clientes", "", "mer", ""],
    ["reorganizacion", "🏚️", "Empresa en crisis (reorganización)", "Superintendencia de Sociedades", "A", 1, "reorganizacion crisis insolvencia empresa", "Proceso de reorganización empresarial (Ley 1116 de 2006)", "emp", ""],
    ["desleal", "🏁", "Competencia desleal", "SIC o juez", "A", 0, "competencia desleal", "Competencia desleal", "mer", ""]
  ],
  consumidor: [
    ["garantia", "🔧", "Garantía de un producto o servicio", "SIC", "AG", 0, "garantia producto defectuoso", "Acción de protección al consumidor", "prod", ""],
    ["banco", "🏦", "Problema con banco o tarjeta", "Defensor del consumidor financiero o Superfinanciera", "AG", 1, "banco tarjeta credito cobro", "Queja ante el defensor del consumidor financiero", "fin", ""],
    ["datacredito", "📉", "Reporte en centrales de riesgo", "La entidad y la SIC", "AG", 0, "datacredito reporte centrales", "Habeas data financiero", "fin", ""],
    ["servicios_pub", "💡", "Cobro de agua, luz o gas", "Empresa y Superservicios", "AG", 0, "servicios publicos agua luz gas factura", "", "prod", ""],
    ["telecom", "📱", "Operador de celular o internet", "Operador y SIC", "AG", 0, "celular internet operador", "", "prod", ""],
    ["viajes", "✈️", "Aerolínea o paquete turístico", "Aerolínea, Aerocivil o SIC", "AG", 0, "aerolinea vuelo viaje", "", "prod", ""],
    ["fraude_banco", "🚨", "Me sacaron plata de la cuenta o la tarjeta", "Banco, Fiscalía y Superfinanciera", "A", 2, "sacaron plata cuenta tarjeta fraude transferencia no reconozco", "Reclamación por fraude en productos financieros", "fin", "Bloquea y reporta de inmediato"]
  ],
  insolvencia: [
    ["persona", "📉", "No puedo pagar mis deudas", "Centro de conciliación o notaría", "A", 1, "no puedo pagar deudas insolvencia", "Insolvencia de persona natural no comerciante", "deu", ""],
    ["remate", "🔨", "Me van a rematar un bien", "Juez civil", "A", 2, "remate rematar subasta", "Oposición y nulidades en el remate", "bie", ""],
    ["hipoteca", "🏠", "Hipoteca o leasing en mora", "Banco o juez", "A", 1, "hipoteca leasing mora", "", "bie", ""],
    ["reestructurar", "🔄", "Reestructurar créditos", "Banco", "AG", 0, "reestructurar credito", "", "deu", ""]
  ],
  migratorio: [
    ["sancion_mig", "⛔", "Multa, deportación o expulsión", "Migración Colombia", "A", 2, "deportacion expulsion migracion multa", "", "san", ""],
    ["visa", "🛂", "Visa para Colombia", "Cancillería", "AG", 0, "visa", "", "est", ""],
    ["ppt", "🪪", "Permiso de Protección Temporal (PPT)", "Migración Colombia", "AG", 0, "ppt permiso venezolano", "", "est", ""],
    ["nacionalidad", "🇨🇴", "Nacionalidad colombiana", "Cancillería o Registraduría", "AG", 0, "nacionalidad", "", "est", ""]
  ],
  victimas: [
    ["desplazamiento", "🚶", "Desplazamiento forzado", "Personería o Defensoría del Pueblo", "AG", 2, "desplazado desplazamiento amenaza grupo armado", "", "reg", ""],
    ["ruv", "📋", "Registro como víctima del conflicto", "Personería y Unidad para las Víctimas", "AG", 0, "registro victima ruv", "", "reg", ""],
    ["reparacion_v", "🕊️", "Indemnización a víctimas", "Unidad para las Víctimas", "AG", 0, "indemnizacion reparacion victima", "", "rep", ""],
    ["tierras", "🌾", "Restitución de tierras", "Unidad de Restitución y juez", "A", 0, "restitucion tierras despojo", "", "rep", ""],
    ["jep", "⚖️", "Casos ante la JEP", "Jurisdicción Especial para la Paz", "A", 0, "jep", "", "rep", ""]
  ],
  ambiental: [
    ["sancion_amb", "🌳", "Sanción ambiental (CVC, DAGMA)", "Autoridad ambiental", "A", 1, "sancion ambiental cvc dagma tala", "", "amb", ""],
    ["permiso_amb", "📃", "Permisos ambientales", "Autoridad ambiental", "AG", 0, "permiso ambiental vertimiento", "", "amb", ""],
    ["baldios", "🌱", "Tierras rurales y baldíos", "Agencia Nacional de Tierras", "AG", 0, "baldio rural finca", "", "rur", ""],
    ["animales", "🐕", "Maltrato animal", "Inspección de Policía o Fiscalía", "AG", 1, "maltrato animal perro gato", "", "rur", ""]
  ],
  notarial: [
    ["escritura", "🖋️", "Escritura pública", "Notaría", "G", 0, "escritura notaria", "", "esc", ""],
    ["poder", "📄", "Poder general o especial", "Notaría", "AG", 0, "poder autorizar", "", "esc", ""],
    ["registro_civil", "👶", "Corregir registro civil", "Registraduría o notaría", "AG", 0, "registro civil corregir nombre", "", "reg", ""],
    ["tradicion", "📚", "Registro de inmueble y certificado de tradición", "Oficina de Registro", "G", 0, "certificado tradicion registro inmueble", "", "reg", ""],
    ["testamento", "📜", "Hacer un testamento", "Notaría", "A", 0, "testamento", "", "esc", ""],
    ["apostilla", "🌐", "Apostillar documentos", "Cancillería", "G", 0, "apostilla legalizar documento exterior", "", "reg", ""]
  ],
  tramites: [
    ["traspaso", "🚘", "Traspaso de vehículo", "Organismo de tránsito (RUNT)", "G", 0, "traspaso vehiculo", "", "ges", ""],
    ["matricula", "🏍️", "Matrícula o levantar prenda", "Organismo de tránsito", "G", 0, "matricula prenda", "", "ges", ""],
    ["camara", "🏪", "Registro mercantil y renovación", "Cámara de Comercio", "G", 0, "camara comercio renovar", "", "ges", ""],
    ["avaluo", "📏", "Avalúo de inmueble o vehículo", "Avaluador inscrito (RAA)", "P", 0, "avaluo avaluador", "", "pro", ""],
    ["perito", "🔬", "Perito para un proceso", "Perito", "P", 1, "perito dictamen peritaje", "", "pro", ""],
    ["traductor", "🌐", "Traductor oficial", "Traductor e intérprete oficial", "P", 0, "traductor traduccion", "", "pro", ""],
    ["conciliador", "🤝", "Conciliador", "Centro de conciliación", "P", 0, "conciliador", "", "pro", ""],
    ["topografo", "📐", "Topógrafo o levantamiento de predio", "Topógrafo", "P", 0, "topografo levantamiento", "", "pro", ""]
  ]
};

/** Rutas detalladas: qué pasa, qué sigue, qué tener y el aviso de plazo. rev = fecha de revisión. */
const ABOGAO_RUTAS = {
  "penal/captura": {"rev": "2026-09", "q": "La persona capturada debe ser puesta ante un juez de control de garantías dentro de las 36 horas siguientes.", "pasos": ["Tiene derecho a guardar silencio, a un abogado y a avisar a su familia.", "Averigua dónde está: URI, estación o Fiscalía.", "El abogado asiste a las audiencias: legalización de captura, imputación y medida de aseguramiento.", "Si la detención se prolonga de forma ilegal, se puede pedir hábeas corpus."], "docs": ["Nombre completo y cédula de la persona", "Lugar y hora de la captura"], "aviso": "Las primeras 36 horas son las más importantes."},
  "penal/habeas": {"rev": "2026-09", "q": "El hábeas corpus protege a quien está privado de la libertad de forma ilegal o por más tiempo del permitido.", "pasos": ["Lo puede presentar cualquier persona, sin abogado, ante cualquier juez.", "Se indica quién está detenido, dónde y por qué es ilegal.", "El juez debe resolver en 36 horas."], "docs": ["Datos de la persona detenida", "Lugar de detención"], "aviso": "Se resuelve en 36 horas."},
  "penal/citacion": {"rev": "2026-09", "q": "Una citación de la Fiscalía puede ser como testigo, víctima o indiciado. Conviene saber cuál antes de ir.", "pasos": ["Lee la citación: fecha, despacho y en qué calidad te citan.", "Tienes derecho a guardar silencio y a ir con abogado.", "No declares ni entregues documentos sin hablarlo antes con un penalista."], "docs": ["La citación", "Documento de identidad"], "aviso": "Ve con abogado si te citan como indiciado."},
  "penal/victima": {"rev": "2026-09", "q": "Como víctima tienes derecho a la verdad, a la justicia y a la reparación, y a tener abogado en el proceso.", "pasos": ["Denuncia y guarda el número de la noticia criminal (SPOA).", "Tu abogado participa en las audiencias y pide medidas de protección.", "Al final se puede pedir la reparación de los daños (incidente de reparación integral)."], "docs": ["Número de la denuncia", "Pruebas: fotos, mensajes, facturas, dictámenes"], "aviso": ""},
  "penal/patios": {"rev": "2026-09", "q": "Si hubo lesionados, el vehículo queda en una investigación penal mientras se hacen los peritajes.", "pasos": ["Se revisa el estado de la investigación con la Fiscalía.", "La entrega provisional se pide normalmente al juez de control de garantías en audiencia.", "Una conciliación con la víctima puede facilitarla."], "docs": ["Tarjeta de propiedad y SOAT", "Número SPOA de la noticia criminal", "Datos del fiscal"], "aviso": ""},
  "penal/vif": {"rev": "2026-09", "q": "La violencia intrafamiliar es delito. Además, la Comisaría de Familia puede dar medidas de protección inmediatas.", "pasos": ["Si hay peligro, llama al 123. Para orientación a mujeres está la línea 155.", "Pide medida de protección en la Comisaría de Familia.", "Denuncia ante la Fiscalía; un abogado te representa como víctima o te defiende."], "docs": ["Documento de identidad", "Pruebas: fotos, mensajes, dictamen de Medicina Legal"], "aviso": "Si hay peligro, primero el 123."},
  "penal/ejecucion": {"rev": "2026-09", "q": "Después de la condena, el juez de ejecución de penas decide sobre domiciliaria, libertad condicional y redención de pena.", "pasos": ["Reúne la sentencia y el cómputo de tiempo cumplido.", "El abogado solicita el beneficio que corresponda.", "Se acredita trabajo, estudio y buena conducta si aplica."], "docs": ["Sentencia", "Certificados del centro de reclusión"], "aviso": ""},
  "penal/querella": {"rev": "2026-09", "q": "Algunos delitos solo se investigan si la víctima presenta querella, y antes se intenta conciliar.", "pasos": ["Presenta la querella ante la Fiscalía.", "Se cita a una conciliación entre las partes.", "Si no hay acuerdo, el proceso sigue, normalmente por el procedimiento abreviado."], "docs": ["Documento de identidad", "Pruebas del hecho"], "aviso": "La querella debe presentarse dentro de los 6 meses siguientes al hecho."},
  "penal/acusador_privado": {"rev": "2026-09", "q": "En los delitos del procedimiento abreviado, la víctima puede pedir llevar ella misma la acusación con su abogado.", "pasos": ["Se pide por escrito a la Fiscalía la conversión de la acción penal.", "Debe pedirse antes de que se entregue el escrito de acusación al indiciado.", "Si la Fiscalía autoriza, tu abogado investiga y acusa ante el juez."], "docs": ["Número de la denuncia (SPOA)", "Pruebas que tengas"], "aviso": "No procede en delitos contra el patrimonio del Estado."},
  "penal/reparacion_integral": {"rev": "2026-09", "q": "Desde la Ley 2477 de 2025, en ciertos delitos, reparar integralmente a la víctima puede cerrar el proceso penal.", "pasos": ["El abogado revisa si el delito está en la lista del artículo 78A (por ejemplo, homicidio y lesiones culposas sin agravantes, y varios delitos contra el patrimonio sin violencia).", "Se acuerda y se paga la reparación a la víctima.", "El juez declara extinguida la acción penal."], "docs": ["Datos del proceso", "Soporte de los daños causados"], "aviso": "Debe hacerse antes de que se decida la casación, y no aplica si ya se usó en los últimos 5 años."},
  "penal/apelacion": {"rev": "2026-09", "q": "Si no estás de acuerdo con la sentencia, puedes pedir que un tribunal la revise.", "pasos": ["El recurso se anuncia cuando se lee la sentencia.", "El abogado lo sustenta dentro del plazo corto que da la ley.", "El tribunal confirma, cambia o anula la decisión."], "docs": ["La sentencia", "Datos del proceso"], "aviso": "El plazo es muy corto: busca abogado antes de la lectura del fallo."},
  "transito/comparendo": {"rev": "2026-09", "q": "Puedes pagar con descuento o impugnar, pero los plazos son de pocos días hábiles desde la notificación.", "pasos": ["Consulta el comparendo y su fecha de notificación.", "Decide si pagas (hay descuento por pago pronto y curso) o si lo impugnas.", "Para impugnar, se pide la audiencia a tiempo ante Movilidad."], "docs": ["Número del comparendo", "Fotos o pruebas de lo ocurrido"], "aviso": "Los plazos son cortos: días hábiles."},
  "familia/alimentos": {"rev": "2026-09", "q": "Los hijos tienen derecho a una cuota alimentaria. Primero se intenta conciliar.", "pasos": ["Pide conciliación en el ICBF, la Comisaría de Familia o un centro de conciliación.", "Si no hay acuerdo, se demanda ante el juez de familia.", "Si la cuota fijada no se paga, se puede cobrar y denunciar inasistencia alimentaria."], "docs": ["Registro civil del niño", "Pruebas de gastos"], "aviso": ""},
  "laboral/despido": {"rev": "2026-09", "q": "Que te despidan no siempre es ilegal, pero hay derechos que se deben revisar.", "pasos": ["Pide por escrito la carta de terminación y la liquidación.", "Revisa salarios, prestaciones e indemnización si aplica.", "Se puede conciliar en el Ministerio del Trabajo; si no, demandar ante el juez laboral."], "docs": ["Contrato o prueba del trabajo", "Carta de despido", "Desprendibles de pago"], "aviso": "En general, las acciones laborales prescriben a los 3 años."},
  "civil/demandado": {"rev": "2026-09", "q": "Si te notificaron una demanda, no la ignores: hay un plazo para contestar.", "pasos": ["Revisa la fecha de notificación y el juzgado.", "Busca un abogado de inmediato.", "El abogado contesta y presenta pruebas y excepciones."], "docs": ["La notificación y la demanda", "Documentos del caso"], "aviso": "Normalmente hay entre 10 y 20 días hábiles para contestar, según el proceso."},
  "inmobiliario/arriendo": {"rev": "2026-09", "q": "Si el inquilino no paga, el camino habitual es conciliar o iniciar un proceso de restitución.", "pasos": ["Envía un requerimiento de pago por escrito.", "Intenta una conciliación.", "Si no funciona, se demanda la restitución del inmueble."], "docs": ["Contrato de arrendamiento", "Soportes de pagos y deudas"], "aviso": ""},
  "inmobiliario/licencia_obra": {"rev": "2026-09", "q": "Para construir, ampliar o remodelar se necesita licencia de la curaduría urbana.", "pasos": ["Revisa el uso del suelo del predio.", "Un arquitecto o gestor prepara planos y documentos.", "Se radica en la curaduría y se sigue el trámite."], "docs": ["Certificado de tradición", "Planos", "Paz y salvo de predial"], "aviso": "Construir sin licencia puede generar multas y demolición."},
  "policivo/querella": {"rev": "2026-09", "q": "Los conflictos entre vecinos y de posesión los resuelve el inspector de policía con un proceso rápido.", "pasos": ["Reúne pruebas: fotos, videos y testigos.", "Presenta la querella en la inspección de policía de tu comuna.", "Asiste a la audiencia, donde se escucha a las partes y se decide."], "docs": ["Pruebas", "Documento que acredite tu posesión o residencia"], "aviso": ""},
  "constitucional/tutela": {"rev": "2026-09", "q": "La tutela protege derechos fundamentales como la salud, la vida o el debido proceso. No necesita abogado.", "pasos": ["Explica qué derecho te violan y quién lo hace.", "Preséntala ante cualquier juez.", "El juez debe decidir en 10 días."], "docs": ["Documento de identidad", "Pruebas"], "aviso": "El juez decide en 10 días."},
  "administrativo/peticion": {"rev": "2026-09", "q": "Toda entidad debe responder un derecho de petición.", "pasos": ["Presenta la petición por escrito y guarda la constancia.", "En general, deben responder en 15 días hábiles.", "Si no responden, puedes presentar tutela."], "docs": ["Copia de la petición radicada"], "aviso": "Plazo general: 15 días hábiles."},
  "salud/eps": {"rev": "2026-09", "q": "Cuando la EPS niega o demora un servicio de salud, hay caminos rápidos.", "pasos": ["Pide la negación por escrito.", "Presenta queja a la EPS y a la Supersalud.", "Si tu salud está en riesgo, presenta una tutela."], "docs": ["Orden médica", "Respuesta de la EPS", "Historia clínica"], "aviso": "Si hay riesgo para la vida, tutela de inmediato."},
  "tributario/requerimiento": {"rev": "2026-09", "q": "Un requerimiento de la DIAN pide información o propone cambios a tu declaración.", "pasos": ["Identifica qué tipo de requerimiento es.", "Reúne soportes contables con tu contador.", "Un abogado tributarista prepara la respuesta."], "docs": ["El requerimiento", "Declaraciones y soportes"], "aviso": "El plazo depende del tipo. El requerimiento especial tiene 3 meses para responder."},
  "coactivo/embargo": {"rev": "2026-09", "q": "Si te embargaron la cuenta, hay que saber qué entidad cobra y en qué va el proceso.", "pasos": ["Pide al banco el oficio de embargo.", "Revisa el proceso con la entidad que cobra.", "El abogado puede pedir levantar o limitar el embargo según el caso."], "docs": ["Oficio del banco", "Extractos"], "aviso": ""},
  "aduanero/aprehension": {"rev": "2026-09", "q": "La DIAN puede retener mercancía si considera que no está legalizada.", "pasos": ["Pide copia del acta de aprehensión.", "Reúne facturas y documentos de importación.", "Un abogado aduanero presenta la defensa dentro del plazo."], "docs": ["Acta de aprehensión", "Facturas y declaración de importación"], "aviso": "Los plazos para defenderse son cortos."},
  "disciplinario/servidor_pub": {"rev": "2026-09", "q": "Los servidores públicos responden disciplinariamente según el Código General Disciplinario (Ley 1952 de 2019).", "pasos": ["Revisa la notificación y la etapa del proceso.", "Tienes derecho a defensa y a presentar pruebas.", "Un abogado disciplinarista prepara descargos y recursos."], "docs": ["Notificación", "Pruebas de tu actuación"], "aviso": ""},
  "policivo/invasion": {"rev": "2026-09", "q": "Si alguien está ocupando tu predio por la fuerza, la Policía debe impedirlo o sacar a los responsables dentro de las 48 horas siguientes a la ocupación.", "pasos": ["Llama a la Policía o al 123 y deja constancia de la hora de la ocupación.", "Toma fotos y videos, y reúne pruebas de tu posesión.", "Si pasaron las 48 horas, presenta querella ante el inspector de Policía."], "docs": ["Pruebas de posesión: recibos, escrituras, testigos", "Fotos y videos"], "aviso": "Actúa en las primeras 48 horas."},
  "policivo/perturbacion": {"rev": "2026-09", "q": "Si alguien perturba tu posesión, tu tenencia o una servidumbre, el inspector de Policía puede amparar la situación mientras un juez decide de fondo.", "pasos": ["Reúne pruebas de la perturbación y de tu posesión.", "Presenta la querella ante el inspector de Policía del lugar del inmueble.", "Asiste a la audiencia; la decisión es provisional mientras decide el juez."], "docs": ["Pruebas de la posesión", "Fotos de la perturbación"], "aviso": "Caduca a los 4 meses de la perturbación."},
  "policivo/orden_policia": {"rev": "2026-09", "q": "En la calle, la Policía aplica el proceso verbal inmediato: debe oírte en descargos y puede imponer órdenes o medidas.", "pasos": ["Pide que te expliquen el comportamiento que te atribuyen y da tu versión.", "Si no estás de acuerdo, apela en el mismo momento.", "La apelación la resuelve el inspector en 3 días hábiles."], "docs": ["Documento de identidad", "Copia de la orden o del comparendo"], "aviso": "Apela en el momento."},
  "familia/proteccion": {"rev": "2026-09", "q": "Las Comisarías de Familia deben poder atender y dar medidas de protección provisionales a cualquier hora, 24 horas y 7 días.", "pasos": ["Si hay peligro, llama al 123. Para orientación a mujeres, línea 155.", "Acude a la Comisaría de Familia y pide medida de protección provisional.", "Si el agresor incumple, el comisario pide al juez el arresto con trámite preferente."], "docs": ["Documento de identidad", "Pruebas: fotos, mensajes, dictamen médico"], "aviso": "Atención 24 horas."},
  "laboral/fuero_sindical": {"rev": "2026-09", "q": "Si tienes fuero sindical y te despidieron, trasladaron o desmejoraron sin permiso del juez, puedes pedir el reintegro.", "pasos": ["Reúne la prueba del fuero: inscripción o comunicación al empleador.", "Un abogado presenta la acción de reintegro ante el juez laboral.", "El juez decide si el despido requería permiso y ordena el reintegro si corresponde."], "docs": ["Carta de despido", "Certificado de la junta directiva o del registro sindical"], "aviso": "Prescribe en 2 meses desde el despido."},
  "laboral/acoso": {"rev": "2026-09", "q": "El acoso laboral se puede denunciar ante el comité de convivencia, el Ministerio del Trabajo o el juez.", "pasos": ["Anota fechas, hechos y testigos.", "Presenta la queja al comité de convivencia de la empresa.", "Si no se resuelve, acude al Ministerio del Trabajo o al juez laboral."], "docs": ["Mensajes, correos y testigos"], "aviso": "Hay 6 meses desde el último hecho."},
  "ph/ph_asamblea": {"rev": "2026-09", "q": "Las decisiones de la asamblea que violan la ley o el reglamento se pueden impugnar ante el juez.", "pasos": ["Pide el acta y revisa convocatoria, quórum y mayorías.", "El administrador, el revisor fiscal o cualquier propietario puede impugnar.", "La demanda se presenta ante el juez civil."], "docs": ["Acta de la asamblea", "Reglamento de propiedad horizontal"], "aviso": "Hay 2 meses desde la decisión."},
  "ph/ph_servicios": {"rev": "2026-09", "q": "La administración de un conjunto no puede dejarte sin servicios públicos esenciales para presionar el pago de cuotas.", "pasos": ["Deja constancia del corte: fotos, testigos y comunicaciones.", "Pide por escrito a la administración que restablezca el servicio.", "Si no lo hace, un abogado presenta tutela o queja ante la autoridad."], "docs": ["Fotos", "Comunicaciones con la administración"], "aviso": "Es urgente: afecta tu vivienda digna."},
  "ph/ph_ruido": {"rev": "2026-09", "q": "Los conflictos de convivencia en el conjunto primero pasan por el comité de convivencia; si siguen, van a la inspección de Policía.", "pasos": ["Presenta la queja por escrito a la administración y al comité de convivencia.", "Intenta una conciliación.", "Si continúa, presenta querella ante el inspector de Policía."], "docs": ["Fechas, horas, grabaciones y testigos"], "aviso": ""},
  "civil/secuestro_bienes": {"rev": "2026-09", "q": "Si llegan a secuestrar bienes que no son del demandado, o hay irregularidades, puedes oponerte en la misma diligencia.", "pasos": ["Pide ver la orden del juez y la identificación del funcionario.", "Muestra pruebas de que los bienes son tuyos (facturas, documentos).", "Un abogado presenta la oposición en la diligencia."], "docs": ["Facturas y documentos de propiedad", "Documento de identidad"], "aviso": "La oposición se hace en la diligencia."},
  "inmobiliario/lanzamiento": {"rev": "2026-09", "q": "La diligencia de lanzamiento cumple una sentencia de restitución; hay pocas defensas, pero conviene revisar que sea legal.", "pasos": ["Pide ver la orden y la sentencia.", "Un abogado revisa si hay causales de oposición o nulidad.", "Organiza tus bienes; la autoridad debe dejar constancia de lo que se retira."], "docs": ["Contrato de arriendo", "Recibos de pago"], "aviso": "Es hoy: busca abogado ya."},
  "coactivo/mandamiento": {"rev": "2026-09", "q": "Una entidad te cobra por la vía coactiva.", "pasos": ["Identifica quién cobra.", "Revisa el plazo.", "Busca abogado."], "docs": ["Mandamiento de pago"], "aviso": ""}
};

/** Botón "Abogado YA": las 14 urgencias más frecuentes; el resto se busca en la misma pantalla */
const ABOGAO_URGENCIAS = [{"e": "🚔", "t": "Capturaron a alguien", "p": "penal/captura"}, {"e": "💥", "t": "Accidente con heridos", "p": "penal/culposo"}, {"e": "🚗", "t": "Choque sin heridos", "p": "transito/choque"}, {"e": "🛡️", "t": "Violencia en la casa", "p": "familia/proteccion"}, {"e": "🏃", "t": "Se llevaron a mi hijo", "p": "familia/retencion_nino"}, {"e": "🚪", "t": "Allanamiento", "p": "penal/allanamiento"}, {"e": "🚓", "t": "Problema con la policía", "p": "policivo/requisa"}, {"e": "🚷", "t": "Están invadiendo mi predio", "p": "policivo/invasion"}, {"e": "🚨", "t": "Me van a desalojar hoy", "p": "inmobiliario/lanzamiento"}, {"e": "🚱", "t": "Conjunto: me cortaron servicios", "p": "ph/ph_servicios"}, {"e": "🏥", "t": "Salud: no me atienden", "p": "salud/urgencias_negada"}, {"e": "📞", "t": "Me extorsionan", "p": "penal/extorsion"}, {"e": "🦺", "t": "Accidente de trabajo", "p": "laboral/accidente_lab"}, {"e": "🤕", "t": "Pelea con heridos", "p": "penal/lesiones"}];

/** Tipos de profesional que pueden vincularse */
const ABOGAO_OFICIOS = {"abogado": {"e": "⚖️", "n": "Abogado", "reg": "Tarjeta profesional verificada en SIRNA"}, "gestor": {"e": "🗂️", "n": "Gestor de trámites", "reg": "Cédula y RUT verificados"}, "perito": {"e": "🔬", "n": "Perito o avaluador", "reg": "Registro profesional o RAA"}, "conciliador": {"e": "🤝", "n": "Conciliador", "reg": "Inscrito en centro de conciliación"}, "traductor": {"e": "🌐", "n": "Traductor oficial", "reg": "Acreditación de traductor oficial"}};

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
