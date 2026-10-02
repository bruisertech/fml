/**
 * Dependencias: catalog.js (ABOGAO_OFICIOS)
 * Expone:       PROFESIONALES (alias LAWYERS_DATA), calculateHaversineDistance(), estimateETA(), nearbyProfessionals(), isSpecialist()
 *
 * "procesos" = especialidades que el propio profesional declara y complementa:
 *   'penal/casacion' (un proceso) · 'penal:con' (un grupo de procesos) · 'penal:*' (toda el área)
 *
 * Abogao – Profesionales de demostración en Cali (ficticios).
 * Tipos: abogado, gestor, perito, conciliador, traductor (ver ABOGAO_OFICIOS).
 * El perfil (dosier) solo guarda datos objetivos permitidos por la Ley 1123 de 2007, art. 31: nombre, títulos, cargos
 * desempeñados, asuntos que atiende y domicilio profesional, más datos de servicio verificables en la plataforma
 * (modalidades, horario, tarifas, casos atendidos en Abogao). Sin estrellas, rankings ni "casos ganados".
 */
const PROFESIONALES = [
 {
  "id": "pro-1",
  "name": "Laura Restrepo",
  "kind": "abogado",
  "doc": "T.P. DEMO-159137",
  "areas": [
   "penal",
   "transito"
  ],
  "priceCOP": 60000,
  "travelPriceCOP": 150000,
  "responseMin": 2,
  "neighborhood": "Granada",
  "lat": 3.4555,
  "lng": -76.5335,
  "color": "#0E8A6E",
  "experienceYears": 12,
  "university": "Universidad del Valle",
  "coverageKm": 8,
  "is24h": true,
  "procesos": [
   "penal:urg",
   "penal:del",
   "transito/embriaguez"
  ],
  "titulos": [
   "Abogado(a) – Universidad del Valle",
   "Especialización en Derecho Penal",
   "Especialización en Responsabilidad Civil y del Estado"
  ],
  "cargos": [],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "24 horas, todos los días",
  "disponible": true,
  "casosAbogao": 55,
  "miembroDesde": "2026-06",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-2",
  "name": "Julián Castaño",
  "kind": "abogado",
  "doc": "T.P. DEMO-168274",
  "areas": [
   "penal",
   "disciplinario"
  ],
  "priceCOP": 80000,
  "travelPriceCOP": 180000,
  "responseMin": 3,
  "neighborhood": "Versalles",
  "lat": 3.463,
  "lng": -76.529,
  "color": "#8A4FD8",
  "experienceYears": 16,
  "university": "Universidad del Valle",
  "coverageKm": 8,
  "is24h": true,
  "procesos": [
   "penal:con",
   "penal:esp",
   "disciplinario:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad del Valle",
   "Especialización en Derecho Penal",
   "Especialización en Derecho Disciplinario"
  ],
  "cargos": [
   "Ex fiscal seccional (2010-2016)"
  ],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "24 horas, todos los días",
  "disponible": true,
  "casosAbogao": 19,
  "miembroDesde": "2026-06",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-3",
  "name": "Óscar Valencia",
  "kind": "abogado",
  "doc": "T.P. DEMO-177411",
  "areas": [
   "penal",
   "transito"
  ],
  "priceCOP": 65000,
  "travelPriceCOP": 150000,
  "responseMin": 2,
  "neighborhood": "Santa Mónica",
  "lat": 3.4715,
  "lng": -76.5295,
  "color": "#10233F",
  "experienceYears": 18,
  "university": "Universidad Libre",
  "coverageKm": 8,
  "is24h": true,
  "procesos": [
   "penal:urg",
   "penal/culposo",
   "penal/patios",
   "penal:fin"
  ],
  "titulos": [
   "Abogado(a) – Universidad Libre",
   "Especialización en Derecho Penal",
   "Especialización en Responsabilidad Civil y del Estado"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "24 horas, todos los días",
  "disponible": true,
  "casosAbogao": 45,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-4",
  "name": "Natalia Caicedo",
  "kind": "abogado",
  "doc": "T.P. DEMO-186548",
  "areas": [
   "penal",
   "aduanero"
  ],
  "priceCOP": 90000,
  "travelPriceCOP": 200000,
  "responseMin": 3,
  "neighborhood": "El Peñón",
  "lat": 3.459,
  "lng": -76.549,
  "color": "#D2562B",
  "experienceYears": 14,
  "university": "Universidad Libre",
  "coverageKm": 8,
  "is24h": true,
  "procesos": [
   "penal/fiscal_penal",
   "penal/lavado",
   "penal/adm_publica",
   "penal/extradicion",
   "penal:inv",
   "aduanero:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Libre",
   "Especialización en Derecho Penal",
   "Especialización en Derecho Aduanero"
  ],
  "cargos": [
   "Ex funcionaria de la DIAN (2012-2015)"
  ],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "24 horas, todos los días",
  "disponible": true,
  "casosAbogao": 51,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-5",
  "name": "Roberto Silva",
  "kind": "abogado",
  "doc": "T.P. DEMO-195685",
  "areas": [
   "penal",
   "victimas"
  ],
  "priceCOP": 70000,
  "travelPriceCOP": 160000,
  "responseMin": 4,
  "neighborhood": "Tequendama",
  "lat": 3.421,
  "lng": -76.538,
  "color": "#B8307A",
  "experienceYears": 20,
  "university": "Universidad Nacional",
  "coverageKm": 8,
  "is24h": true,
  "procesos": [
   "penal:vic",
   "penal:fin",
   "penal/incidente",
   "victimas:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Nacional",
   "Especialización en Derecho Penal",
   "Especialización en Derechos Humanos"
  ],
  "cargos": [
   "Ex defensor público (2006-2014)"
  ],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "24 horas, todos los días",
  "disponible": true,
  "casosAbogao": 52,
  "miembroDesde": "2026-06",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-6",
  "name": "Paula Mejía",
  "kind": "abogado",
  "doc": "T.P. DEMO-204822",
  "areas": [
   "penal",
   "familia"
  ],
  "priceCOP": 45000,
  "travelPriceCOP": 100000,
  "responseMin": 3,
  "neighborhood": "Siloé",
  "lat": 3.4245,
  "lng": -76.5555,
  "color": "#0F7C95",
  "experienceYears": 6,
  "university": "Universidad Santiago de Cali",
  "coverageKm": 8,
  "is24h": true,
  "procesos": [
   "penal:vic",
   "penal/vif",
   "penal/sexual",
   "penal/alimentaria",
   "penal/adolescentes",
   "familia:*",
   "familia:prot"
  ],
  "titulos": [
   "Abogado(a) – Universidad Santiago de Cali",
   "Especialización en Derecho Penal",
   "Especialización en Derecho de Familia"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "24 horas, todos los días",
  "disponible": true,
  "casosAbogao": 54,
  "miembroDesde": "2026-06",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-7",
  "name": "Carlos Osorio",
  "kind": "abogado",
  "doc": "T.P. DEMO-213959",
  "areas": [
   "transito",
   "civil"
  ],
  "priceCOP": 50000,
  "travelPriceCOP": 120000,
  "responseMin": 3,
  "neighborhood": "San Fernando",
  "lat": 3.438,
  "lng": -76.542,
  "color": "#6B7A12",
  "experienceYears": 9,
  "university": "Pontificia Universidad Javeriana",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "transito:*",
   "civil:*"
  ],
  "titulos": [
   "Abogado(a) – Pontificia Universidad Javeriana",
   "Especialización en Responsabilidad Civil y del Estado",
   "Especialización en Derecho Procesal"
  ],
  "cargos": [],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a viernes 8:00–18:00",
  "disponible": true,
  "casosAbogao": 37,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-8",
  "name": "Isabel Zabala",
  "kind": "abogado",
  "doc": "T.P. DEMO-223096",
  "areas": [
   "transito",
   "policivo",
   "alcaldia",
   "ph"
  ],
  "priceCOP": 50000,
  "travelPriceCOP": 110000,
  "responseMin": 4,
  "neighborhood": "Centro",
  "lat": 3.4541,
  "lng": -76.5345,
  "color": "#9A3412",
  "experienceYears": 9,
  "university": "Universidad Cooperativa",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "transito:*",
   "policivo:*",
   "alcaldia:*",
   "ph:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Cooperativa",
   "Especialización en Responsabilidad Civil y del Estado",
   "Diplomado en Código Nacional de Seguridad y Convivencia"
  ],
  "cargos": [
   "Ex inspectora de Policía (2017-2021)"
  ],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a viernes 8:00–18:00",
  "disponible": true,
  "casosAbogao": 38,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-9",
  "name": "Diana Mosquera",
  "kind": "abogado",
  "doc": "T.P. DEMO-232233",
  "areas": [
   "familia",
   "civil",
   "notarial"
  ],
  "priceCOP": 45000,
  "travelPriceCOP": 100000,
  "responseMin": 5,
  "neighborhood": "San Antonio",
  "lat": 3.453,
  "lng": -76.544,
  "color": "#4F46E5",
  "experienceYears": 8,
  "university": "Universidad San Buenaventura",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "familia:*",
   "civil:*",
   "notarial:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad San Buenaventura",
   "Especialización en Derecho de Familia",
   "Especialización en Derecho Procesal"
  ],
  "cargos": [],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a viernes 8:00–18:00",
  "disponible": true,
  "casosAbogao": 54,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-10",
  "name": "Valentina Holguín",
  "kind": "abogado",
  "doc": "T.P. DEMO-241370",
  "areas": [
   "familia",
   "victimas",
   "constitucional"
  ],
  "priceCOP": 40000,
  "travelPriceCOP": 90000,
  "responseMin": 4,
  "neighborhood": "Aguablanca",
  "lat": 3.413,
  "lng": -76.49,
  "color": "#0369A1",
  "experienceYears": 7,
  "university": "Universidad del Valle",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "familia:*",
   "victimas:*",
   "constitucional:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad del Valle",
   "Especialización en Derecho de Familia",
   "Especialización en Derechos Humanos"
  ],
  "cargos": [
   "Ex comisaria de familia (2019-2023)"
  ],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": true,
  "casosAbogao": 24,
  "miembroDesde": "2026-06",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-11",
  "name": "Marcela Díaz",
  "kind": "abogado",
  "doc": "T.P. DEMO-250507",
  "areas": [
   "laboral",
   "salud",
   "constitucional"
  ],
  "priceCOP": 45000,
  "travelPriceCOP": 110000,
  "responseMin": 3,
  "neighborhood": "Alameda",
  "lat": 3.4405,
  "lng": -76.5285,
  "color": "#BE123C",
  "experienceYears": 7,
  "university": "Universidad Santiago de Cali",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "laboral:*",
   "salud:*",
   "constitucional:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Santiago de Cali",
   "Especialización en Derecho Laboral y Seguridad Social",
   "Especialización en Derecho Médico"
  ],
  "cargos": [],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a viernes 8:00–18:00",
  "disponible": true,
  "casosAbogao": 19,
  "miembroDesde": "2026-07",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-12",
  "name": "Mario Bermúdez",
  "kind": "abogado",
  "doc": "T.P. DEMO-259644",
  "areas": [
   "laboral",
   "administrativo"
  ],
  "priceCOP": 60000,
  "travelPriceCOP": 130000,
  "responseMin": 5,
  "neighborhood": "La Flora",
  "lat": 3.488,
  "lng": -76.521,
  "color": "#15803D",
  "experienceYears": 10,
  "university": "Universidad Santiago de Cali",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "laboral:sind",
   "laboral:pens",
   "laboral:emp",
   "administrativo:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Santiago de Cali",
   "Especialización en Derecho Laboral y Seguridad Social",
   "Maestría en Derecho Administrativo"
  ],
  "cargos": [
   "Ex inspector de trabajo (2016-2020)"
  ],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": false,
  "casosAbogao": 47,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-13",
  "name": "Andrés Gómez",
  "kind": "abogado",
  "doc": "T.P. DEMO-268781",
  "areas": [
   "civil",
   "comercial",
   "insolvencia"
  ],
  "priceCOP": 70000,
  "travelPriceCOP": 160000,
  "responseMin": 5,
  "neighborhood": "Ciudad Jardín",
  "lat": 3.3725,
  "lng": -76.5325,
  "color": "#2F6FDE",
  "experienceYears": 14,
  "university": "Universidad Icesi",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "civil:*",
   "comercial:*",
   "insolvencia:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Icesi",
   "Especialización en Derecho Procesal",
   "Especialización en Derecho Comercial"
  ],
  "cargos": [],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a viernes 8:00–18:00",
  "disponible": true,
  "casosAbogao": 5,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-14",
  "name": "Felipe Arango",
  "kind": "abogado",
  "doc": "T.P. DEMO-277918",
  "areas": [
   "tributario",
   "coactivo",
   "comercial"
  ],
  "priceCOP": 75000,
  "travelPriceCOP": 170000,
  "responseMin": 4,
  "neighborhood": "Chipichape",
  "lat": 3.485,
  "lng": -76.53,
  "color": "#0E8A6E",
  "experienceYears": 11,
  "university": "Pontificia Universidad Javeriana",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "tributario:*",
   "coactivo:*",
   "comercial:*"
  ],
  "titulos": [
   "Abogado(a) – Pontificia Universidad Javeriana",
   "Especialización en Derecho Tributario",
   "Especialización en Derecho Administrativo"
  ],
  "cargos": [
   "Ex asesor tributario en firma de auditoría (2014-2019)"
  ],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": true,
  "casosAbogao": 26,
  "miembroDesde": "2026-07",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-15",
  "name": "Camila Morales",
  "kind": "abogado",
  "doc": "T.P. DEMO-287055",
  "areas": [
   "administrativo",
   "disciplinario",
   "coactivo"
  ],
  "priceCOP": 70000,
  "travelPriceCOP": 150000,
  "responseMin": 6,
  "neighborhood": "Valle del Lili",
  "lat": 3.371,
  "lng": -76.516,
  "color": "#8A4FD8",
  "experienceYears": 7,
  "university": "Universidad Externado",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "administrativo:*",
   "disciplinario:*",
   "coactivo:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Externado",
   "Maestría en Derecho Administrativo",
   "Especialización en Derecho Disciplinario"
  ],
  "cargos": [
   "Ex asesora jurídica de la Procuraduría Provincial (2019-2022)"
  ],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": true,
  "casosAbogao": 35,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-16",
  "name": "Santiago Lozano",
  "kind": "abogado",
  "doc": "T.P. DEMO-296192",
  "areas": [
   "tributario",
   "aduanero"
  ],
  "priceCOP": 85000,
  "travelPriceCOP": 190000,
  "responseMin": 5,
  "neighborhood": "El Ingenio",
  "lat": 3.3865,
  "lng": -76.5335,
  "color": "#10233F",
  "experienceYears": 13,
  "university": "Universidad Icesi",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "tributario:*",
   "aduanero:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Icesi",
   "Especialización en Derecho Tributario",
   "Especialización en Derecho Aduanero"
  ],
  "cargos": [],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": true,
  "casosAbogao": 54,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-17",
  "name": "Natalia Ruiz",
  "kind": "abogado",
  "doc": "T.P. DEMO-305329",
  "areas": [
   "inmobiliario",
   "policivo",
   "ambiental",
   "ph"
  ],
  "priceCOP": 55000,
  "travelPriceCOP": 120000,
  "responseMin": 4,
  "neighborhood": "Normandía",
  "lat": 3.458,
  "lng": -76.552,
  "color": "#D2562B",
  "experienceYears": 8,
  "university": "Universidad Icesi",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "inmobiliario:*",
   "policivo:*",
   "ambiental:*",
   "ph:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Icesi",
   "Especialización en Derecho Urbano",
   "Diplomado en Código Nacional de Seguridad y Convivencia"
  ],
  "cargos": [],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a viernes 8:00–18:00",
  "disponible": true,
  "casosAbogao": 26,
  "miembroDesde": "2026-06",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-18",
  "name": "Hernán Quintero",
  "kind": "abogado",
  "doc": "T.P. DEMO-314466",
  "areas": [
   "inmobiliario",
   "civil",
   "notarial",
   "ph"
  ],
  "priceCOP": 60000,
  "travelPriceCOP": 130000,
  "responseMin": 5,
  "neighborhood": "Los Cámbulos",
  "lat": 3.4355,
  "lng": -76.5405,
  "color": "#B8307A",
  "experienceYears": 15,
  "university": "Universidad Libre",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "inmobiliario:*",
   "civil:*",
   "notarial:*",
   "ph:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Libre",
   "Especialización en Derecho Urbano",
   "Especialización en Derecho Procesal"
  ],
  "cargos": [],
  "idiomas": [
   "Español"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a viernes 8:00–18:00",
  "disponible": true,
  "casosAbogao": 40,
  "miembroDesde": "2026-06",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-19",
  "name": "Luisa Fernanda Prado",
  "kind": "abogado",
  "doc": "T.P. DEMO-323603",
  "areas": [
   "consumidor",
   "insolvencia",
   "civil",
   "ph"
  ],
  "priceCOP": 40000,
  "travelPriceCOP": 90000,
  "responseMin": 4,
  "neighborhood": "San Bosco",
  "lat": 3.451,
  "lng": -76.532,
  "color": "#0F7C95",
  "experienceYears": 5,
  "university": "Universidad Autónoma de Occidente",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "consumidor:*",
   "insolvencia:*",
   "civil:*",
   "ph:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Autónoma de Occidente",
   "Diplomado en Protección al Consumidor",
   "Diplomado en Insolvencia"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": true,
  "casosAbogao": 36,
  "miembroDesde": "2026-06",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-20",
  "name": "Daniel Ospina",
  "kind": "abogado",
  "doc": "T.P. DEMO-332740",
  "areas": [
   "migratorio",
   "comercial"
  ],
  "priceCOP": 70000,
  "travelPriceCOP": 150000,
  "responseMin": 6,
  "neighborhood": "Granada",
  "lat": 3.453,
  "lng": -76.531,
  "color": "#6B7A12",
  "experienceYears": 9,
  "university": "Universidad Icesi",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "migratorio:*",
   "comercial:*"
  ],
  "titulos": [
   "Abogado(a) – Universidad Icesi",
   "Diplomado en Derecho Migratorio",
   "Especialización en Derecho Comercial"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video",
   "consultorio"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": false,
  "casosAbogao": 22,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": true,
   "sinSanciones": true,
   "registro": false
  }
 },
 {
  "id": "pro-21",
  "name": "Gloria Cárdenas",
  "kind": "gestor",
  "doc": "C.C. DEMO",
  "areas": [
   "tramites",
   "transito",
   "alcaldia",
   "notarial"
  ],
  "priceCOP": 35000,
  "travelPriceCOP": 70000,
  "responseMin": 3,
  "neighborhood": "Centro",
  "lat": 3.4491,
  "lng": -76.5295,
  "color": "#9A3412",
  "experienceYears": 12,
  "university": "Gestora de trámites",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "tramites:*",
   "transito:*",
   "alcaldia:*",
   "notarial:*"
  ],
  "titulos": [
   "Gestora de trámites"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video"
  ],
  "horario": "Lunes a viernes 8:00–18:00",
  "disponible": true,
  "casosAbogao": 11,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": false,
   "sinSanciones": false,
   "registro": true
  }
 },
 {
  "id": "pro-22",
  "name": "Jhon Fredy Ramírez",
  "kind": "gestor",
  "doc": "C.C. DEMO",
  "areas": [
   "tramites",
   "transito",
   "inmobiliario"
  ],
  "priceCOP": 30000,
  "travelPriceCOP": 60000,
  "responseMin": 4,
  "neighborhood": "Aguablanca",
  "lat": 3.418,
  "lng": -76.495,
  "color": "#4F46E5",
  "experienceYears": 10,
  "university": "Gestor de trámites",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "tramites:*",
   "transito:*",
   "inmobiliario:*"
  ],
  "titulos": [
   "Gestor de trámites"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": true,
  "casosAbogao": 47,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": false,
   "sinSanciones": false,
   "registro": true
  }
 },
 {
  "id": "pro-23",
  "name": "Mónica Salazar",
  "kind": "perito",
  "doc": "C.C. DEMO",
  "areas": [
   "tramites",
   "inmobiliario",
   "transito"
  ],
  "priceCOP": 120000,
  "travelPriceCOP": 200000,
  "responseMin": 8,
  "neighborhood": "Pance",
  "lat": 3.3505,
  "lng": -76.5455,
  "color": "#0369A1",
  "experienceYears": 11,
  "university": "Avaluadora inscrita en el RAA",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "tramites:*",
   "inmobiliario:*",
   "transito:*"
  ],
  "titulos": [
   "Avaluadora inscrita en el RAA"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": true,
  "casosAbogao": 4,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": false,
   "sinSanciones": false,
   "registro": true
  }
 },
 {
  "id": "pro-24",
  "name": "Iván Castillo",
  "kind": "perito",
  "doc": "C.C. DEMO",
  "areas": [
   "tramites",
   "penal",
   "transito"
  ],
  "priceCOP": 150000,
  "travelPriceCOP": 250000,
  "responseMin": 8,
  "neighborhood": "San Fernando",
  "lat": 3.443,
  "lng": -76.547,
  "color": "#BE123C",
  "experienceYears": 15,
  "university": "Perito en reconstrucción de accidentes",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "tramites:*",
   "penal:*",
   "transito:*"
  ],
  "titulos": [
   "Perito en reconstrucción de accidentes"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": true,
  "casosAbogao": 42,
  "miembroDesde": "2026-08",
  "verificacion": {
   "identidad": true,
   "tarjeta": false,
   "sinSanciones": false,
   "registro": true
  }
 },
 {
  "id": "pro-25",
  "name": "Adriana Vélez",
  "kind": "conciliador",
  "doc": "C.C. DEMO",
  "areas": [
   "tramites",
   "civil",
   "familia"
  ],
  "priceCOP": 60000,
  "travelPriceCOP": 120000,
  "responseMin": 6,
  "neighborhood": "Alameda",
  "lat": 3.438,
  "lng": -76.526,
  "color": "#15803D",
  "experienceYears": 9,
  "university": "Conciliadora en derecho",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "tramites:*",
   "civil:*",
   "familia:*"
  ],
  "titulos": [
   "Conciliadora en derecho"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video"
  ],
  "horario": "Lunes a viernes 8:00–18:00",
  "disponible": true,
  "casosAbogao": 27,
  "miembroDesde": "2026-07",
  "verificacion": {
   "identidad": true,
   "tarjeta": false,
   "sinSanciones": false,
   "registro": true
  }
 },
 {
  "id": "pro-26",
  "name": "Thomas Becker",
  "kind": "traductor",
  "doc": "C.C. DEMO",
  "areas": [
   "tramites",
   "migratorio"
  ],
  "priceCOP": 50000,
  "travelPriceCOP": 90000,
  "responseMin": 10,
  "neighborhood": "Versalles",
  "lat": 3.4605,
  "lng": -76.5265,
  "color": "#2F6FDE",
  "experienceYears": 12,
  "university": "Traductor oficial alemán e inglés",
  "coverageKm": 6,
  "is24h": false,
  "procesos": [
   "tramites:*",
   "migratorio:*"
  ],
  "titulos": [
   "Traductor oficial alemán e inglés"
  ],
  "cargos": [],
  "idiomas": [
   "Español",
   "Alemán",
   "Inglés"
  ],
  "modalidades": [
   "presencial",
   "llamada",
   "video"
  ],
  "horario": "Lunes a sábado 7:00–19:00",
  "disponible": false,
  "casosAbogao": 6,
  "miembroDesde": "2026-06",
  "verificacion": {
   "identidad": true,
   "tarjeta": false,
   "sinSanciones": false,
   "registro": true
  }
 }
];
const LAWYERS_DATA = PROFESIONALES; // compatibilidad con versiones anteriores

/** Distancia en km (Haversine) */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

/** Minutos de desplazamiento urbano estimados (≈ 30 km/h + 2 min) */
function estimateETA(km) { return Math.max(2, Math.round((km / 30) * 60) + 2); }

/** ¿El profesional declaró este proceso (o su grupo) como especialidad? */
function isSpecialist(pro, proc) {
  if (!proc || !pro.procesos) return false;
  return pro.procesos.includes(proc.key) || (proc.g && pro.procesos.includes(proc.area + ':' + proc.g));
}

/**
 * Profesionales cercanos para un área o proceso.
 * @param {{lat:number,lng:number}} pos  ubicación del usuario
 * @param {object} opts  { area, need ('A'|'AG'|'G'|'P'), proceso, urgent, exclude:Set, limit, extra:[], includeUnavailable }
 * Por defecto solo devuelve profesionales con disponible = true: nunca se ofrece a alguien que no puede atender.
 * Los especialistas en el proceso exacto van primero; después, los del área.
 */
function nearbyProfessionals(pos, opts = {}) {
  const kinds = { A: ['abogado'], AG: ['abogado', 'gestor'], G: ['gestor'], P: ['perito', 'conciliador', 'traductor'] }[opts.need] || null;
  const cmp = (a, b) => (b.spec - a.spec) || (opts.urgent ? (b.is24h - a.is24h) || (a.etaMinutes - b.etaMinutes) : (a.responseMin - b.responseMin) || (a.distanceKm - b.distanceKm));
  const k = typeof opts.limit === 'number' ? opts.limit : Infinity;
  const top = [];
  // Filtros baratos primero; la distancia solo se calcula para quien los pasa.
  // Con límite pequeño se guardan solo los k mejores (O(n·k)) en lugar de ordenar a todos (O(n log n)).
  for (const p of PROFESIONALES.concat(opts.extra || [])) {
    if (!opts.includeUnavailable && p.disponible === false) continue;
    if (opts.exclude && opts.exclude.has(p.id)) continue;
    if (opts.area && !p.areas.includes(opts.area)) continue;
    if (kinds && !kinds.includes(p.kind)) continue;
    const distanceKm = calculateHaversineDistance(pos.lat, pos.lng, p.lat, p.lng);
    const c = { ...p, distanceKm, etaMinutes: estimateETA(distanceKm), spec: isSpecialist(p, opts.proceso) };
    if (top.length < k) { top.push(c); if (top.length === k && k !== Infinity) top.sort(cmp); continue; }
    if (k === Infinity) continue;
    if (cmp(c, top[k - 1]) < 0) { let i = k - 1; while (i > 0 && cmp(c, top[i - 1]) < 0) i--; top.splice(i, 0, c); top.pop(); }
  }
  return top.sort(cmp);
}
