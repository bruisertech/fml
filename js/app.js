/**
 * Control Principal de la Aplicación uberlawyerBETA
 * Orquesta la interfaz de usuario, eventos, filtros, Apple Pay simulado y despacho presencial.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado global de la app
  const state = {
    selectedSpecialty: null,
    isEmergency: true,
    assignedLawyer: null,
    currentLawyers: []
  };

  // Inicialización de Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // 1. Inicializar Mapa
  MapController.initMap();

  // Cargar lista inicial de abogados en Cali
  function updateLawyersList() {
    const list = getLawyersWithDistance(
      MapController.userLocation.lat,
      MapController.userLocation.lng,
      state.selectedSpecialty
    );
    state.currentLawyers = list;

    // Renderizar marcadores
    MapController.renderLawyerMarkers(list, (lawyer) => {
      showAssignedLawyerModal(lawyer);
    });

    // Actualizar badge de especialidad
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

  // Ejecutar primera carga de abogados cuando el mapa o ubicación estén listos
  setTimeout(() => {
    updateLawyersList();
  }, 500);


  // 2. Manejo de Cuestionario Flotante Superior (Emergency Yes/No)
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

  // Selector de Especialidades Rápidas en Emergencia (Pills)
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

  // Select de Especialidad en No Emergencia
  const selectNonEmergencyArea = document.getElementById('non-emergency-area');
  selectNonEmergencyArea.addEventListener('change', (e) => {
    state.selectedSpecialty = e.target.value;
    updateLawyersList();
  });


  // 3. Módulo de Grabación de Audio e IA Gemini
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


  // 4. Botón Principal "BUSCAR ABOGADO" y Asignación de Abogado
  const btnMainSearch = document.getElementById('btn-main-search');
  const btnRadarWave = document.getElementById('btn-radar-wave');
  const lawyerMatchModal = document.getElementById('lawyer-match-modal');
  const btnCloseMatch = document.getElementById('btn-close-match');

  btnMainSearch.addEventListener('click', () => {
    btnRadarWave.classList.remove('hidden');

    MapController.triggerRadarAnimation(2500, () => {
      btnRadarWave.classList.add('hidden');

      if (state.currentLawyers.length > 0) {
        const topLawyer = state.currentLawyers[0];
        showAssignedLawyerModal(topLawyer);
      } else {
        alert("No se encontraron abogados disponibles en este momento.");
      }
    });
  });

  function showAssignedLawyerModal(lawyer) {
    state.assignedLawyer = lawyer;

    document.getElementById('match-lawyer-avatar').src = lawyer.avatar;
    document.getElementById('match-lawyer-name').textContent = lawyer.name;
    document.getElementById('match-lawyer-spec').textContent = `Especialista en ${lawyer.specialty}`;
    document.getElementById('match-lawyer-rating').textContent = lawyer.rating;
    document.getElementById('match-lawyer-tp').textContent = lawyer.tp;
    document.getElementById('match-lawyer-neighborhood').textContent = lawyer.neighborhood;

    // Tiempos de respuesta estimado y máximo
    document.getElementById('match-lawyer-response-times').textContent =
      `Estimado ${lawyer.estimatedResponseMin} min • Máx ${lawyer.maxResponseMin} min`;

    document.getElementById('match-lawyer-distance').textContent = `${lawyer.distanceKm} km`;
    document.getElementById('match-lawyer-time').textContent = `${lawyer.etaMinutes} min`;
    document.getElementById('match-lawyer-price').textContent = `$${lawyer.priceCOP.toLocaleString('es-CO')}`;

    // Precios de llamada y despacho
    document.getElementById('btn-video-price').textContent = lawyer.priceCOP.toLocaleString('es-CO');
    document.getElementById('btn-dispatch-price').textContent = lawyer.travelPriceCOP.toLocaleString('es-CO');

    lawyerMatchModal.classList.remove('hidden', 'translate-y-full');
    lawyerMatchModal.classList.add('translate-y-0');
  }

  btnCloseMatch.addEventListener('click', () => {
    lawyerMatchModal.classList.add('translate-y-full');
    setTimeout(() => {
      lawyerMatchModal.classList.add('hidden');
    }, 300);
  });


  // 5. Iniciar Videollamada
  const btnStartVideocall = document.getElementById('btn-start-videocall');
  const btnEndVideocall = document.getElementById('btn-end-videocall');

  btnStartVideocall.addEventListener('click', () => {
    if (state.assignedLawyer) {
      VideoCall.startCall(state.assignedLawyer, () => {
        console.log("Videollamada finalizada.");
      });
    }
  });

  btnEndVideocall.addEventListener('click', () => {
    VideoCall.endCall();
  });


  // 6. Modal Desplazamiento Presencial & Cobro Simulado Apple Pay
  const btnOpenDispatchModal = document.getElementById('btn-open-dispatch-modal');
  const btnCloseDispatch = document.getElementById('btn-close-dispatch');
  const dispatchModal = document.getElementById('dispatch-modal');
  const btnPayApplepay = document.getElementById('btn-pay-applepay');
  const applepayBtnText = document.getElementById('applepay-btn-text');
  const dispatchStatusMsg = document.getElementById('dispatch-status-msg');
  const applePayAmount = document.getElementById('apple-pay-amount');

  btnOpenDispatchModal.addEventListener('click', () => {
    if (state.assignedLawyer) {
      applePayAmount.textContent = `$${state.assignedLawyer.travelPriceCOP.toLocaleString('es-CO')} COP`;
    }
    dispatchStatusMsg.classList.add('hidden');
    applepayBtnText.textContent = "PAGAR CON TOUCH ID / FACE ID";
    dispatchModal.classList.remove('hidden');
  });

  btnCloseDispatch.addEventListener('click', () => {
    dispatchModal.classList.add('hidden');
  });

  btnPayApplepay.addEventListener('click', () => {
    // Animación de validación Touch ID / Face ID
    applepayBtnText.textContent = "Procesando pago con Face ID...";
    btnPayApplepay.disabled = true;

    setTimeout(() => {
      applepayBtnText.textContent = "✓ PAGO APROBADO CON APPLE PAY";
      btnPayApplepay.disabled = false;
      dispatchStatusMsg.classList.remove('hidden');
    }, 1800);
  });


  // 7. Modal Configuración Google Gemini API Key
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
