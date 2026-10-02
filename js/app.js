/**
 * Control Principal de la Aplicación Abogao (Cali, Colombia)
 * Orquesta la máquina de estados de triaje, especialidades reales, rutas jurídicas,
 * consultorio, selección de abogados con T.P. visible y pagos simulados con Apple Pay.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado global de la app
  const state = {
    triageStep: 1, // 1: Urgencia/Consulta, 2: Injury check, 3: Specialty, 4: Role, 5: Description
    isUrgency: true,
    hasInjuries: false,
    selectedSpecialty: null,
    userRole: 'Víctima', // 'Víctima' o 'Acusado'
    inputMode: 'text', // 'text' o 'audio'
    assignedLawyer: null,
    currentLawyers: [],
    omittedLawyerIds: new Set(),
    pendingPaymentType: null, // 'videocall' o 'dispatch'
    activeOrders: [],
    currentRole: 'client' // 'client' o 'lawyer'
  };

  // 1. Inicializar Lucide Icons y Mapa
  if (window.lucide) {
    lucide.createIcons();
  }

  MapController.initMap();
  if (window.LawyerDriver) {
    LawyerDriver.init();
  }

  // GESTIÓN DE ROLES (PORTAL SWITCHER)
  const roleModal = document.getElementById('role-selection-modal');
  const btnRoleClient = document.getElementById('btn-select-role-client');
  const btnRoleLawyer = document.getElementById('btn-select-role-lawyer');
  const btnToggleRole = document.getElementById('btn-toggle-role');
  const headerRoleLabel = document.getElementById('header-role-label');
  const selectModalRole = document.getElementById('select-modal-role');

  const mainEl = document.querySelector('main');
  const footerEl = document.querySelector('footer');
  const screenLawyerDriver = document.getElementById('screen-lawyer-driver');

  function setAppRole(role) {
    state.currentRole = role;
    localStorage.setItem(CONFIG.STORAGE_KEYS.ROLE, role);

    if (headerRoleLabel) {
      headerRoleLabel.textContent = role === 'lawyer' ? 'Abogado' : 'Cliente';
    }

    if (selectModalRole) {
      selectModalRole.value = role;
    }

    if (role === 'lawyer') {
      if (mainEl) mainEl.classList.add('hidden');
      if (footerEl) footerEl.classList.add('hidden');
      if (screenLawyerDriver) screenLawyerDriver.classList.remove('hidden');
      if (window.LawyerDriver) LawyerDriver.updateOnlineUI();
    } else {
      if (screenLawyerDriver) screenLawyerDriver.classList.add('hidden');
      if (mainEl) mainEl.classList.remove('hidden');
      if (footerEl) footerEl.classList.remove('hidden');
    }

    if (window.lucide) lucide.createIcons();
  }

  const savedRole = localStorage.getItem(CONFIG.STORAGE_KEYS.ROLE);
  if (!savedRole) {
    if (roleModal) roleModal.classList.remove('hidden');
  } else {
    setAppRole(savedRole);
  }

  if (btnRoleClient) {
    btnRoleClient.addEventListener('click', () => {
      setAppRole('client');
      if (roleModal) roleModal.classList.add('hidden');
    });
  }

  if (btnRoleLawyer) {
    btnRoleLawyer.addEventListener('click', () => {
      setAppRole('lawyer');
      if (roleModal) roleModal.classList.add('hidden');
    });
  }

  if (btnToggleRole) {
    btnToggleRole.addEventListener('click', () => {
      const nextRole = state.currentRole === 'client' ? 'lawyer' : 'client';
      setAppRole(nextRole);
    });
  }

  if (selectModalRole) {
    selectModalRole.addEventListener('change', (e) => {
      setAppRole(e.target.value);
    });
  }

  function updateLawyersList() {
    const list = getLawyersWithDistance(
      MapController.userLocation.lat,
      MapController.userLocation.lng,
      state.selectedSpecialty
    );
    state.currentLawyers = list;

    MapController.renderLawyerMarkers(list, (lawyer) => {
      showAssignedLawyerModal(lawyer);
    });

    const specBanner = document.getElementById('selected-spec-banner');
    const specName = document.getElementById('selected-spec-name');
    const countBadge = document.getElementById('lawyers-found-count');

    if (specBanner && specName && countBadge) {
      specBanner.classList.remove('hidden');
      specName.textContent = state.selectedSpecialty || "Todas las especialidades";
      countBadge.textContent = `${list.length} Abogados activos en Cali`;
    }
  }

  setTimeout(() => {
    updateLawyersList();
  }, 500);

  // 2. Cuestionario de Triaje de Entrada (Step-by-Step)
  const triageStepBadge = document.getElementById('triage-step-badge');
  const triageStepTitle = document.getElementById('triage-step-title');
  const btnRestartTriage = document.getElementById('btn-restart-triage');

  const step1 = document.getElementById('triage-step-1');
  const step2 = document.getElementById('triage-step-2');
  const step3 = document.getElementById('triage-step-3');
  const step4 = document.getElementById('triage-step-4');
  const step5 = document.getElementById('triage-step-5');

  function showTriageStep(stepNum, titleText) {
    state.triageStep = stepNum;
    if (triageStepBadge) triageStepBadge.textContent = stepNum;
    if (triageStepTitle) triageStepTitle.textContent = titleText;
    if (btnRestartTriage) btnRestartTriage.classList.remove('hidden');

    [step1, step2, step3, step4, step5].forEach((el, idx) => {
      if (el) {
        if (idx + 1 === stepNum) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });
  }

  if (btnRestartTriage) {
    btnRestartTriage.addEventListener('click', () => {
      state.selectedSpecialty = null;
      state.hasInjuries = false;
      const banner123 = document.getElementById('banner-123-emergency');
      if (banner123) banner123.classList.add('hidden');
      showTriageStep(1, "Clasificación de Urgencia");
      updateLawyersList();
    });
  }

  // Paso 1 Actions
  const btnTriageUrgency = document.getElementById('btn-triage-urgency');
  const btnTriagePreventive = document.getElementById('btn-triage-preventive');

  if (btnTriageUrgency) {
    btnTriageUrgency.addEventListener('click', () => {
      state.isUrgency = true;
      showTriageStep(2, "Filtro de Seguridad y Salud");
    });
  }

  if (btnTriagePreventive) {
    btnTriagePreventive.addEventListener('click', () => {
      state.isUrgency = false;
      showTriageStep(3, "Especialidades de Consulta");
    });
  }

  // Paso 2 Actions (Injury check)
  const btnInjuryYes = document.getElementById('btn-injury-yes');
  const btnInjuryNo = document.getElementById('btn-injury-no');
  const banner123 = document.getElementById('banner-123-emergency');
  const btnContinueLegal123 = document.getElementById('btn-continue-legal-123');

  if (btnInjuryYes) {
    btnInjuryYes.addEventListener('click', () => {
      state.hasInjuries = true;
      if (banner123) banner123.classList.remove('hidden');
    });
  }

  if (btnInjuryNo) {
    btnInjuryNo.addEventListener('click', () => {
      state.hasInjuries = false;
      if (banner123) banner123.classList.add('hidden');
      showTriageStep(3, "Situación Crítica de Emergencia");
    });
  }

  if (btnContinueLegal123) {
    btnContinueLegal123.addEventListener('click', () => {
      showTriageStep(3, "Situación Crítica de Emergencia");
    });
  }

  // Paso 3 Render & Selection (5 Especialidades Reales sin narcotráfico)
  const specialtiesGridContainer = document.getElementById('specialties-grid-container');

  function renderSpecialtiesGrid() {
    if (!specialtiesGridContainer) return;
    specialtiesGridContainer.innerHTML = '';

    CATALOG.EMERGENCY_SPECIALTIES.forEach(spec => {
      const btn = document.createElement('button');
      btn.className = "btn-spec-card flex items-center space-x-2.5 p-2.5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left transition active:scale-98";
      btn.setAttribute('data-id', spec.id);

      btn.innerHTML = `
        <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
          <i data-lucide="${spec.icon}" class="w-4 h-4"></i>
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-xs font-bold text-white truncate">${spec.name}</div>
          <div class="text-[10px] text-slate-400 truncate">${spec.desc}</div>
        </div>
      `;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-spec-card').forEach(b => b.classList.remove('ring-2', 'ring-emerald-400', 'bg-slate-800'));
        btn.classList.add('ring-2', 'ring-emerald-400', 'bg-slate-800');

        state.selectedSpecialty = spec.id;
        updateLawyersList();
        showTriageStep(4, "Rol del Solicitante");
      });

      specialtiesGridContainer.appendChild(btn);
    });

    if (window.lucide) lucide.createIcons();
  }

  renderSpecialtiesGrid();

  // Paso 4 Actions (Víctima vs Acusado)
  const btnRoleVictima = document.getElementById('btn-role-victima');
  const btnRoleAcusado = document.getElementById('btn-role-acusado');

  if (btnRoleVictima && btnRoleAcusado) {
    btnRoleVictima.addEventListener('click', () => {
      state.userRole = 'Víctima';
      btnRoleVictima.className = "py-2.5 px-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs border border-emerald-400 flex items-center justify-center space-x-2 transition active:scale-95 shadow";
      btnRoleAcusado.className = "py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 flex items-center justify-center space-x-2 transition active:scale-95";
      showTriageStep(5, "Descripción de los Hechos");
    });

    btnRoleAcusado.addEventListener('click', () => {
      state.userRole = 'Acusado';
      btnRoleAcusado.className = "py-2.5 px-3 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs border border-emerald-400 flex items-center justify-center space-x-2 transition active:scale-95 shadow";
      btnRoleVictima.className = "py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 flex items-center justify-center space-x-2 transition active:scale-95";
      showTriageStep(5, "Descripción de los Hechos");
    });
  }

  // Paso 5 Actions (Texto vs Audio + Gemini AI)
  const btnModeText = document.getElementById('btn-mode-text');
  const btnModeAudio = document.getElementById('btn-mode-audio');
  const textInputContainer = document.getElementById('text-input-container');
  const audioInputContainer = document.getElementById('audio-input-container');

  if (btnModeText && btnModeAudio) {
    btnModeText.addEventListener('click', () => {
      state.inputMode = 'text';
      btnModeText.className = "px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold transition";
      btnModeAudio.className = "px-2.5 py-1 rounded-lg text-slate-400 font-medium hover:text-white transition";
      if (textInputContainer) textInputContainer.classList.remove('hidden');
      if (audioInputContainer) audioInputContainer.classList.add('hidden');
    });

    btnModeAudio.addEventListener('click', () => {
      state.inputMode = 'audio';
      btnModeAudio.className = "px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold transition";
      btnModeText.className = "px-2.5 py-1 rounded-lg text-slate-400 font-medium hover:text-white transition";
      if (textInputContainer) textInputContainer.classList.add('hidden');
      if (audioInputContainer) audioInputContainer.classList.remove('hidden');
    });
  }

  const btnRecordAudio = document.getElementById('btn-record-audio');
  const recordIcon = document.getElementById('record-icon');
  const recordText = document.getElementById('record-text');
  const timerEl = document.getElementById('recording-timer');
  const btnPlayAudio = document.getElementById('btn-play-audio');
  const btnClearAudio = document.getElementById('btn-clear-audio');

  const aiFeedbackEl = document.getElementById('ai-analysis-feedback');
  const aiFeedbackText = document.getElementById('ai-analysis-text');

  let isRecording = false;

  if (btnRecordAudio) {
    btnRecordAudio.addEventListener('click', async () => {
      if (!isRecording) {
        isRecording = true;
        if (recordIcon) recordIcon.className = "w-3.5 h-3.5 text-white animate-pulse";
        if (recordText) recordText.textContent = "Detener grabación...";
        btnRecordAudio.classList.replace('bg-slate-800', 'bg-red-600');
        if (timerEl) timerEl.classList.remove('hidden');

        AudioRecorder.startRecording(
          (timerStr) => { if (timerEl) timerEl.textContent = timerStr; },
          async (recordedBlob, base64Audio) => {
            isRecording = false;
            if (recordIcon) recordIcon.className = "w-3.5 h-3.5 text-red-500";
            if (recordText) recordText.textContent = "Nota grabada";
            btnRecordAudio.classList.replace('bg-red-600', 'bg-slate-800');
            if (btnPlayAudio) btnPlayAudio.classList.remove('hidden');
            if (btnClearAudio) btnClearAudio.classList.remove('hidden');

            if (aiFeedbackEl) aiFeedbackEl.classList.remove('hidden');
            if (aiFeedbackText) aiFeedbackText.textContent = "Analizando nota de voz con IA Gemini...";

            const analysis = await GoogleApiTest.analyzeCaseAudioOrText({ audioBase64: base64Audio });

            if (analysis.success && aiFeedbackText) {
              aiFeedbackText.innerHTML = `
                <strong>IA Gemini (${analysis.isSimulation ? 'Modo Test' : 'Real'}):</strong>
                Rol: <span class="font-bold text-white">${state.userRole}</span> • Especialidad: <span class="underline font-bold">${analysis.specialty}</span>.<br>
                ${analysis.summary}
              `;
              state.selectedSpecialty = analysis.specialty;
              updateLawyersList();
            }
          },
          (err) => {
            alert(err);
            isRecording = false;
          }
        );
      } else {
        AudioRecorder.stopRecording();
      }
    });
  }

  const btnAnalyzeTextAi = document.getElementById('btn-analyze-text-ai');
  const userTextPrompt = document.getElementById('user-text-prompt');

  if (btnAnalyzeTextAi) {
    btnAnalyzeTextAi.addEventListener('click', async () => {
      const promptText = userTextPrompt ? userTextPrompt.value.trim() : '';
      if (!promptText) {
        alert("Por favor escribe una breve descripción de lo sucedido.");
        return;
      }

      if (aiFeedbackEl) aiFeedbackEl.classList.remove('hidden');
      if (aiFeedbackText) aiFeedbackText.textContent = `Analizando consulta como ${state.userRole} con IA Gemini...`;

      const analysis = await GoogleApiTest.analyzeCaseAudioOrText({
        textPrompt: `[Rol: ${state.userRole}] ${promptText}`
      });

      if (analysis.success && aiFeedbackText) {
        aiFeedbackText.innerHTML = `
          <strong>IA Gemini (${analysis.isSimulation ? 'Modo Test' : 'Real'}):</strong>
          Rol: <span class="font-bold text-white">${state.userRole}</span> • Especialidad: <span class="underline font-bold">${analysis.specialty}</span>.<br>
          ${analysis.summary}
        `;
        state.selectedSpecialty = analysis.specialty;
        updateLawyersList();
      }
    });
  }


  // 3. Botón de Acción Estilo Uber Driver & Modal de Coincidencia
  const btnMainSearch = document.getElementById('btn-main-search');
  const btnRadarWave = document.getElementById('btn-radar-wave');
  const lawyerMatchModal = document.getElementById('lawyer-match-modal');
  const btnCloseMatch = document.getElementById('btn-close-match');
  const btnNewSearch = document.getElementById('btn-new-search');
  const btnOmitMainLawyer = document.getElementById('btn-omit-main-lawyer');
  const secondaryLawyersContainer = document.getElementById('secondary-lawyers-container');
  const secondaryLawyersCount = document.getElementById('secondary-lawyers-count');

  function getAvailableLawyers() {
    return state.currentLawyers.filter(l => !state.omittedLawyerIds.has(l.id));
  }

  function triggerSearchFlow() {
    if (btnRadarWave) btnRadarWave.classList.remove('hidden');

    MapController.triggerRadarAnimation(2500, () => {
      if (btnRadarWave) btnRadarWave.classList.add('hidden');

      const availableLawyers = getAvailableLawyers();
      if (availableLawyers.length > 0) {
        showAssignedLawyerModal(availableLawyers[0]);
      } else {
        alert("No hay más abogados disponibles para esta categoría.");
      }
    });
  }

  if (btnMainSearch) {
    btnMainSearch.addEventListener('click', triggerSearchFlow);
  }

  if (btnNewSearch) {
    btnNewSearch.addEventListener('click', () => {
      state.omittedLawyerIds.clear();
      lawyerMatchModal.classList.add('translate-y-full');
      setTimeout(() => {
        lawyerMatchModal.classList.add('hidden');
        triggerSearchFlow();
      }, 200);
    });
  }

  function showAssignedLawyerModal(lawyer) {
    if (!lawyer) return;
    state.assignedLawyer = lawyer;

    const availableLawyers = getAvailableLawyers();
    const secondaryLawyers = availableLawyers.filter(l => l.id !== lawyer.id).slice(0, 2);

    // Actualizar campos del abogado principal
    document.getElementById('match-lawyer-avatar').src = lawyer.avatar;
    document.getElementById('match-lawyer-name').textContent = lawyer.name;
    document.getElementById('match-lawyer-spec').textContent = `Especialista en ${lawyer.specialty}`;
    document.getElementById('match-lawyer-rating').textContent = lawyer.rating;

    // BADGE DE TARJETA PROFESIONAL VISIBLE
    document.getElementById('match-lawyer-tp').textContent = lawyer.tp;
    document.getElementById('match-lawyer-university').textContent = lawyer.university || "Univ. del Valle";
    document.getElementById('match-lawyer-neighborhood').textContent = lawyer.neighborhood;

    document.getElementById('match-lawyer-response-times').textContent =
      `Estimado ${lawyer.estimatedResponseMin} min • Máx ${lawyer.maxResponseMin} min`;

    document.getElementById('match-lawyer-distance').textContent = `${lawyer.distanceKm} km`;
    document.getElementById('match-lawyer-time').textContent = `${lawyer.etaMinutes} min`;
    document.getElementById('match-lawyer-price').textContent = `$${lawyer.priceCOP.toLocaleString('es-CO')}`;

    document.getElementById('btn-video-price').textContent = lawyer.priceCOP.toLocaleString('es-CO');
    document.getElementById('btn-dispatch-price').textContent = lawyer.travelPriceCOP.toLocaleString('es-CO');

    renderSecondaryLawyers(secondaryLawyers);

    lawyerMatchModal.classList.remove('hidden', 'translate-y-full');
    lawyerMatchModal.classList.add('translate-y-0');

    if (window.lucide) lucide.createIcons();
  }

  function renderSecondaryLawyers(lawyers) {
    if (!secondaryLawyersContainer) return;
    secondaryLawyersContainer.innerHTML = '';
    if (secondaryLawyersCount) secondaryLawyersCount.textContent = `${lawyers.length} más`;

    if (lawyers.length === 0) {
      secondaryLawyersContainer.innerHTML = `
        <div class="p-3 bg-slate-950/60 rounded-xl text-center text-xs text-slate-400 border border-slate-800">
          No hay más alternativas cercanas disponibles en esta categoría.
        </div>
      `;
      return;
    }

    lawyers.forEach((l, index) => {
      const card = document.createElement('div');
      card.className = "bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 transition flex items-center justify-between cursor-pointer group";

      card.innerHTML = `
        <div class="flex items-center space-x-3 min-w-0 btn-select-secondary" data-id="${l.id}">
          <img class="w-11 h-11 rounded-xl object-cover border border-slate-700 group-hover:border-emerald-400 transition shrink-0" src="${l.avatar}" alt="${l.name}">
          <div class="min-w-0">
            <div class="flex items-center space-x-1.5">
              <span class="text-[9px] font-bold px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">Opción ${index + 2}</span>
              <h5 class="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition">${l.name}</h5>
            </div>
            <div class="text-[10px] text-emerald-300 font-semibold truncate mt-0.5 flex items-center gap-1">
              <i data-lucide="badge-check" class="w-3 h-3 text-emerald-400"></i>
              <span>${l.tpNumber || l.tp}</span>
            </div>
            <div class="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span class="text-emerald-400 font-semibold">${l.specialty}</span>
              <span>•</span>
              <span class="flex items-center gap-0.5"><i data-lucide="star" class="w-2.5 h-2.5 fill-amber-400 text-amber-400"></i> ${l.rating}</span>
              <span>•</span>
              <span>${l.distanceKm} km</span>
            </div>
          </div>
        </div>
        <button class="btn-omit-secondary text-xs text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition shrink-0" data-id="${l.id}">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      `;

      secondaryLawyersContainer.appendChild(card);
    });

    secondaryLawyersContainer.querySelectorAll('.btn-select-secondary').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const selected = state.currentLawyers.find(l => l.id === id);
        if (selected) showAssignedLawyerModal(selected);
      });
    });

    secondaryLawyersContainer.querySelectorAll('.btn-omit-secondary').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        state.omittedLawyerIds.add(id);
        const available = getAvailableLawyers();
        if (available.length > 0) {
          showAssignedLawyerModal(state.assignedLawyer);
        } else {
          alert("Has omitido todos los abogados disponibles.");
          lawyerMatchModal.classList.add('translate-y-full');
          setTimeout(() => lawyerMatchModal.classList.add('hidden'), 300);
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  if (btnOmitMainLawyer) {
    btnOmitMainLawyer.addEventListener('click', () => {
      if (state.assignedLawyer) {
        state.omittedLawyerIds.add(state.assignedLawyer.id);
        const available = getAvailableLawyers();
        if (available.length > 0) {
          showAssignedLawyerModal(available[0]);
        } else {
          alert("Has omitido todos los abogados disponibles.");
          lawyerMatchModal.classList.add('translate-y-full');
          setTimeout(() => lawyerMatchModal.classList.add('hidden'), 300);
        }
      }
    });
  }

  if (btnCloseMatch) {
    btnCloseMatch.addEventListener('click', () => {
      lawyerMatchModal.classList.add('translate-y-full');
      setTimeout(() => lawyerMatchModal.classList.add('hidden'), 300);
    });
  }


  // 4. Modales de Rutas Jurídicas y Consultorio (Herencia Claude)
  const btnOpenRoutesModal = document.getElementById('btn-open-routes-modal');
  const btnCloseRoutesModal = document.getElementById('btn-close-routes-modal');
  const routesModal = document.getElementById('routes-modal');
  const routesModalContent = document.getElementById('routes-modal-content');

  function renderLegalRoutes() {
    if (!routesModalContent) return;
    routesModalContent.innerHTML = '';

    CATALOG.LEGAL_ROUTES.forEach(route => {
      const card = document.createElement('div');
      card.className = "bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3";

      const stepsHtml = route.steps.map((s, idx) => `
        <li class="flex items-start space-x-2 text-xs text-slate-300">
          <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">${idx + 1}</span>
          <span>${s}</span>
        </li>
      `).join('');

      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center space-x-2">
            <i data-lucide="${route.icon}" class="w-4 h-4 text-emerald-400"></i>
            <h4 class="text-xs sm:text-sm font-bold text-white">${route.title}</h4>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ${route.badge}
          </span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">${route.summary}</p>
        <ul class="space-y-2 pt-1 border-t border-slate-800/80">
          ${stepsHtml}
        </ul>
      `;

      routesModalContent.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  if (btnOpenRoutesModal) {
    btnOpenRoutesModal.addEventListener('click', () => {
      renderLegalRoutes();
      if (routesModal) routesModal.classList.remove('hidden');
    });
  }

  if (btnCloseRoutesModal) {
    btnCloseRoutesModal.addEventListener('click', () => {
      if (routesModal) routesModal.classList.add('hidden');
    });
  }

  // Módulo Consultorio
  const btnOpenConsultorioModal = document.getElementById('btn-open-consultorio-modal');
  const btnCloseConsultorioModal = document.getElementById('btn-close-consultorio-modal');
  const consultorioModal = document.getElementById('consultorio-modal');
  const consultorioPackagesContainer = document.getElementById('consultorio-packages-container');

  function renderConsultorioPackages() {
    if (!consultorioPackagesContainer) return;
    consultorioPackagesContainer.innerHTML = '';

    CATALOG.CONSULTORIO_PACKAGES.forEach(pkg => {
      const card = document.createElement('div');
      card.className = "bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-emerald-500/50 transition";

      const feats = pkg.features.map(f => `
        <li class="flex items-center space-x-2 text-xs text-slate-300">
          <i data-lucide="check-circle2" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>
          <span>${f}</span>
        </li>
      `).join('');

      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 class="text-sm font-extrabold text-white">${pkg.name}</h4>
          <span class="text-sm font-extrabold text-emerald-400">$${pkg.priceCOP.toLocaleString('es-CO')} COP</span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">${pkg.desc}</p>
        <ul class="space-y-1.5 pt-1">
          ${feats}
        </ul>
        <button class="btn-subscribe-consultorio w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl transition active:scale-95" data-id="${pkg.id}">
          SOLICITAR PLAN CONSULTORIO (${pkg.durationDays} DÍAS)
        </button>
      `;

      consultorioPackagesContainer.appendChild(card);
    });

    consultorioPackagesContainer.querySelectorAll('.btn-subscribe-consultorio').forEach(btn => {
      btn.addEventListener('click', () => {
        alert("¡Acompañamiento de Consultorio seleccionado! Se ha iniciado la asignación de tu equipo jurídico en Cali.");
        if (consultorioModal) consultorioModal.classList.add('hidden');
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  if (btnOpenConsultorioModal) {
    btnOpenConsultorioModal.addEventListener('click', () => {
      renderConsultorioPackages();
      if (consultorioModal) consultorioModal.classList.remove('hidden');
    });
  }

  if (btnCloseConsultorioModal) {
    btnCloseConsultorioModal.addEventListener('click', () => {
      if (consultorioModal) consultorioModal.classList.add('hidden');
    });
  }


  // 5. Ficha Técnica / Perfil de Abogado
  const btnOpenBriefcase = document.getElementById('btn-open-briefcase');
  const btnTriggerLawyerProfileAvatar = document.getElementById('btn-trigger-lawyer-profile-avatar');
  const lawyerProfileModal = document.getElementById('lawyer-profile-modal');
  const btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
  const btnCloseProfileOk = document.getElementById('btn-close-profile-ok');

  function openLawyerProfileModal() {
    const l = state.assignedLawyer;
    if (!l) return;

    document.getElementById('profile-modal-avatar').src = l.avatar;
    document.getElementById('profile-modal-name').textContent = l.name;
    document.getElementById('profile-modal-spec').textContent = `Especialista en ${l.specialty}`;
    document.getElementById('profile-modal-tp-badge').textContent = l.tp;
    document.getElementById('profile-modal-univ').textContent = l.university || "Universidad del Valle";
    document.getElementById('profile-modal-bio').textContent = l.bio || l.description;
    document.getElementById('profile-modal-cases').textContent = l.casesWon || "250+ Casos Exitosos";

    lawyerProfileModal.classList.remove('hidden');
  }

  if (btnOpenBriefcase) btnOpenBriefcase.addEventListener('click', openLawyerProfileModal);
  if (btnTriggerLawyerProfileAvatar) btnTriggerLawyerProfileAvatar.addEventListener('click', openLawyerProfileModal);

  function closeLawyerProfileModal() {
    lawyerProfileModal.classList.add('hidden');
  }

  if (btnCloseProfileModal) btnCloseProfileModal.addEventListener('click', closeLawyerProfileModal);
  if (btnCloseProfileOk) btnCloseProfileOk.addEventListener('click', closeLawyerProfileModal);


  // 6. Pasarela de Pago Apple Pay Simulado & Dispatches
  const applePayModal = document.getElementById('apple-pay-modal');
  const btnCloseApplePayModal = document.getElementById('btn-close-apple-pay-modal');
  const applePayServiceTitle = document.getElementById('apple-pay-service-title');
  const applePayModalAmount = document.getElementById('apple-pay-modal-amount');
  const btnTriggerApplepayBiometric = document.getElementById('btn-trigger-applepay-biometric');
  const applepayModalBtnText = document.getElementById('applepay-modal-btn-text');
  const applepayModalStatusMsg = document.getElementById('applepay-modal-status-msg');

  const btnStartVideocallCheckout = document.getElementById('btn-start-videocall-checkout');
  const btnOpenDispatchModal = document.getElementById('btn-open-dispatch-modal');
  const dispatchModal = document.getElementById('dispatch-modal');
  const btnCloseDispatch = document.getElementById('btn-close-dispatch');
  const btnProceedDispatchApplepay = document.getElementById('btn-proceed-dispatch-applepay');

  if (btnStartVideocallCheckout) {
    btnStartVideocallCheckout.addEventListener('click', () => {
      if (!state.assignedLawyer) return;
      state.pendingPaymentType = 'videocall';
      applePayServiceTitle.textContent = "Asesoría por Videollamada Cifrada P2P";
      applePayModalAmount.textContent = `$${state.assignedLawyer.priceCOP.toLocaleString('es-CO')} COP`;
      applepayModalStatusMsg.classList.add('hidden');
      applepayModalBtnText.textContent = "DOBLE CLIC / TOUCH ID PARA PAGAR";
      applePayModal.classList.remove('hidden');
    });
  }

  if (btnOpenDispatchModal) {
    btnOpenDispatchModal.addEventListener('click', () => {
      dispatchModal.classList.remove('hidden');
    });
  }

  if (btnCloseDispatch) {
    btnCloseDispatch.addEventListener('click', () => {
      dispatchModal.classList.add('hidden');
    });
  }

  if (btnProceedDispatchApplepay) {
    btnProceedDispatchApplepay.addEventListener('click', () => {
      dispatchModal.classList.add('hidden');
      state.pendingPaymentType = 'dispatch';
      applePayServiceTitle.textContent = "Desplazamiento Presencial de Abogado";
      applePayModalAmount.textContent = `$${state.assignedLawyer.travelPriceCOP.toLocaleString('es-CO')} COP`;
      applepayModalStatusMsg.classList.add('hidden');
      applepayModalBtnText.textContent = "DOBLE CLIC / TOUCH ID PARA PAGAR";
      applePayModal.classList.remove('hidden');
    });
  }

  if (btnCloseApplePayModal) {
    btnCloseApplePayModal.addEventListener('click', () => {
      applePayModal.classList.add('hidden');
    });
  }

  if (btnTriggerApplepayBiometric) {
    btnTriggerApplepayBiometric.addEventListener('click', () => {
      applepayModalBtnText.textContent = "Procesando biometría con Face ID...";
      btnTriggerApplepayBiometric.disabled = true;

      setTimeout(() => {
        applepayModalBtnText.textContent = "PAGO APROBADO CON APPLE PAY";
        btnTriggerApplepayBiometric.disabled = false;
        applepayModalStatusMsg.classList.remove('hidden');

        const newOrder = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          originalLawyer: state.assignedLawyer,
          currentLawyer: state.assignedLawyer,
          serviceType: state.pendingPaymentType === 'videocall' ? 'Videollamada Express' : 'Desplazamiento Presencial',
          amountCOP: state.pendingPaymentType === 'videocall' ? state.assignedLawyer.priceCOP : state.assignedLawyer.travelPriceCOP,
          status: 'Reasignado por Rechazo',
          isReassigned: true,
          reassignedLawyer: getAvailableLawyers().find(l => l.id !== state.assignedLawyer.id) || state.currentLawyers[1]
        };

        state.activeOrders.unshift(newOrder);
        updateOrdersBadge();

        setTimeout(() => {
          applePayModal.classList.add('hidden');

          if (state.pendingPaymentType === 'videocall') {
            VideoCall.startCall(state.assignedLawyer, () => {
              console.log("Videollamada terminada.");
            });
          } else if (state.pendingPaymentType === 'dispatch') {
            alert("¡Pago aprobado! El abogado ha sido notificado y está en camino a tu dirección en Cali.");
          }
        }, 1200);

      }, 1600);
    });
  }


  // 7. Panel de Mis Órdenes
  const btnOpenOrdersModal = document.getElementById('btn-open-orders-modal');
  const btnCloseOrdersModal = document.getElementById('btn-close-orders-modal');
  const ordersModal = document.getElementById('orders-modal');
  const ordersModalContent = document.getElementById('orders-modal-content');
  const ordersBadge = document.getElementById('orders-badge');

  function updateOrdersBadge() {
    if (!ordersBadge) return;
    if (state.activeOrders.length > 0) {
      ordersBadge.textContent = state.activeOrders.length;
      ordersBadge.classList.remove('hidden');
    } else {
      ordersBadge.classList.add('hidden');
    }
  }

  function renderOrdersList() {
    if (!ordersModalContent) return;
    ordersModalContent.innerHTML = '';

    if (state.activeOrders.length === 0) {
      ordersModalContent.innerHTML = `
        <div class="p-6 text-center text-slate-400 space-y-2 bg-slate-950/60 rounded-2xl border border-slate-800">
          <i data-lucide="shopping-bag" class="w-8 h-8 text-slate-600 mx-auto"></i>
          <p class="text-xs">No tienes órdenes o servicios activos en este momento.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    state.activeOrders.forEach((order, idx) => {
      const card = document.createElement('div');
      card.className = "bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3";

      if (order.isReassigned && order.status === 'Reasignado por Rechazo') {
        card.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-mono text-slate-400">${order.id} • ${order.serviceType}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Reasignado
            </span>
          </div>

          <div class="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs space-y-1 text-amber-200">
            <div class="font-bold flex items-center gap-1 text-amber-400">
              <i data-lucide="alert-circle" class="w-3.5 h-3.5"></i>
              <span>El abogado original (${order.originalLawyer.name}) no pudo aceptar la solicitud.</span>
            </div>
            <p>Se ha asignado automáticamente al especialista más calificado en Cali:</p>
          </div>

          <div class="flex items-center space-x-3 p-2 bg-black/60 rounded-xl border border-slate-800">
            <img class="w-12 h-12 rounded-xl object-cover border border-emerald-400" src="${order.reassignedLawyer.avatar}" alt="Nuevo Abogado">
            <div class="flex-1 min-w-0">
              <h5 class="text-xs font-bold text-white truncate">${order.reassignedLawyer.name}</h5>
              <p class="text-[11px] text-emerald-400 font-semibold">${order.reassignedLawyer.specialty}</p>
              <div class="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                <i data-lucide="badge-check" class="w-3 h-3 text-emerald-400"></i>
                <span>${order.reassignedLawyer.tp}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <button class="btn-cancel-order py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs rounded-xl border border-red-500/40 transition active:scale-95" data-index="${idx}">
              Cancelar Servicio
            </button>
            <button class="btn-accept-order py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl transition active:scale-95" data-index="${idx}">
              Aceptar Cambio
            </button>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-mono text-slate-400">${order.id} • ${order.serviceType}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ${order.status}
            </span>
          </div>

          <div class="flex items-center space-x-3 p-2 bg-black/60 rounded-xl border border-slate-800">
            <img class="w-12 h-12 rounded-xl object-cover border border-emerald-400" src="${order.currentLawyer.avatar}" alt="Abogado">
            <div class="flex-1 min-w-0">
              <h5 class="text-xs font-bold text-white truncate">${order.currentLawyer.name}</h5>
              <p class="text-[11px] text-emerald-400 font-semibold">${order.currentLawyer.specialty}</p>
              <div class="text-[10px] text-slate-400">$${order.amountCOP.toLocaleString('es-CO')} COP</div>
            </div>
          </div>
        `;
      }

      ordersModalContent.appendChild(card);
    });

    ordersModalContent.querySelectorAll('.btn-accept-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const order = state.activeOrders[idx];
        order.currentLawyer = order.reassignedLawyer;
        order.status = 'Confirmado y En Curso';
        order.isReassigned = false;
        renderOrdersList();
      });
    });

    ordersModalContent.querySelectorAll('.btn-cancel-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        state.activeOrders.splice(idx, 1);
        updateOrdersBadge();
        renderOrdersList();
        alert("El servicio ha sido cancelado con éxito y el reembolso fue procesado.");
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  if (btnOpenOrdersModal) {
    btnOpenOrdersModal.addEventListener('click', () => {
      renderOrdersList();
      ordersModal.classList.remove('hidden');
    });
  }

  if (btnCloseOrdersModal) {
    btnCloseOrdersModal.addEventListener('click', () => {
      ordersModal.classList.add('hidden');
    });
  }

  // Jitsi End Call
  const btnEndVideocall = document.getElementById('btn-end-videocall');
  if (btnEndVideocall) {
    btnEndVideocall.addEventListener('click', () => {
      VideoCall.endCall();
    });
  }

  // 8. Modal Configuración Google Gemini API Key
  const btnOpenApiModal = document.getElementById('btn-open-api-modal');
  const btnCloseApiModal = document.getElementById('btn-close-api-modal');
  const apiModal = document.getElementById('api-modal');
  const inputApiKey = document.getElementById('input-api-key');
  const selectGeminiModel = document.getElementById('select-gemini-model');
  const btnSaveApiKey = document.getElementById('btn-save-api-key');
  const btnTestApi = document.getElementById('btn-test-api');
  const apiTestResult = document.getElementById('api-test-result');

  if (btnOpenApiModal) {
    btnOpenApiModal.addEventListener('click', () => {
      if (inputApiKey) inputApiKey.value = GoogleApiTest.getApiKey();
      if (selectGeminiModel) selectGeminiModel.value = GoogleApiTest.getModel();
      if (apiTestResult) apiTestResult.classList.add('hidden');
      if (apiModal) apiModal.classList.remove('hidden');
    });
  }

  if (btnCloseApiModal) {
    btnCloseApiModal.addEventListener('click', () => {
      if (apiModal) apiModal.classList.add('hidden');
    });
  }

  if (btnSaveApiKey) {
    btnSaveApiKey.addEventListener('click', () => {
      GoogleApiTest.setApiKey(inputApiKey.value);
      GoogleApiTest.setModel(selectGeminiModel.value);
      if (apiModal) apiModal.classList.add('hidden');
    });
  }

  if (btnTestApi) {
    btnTestApi.addEventListener('click', async () => {
      if (apiTestResult) {
        apiTestResult.classList.remove('hidden');
        apiTestResult.className = "text-xs p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300";
        apiTestResult.textContent = "Probando conexión con Google Gemini API...";
      }

      const tempKey = inputApiKey ? inputApiKey.value.trim() : '';
      if (!tempKey) {
        if (apiTestResult) apiTestResult.textContent = "Modo Test / Simulación activo (Sin clave). Todo funcionará con clasificación simulada.";
        return;
      }

      GoogleApiTest.setApiKey(tempKey);
      GoogleApiTest.setModel(selectGeminiModel ? selectGeminiModel.value : 'gemini-2.5-flash');

      const res = await GoogleApiTest.analyzeCaseAudioOrText({
        textPrompt: "Prueba de conexión API para urgencia legal en Cali Colombia"
      });

      if (res.success && apiTestResult) {
        apiTestResult.className = "text-xs p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300";
        apiTestResult.textContent = `¡Conexión Exitosa con Google Gemini! Clasificación detectada: ${res.specialty}.`;
      } else if (apiTestResult) {
        apiTestResult.className = "text-xs p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300";
        apiTestResult.textContent = `Error de conexión: ${res.error}`;
      }
    });
  }

});
