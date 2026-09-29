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
    pendingPaymentType: null, // 'videocall' o 'dispatch'
    userRole: 'Víctima', // 'Víctima' o 'Acusado'
    inputMode: 'text', // 'text' o 'audio'
    activeOrders: []
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

      // Register new order
      const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        originalLawyer: state.assignedLawyer,
        currentLawyer: state.assignedLawyer,
        serviceType: state.pendingPaymentType === 'videocall' ? 'Videollamada Express' : 'Desplazamiento Presencial',
        amountCOP: state.pendingPaymentType === 'videocall' ? state.assignedLawyer.priceCOP : state.assignedLawyer.travelPriceCOP,
        status: 'Reasignado por Rechazo', // Simular reasignación para demostrar la funcionalidad
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


  // 7. Controles de Llamada
  const btnEndVideocall = document.getElementById('btn-end-videocall');
  if (btnEndVideocall) {
    btnEndVideocall.addEventListener('click', () => {
      VideoCall.endCall();
    });
  }


  // 3b. Role Selection (Víctima / Acusado) & Input Mode (Texto / Audio)
  const btnRoleVictima = document.getElementById('btn-role-victima');
  const btnRoleAcusado = document.getElementById('btn-role-acusado');

  if (btnRoleVictima && btnRoleAcusado) {
    btnRoleVictima.addEventListener('click', () => {
      state.userRole = 'Víctima';
      btnRoleVictima.className = "py-2 px-3 rounded-xl bg-uber-green text-black font-extrabold text-xs border border-uber-green flex items-center justify-center space-x-1.5 transition active:scale-95 shadow";
      btnRoleAcusado.className = "py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-700 flex items-center justify-center space-x-1.5 transition active:scale-95";
    });

    btnRoleAcusado.addEventListener('click', () => {
      state.userRole = 'Acusado';
      btnRoleAcusado.className = "py-2 px-3 rounded-xl bg-uber-green text-black font-extrabold text-xs border border-uber-green flex items-center justify-center space-x-1.5 transition active:scale-95 shadow";
      btnRoleVictima.className = "py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs border border-zinc-700 flex items-center justify-center space-x-1.5 transition active:scale-95";
    });
  }

  const btnModeText = document.getElementById('btn-mode-text');
  const btnModeAudio = document.getElementById('btn-mode-audio');
  const textInputContainer = document.getElementById('text-input-container');
  const audioInputContainer = document.getElementById('audio-input-container');

  if (btnModeText && btnModeAudio) {
    btnModeText.addEventListener('click', () => {
      state.inputMode = 'text';
      btnModeText.className = "px-2.5 py-1 rounded-lg bg-uber-green text-black font-bold transition";
      btnModeAudio.className = "px-2.5 py-1 rounded-lg text-zinc-400 font-medium hover:text-white transition";
      textInputContainer.classList.remove('hidden');
      audioInputContainer.classList.add('hidden');
    });

    btnModeAudio.addEventListener('click', () => {
      state.inputMode = 'audio';
      btnModeAudio.className = "px-2.5 py-1 rounded-lg bg-uber-green text-black font-bold transition";
      btnModeText.className = "px-2.5 py-1 rounded-lg text-zinc-400 font-medium hover:text-white transition";
      textInputContainer.classList.add('hidden');
      audioInputContainer.classList.remove('hidden');
    });
  }

  const btnAnalyzeTextAi = document.getElementById('btn-analyze-text-ai');
  const userTextPrompt = document.getElementById('user-text-prompt');

  if (btnAnalyzeTextAi) {
    btnAnalyzeTextAi.addEventListener('click', async () => {
      const promptText = userTextPrompt.value.trim();
      if (!promptText) {
        alert("Por favor escribe un breve resumen de tu caso.");
        return;
      }

      aiFeedbackEl.classList.remove('hidden');
      aiFeedbackText.textContent = `Analizando consulta como ${state.userRole} con IA de Google Gemini...`;

      const analysis = await GoogleApiTest.analyzeCaseAudioOrText({
        textPrompt: `[Rol: ${state.userRole}] ${promptText}`
      });

      if (analysis.success) {
        aiFeedbackText.innerHTML = `
          <strong>IA Gemini (${analysis.isSimulation ? 'Modo Test' : 'Real'}):</strong>
          Rol: <span class="font-bold text-white">${state.userRole}</span> • Especialidad: <span class="underline font-bold">${analysis.specialty}</span>.<br>
          ${analysis.summary}
        `;
        state.selectedSpecialty = analysis.specialty;
        updateLawyersList();
      } else {
        aiFeedbackText.textContent = `Error en IA: ${analysis.error}. Se mantiene la categoría actual.`;
      }
    });
  }

  // 7b. Panel de Mis Órdenes
  const btnOpenOrdersModal = document.getElementById('btn-open-orders-modal');
  const btnCloseOrdersModal = document.getElementById('btn-close-orders-modal');
  const ordersModal = document.getElementById('orders-modal');
  const ordersModalContent = document.getElementById('orders-modal-content');
  const ordersBadge = document.getElementById('orders-badge');

  function updateOrdersBadge() {
    if (state.activeOrders.length > 0) {
      ordersBadge.textContent = state.activeOrders.length;
      ordersBadge.classList.remove('hidden');
    } else {
      ordersBadge.classList.add('hidden');
    }
  }

  function renderOrdersList() {
    ordersModalContent.innerHTML = '';

    if (state.activeOrders.length === 0) {
      ordersModalContent.innerHTML = `
        <div class="p-6 text-center text-zinc-400 space-y-2 bg-zinc-900/60 rounded-2xl border border-zinc-800">
          <i data-lucide="shopping-bag" class="w-8 h-8 text-zinc-600 mx-auto"></i>
          <p class="text-xs">No tienes órdenes o servicios activos en este momento.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    state.activeOrders.forEach((order, idx) => {
      const card = document.createElement('div');
      card.className = "bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3";

      if (order.isReassigned && order.status === 'Reasignado por Rechazo') {
        card.innerHTML = `
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span class="text-xs font-mono text-zinc-400">${order.id} • ${order.serviceType}</span>
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

          <div class="flex items-center space-x-3 p-2 bg-black/60 rounded-xl border border-zinc-800">
            <img class="w-12 h-12 rounded-xl object-cover border border-uber-green" src="${order.reassignedLawyer.avatar}" alt="Nuevo Abogado">
            <div class="flex-1 min-w-0">
              <h5 class="text-xs font-bold text-white truncate">${order.reassignedLawyer.name}</h5>
              <p class="text-[11px] text-uber-green font-semibold">${order.reassignedLawyer.specialty}</p>
              <div class="text-[10px] text-zinc-400">★ ${order.reassignedLawyer.rating} • ${order.reassignedLawyer.tp}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <button class="btn-cancel-order py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs rounded-xl border border-red-500/40 transition active:scale-95" data-index="${idx}">
              Cancelar Servicio
            </button>
            <button class="btn-accept-order py-2 bg-uber-green hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl transition active:scale-95" data-index="${idx}">
              Aceptar Cambio
            </button>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span class="text-xs font-mono text-zinc-400">${order.id} • ${order.serviceType}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-uber-green/20 text-uber-green border border-uber-green/30">
              ${order.status}
            </span>
          </div>

          <div class="flex items-center space-x-3 p-2 bg-black/60 rounded-xl border border-zinc-800">
            <img class="w-12 h-12 rounded-xl object-cover border border-uber-green" src="${order.currentLawyer.avatar}" alt="Abogado">
            <div class="flex-1 min-w-0">
              <h5 class="text-xs font-bold text-white truncate">${order.currentLawyer.name}</h5>
              <p class="text-[11px] text-uber-green font-semibold">${order.currentLawyer.specialty}</p>
              <div class="text-[10px] text-zinc-400">$${order.amountCOP.toLocaleString('es-CO')} COP</div>
            </div>
          </div>
        `;
      }

      ordersModalContent.appendChild(card);
    });

    // Add action handlers
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

  // 8. Modal Configuración Google Gemini API Key y Verificación Startup
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

  // Startup prompt for Gemini API key if missing
  setTimeout(() => {
    if (!GoogleApiTest.getApiKey()) {
      inputApiKey.value = "";
      selectGeminiModel.value = GoogleApiTest.getModel();
      apiTestResult.classList.remove('hidden');
      apiTestResult.className = "text-xs p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300";
      apiTestResult.textContent = "¡Bienvenido a Abogao! Ingrese su API Key de Google Gemini para habilitar el análisis de IA obligatorio. O guarde sin clave para utilizar el Modo Test/Simulación.";
      apiModal.classList.remove('hidden');
    }
  }, 600);

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
