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
    const defaultCoords = this.userLocation;
    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: true
    }).setView([defaultCoords.lat, defaultCoords.lng], CONFIG ? CONFIG.DEFAULT_ZOOM : 14);

    // Dark CartoDB Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
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
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    this.userMarker = L.marker([coords.lat, coords.lng], { icon: userIcon }).addTo(this.map);
    this.userMarker.bindTooltip("Tu Ubicación en Cali", { permanent: false, direction: "top" });
  },

  renderLawyerMarkers(lawyers, onLawyerSelectCallback) {
    this.clearLawyerMarkers();

    lawyers.forEach((lawyer) => {
      const lawyerIcon = L.divIcon({
        className: 'custom-lawyer-icon',
        html: `
          <div class="lawyer-marker-pin" title="${lawyer.name}">
            <img src="${lawyer.avatar}" alt="${lawyer.name}" />
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([lawyer.lat, lawyer.lng], { icon: lawyerIcon }).addTo(this.map);

      const popupContent = `
        <div class="p-2 space-y-1.5 text-white max-w-[210px]">
          <div class="flex items-center space-x-2">
            <img src="${lawyer.avatar}" class="w-9 h-9 rounded-xl object-cover border border-emerald-400" />
            <div class="min-w-0">
              <div class="text-xs font-bold truncate">${lawyer.name}</div>
              <div class="text-[10px] text-emerald-400 font-semibold">${lawyer.specialty}</div>
            </div>
          </div>
          <div class="p-1 px-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded text-[9px] font-bold text-emerald-300">
            ✓ ${lawyer.tp}
          </div>
          <div class="text-[10px] text-slate-300 flex items-center justify-between">
            <span>★ ${lawyer.rating}</span>
            <span>${lawyer.distanceKm} km (${lawyer.etaMinutes} min)</span>
          </div>
          <button class="btn-popup-select w-full mt-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-extrabold rounded-lg transition" data-id="${lawyer.id}">
            Ver Opción
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { closeButton: false });

      marker.on('popupopen', () => {
        const btn = document.querySelector(`.btn-popup-select[data-id="${lawyer.id}"]`);
        if (btn) {
          btn.addEventListener('click', () => {
            if (onLawyerSelectCallback) onLawyerSelectCallback(lawyer);
          });
        }
      });

      this.lawyerMarkers.push(marker);
    });
  },

  clearLawyerMarkers() {
    this.lawyerMarkers.forEach(m => this.map.removeLayer(m));
    this.lawyerMarkers = [];
  },

  triggerRadarAnimation(durationMs = 2500, onComplete) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    if (this.radarOverlayEl) {
      this.radarOverlayEl.remove();
    }

    this.radarOverlayEl = document.createElement('div');
    this.radarOverlayEl.className = 'radar-scan-overlay';
    mapContainer.appendChild(this.radarOverlayEl);

    setTimeout(() => {
      if (this.radarOverlayEl) {
        this.radarOverlayEl.remove();
        this.radarOverlayEl = null;
      }
      if (onComplete) onComplete();
    }, durationMs);
  }
};

if (typeof window !== 'undefined') {
  window.MapController = MapController;
}
