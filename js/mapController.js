/**
 * Controlador del Mapa Interactivo Leaflet para Abogao (Cali, Colombia)
 * Posicionamiento, pines con pulso esmeralda neón, popups con T.P. y radar de búsqueda.
 */

const MapController = {
  map: null,
  userLocation: CONFIG ? CONFIG.CALI_COORDS : { lat: 3.4516, lng: -76.5320 },
  userMarker: null,
  lawyerMarkers: [],
  radarOverlayEl: null,

  initMap() {
    const defaultCoords = this.userLocation || (CONFIG ? CONFIG.CALI_COORDS : { lat: 3.4516, lng: -76.5320 });
    const defaultZoom = (CONFIG && CONFIG.DEFAULT_ZOOM) ? CONFIG.DEFAULT_ZOOM : 14;
    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([defaultCoords.lat, defaultCoords.lng], defaultZoom);

    // Standard OpenStreetMap tile layer with dark CSS filter
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: 'map-tiles-dark'
    }).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.renderUserMarker(defaultCoords);
    this.locateUserBrowser();
  },

  locateUserBrowser() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Si el usuario está cerca de Cali, actualizar
          if (lat > 3.0 && lat < 4.0 && lng > -77.0 && lng < -76.0) {
            this.userLocation = { lat, lng };
            this.map.setView([lat, lng], 14);
            this.renderUserMarker(this.userLocation);
          }
        },
        (error) => {
          console.warn("Geolocalización no otorgada. Usando Cali Centro por defecto.");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  },

  renderUserMarker(coords) {
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="user-location-pulse"></div>
        <div class="user-location-dot"></div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    this.userMarker = L.marker([coords.lat, coords.lng], { icon: userIcon }).addTo(this.map);
  },

  renderLawyerMarkers(lawyers, onMarkerClickCallback) {
    // Clear existing lawyer markers
    this.lawyerMarkers.forEach(m => this.map.removeLayer(m));
    this.lawyerMarkers = [];

    lawyers.forEach(lawyer => {
      const isTarget = lawyer.isTargetMatch;
      const markerColor = isTarget ? '#10B981' : '#3B82F6';

      const customIcon = L.divIcon({
        className: 'custom-lawyer-pin-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full ${isTarget ? 'bg-emerald-400' : 'bg-blue-400'} opacity-50"></span>
            <div class="relative w-9 h-9 rounded-full bg-slate-900 border-2 ${isTarget ? 'border-emerald-400' : 'border-blue-500'} shadow-xl flex items-center justify-center text-xs font-bold text-white">
              ${lawyer.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([lawyer.lat, lawyer.lng], { icon: customIcon }).addTo(this.map);

      const popupContent = `
        <div class="p-2 text-white font-sans max-w-[200px]">
          <div class="text-xs font-extrabold text-white">${lawyer.name} ${isTarget ? '🎯' : ''}</div>
          <div class="text-[10px] text-emerald-400 font-semibold mt-0.5">${lawyer.kind === 'abogado' ? 'Abogado(a)' : lawyer.kind} • ${lawyer.neighborhood}</div>
          <div class="text-[9px] text-slate-300 mt-1">${lawyer.doc || 'T.P. Verificada'}</div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup'
      });

      marker.on('click', () => {
        if (onMarkerClickCallback) {
          onMarkerClickCallback(lawyer);
        }
      });

      this.lawyerMarkers.push(marker);
    });
  },

  highlightLawyerMarker(lawyerId) {
    // Optional highlight logic
  },

  triggerRadarAnimation(durationMs = 2000, onComplete) {
    if (this.map) {
      const currentZoom = this.map.getZoom();
      this.map.setZoom(currentZoom - 1, { animate: true });
      setTimeout(() => {
        this.map.setZoom(currentZoom, { animate: true });
        if (onComplete) onComplete();
      }, durationMs);
    } else if (onComplete) {
      onComplete();
    }
  }
};
