/**
 * Controlador del Mapa Leaflet para uberlawyerBETA
 * Administra el mapa centrado en Cali, geolocalización, marcadores de abogados y efectos de escaneo radar.
 */

const MapController = {
  map: null,
  userLocation: { lat: 3.4516, lng: -76.5320 }, // Plazoleta Jairo Varela, Cali por defecto
  userMarker: null,
  lawyerMarkers: [],
  radarOverlayEl: null,

  initMap() {
    // Inicializar mapa centrado en Cali, Colombia
    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([this.userLocation.lat, this.userLocation.lng], 14);

    // Mosaicos minimalistas de OpenStreetMap / Carto
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Mover control de zoom a esquina inferior derecha
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Intentar geolocalización del usuario
    this.locateUser();
  },

  locateUser() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.updateUserMarker();
          this.map.setView([this.userLocation.lat, this.userLocation.lng], 14, { animate: true });
        },
        (error) => {
          console.warn("Geolocalización denegada o con error. Usando centro de Cali por defecto.", error);
          this.updateUserMarker();
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      this.updateUserMarker();
    }
  },

  updateUserMarker() {
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    const customUserIcon = L.divIcon({
      className: 'user-location-marker',
      html: `<div class="user-location-dot"><div class="user-location-pulse"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lng], { icon: customUserIcon })
      .addTo(this.map)
      .bindPopup('<div class="text-xs font-bold text-white px-1 py-0.5">📍 Tu ubicación actual en Cali</div>');
  },

  renderLawyerMarkers(lawyersList, onLawyerSelectCallback) {
    // Limpiar marcadores existentes
    this.lawyerMarkers.forEach(m => this.map.removeLayer(m));
    this.lawyerMarkers = [];

    lawyersList.forEach(lawyer => {
      const customLawyerIcon = L.divIcon({
        className: 'custom-lawyer-pin-wrap',
        html: `
          <div class="lawyer-marker-pin" id="pin-${lawyer.id}">
            <img src="${lawyer.avatar}" alt="${lawyer.name}">
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const popupContent = `
        <div class="p-2 space-y-1.5 font-sans min-w-[200px]">
          <div class="flex items-center space-x-2">
            <img src="${lawyer.avatar}" class="w-8 h-8 rounded-full object-cover border border-uber-green">
            <div>
              <div class="text-xs font-bold text-white leading-tight">${lawyer.name}</div>
              <div class="text-[10px] text-uber-green font-semibold">${lawyer.specialty} • ${lawyer.neighborhood}</div>
            </div>
          </div>
          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800 text-zinc-300">
            <span>★ ${lawyer.rating}</span>
            <span>${lawyer.distanceKm} km (${lawyer.etaMinutes} min)</span>
            <span class="font-bold text-white">$${lawyer.priceCOP.toLocaleString('es-CO')}</span>
          </div>
        </div>
      `;

      const marker = L.marker([lawyer.lat, lawyer.lng], { icon: customLawyerIcon })
        .addTo(this.map)
        .bindPopup(popupContent);

      marker.on('click', () => {
        if (onLawyerSelectCallback) {
          onLawyerSelectCallback(lawyer);
        }
      });

      this.lawyerMarkers.push(marker);
    });
  },

  triggerRadarAnimation(durationMs = 2500, callback) {
    if (!this.radarOverlayEl) {
      this.radarOverlayEl = document.createElement('div');
      this.radarOverlayEl.className = 'radar-scan-overlay';
      document.body.appendChild(this.radarOverlayEl);
    }

    this.radarOverlayEl.style.display = 'block';

    // Animación de pulso de la cámara centrada en el usuario
    this.map.flyTo([this.userLocation.lat, this.userLocation.lng], 15, { duration: 1.5 });

    setTimeout(() => {
      if (this.radarOverlayEl) {
        this.radarOverlayEl.style.display = 'none';
      }
      if (callback) callback();
    }, durationMs);
  }
};
