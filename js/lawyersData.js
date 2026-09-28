/**
 * Base de datos local de abogados activos en Cali, Colombia (Mock Data Amplio)
 * Incluye cálculo de fórmula Haversine, tiempos de respuesta (estimado y máximo) y desplazamientos.
 */

const LAWYERS_DATA = [
  {
    id: "lawyer-1",
    name: "Dra. Sofía Restrepo Valencia",
    tp: "TP #284.912 CSJ",
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
    description: "Especialista en Derecho Penal Corporativo y capturas en flagrancia. 12 años de experiencia."
  },
  {
    id: "lawyer-2",
    name: "Dr. Carlos Eduardo Osorio",
    tp: "TP #198.405 CSJ",
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
    description: "Ex-asesor de la Secretaría de Tránsito de Cali. Conciliaciones inmediatas y fotomultas."
  },
  {
    id: "lawyer-3",
    name: "Dr. Alejandro Gómez Jaramillo",
    tp: "TP #312.044 CSJ",
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
    description: "Especialista en restitución de inmuebles, embargo de bienes y contratos comerciales."
  },
  {
    id: "lawyer-4",
    name: "Dra. Natalia Caicedo Borrero",
    tp: "TP #275.319 CSJ",
    specialty: "Narcotráfico",
    rating: 4.98,
    reviewsCount: 84,
    priceCOP: 120000,
    travelPriceCOP: 220000,
    estimatedResponseMin: 1,
    maxResponseMin: 4,
    neighborhood: "El Peñón",
    lat: 3.4490,
    lng: -76.5420,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
    phone: "+57 300 782 9900",
    status: "Disponible ahora",
    description: "Magíster en Ciencias Penales y Criminología. Defensa técnica especializada 24/7."
  },
  {
    id: "lawyer-5",
    name: "Dr. Mario Fernando Bermúdez",
    tp: "TP #164.882 CSJ",
    specialty: "Laboral",
    rating: 4.85,
    reviewsCount: 160,
    priceCOP: 70000,
    travelPriceCOP: 130000,
    estimatedResponseMin: 5,
    maxResponseMin: 12,
    neighborhood: "Santa Mónica",
    lat: 3.4680,
    lng: -76.5260,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    phone: "+57 316 223 8811",
    status: "Disponible ahora",
    description: "Asesoría laboral tanto para trabajadores como para empleadores. Despidos inconstitucionales."
  },
  {
    id: "lawyer-6",
    name: "Dra. Valentina Holguín Prada",
    tp: "TP #299.102 CSJ",
    specialty: "Familia",
    rating: 4.90,
    reviewsCount: 110,
    priceCOP: 80000,
    travelPriceCOP: 150000,
    estimatedResponseMin: 3,
    maxResponseMin: 7,
    neighborhood: "San Antonio",
    lat: 3.4460,
    lng: -76.5390,
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=250",
    phone: "+57 312 889 0044",
    status: "Disponible ahora",
    description: "Especialista en divorcios expres, fijación de cuota alimentaria y custodias."
  },
  {
    id: "lawyer-7",
    name: "Dr. Andrés Felipe Mosquera",
    tp: "TP #241.550 CSJ",
    specialty: "Comercial",
    rating: 4.89,
    reviewsCount: 175,
    priceCOP: 90000,
    travelPriceCOP: 170000,
    estimatedResponseMin: 4,
    maxResponseMin: 9,
    neighborhood: "Chipichape",
    lat: 3.4750,
    lng: -76.5280,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    phone: "+57 317 554 3322",
    status: "Disponible ahora",
    description: "Derecho corporativo, propiedad intelectual, marcas y sociedades comerciales."
  },
  {
    id: "lawyer-8",
    name: "Dra. Camila Morales Echeverry",
    tp: "TP #305.811 CSJ",
    specialty: "Administrativo",
    rating: 4.91,
    reviewsCount: 67,
    priceCOP: 85000,
    travelPriceCOP: 155000,
    estimatedResponseMin: 6,
    maxResponseMin: 15,
    neighborhood: "Valle del Lili",
    lat: 3.3750,
    lng: -76.5180,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
    phone: "+57 301 445 7788",
    status: "Disponible ahora",
    description: "Acciones de Tutela, Derechos de Petición y demandas contra entidades del Estado."
  },
  {
    id: "lawyer-9",
    name: "Dr. Roberto Silva Llanos",
    tp: "TP #210.334 CSJ",
    specialty: "Penal",
    rating: 4.96,
    reviewsCount: 190,
    priceCOP: 100000,
    travelPriceCOP: 190000,
    estimatedResponseMin: 2,
    maxResponseMin: 6,
    neighborhood: "Tequendama",
    lat: 3.4180,
    lng: -76.5430,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
    phone: "+57 311 300 1212",
    status: "Disponible ahora",
    description: "Penalista Senior. Litigio en audiencias de control de garantías e imputaciones."
  },
  {
    id: "lawyer-10",
    name: "Dra. Isabel Cristina Zabala",
    tp: "TP #266.701 CSJ",
    specialty: "Tránsito",
    rating: 4.87,
    reviewsCount: 130,
    priceCOP: 75000,
    travelPriceCOP: 145000,
    estimatedResponseMin: 3,
    maxResponseMin: 8,
    neighborhood: "Versalles",
    lat: 3.4610,
    lng: -76.5290,
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250",
    phone: "+57 320 667 8989",
    status: "Disponible ahora",
    description: "Experticia en licencias suspendidas, alcoholemia e impugnación de comparendos."
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
  const distance = R * c; // Distancia en km
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
