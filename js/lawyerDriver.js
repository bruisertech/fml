/**
 * Controlador del Panel de Abogado Estilo Uber Driver para Abogao
 * Gestión de estado en línea/offline, radar de casos simulados en vivo,
 * aceptación/rechazo de casos, cronómetro de atención y panel dividido (videollamada + recursos).
 */

const LawyerDriver = {
  isOnline: false,
  activeTimerInterval: null,
  timerSeconds: 0,
  activeCase: null,

  DEFAULT_CASES: [
    {
      id: 'CASE-101',
      active: true,
      title: 'Accidente de tránsito con lesionados en Av. Roosevelt con Cra 39',
      situation: 'Accidente de tránsito con lesionados',
      neighborhood: 'San Fernando',
      rateCOP: 130000,
      mode: 'Videollamada Express',
      timeAgo: 'Hace 2 min',
      clientName: 'Juan Carlos Pérez',
      clientPhone: '315 123 4567',
      clientPrompt: 'Sufrí un choque con herido leve en la intersección. La otra parte insiste en citar a agentes de tránsito para el informe policial.',
      aiSummary: 'Urgencia Alta. Lesiones culposas en accidente de tránsito. Se requiere orientación legal previa al diligenciamiento del Informe Policial de Accidentes de Tránsito (IPAT).',
      resources: [
        { norm: 'Código Penal', art: 'Art. 120 (Lesiones culposas)', action: 'Querellable en 6 meses' },
        { norm: 'Ley 769 de 2002', art: 'Art. 143 (IPAT)', action: 'Verificar croquis antes de firmar' },
        { norm: 'SOAT / Póliza', art: 'Amparo de salud', action: 'Activación inmediata en centro médico' }
      ],
      resourceAdvice: 'Instruir al cliente de no aceptar responsabilidad previa a peritaje, solicitar copia del IPAT y canalizar atención médica SOAT.'
    },
    {
      id: 'CASE-102',
      active: true,
      title: 'Captura en flagrancia y traslado a URI Fiscalía (Barrio Granada)',
      situation: 'Captura en flagrancia / Retención',
      neighborhood: 'Granada',
      rateCOP: 150000,
      mode: 'Desplazamiento Presencial',
      timeAgo: 'Hace 5 min',
      clientName: 'María Fernanda Ruiz',
      clientPhone: '312 987 6543',
      clientPrompt: 'Fui retenida por patrulla de la policía en la Zona Rosa de Granada. Me acusan injustamente y me están trasladando a la URI.',
      aiSummary: 'Urgencia Máxima. Detención y traslado a la URI de Fiscalía Granada. Inicia término de 36 horas para legalización de captura ante juez de control de garantías.',
      resources: [
        { norm: 'C. P. Penal', art: 'Art. 301 (Flagrancia)', action: 'Término constitucional de 36 horas' },
        { norm: 'Constitución Pol.', art: 'Art. 29 (Debido proceso)', action: 'Derecho a guardar silencio y defensa' },
        { norm: 'Ley 1095 / 2006', art: 'Hábeas Corpus', action: 'Acción expedita en caso de prolongación ilegal' }
      ],
      resourceAdvice: 'Acudir a la URI de Granada, verificar libro de minutas de la policía, entablar entrevista privada con el retenido e instruir silencio.'
    },
    {
      id: 'CASE-103',
      active: true,
      title: 'Violencia intrafamiliar / Asistencia en CAI San Fernando',
      situation: 'Violencia Intrafamiliar o Riesgo Inminente',
      neighborhood: 'San Fernando',
      rateCOP: 120000,
      mode: 'Videollamada Express',
      timeAgo: 'Hace 1 min',
      clientName: 'Andrea Patricia Gómez',
      clientPhone: '300 456 7890',
      clientPrompt: 'Sufro agresión verbal y amenazas físicas de mi expareja en la puerta de mi casa. La policía se encuentra presente en el lugar.',
      aiSummary: 'Urgencia Alta. Agresión en ámbito familiar con riesgo físico. Requiere solicitud inmediata de Medida de Protección Provisional de Urgencia.',
      resources: [
        { norm: 'Código Penal', art: 'Art. 229 (Violencia intrafamiliar)', action: 'Delito no querellable, actuación de oficio' },
        { norm: 'Ley 2126 de 2021', art: 'Comisaría de Familia 24h', action: 'Medida provisional de protección inmediata' },
        { norm: 'Medicina Legal', art: 'Dictamen de lesiones', action: 'Valoración e incapacidad' }
      ],
      resourceAdvice: 'Recomendar el traslado inmediato a Comisaría de Familia 24h o Fiscalía, solicitar orden de desalojo/restricción del agresor y dictamen médico.'
    }
  ],

  getSimulatedCases() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.SIMULATED_CASES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error cargando casos de localStorage:", e);
    }
    // Inicializar por defecto
    localStorage.setItem(CONFIG.STORAGE_KEYS.SIMULATED_CASES, JSON.stringify(this.DEFAULT_CASES));
    return this.DEFAULT_CASES;
  },

  saveSimulatedCases(cases) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SIMULATED_CASES, JSON.stringify(cases));
  },

  init() {
    this.setupEventListeners();
    this.checkInitialStatus();
  },

  checkInitialStatus() {
    const savedStatus = localStorage.getItem(CONFIG.STORAGE_KEYS.LAWYER_ONLINE);
    this.isOnline = savedStatus === 'true';
    this.updateOnlineUI();
  },

  toggleOnline() {
    this.isOnline = !this.isOnline;
    localStorage.setItem(CONFIG.STORAGE_KEYS.LAWYER_ONLINE, this.isOnline);
    this.updateOnlineUI();
  },

  updateOnlineUI() {
    const statusDot = document.getElementById('driver-status-dot');
    const statusText = document.getElementById('driver-status-text');
    const btnToggleText = document.getElementById('btn-driver-toggle-text');
    const btnToggle = document.getElementById('btn-driver-toggle-online');
    const radarHeader = document.getElementById('driver-radar-header');
    const casesContainer = document.getElementById('driver-incoming-cases-container');

    if (this.isOnline) {
      if (statusDot) statusDot.className = "absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse";
      if (statusText) statusText.textContent = "Modo Abogado • En Línea (Recibiendo Casos)";
      if (btnToggleText) btnToggleText.textContent = "EN LÍNEA - DESCONECTAR";
      if (btnToggle) btnToggle.className = "py-3 px-5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-wider rounded-2xl shadow-xl transition active:scale-95 flex items-center space-x-2";
      if (radarHeader) radarHeader.classList.remove('hidden');
      if (casesContainer) casesContainer.classList.remove('hidden');

      this.renderIncomingCases();
    } else {
      if (statusDot) statusDot.className = "absolute -bottom-1 -right-1 w-4 h-4 bg-slate-500 border-2 border-slate-900 rounded-full";
      if (statusText) statusText.textContent = "Modo Abogado • Desconectado";
      if (btnToggleText) btnToggleText.textContent = "CONECTARSE EN LÍNEA";
      if (btnToggle) btnToggle.className = "py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs tracking-wider rounded-2xl shadow-xl transition active:scale-95 flex items-center space-x-2";
      if (radarHeader) radarHeader.classList.add('hidden');
      if (casesContainer) casesContainer.classList.add('hidden');
    }

    if (window.lucide) lucide.createIcons();
  },

  renderIncomingCases() {
    const container = document.getElementById('driver-incoming-cases-container');
    const countBadge = document.getElementById('driver-cases-count');
    if (!container) return;

    const allCases = this.getSimulatedCases();
    const activeCases = allCases.filter(c => c.active !== false);

    if (countBadge) countBadge.textContent = `${activeCases.length} Casos cercanos`;

    container.innerHTML = '';

    if (activeCases.length === 0) {
      container.innerHTML = `
        <div class="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl text-center text-slate-400 space-y-2">
          <i data-lucide="radar" class="w-8 h-8 text-emerald-500 mx-auto animate-pulse"></i>
          <p class="text-xs font-semibold">Escaneando casos urgentes en Cali...</p>
          <p class="text-[11px] text-slate-500">Mantente en línea para recibir la asignación en tiempo real.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    activeCases.forEach((caseItem) => {
      const card = document.createElement('div');
      card.className = "bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-4 shadow-2xl space-y-3 relative transition hover:border-emerald-400";

      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center space-x-2">
            <span class="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <i data-lucide="siren" class="w-4 h-4"></i>
            </span>
            <span class="text-xs font-extrabold text-white truncate max-w-[220px]">${caseItem.situation}</span>
          </div>
          <span class="text-xs font-mono text-emerald-400 font-extrabold bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/30">
            $${caseItem.rateCOP.toLocaleString('es-CO')} COP
          </span>
        </div>

        <div class="space-y-1">
          <h4 class="text-xs sm:text-sm font-extrabold text-white leading-snug">${caseItem.title}</h4>
          <div class="flex items-center space-x-3 text-[11px] text-slate-400 pt-0.5">
            <span class="flex items-center gap-1 text-slate-300">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-red-400"></i>
              ${caseItem.neighborhood}
            </span>
            <span>•</span>
            <span class="flex items-center gap-1 text-emerald-400">
              <i data-lucide="video" class="w-3.5 h-3.5"></i>
              ${caseItem.mode}
            </span>
            <span>•</span>
            <span class="text-slate-500">${caseItem.timeAgo}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-1">
          <button class="btn-reject-driver-case py-2.5 px-3 bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition active:scale-95 flex items-center justify-center space-x-1.5" data-id="${caseItem.id}">
            <i data-lucide="x-circle" class="w-4 h-4"></i>
            <span>Rechazar</span>
          </button>
          <button class="btn-accept-driver-case py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl transition active:scale-95 flex items-center justify-center space-x-1.5 shadow-lg" data-id="${caseItem.id}">
            <i data-lucide="check-circle" class="w-4 h-4"></i>
            <span>Aceptar Caso</span>
          </button>
        </div>
      `;

      container.appendChild(card);
    });

    container.querySelectorAll('.btn-reject-driver-case').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        this.rejectCase(id);
      });
    });

    container.querySelectorAll('.btn-accept-driver-case').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        this.acceptCase(id);
      });
    });

    if (window.lucide) lucide.createIcons();
  },

  rejectCase(caseId) {
    const cases = this.getSimulatedCases();
    const target = cases.find(c => c.id === caseId);
    if (target) {
      target.active = false;
      this.saveSimulatedCases(cases);
      this.renderIncomingCases();
    }
  },

  acceptCase(caseId) {
    const cases = this.getSimulatedCases();
    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) return;

    this.activeCase = caseItem;
    this.openActiveCaseModal(caseItem);
  },

  openActiveCaseModal(caseItem) {
    const modal = document.getElementById('driver-case-active-modal');
    if (!modal) return;

    document.getElementById('active-case-title').textContent = `Caso # ${caseItem.id} - ${caseItem.situation}`;
    document.getElementById('active-case-location').textContent = `${caseItem.neighborhood} • ${caseItem.title}`;
    document.getElementById('active-client-name').textContent = caseItem.clientName || 'Cliente Abogao';

    const phoneEl = document.getElementById('active-client-phone');
    if (phoneEl) {
      phoneEl.href = `tel:${(caseItem.clientPhone || '').replace(/\s+/g, '')}`;
      phoneEl.querySelector('span').textContent = caseItem.clientPhone || '315 123 4567';
    }

    document.getElementById('active-case-rate').textContent = `$${caseItem.rateCOP.toLocaleString('es-CO')} COP`;
    document.getElementById('active-case-mode').textContent = caseItem.mode;
    document.getElementById('active-client-message').textContent = `"${caseItem.clientPrompt}"`;
    document.getElementById('active-ai-summary').textContent = caseItem.aiSummary;

    // Render Tabla de Recursos
    const tableBody = document.getElementById('driver-resources-table-body');
    if (tableBody) {
      tableBody.innerHTML = '';
      (caseItem.resources || []).forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="p-2 font-bold text-emerald-400">${res.norm}</td>
          <td class="p-2 text-slate-200">${res.art}</td>
          <td class="p-2 text-slate-300 font-medium">${res.action}</td>
        `;
        tableBody.appendChild(tr);
      });
    }

    const adviceEl = document.getElementById('driver-resource-advice');
    if (adviceEl) adviceEl.textContent = caseItem.resourceAdvice || 'Verificar documentación básica y tomar contacto inmediato.';

    // Start Timer
    this.startActiveTimer();

    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  startActiveTimer() {
    this.stopActiveTimer();
    this.timerSeconds = 0;
    const timerDisplay = document.getElementById('active-case-timer');

    this.activeTimerInterval = setInterval(() => {
      this.timerSeconds++;
      const mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
      const secs = String(this.timerSeconds % 60).padStart(2, '0');
      if (timerDisplay) {
        timerDisplay.querySelector('span').textContent = `${mins}:${secs}`;
      }
    }, 1000);
  },

  stopActiveTimer() {
    if (this.activeTimerInterval) {
      clearInterval(this.activeTimerInterval);
      this.activeTimerInterval = null;
    }
  },

  closeActiveCaseModal() {
    const modal = document.getElementById('driver-case-active-modal');
    const jitsiSplit = document.getElementById('driver-jitsi-split-view');
    if (jitsiSplit) jitsiSplit.classList.add('hidden');
    this.stopActiveTimer();
    if (modal) modal.classList.add('hidden');
  },

  setupEventListeners() {
    const btnToggleOnline = document.getElementById('btn-driver-toggle-online');
    if (btnToggleOnline) {
      btnToggleOnline.addEventListener('click', () => {
        this.toggleOnline();
      });
    }

    const btnCloseModal = document.getElementById('btn-close-active-case-modal');
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => {
        this.closeActiveCaseModal();
      });
    }

    const btnStartJitsiSplit = document.getElementById('btn-driver-start-jitsi-split');
    if (btnStartJitsiSplit) {
      btnStartJitsiSplit.addEventListener('click', () => {
        const jitsiContainer = document.getElementById('jitsi-driver-container');
        const jitsiSplit = document.getElementById('driver-jitsi-split-view');

        if (jitsiSplit) jitsiSplit.classList.remove('hidden');

        if (typeof JitsiMeetExternalAPI !== 'undefined' && jitsiContainer && this.activeCase) {
          jitsiContainer.innerHTML = '';
          const domain = 'meet.jit.si';
          const options = {
            roomName: `AbogaoCase_${this.activeCase.id}`,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainer,
            configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false },
            interfaceConfigOverwrite: { TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'tileview'] }
          };
          new JitsiMeetExternalAPI(domain, options);
        } else {
          alert("Videollamada iniciada en modo simulación (Split 50/50 activado).");
        }
      });
    }
  }
};

if (typeof window !== 'undefined') {
  window.LawyerDriver = LawyerDriver;
}
