/**
 * Control Principal de la Aplicación findmylawyerBETA
 * Orquesta la interfaz de usuario, eventos, filtros, Apple Pay simulado, ficha técnica y despacho presencial.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado global de la app
  const state = {
    selectedSpecialty: null,
    isEmergency: true,
    assignedLawyer: null,
    currentLawyers: [],
    omittedLawyerIds: new Set(),
    pendingPaymentType: null // 'videocall' o 'dispatch'
  };

  // Inicialización de Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 1. Inicializar Mapa
  MapController.initMap();

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

    if (state.selectedSpecialty) {
      specBanner.classList.remove('hidden');
      specName.textContent = state.selectedSpecialty;
      countBadge.textContent = `${list.length} Abogados activos`;
    } else {
      specBanner.classList.remove('hidden');
      specName.textContent = "Todos los especialistas";
      countBadge.textContent = `${list.length} Abogados activos en Cali`;
    }
  }

  setTimeout(() => {
    updateLawyersList();
  }, 500);


  // 2. Manejo de Cuestionario Flotante Superior
  const stepEmergencyQuestion = document.getElementById('step-emergency-question');
  const stepEmergencyCategories = document.getElementById('step-emergency-categories');
  const stepNonEmergencyForm = document.getElementById('step-non-emergency-form');

  const btnEmergencyYes = document.getElementById('btn-emergency-yes');
  const btnEmergencyNo = document.getElementById('btn-emergency-no');
  const btnResetEmergency = document.getElementById('btn-reset-emergency');
  const btnResetNonEmergency = document.getElementById('btn-reset-non-emergency');

  btnEmergencyYes.addEventListener('click', () => {
    state.isEmergency = true;
    stepEmergencyQuestion.classList.add('hidden');
    stepEmergencyCategories.classList.remove('hidden');
    stepNonEmergencyForm.classList.add('hidden');
  });

  btnEmergencyNo.addEventListener('click', () => {
    state.isEmergency = false;
    stepEmergencyQuestion.classList.add('hidden');
    stepEmergencyCategories.classList.add('hidden');
    stepNonEmergencyForm.classList.remove('hidden');

    const areaSelect = document.getElementById('non-emergency-area');
    state.selectedSpecialty = areaSelect.value;
    updateLawyersList();
  });

  btnResetEmergency.addEventListener('click', () => {
    state.selectedSpecialty = null;
    stepEmergencyCategories.classList.add('hidden');
    stepEmergencyQuestion.classList.remove('hidden');
    updateLawyersList();
  });

  btnResetNonEmergency.addEventListener('click', () => {
    state.selectedSpecialty = null;
    stepNonEmergencyForm.classList.add('hidden');
    stepEmergencyQuestion.classList.remove('hidden');
    updateLawyersList();
  });

  const specPills = document.querySelectorAll('.btn-spec-pill');
  specPills.forEach(pill => {
    pill.addEventListener('click', () => {
      specPills.forEach(p => p.classList.remove('ring-2', 'ring-uber-green', 'bg-zinc-800'));
      pill.classList.add('ring-2', 'ring-uber-green', 'bg-zinc-800');

      const specialty = pill.getAttribute('data-specialty');
      state.selectedSpecialty = specialty;
      updateLawyersList();
    });
  });

  const selectNonEmergencyArea = document.getElementById('non-emergency-area');
  selectNonEmergencyArea.addEventListener('change', (e) => {
    state.selectedSpecialty = e.target.value;
    updateLawyersList();
  });


  // 3. Audio Recorder e IA Gemini
  const btnRecordAudio = document.getElementById('btn-record-audio');
  const recordIcon = document.getElementById('record-icon');
  const recordText = document.getElementById('record-text');
  const timerEl = document.getElementById('recording-timer');
  const btnPlayAudio = document.getElementById('btn-play-audio');
  const btnClearAudio = document.getElementById('btn-clear-audio');
  const aiFeedbackEl = document.getElementById('ai-analysis-feedback');
  const aiFeedbackText = document.getElementById('ai-analysis-text');

  let isRecording = false;

  btnRecordAudio.addEventListener('click', async () => {
    if (!isRecording) {
      isRecording = true;
      recordIcon.className = "w-3.5 h-3.5 text-white animate-pulse";
      recordText.textContent = "Detener grabación...";
      btnRecordAudio.classList.replace('bg-zinc-900', 'bg-red-600');
      timerEl.classList.remove('hidden');

      AudioRecorder.startRecording(
        (timerStr) => {
          timerEl.textContent = timerStr;
        },
        async (recordedBlob, base64Audio) => {
          isRecording = false;
          recordIcon.className = "w-3.5 h-3.5 text-red-500";
          recordText.textContent = "Nota grabada ✓";
          btnRecordAudio.classList.replace('bg-red-600', 'bg-zinc-900');
          btnPlayAudio.classList.remove('hidden');
          btnClearAudio.classList.remove('hidden');

          aiFeedbackEl.classList.remove('hidden');
          aiFeedbackText.textContent = "Analizando nota de voz con IA de Google Gemini...";

          const analysis = await GoogleApiTest.analyzeCaseAudioOrText({ audioBase64: base64Audio });

          if (analysis.success) {
            aiFeedbackText.innerHTML = `
              <strong>IA Gemini (${analysis.isSimulation ? 'Modo Test' : 'Real'}):</strong>
              Categoría recomendada: <span class="underline font-bold">${analysis.specialty}</span>. ${analysis.summary}
            `;
            state.selectedSpecialty = analysis.specialty;
            updateLawyersList();
          } else {
            aiFeedbackText.textContent = `Error en IA: ${analysis.error}. Se mantiene la categoría actual.`;
          }
        },
        (err) => {
          alert(err);
          isRecording = false;
          recordIcon.className = "w-3.5 h-3.5 text-red-500";
          recordText.textContent = "Grabar nota de voz (1 min max)";
          btnRecordAudio.classList.replace('bg-red-600', 'bg-zinc-900');
        }
      );
    } else {
      AudioRecorder.stopRecording();
    }
  });

  btnPlayAudio.addEventListener('click', () => {
    AudioRecorder.playRecording();
  });

  btnClearAudio.addEventListener('click', () => {
    AudioRecorder.clearRecording();
    btnPlayAudio.classList.add('hidden');
    btnClearAudio.classList.add('hidden');
    aiFeedbackEl.classList.add('hidden');
    timerEl.classList.add('hidden');
    recordText.textContent = "Grabar nota de voz (1 min max)";
  });


  // 4. Botón Principal y Asignación de Abogado
  const btnMainSearch = document.getElementById('btn-main-search');
  const btnRadarWave = document.getElementById('btn-radar-wave');
  const lawyerMatchModal = document.getElementById('lawyer-match-modal');
  const btnCloseMatch = document.getElementById('btn-close-match');
  const btnNewSearch = document.getElementById('btn-new-search');
  const btnOmitMainLawyer = document.getElementById('btn-omit-main-lawyer');
  const secondaryLawyersContainer = document.getElementById('secondary-lawyers-container');
  const secondaryLawyersCount = document.getElementById('secondary-lawyers-count');

  function triggerSearchFlow() {
    btnRadarWave.classList.remove('hidden');

    MapController.triggerRadarAnimation(2500, () => {
      btnRadarWave.classList.add('hidden');

      const availableLawyers = getAvailableLawyers();
      if (availableLawyers.length > 0) {
        showAssignedLawyerModal(availableLawyers[0]);
      } else {
        alert("No hay más abogados disponibles para esta categoría.");
      }
    });
  }

  btnMainSearch.addEventListener('click', () => {
    triggerSearchFlow();
  });

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

  function getAvailableLawyers() {
    return state.currentLawyers.filter(l => !state.omittedLawyerIds.has(l.id));
  }

  function showAssignedLawyerModal(lawyer) {
    if (!lawyer) return;
    state.assignedLawyer = lawyer;

    const availableLawyers = getAvailableLawyers();
    const secondaryLawyers = availableLawyers.filter(l => l.id !== lawyer.id).slice(0, 2);

    // Update main lawyer UI
    document.getElementById('match-lawyer-avatar').src = lawyer.avatar;
    document.getElementById('match-lawyer-name').textContent = lawyer.name;
    document.getElementById('match-lawyer-spec').textContent = `Especialista en ${lawyer.specialty}`;
    document.getElementById('match-lawyer-rating').textContent = lawyer.rating;
    document.getElementById('match-lawyer-tp').textContent = lawyer.tp;
    document.getElementById('match-lawyer-neighborhood').textContent = lawyer.neighborhood;

    document.getElementById('match-lawyer-response-times').textContent =
      `Estimado ${lawyer.estimatedResponseMin} min • Máx ${lawyer.maxResponseMin} min`;

    document.getElementById('match-lawyer-distance').textContent = `${lawyer.distanceKm} km`;
    document.getElementById('match-lawyer-time').textContent = `${lawyer.etaMinutes} min`;
    document.getElementById('match-lawyer-price').textContent = `$${lawyer.priceCOP.toLocaleString('es-CO')}`;

    document.getElementById('btn-video-price').textContent = lawyer.priceCOP.toLocaleString('es-CO');
    document.getElementById('btn-dispatch-price').textContent = lawyer.travelPriceCOP.toLocaleString('es-CO');

    // Render secondary lawyer cards
    renderSecondaryLawyers(secondaryLawyers);

    lawyerMatchModal.classList.remove('hidden', 'translate-y-full');
    lawyerMatchModal.classList.add('translate-y-0');

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  function renderSecondaryLawyers(lawyers) {
    secondaryLawyersContainer.innerHTML = '';
    secondaryLawyersCount.textContent = `${lawyers.length} más`;

    if (lawyers.length === 0) {
      secondaryLawyersContainer.innerHTML = `
        <div class="p-3 bg-zinc-900/60 rounded-xl text-center text-xs text-zinc-400 border border-zinc-800">
          No hay más alternativas cercanas disponibles en esta categoría.
        </div>
      `;
      return;
    }

    lawyers.forEach((l, index) => {
      const card = document.createElement('div');
      card.className = "bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl p-2.5 transition flex items-center justify-between cursor-pointer group";

      card.innerHTML = `
        <div class="flex items-center space-x-3 min-w-0 select-none btn-select-secondary" data-id="${l.id}">
          <img class="w-11 h-11 rounded-xl object-cover border border-zinc-700 group-hover:border-uber-green transition shrink-0" src="${l.avatar}" alt="${l.name}">
          <div class="min-w-0">
            <div class="flex items-center space-x-1.5">
              <span class="text-[9px] font-bold px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">Opción ${index + 2}</span>
              <h5 class="text-xs font-bold text-white truncate group-hover:text-uber-green transition">${l.name}</h5>
            </div>
            <div class="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
              <span class="text-uber-green font-semibold">${l.specialty}</span>
              <span>•</span>
              <span>★ ${l.rating}</span>
              <span>•</span>
              <span>${l.distanceKm} km (${l.etaMinutes} min)</span>
            </div>
          </div>
        </div>
        <button class="btn-omit-secondary text-xs text-zinc-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition shrink-0 flex items-center gap-1" data-id="${l.id}" title="Omitir resultado">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      `;

      secondaryLawyersContainer.appendChild(card);
    });

    // Add event listeners for secondary selection and omission
    secondaryLawyersContainer.querySelectorAll('.btn-select-secondary').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const selected = state.currentLawyers.find(l => l.id === id);
        if (selected) {
          showAssignedLawyerModal(selected);
        }
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

  btnCloseMatch.addEventListener('click', () => {
    lawyerMatchModal.classList.add('translate-y-full');
    setTimeout(() => {
      lawyerMatchModal.classList.add('hidden');
    }, 300);
  });


  // 5. Ficha Técnica / Perfil de Abogado (Maletín)
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
    document.getElementById('profile-modal-tp').textContent = l.tp;
    document.getElementById('profile-modal-univ').textContent = l.university || "Universidad del Valle";
    document.getElementById('profile-modal-bio').textContent = l.bio || l.description;
    document.getElementById('profile-modal-exp').textContent = `${l.experienceYears || 10} Años de Experiencia`;
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


  // 6. Pasarela de Pago Apple Pay Simulado
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

  // Trigger Pago Apple Pay para Videollamada
  btnStartVideocallCheckout.addEventListener('click', () => {
    if (!state.assignedLawyer) return;
    state.pendingPaymentType = 'videocall';

    applePayServiceTitle.textContent = "Asesoría por Videollamada Cifrada P2P";
    applePayModalAmount.textContent = `$${state.assignedLawyer.priceCOP.toLocaleString('es-CO')} COP`;
    applepayModalStatusMsg.classList.add('hidden');
    applepayModalBtnText.textContent = "DOBLE CLIC / TOUCH ID PARA PAGAR";

    applePayModal.classList.remove('hidden');
  });

  // Abrir formulario de desplazamiento
  btnOpenDispatchModal.addEventListener('click', () => {
    dispatchModal.classList.remove('hidden');
  });

  btnCloseDispatch.addEventListener('click', () => {
    dispatchModal.classList.add('hidden');
  });

  // Continuar desde desplazamiento a Apple Pay
  btnProceedDispatchApplepay.addEventListener('click', () => {
    dispatchModal.classList.add('hidden');
    state.pendingPaymentType = 'dispatch';

    applePayServiceTitle.textContent = "Desplazamiento Presencial de Abogado";
    applePayModalAmount.textContent = `$${state.assignedLawyer.travelPriceCOP.toLocaleString('es-CO')} COP`;
    applepayModalStatusMsg.classList.add('hidden');
    applepayModalBtnText.textContent = "DOBLE CLIC / TOUCH ID PARA PAGAR";

    applePayModal.classList.remove('hidden');
  });

  btnCloseApplePayModal.addEventListener('click', () => {
    applePayModal.classList.add('hidden');
  });

  // Ejecución de Biometría Touch ID / Face ID
  btnTriggerApplepayBiometric.addEventListener('click', () => {
    applepayModalBtnText.textContent = "Procesando biometría con Face ID...";
    btnTriggerApplepayBiometric.disabled = true;

    setTimeout(() => {
      applepayModalBtnText.textContent = "✓ PAGO APROBADO CON APPLE PAY";
      btnTriggerApplepayBiometric.disabled = false;
      applepayModalStatusMsg.classList.remove('hidden');

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


  // 7. Controles de Llamada
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
  const apiStatusBadge = document.getElementById('api-status-badge');

  function updateApiBadgeStatus() {
    const key = GoogleApiTest.getApiKey();
    if (key) {
      apiStatusBadge.className = "w-2 h-2 rounded-full bg-uber-green ml-1";
    } else {
      apiStatusBadge.className = "w-2 h-2 rounded-full bg-amber-500 ml-1";
    }
  }

  updateApiBadgeStatus();

  btnOpenApiModal.addEventListener('click', () => {
    inputApiKey.value = GoogleApiTest.getApiKey();
    selectGeminiModel.value = GoogleApiTest.getModel();
    apiTestResult.classList.add('hidden');
    apiModal.classList.remove('hidden');
  });

  btnCloseApiModal.addEventListener('click', () => {
    apiModal.classList.add('hidden');
  });

  btnSaveApiKey.addEventListener('click', () => {
    GoogleApiTest.setApiKey(inputApiKey.value);
    GoogleApiTest.setModel(selectGeminiModel.value);
    updateApiBadgeStatus();
    apiModal.classList.add('hidden');
  });

  btnTestApi.addEventListener('click', async () => {
    apiTestResult.classList.remove('hidden');
    apiTestResult.className = "text-xs p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300";
    apiTestResult.textContent = "Probando conexión con Google Gemini API...";

    const tempKey = inputApiKey.value.trim();
    if (!tempKey) {
      apiTestResult.textContent = "Modo Test / Simulación activo (Sin clave). Todo funcionará con clasificación simulada.";
      return;
    }

    GoogleApiTest.setApiKey(tempKey);
    GoogleApiTest.setModel(selectGeminiModel.value);

    const res = await GoogleApiTest.analyzeCaseAudioOrText({
      textPrompt: "Prueba de conexión API para urgencia legal en Cali Colombia"
    });

    if (res.success) {
      apiTestResult.className = "text-xs p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300";
      apiTestResult.textContent = `¡Conexión Exitosa con Google Gemini! Clasificación detectada: ${res.specialty}.`;
      updateApiBadgeStatus();
    } else {
      apiTestResult.className = "text-xs p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300";
      apiTestResult.textContent = `Error de conexión: ${res.error}`;
    }
  });

});
