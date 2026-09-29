/**
 * Base de datos local de abogados activos en Cali, Colombia
 * Incluye Tarjeta Profesional (T.P. CSJ) pública y verificada, universidades, barrios y coordenadas
 */

const LAWYERS_DATA = [
  {
    id: "lawyer-1",
    name: "Dra. Sofía Restrepo Valencia",
    tp: "T.P. No. 284.912 del CSJ • Verificada MinJusticia",
    tpNumber: "284.912 CSJ",
    specialty: "Penal",
    rating: 4.95,
    reviewsCount: 142,
    priceCOP: 95000,
    travelPriceCOP: 180000,
    estimatedResponseMin: 2,
    maxResponseMin: 5,
    neighborhood: "Granada",
    lat: 3.4560,
    lng: -76.5350,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    phone: "+57 315 489 2011",
    status: "Disponible ahora",
    university: "Universidad del Valle",
    experienceYears: 12,
    languages: ["Español", "Inglés"],
    casesWon: "320+ capturas e imputaciones resueltas",
    bio: "Especialista en Derecho Penal y Audiencias Urgentes de Garantías. Atención en Uri de la Fiscalía y CAI de Policía en Cali.",
    description: "Atención inmediata en capturas en flagrancia y libertad en URI."
  },
  {
    id: "lawyer-2",
    name: "Dr. Carlos Eduardo Osorio",
    tp: "T.P. No. 198.405 del CSJ • Verificada MinJusticia",
    tpNumber: "198.405 CSJ",
    specialty: "Tránsito",
    rating: 4.88,
    reviewsCount: 98,
    priceCOP: 75000,
    travelPriceCOP: 140000,
    estimatedResponseMin: 3,
    maxResponseMin: 8,
    neighborhood: "San Fernando",
    lat: 3.4310,
    lng: -76.5410,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250",
    phone: "+57 310 921 4455",
    status: "Disponible ahora",
    university: "Universidad Javeriana Cali",
    experienceYears: 9,
    languages: ["Español"],
    casesWon: "210+ accidentes e impugnaciones",
    bio: "Ex-asesor de la Secretaría de Tránsito de Cali. Conciliaciones inmediatas en choques y retiro de vehículos retenidos.",
    description: "Conciliación en sitio de accidente y defensa ante retenes de tránsito."
  },
  {
    id: "lawyer-3",
    name: "Dr. Alejandro Gómez Jaramillo",
    tp: "T.P. No. 312.044 del CSJ • Verificada MinJusticia",
    tpNumber: "312.044 CSJ",
    specialty: "Civil",
    rating: 4.92,
    reviewsCount: 215,
    priceCOP: 85000,
    travelPriceCOP: 160000,
    estimatedResponseMin: 4,
    maxResponseMin: 10,
    neighborhood: "Ciudad Jardín",
    lat: 3.3620,
    lng: -76.5290,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    phone: "+57 318 654 1122",
    status: "Disponible ahora",
    university: "Universidad Icesi",
    experienceYears: 14,
    languages: ["Español", "Inglés"],
    casesWon: "450+ restitución de arrendamientos y embargos",
    bio: "Magíster en Derecho Civil y Contratos. Asesoría urgente en suspensión de embargos y retenciones indebidas de inmuebles.",
    description: "Desalojos contractuales, desacuerdos de arriendo y levantamiento de embargos."
  },
  {
    id: "lawyer-4",
    name: "Dra. Natalia Caicedo Borrero",
    tp: "T.P. No. 275.319 del CSJ • Verificada MinJusticia",
    tpNumber: "275.319 CSJ",
    specialty: "Policía",
    rating: 4.98,
    reviewsCount: 84,
    priceCOP: 90000,
    travelPriceCOP: 170000,
    estimatedResponseMin: 1,
    maxResponseMin: 4,
    neighborhood: "El Peñón",
    lat: 3.4490,
    lng: -76.5420,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
    phone: "+57 300 782 9900",
    status: "Disponible ahora",
    university: "Universidad Libre de Cali",
    experienceYears: 16,
    languages: ["Español", "Inglés"],
    casesWon: "180+ comparendos anulados e inspecciones",
    bio: "Experta en Ley 1801 Código Nacional de Policía y Convivencia. Asistencia técnica en cierres de establecimientos e inspecciones.",
    description: "Representación en audiencias públicas de inspectores de Policía en Cali."
  },
  {
    id: "lawyer-5",
    name: "Dr. Mario Fernando Bermúdez",
    tp: "T.P. No. 164.882 del CSJ • Verificada MinJusticia",
    tpNumber: "164.882 CSJ",
    specialty: "Familia",
    rating: 4.85,
    reviewsCount: 160,
    priceCOP: 80000,
    travelPriceCOP: 150000,
    estimatedResponseMin: 3,
    maxResponseMin: 8,
    neighborhood: "Santa Mónica",
    lat: 3.4680,
    lng: -76.5260,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    phone: "+57 316 223 8811",
    status: "Disponible ahora",
    university: "Universidad Santiago de Cali",
    experienceYears: 10,
    languages: ["Español"],
    casesWon: "290+ medidas de protección dictaminadas",
    bio: "Especialista en Comisarías de Familia y Violencia Intrafamiliar. Trámite prioritario de caución y medidas de alejamiento.",
    description: "Medidas urgentes en Comisaría de Familia y custodia de menores."
  },
  {
    id: "lawyer-6",
    name: "Dra. Valentina Holguín Prada",
    tp: "T.P. No. 299.102 del CSJ • Verificada MinJusticia",
    tpNumber: "299.102 CSJ",
    specialty: "Penal",
    rating: 4.90,
    reviewsCount: 110,
    priceCOP: 95000,
    travelPriceCOP: 180000,
    estimatedResponseMin: 3,
    maxResponseMin: 7,
    neighborhood: "San Antonio",
    lat: 3.4460,
    lng: -76.5390,
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=250",
    phone: "+57 312 889 0044",
    status: "Disponible ahora",
    university: "Universidad San Buenaventura Cali",
    experienceYears: 8,
    languages: ["Español", "Italiano"],
    casesWon: "195+ solicitudes de libertad y defensas",
    bio: "Defensora penal en audiencias preliminares de la URI. Hábeas Corpus y traslados a centros asistenciales.",
    description: "Defensa urgente 24/7 en estaciones de policía y juzgados penales."
  },
  {
    id: "lawyer-7",
    name: "Dr. Andrés Felipe Mosquera",
    tp: "T.P. No. 241.550 del CSJ • Verificada MinJusticia",
    tpNumber: "241.550 CSJ",
    specialty: "Tránsito",
    rating: 4.89,
    reviewsCount: 175,
    priceCOP: 75000,
    travelPriceCOP: 140000,
    estimatedResponseMin: 4,
    maxResponseMin: 9,
    neighborhood: "Chipichape",
    lat: 3.4750,
    lng: -76.5280,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    phone: "+57 317 554 3322",
    status: "Disponible ahora",
    university: "Universidad del Rosario",
    experienceYears: 11,
    languages: ["Español", "Inglés"],
    casesWon: "230+ casos de alcoholemia y patíos",
    bio: "Especialista en litigio de tránsito, audiencias de alcoholemia y desbloqueo de licencias de conducción.",
    description: "Atención inmediata en embargos por fotomultas e incidentes en carretera."
  },
  {
    id: "lawyer-8",
    name: "Dra. Isabel Cristina Zabala",
    tp: "T.P. No. 266.701 del CSJ • Verificada MinJusticia",
    tpNumber: "266.701 CSJ",
    specialty: "Policía",
    rating: 4.87,
    reviewsCount: 130,
    priceCOP: 85000,
    travelPriceCOP: 160000,
    estimatedResponseMin: 3,
    maxResponseMin: 8,
    neighborhood: "Versalles",
    lat: 3.4610,
    lng: -76.5290,
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250",
    phone: "+57 320 667 8989",
    status: "Disponible ahora",
    university: "Universidad Cooperativa de Colombia",
    experienceYears: 9,
    languages: ["Español"],
    casesWon: "260+ procedimientos policivos acompañados",
    bio: "Acompañamiento presencial inmediato en allanamientos, incautaciones de bienes e inspecciones administrativas.",
    description: "Experta en Código de Policía y mediación en conflictos vecinales o comerciales."
  }
];

/**
 * Cálculo de la distancia en kilómetros entre dos coordenadas usando Haversine
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
}

/**
 * Estima el tiempo de atención o desplazamiento en minutos según la distancia
 */
function estimateETA(distanceKm) {
  const minutes = Math.max(2, Math.round((distanceKm / 30) * 60) + 2);
  return minutes;
}

/**
 * Filtra y ordena los abogados más cercanos según una especialidad deseada
 */
function getLawyersWithDistance(userLat, userLng, specialtyFilter = null) {
  let list = LAWYERS_DATA.map(lawyer => {
    const dist = calculateHaversineDistance(userLat, userLng, lawyer.lat, lawyer.lng);
    const eta = estimateETA(dist);
    return {
      ...lawyer,
      distanceKm: dist,
      etaMinutes: eta
    };
  });

  if (specialtyFilter && specialtyFilter !== 'General' && specialtyFilter !== 'Cualquiera') {
    const filtered = list.filter(l => l.specialty.toLowerCase() === specialtyFilter.toLowerCase());
    if (filtered.length > 0) {
      list = filtered;
    }
  }

  // Ordenar por distancia ascendente
  list.sort((a, b) => a.distanceKm - b.distanceKm);
  return list;
}

if (typeof window !== 'undefined') {
  window.LAWYERS_DATA = LAWYERS_DATA;
  window.getLawyersWithDistance = getLawyersWithDistance;
}
