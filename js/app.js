/**
 * Control Principal de la Aplicación Abogao (Cali, Colombia)
 * Orquesta la máquina de estados de triaje, especialidades reales (24 áreas y 247 procesos v6.1),
 * rutas jurídicas, consultorio, selección de especialistas con T.P. visible y pagos con Apple Pay.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Estado global de la app
  const state = {
    triageStep: 1, // 1: Urgencia/Consulta, 2: Injury check, 3: Specialty, 4: Questionnaire, 5: Description
    isUrgency: true,
    hasInjuries: false,
    selectedArea: null,
    selectedProcesoKey: null,
    qPara: 'yo',
    qRol: 'victima',
    qNecesita: 'orientacion',
    inputMode: 'text',
    assignedLawyer: null,
    currentLawyers: [],
    omittedLawyerIds: new Set(),
    pendingPaymentType: null, // 'videocall' o 'dispatch'
    activeOrders: []
  };

  // 1. Inicializar Lucide Icons, Mapa y Guía de Voz
  if (window.lucide) {
    lucide.createIcons();
  }

  MapController.initMap();

  if (typeof VoiceGuide !== 'undefined') {
    VoiceGuide.init(false);
  }

  // Guía de voz toggle
  const btnToggleVoiceGuide = document.getElementById('btn-toggle-voice-guide');
  if (btnToggleVoiceGuide) {
    btnToggleVoiceGuide.addEventListener('click', () => {
      if (typeof VoiceGuide !== 'undefined') {
        const text = `Estás en la aplicación Abogao Cali. Pasos actual: ${triageStepTitle ? triageStepTitle.textContent : 'Inicio'}. Selecciona una opción o busca un especialista.`;
        VoiceGuide.speak(text);
      }
    });
  }

  // renderSpecialtiesGrid: Carga las 24 áreas de catalog.js con estilo Uber Dark
  function renderSpecialtiesGrid() {
    const grid = document.getElementById('specialties-grid-container');
    if (!grid) return;
    grid.innerHTML = '';

    if (typeof ABOGAO_AREAS !== 'undefined' && Array.isArray(ABOGAO_AREAS)) {
      ABOGAO_AREAS.forEach(area => {
        const btn = document.createElement('button');
        btn.className = 'flex items-center space-x-2 p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition active:scale-95 text-xs';
        btn.innerHTML = `
          <span class="text-lg shrink-0">${area.e || '⚖️'}</span>
          <div class="min-w-0 flex-1">
            <div class="font-bold text-white truncate">${area.n}</div>
            <div class="text-[10px] text-slate-400 truncate">${area.d}</div>
          </div>
        `;
        btn.addEventListener('click', () => {
          state.selectedArea = area.id;
          state.selectedProcesoKey = null;
          updateLawyersList();
          showTriageStep(4, `Orientación: ${area.n}`);
        });
        grid.appendChild(btn);
      });
    }
  }

  // Render Cuestionario v6.1
  function renderQuestionnaire() {
    const paraBox = document.getElementById('q-para-container');
    const rolBox = document.getElementById('q-rol-container');
    const necBox = document.getElementById('q-necesita-container');

    if (paraBox) {
      paraBox.innerHTML = [
        ['yo', '🙋', 'Para mí'],
        ['familiar', '👨‍👩‍👧', 'Para un familiar'],
        ['empresa', '🏢', 'Para empresa']
      ].map(([id, icon, label]) => `
        <button type="button" data-qpara="${id}" class="qpara-btn p-2 rounded-xl text-center border text-[11px] font-medium ${state.qPara === id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300'} transition">
          <div class="text-sm">${icon}</div>
          <div>${label}</div>
        </button>
      `).join('');

      paraBox.querySelectorAll('.qpara-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.qPara = btn.dataset.qpara;
          renderQuestionnaire();
        });
      });
    }

    if (rolBox) {
      rolBox.innerHTML = [
        ['victima', '🕊️', 'Víctima / Afectado'],
        ['senalado', '👤', 'Señalado / Reclamado'],
        ['tercero', '🤝', 'Testigo / Tercero']
      ].map(([id, icon, label]) => `
        <button type="button" data-qrol="${id}" class="qrol-btn p-2 rounded-xl text-center border text-[11px] font-medium ${state.qRol === id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300'} transition">
          <div class="text-sm">${icon}</div>
          <div>${label}</div>
        </button>
      `).join('');

      rolBox.querySelectorAll('.qrol-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.qRol = btn.dataset.qrol;
          renderQuestionnaire();
        });
      });
    }

    if (necBox) {
      necBox.innerHTML = [
        ['orientacion', '💬', 'Orientación legal'],
        ['documento', '📝', 'Elaborar documento'],
        ['representacion', '🧑‍⚖️', 'Representación'],
        ['norma', '📖', 'Entender norma']
      ].map(([id, icon, label]) => `
        <button type="button" data-qnec="${id}" class="qnec-btn p-2 rounded-xl text-center border text-[11px] font-medium ${state.qNecesita === id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300'} transition">
          <div class="text-sm">${icon}</div>
          <div>${label}</div>
        </button>
      `).join('');

      necBox.querySelectorAll('.qnec-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          state.qNecesita = btn.dataset.qnec;
          renderQuestionnaire();
        });
      });
    }
  }

  function updateLawyersList() {
    const coords = MapController.userLocation;
    let list = nearbyProfessionals(coords.lat, coords.lng, {
      area: state.selectedArea,
      proceso: state.selectedProcesoKey
    });

    if (state.omittedLawyerIds.size > 0) {
      list = list.filter(pro => !state.omittedLawyerIds.has(pro.id));
    }

    state.currentLawyers = list;

    MapController.renderLawyerMarkers(list, (lawyer) => {
      showAssignedLawyerModal(lawyer);
    });

    const specBanner = document.getElementById('selected-spec-banner');
    const specName = document.getElementById('selected-spec-name');
    const countBadge = document.getElementById('lawyers-found-count');

    if (specBanner && specName && countBadge) {
      specBanner.classList.remove('hidden');
      const areaObj = typeof ABOGAO_AREAS !== 'undefined' ? ABOGAO_AREAS.find(a => a.id === state.selectedArea) : null;
      specName.textContent = areaObj ? areaObj.n : (state.selectedArea || "Todas las áreas");
      countBadge.textContent = `${list.length} Profesionales activos en Cali`;
    }
  }

  renderSpecialtiesGrid();
  renderQuestionnaire();

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

    if (typeof VoiceGuide !== 'undefined' && VoiceGuide.auto) {
      VoiceGuide.speak(`Paso ${stepNum}: ${titleText}`);
    }
  }

  if (btnRestartTriage) {
    btnRestartTriage.addEventListener('click', () => {
      state.selectedArea = null;
      state.selectedProcesoKey = null;
      state.hasInjuries = false;
      state.omittedLawyerIds.clear();
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
      showTriageStep(2, "Filtro Crítico de Emergencia");
    });
  }

  if (btnTriagePreventive) {
    btnTriagePreventive.addEventListener('click', () => {
      state.isUrgency = false;
      showTriageStep(3, "Selección de Área Legal");
    });
  }

  // Paso 2 Actions
  const btnInjuryYes = document.getElementById('btn-injury-yes');
  const btnInjuryNo = document.getElementById('btn-injury-no');
  const banner123Emergency = document.getElementById('banner-123-emergency');

  if (btnInjuryYes) {
    btnInjuryYes.addEventListener('click', () => {
      state.hasInjuries = true;
      if (banner123Emergency) banner123Emergency.classList.remove('hidden');
    });
  }

  if (btnInjuryNo) {
    btnInjuryNo.addEventListener('click', () => {
      state.hasInjuries = false;
      if (banner123Emergency) banner123Emergency.classList.add('hidden');
      showTriageStep(3, "Selección de Área Legal");
    });
  }

  // Paso 4 Actions
  const btnFinishQuestionnaire = document.getElementById('btn-finish-questionnaire');
  if (btnFinishQuestionnaire) {
    btnFinishQuestionnaire.addEventListener('click', () => {
      showTriageStep(5, "Descripción del Caso");
    });
  }

  // Búsqueda en vivo en Paso 5 con searchProcesos()
  const userTextPrompt = document.getElementById('user-text-prompt');
  const charCount = document.getElementById('char-count');
  const searchMatchesIndicator = document.getElementById('search-matches-indicator');

  if (userTextPrompt) {
    userTextPrompt.addEventListener('input', (e) => {
      const text = e.target.value;
      if (charCount) charCount.textContent = text.length;

      if (text.trim().length >= 4 && typeof searchProcesos === 'function') {
        const matches = searchProcesos(text, 1);
        if (matches.length > 0) {
          const match = matches[0];
          state.selectedArea = match.area;
          state.selectedProcesoKey = match.key;
          if (searchMatchesIndicator) {
            searchMatchesIndicator.textContent = `🎯 Proceso detectado: ${match.t} (${match.areaObj ? match.areaObj.n : match.area})`;
          }
          updateLawyersList();
        } else {
          if (searchMatchesIndicator) searchMatchesIndicator.textContent = '';
        }
      } else {
        if (searchMatchesIndicator) searchMatchesIndicator.textContent = '';
      }
    });
  }

  // Selector de Modo Texto / Audio
  const btnModeText = document.getElementById('btn-mode-text');
  const btnModeAudio = document.getElementById('btn-mode-audio');
  const textInputContainer = document.getElementById('text-input-container');
  const audioInputContainer = document.getElementById('audio-input-container');

  if (btnModeText && btnModeAudio) {
    btnModeText.addEventListener('click', () => {
      state.inputMode = 'text';
      btnModeText.className = "px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold transition";
      btnModeAudio.className = "px-2.5 py-1 rounded-lg text-slate-400 font-medium hover:text-white transition";
      textInputContainer.classList.remove('hidden');
      audioInputContainer.classList.add('hidden');
    });

    btnModeAudio.addEventListener('click', () => {
      state.inputMode = 'audio';
      btnModeAudio.className = "px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold transition";
      btnModeText.className = "px-2.5 py-1 rounded-lg text-slate-400 font-medium hover:text-white transition";
      textInputContainer.classList.add('hidden');
      audioInputContainer.classList.remove('hidden');
    });
  }

  // Captura de Audio / Dictado por voz
  const btnRecordAudio = document.getElementById('btn-record-audio');
  const recordText = document.getElementById('record-text');
  const recordingTimer = document.getElementById('recording-timer');
  let activeSpeechRecognition = null;

  if (btnRecordAudio) {
    btnRecordAudio.addEventListener('click', () => {
      if (typeof VoiceGuide !== 'undefined' && VoiceGuide.canListen) {
        if (!activeSpeechRecognition) {
          if (recordText) recordText.textContent = "Escuchando... Di tu caso";
          if (recordingTimer) recordingTimer.classList.remove('hidden');

          activeSpeechRecognition = VoiceGuide.listen({
            onText: (transcript) => {
              if (userTextPrompt) {
                userTextPrompt.value = transcript;
                userTextPrompt.dispatchEvent(new Event('input'));
              }
            },
            onEnd: () => {
              if (recordText) recordText.textContent = "Hablar para dictar relato";
              if (recordingTimer) recordingTimer.classList.add('hidden');
              activeSpeechRecognition = null;
            },
            onError: (err) => {
              console.warn("Speech recognition error:", err);
              if (recordText) recordText.textContent = "Hablar para dictar relato";
              if (recordingTimer) recordingTimer.classList.add('hidden');
              activeSpeechRecognition = null;
            }
          });
        } else {
          activeSpeechRecognition.stop();
          activeSpeechRecognition = null;
          if (recordText) recordText.textContent = "Hablar para dictar relato";
          if (recordingTimer) recordingTimer.classList.add('hidden');
        }
      } else {
        alert("El dictado por voz no está disponible en este navegador. Puedes escribir el texto directamente.");
      }
    });
  }

  // Análisis inteligente con Gemini / Catálogo
  const btnAnalyzeTextAi = document.getElementById('btn-analyze-text-ai');
  const aiAnalysisFeedback = document.getElementById('ai-analysis-feedback');
  const aiAnalysisText = document.getElementById('ai-analysis-text');

  if (btnAnalyzeTextAi) {
    btnAnalyzeTextAi.addEventListener('click', async () => {
      const userText = userTextPrompt ? userTextPrompt.value.trim() : "";
      if (!userText) {
        alert("Por favor ingresa un breve texto describiendo tu caso.");
        return;
      }

      if (aiAnalysisFeedback) aiAnalysisFeedback.classList.remove('hidden');
      if (aiAnalysisText) aiAnalysisText.textContent = "Analizando tu relato con el Catálogo Jurídico e IA...";

      let summaryText = "";

      // Primero buscar con la máquina de catálogo local
      if (typeof searchProcesos === 'function') {
        const matches = searchProcesos(userText, 3);
        if (matches.length > 0) {
          const topMatch = matches[0];
          state.selectedArea = topMatch.area;
          state.selectedProcesoKey = topMatch.key;
          updateLawyersList();

          summaryText = `Proceso recomendado: <strong>${topMatch.t}</strong> (${topMatch.tn || topMatch.areaObj.n}). Trámite ante: ${topMatch.ante}. Plazo/Urgencia: ${topMatch.u === 2 ? '🚨 YA' : (topMatch.u === 1 ? '⏰ PRONTO' : '📅 CON CITA')}.`;
        }
      }

      // Si Gemini API está configurada, consultar vía GoogleApiTest
      if (typeof GoogleApiTest !== 'undefined' && GoogleApiTest.getApiKey()) {
        const geminiRes = await GoogleApiTest.testApiConnection();
        if (geminiRes.success) {
          summaryText += ` <br><span class="text-emerald-400 font-bold">Resumen IA:</span> ${geminiRes.responseSample.slice(0, 150)}...`;
        }
      }

      if (aiAnalysisText) {
        aiAnalysisText.innerHTML = summaryText || "Caso analizado. Te hemos asignado el especialista más cercano disponible.";
      }
    });
  }

  // 3. Botón Principal de Búsqueda Uber Driver Style
  const btnMainSearch = document.getElementById('btn-main-search');
  const btnRadarWave = document.getElementById('btn-radar-wave');

  if (btnMainSearch) {
    btnMainSearch.addEventListener('click', () => {
      if (btnRadarWave) btnRadarWave.classList.remove('hidden');

      setTimeout(() => {
        if (btnRadarWave) btnRadarWave.classList.add('hidden');

        if (state.currentLawyers.length > 0) {
          showAssignedLawyerModal(state.currentLawyers[0]);
        } else {
          alert("No se encontraron profesionales para esta área en este momento. Intenta cambiar de área o filtro.");
        }
      }, 1200);
    });
  }

  // 4. Modal de Confirmación / Asignación de Especialista
  const lawyerMatchModal = document.getElementById('lawyer-match-modal');
  const btnCloseMatch = document.getElementById('btn-close-match');
  const btnNewSearch = document.getElementById('btn-new-search');
  const btnOmitMainLawyer = document.getElementById('btn-omit-main-lawyer');

  function showAssignedLawyerModal(lawyer) {
    if (!lawyer) return;
    state.assignedLawyer = lawyer;

    const matchName = document.getElementById('match-lawyer-name');
    const matchSpec = document.getElementById('match-lawyer-spec');
    const matchTp = document.getElementById('match-lawyer-tp');
    const matchUniv = document.getElementById('match-lawyer-university');
    const matchNeigh = document.getElementById('match-lawyer-neighborhood');
    const matchDist = document.getElementById('match-lawyer-distance');
    const matchTime = document.getElementById('match-lawyer-time');
    const matchPrice = document.getElementById('match-lawyer-price');
    const matchResp = document.getElementById('match-lawyer-response-times');
    const btnVideoPrice = document.getElementById('btn-video-price');
    const btnDispatchPrice = document.getElementById('btn-dispatch-price');
    const avatarPlaceholder = document.getElementById('match-lawyer-avatar-placeholder');
    const specBadgeTarget = document.getElementById('specialist-badge-target');

    if (matchName) matchName.textContent = lawyer.name;
    if (matchSpec) matchSpec.textContent = `${lawyer.kind === 'abogado' ? 'Abogado(a)' : lawyer.kind} (${(lawyer.areas || []).join(', ')})`;
    if (matchTp) matchTp.textContent = `${lawyer.doc || 'T.P. Verificada'} • CSJ`;
    if (matchUniv) matchUniv.textContent = lawyer.university || 'Univ. del Valle';
    if (matchNeigh) matchNeigh.textContent = lawyer.neighborhood || 'Cali';

    if (matchDist) matchDist.textContent = km(lawyer.distanceKm || 1.2);
    if (matchTime) matchTime.textContent = `${lawyer.etaMinutes || 3} min`;
    if (matchPrice) matchPrice.textContent = money(lawyer.priceCOP || 60000);
    if (matchResp) matchResp.textContent = lawyer.horario || '24 horas, todos los días';

    if (btnVideoPrice) btnVideoPrice.textContent = (lawyer.priceCOP || 60000).toLocaleString('es-CO');
    if (btnDispatchPrice) btnDispatchPrice.textContent = (lawyer.travelPriceCOP || 150000).toLocaleString('es-CO');

    if (avatarPlaceholder) {
      avatarPlaceholder.textContent = lawyer.name.split(' ').map(x => x[0]).slice(0, 2).join('');
    }

    if (specBadgeTarget) {
      if (lawyer.isTargetMatch) {
        specBadgeTarget.innerHTML = `🎯 Especialista Directo`;
        specBadgeTarget.className = "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      } else {
        specBadgeTarget.innerHTML = `★ Profesional Verificado`;
        specBadgeTarget.className = "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700";
      }
    }

    // Render secundarias
    const secContainer = document.getElementById('secondary-lawyers-container');
    const secCount = document.getElementById('secondary-lawyers-count');

    if (secContainer) {
      secContainer.innerHTML = '';
      const alternatives = state.currentLawyers.filter(l => l.id !== lawyer.id).slice(0, 2);

      if (secCount) secCount.textContent = `${alternatives.length} más`;

      alternatives.forEach(alt => {
        const div = document.createElement('div');
        div.className = "p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs";
        div.innerHTML = `
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
              ${alt.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div class="font-bold text-white">${alt.name} ${alt.isTargetMatch ? '🎯' : ''}</div>
              <div class="text-[10px] text-slate-400">${alt.doc} • ${alt.neighborhood}</div>
            </div>
          </div>
          <button data-alt-id="${alt.id}" class="btn-select-alt px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-lg border border-slate-700 text-[11px] transition">
            Seleccionar
          </button>
        `;
        secContainer.appendChild(div);
      });

      secContainer.querySelectorAll('.btn-select-alt').forEach(btn => {
        btn.addEventListener('click', () => {
          const altId = btn.dataset.altId;
          const altLawyer = state.currentLawyers.find(l => l.id === altId);
          if (altLawyer) showAssignedLawyerModal(altLawyer);
        });
      });
    }

    if (lawyerMatchModal) {
      lawyerMatchModal.classList.remove('hidden');
      lawyerMatchModal.classList.remove('translate-y-full');
    }

    MapController.highlightLawyerMarker(lawyer.id);
  }

  if (btnCloseMatch) {
    btnCloseMatch.addEventListener('click', () => {
      if (lawyerMatchModal) lawyerMatchModal.classList.add('hidden');
    });
  }

  if (btnNewSearch) {
    btnNewSearch.addEventListener('click', () => {
      if (lawyerMatchModal) lawyerMatchModal.classList.add('hidden');
      showTriageStep(1, "Clasificación de Urgencia");
    });
  }

  if (btnOmitMainLawyer) {
    btnOmitMainLawyer.addEventListener('click', () => {
      if (state.assignedLawyer) {
        state.omittedLawyerIds.add(state.assignedLawyer.id);
        updateLawyersList();
        if (state.currentLawyers.length > 0) {
          showAssignedLawyerModal(state.currentLawyers[0]);
        } else {
          alert("Has omitido las opciones actuales. Realiza una nueva búsqueda con otros criterios.");
          if (lawyerMatchModal) lawyerMatchModal.classList.add('hidden');
        }
      }
    });
  }

  // Ver Dosier / Ficha Técnica del Profesional
  const btnOpenBriefcase = document.getElementById('btn-open-briefcase');
  const btnTriggerAvatar = document.getElementById('btn-trigger-lawyer-profile-avatar');
  const lawyerProfileModal = document.getElementById('lawyer-profile-modal');
  const btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
  const btnCloseProfileOk = document.getElementById('btn-close-profile-ok');

  function openLawyerDosier() {
    const l = state.assignedLawyer;
    if (!l) return;

    const nameEl = document.getElementById('profile-modal-name');
    const specEl = document.getElementById('profile-modal-spec');
    const tpEl = document.getElementById('profile-modal-tp-badge');
    const titulosEl = document.getElementById('profile-modal-titulos');
    const univEl = document.getElementById('profile-modal-univ');
    const casesEl = document.getElementById('profile-modal-cases');
    const schedEl = document.getElementById('profile-modal-schedule');
    const avatarEl = document.getElementById('profile-modal-avatar');

    if (nameEl) nameEl.textContent = l.name;
    if (specEl) specEl.textContent = `${l.kind === 'abogado' ? 'Abogado(a)' : l.kind} en ${l.neighborhood || 'Cali'}`;
    if (tpEl) tpEl.textContent = `${l.doc || 'T.P. Verificada'} • CSJ`;
    if (univEl) univEl.textContent = l.university || 'Universidad del Valle';
    if (casesEl) casesEl.textContent = `${l.casosAbogao || 55} casos atendidos`;
    if (schedEl) schedEl.textContent = `${l.horario || '24 horas'} • ${l.neighborhood || 'Granada'}`;

    if (avatarEl) {
      avatarEl.textContent = l.name.split(' ').map(x => x[0]).slice(0, 2).join('');
    }

    if (titulosEl) {
      const titles = l.titulos && l.titulos.length ? l.titulos : [`Especialista en Derecho ${(l.areas || [])[0] || 'Penal'}`];
      titulosEl.innerHTML = titles.map(t => `<li>${t}</li>`).join('');
    }

    if (lawyerProfileModal) lawyerProfileModal.classList.remove('hidden');
  }

  if (btnOpenBriefcase) btnOpenBriefcase.addEventListener('click', openLawyerDosier);
  if (btnTriggerAvatar) btnTriggerAvatar.addEventListener('click', openLawyerDosier);

  if (btnCloseProfileModal) btnCloseProfileModal.addEventListener('click', () => lawyerProfileModal.classList.add('hidden'));
  if (btnCloseProfileOk) btnCloseProfileOk.addEventListener('click', () => lawyerProfileModal.classList.add('hidden'));

  // 5. Pagos con Apple Pay y Videollamadas / Desplazamientos
  const btnStartVideocallCheckout = document.getElementById('btn-start-videocall-checkout');
  const btnOpenDispatchModal = document.getElementById('btn-open-dispatch-modal');
  const applePayModal = document.getElementById('apple-pay-modal');
  const btnCloseApplePayModal = document.getElementById('btn-close-apple-pay-modal');
  const dispatchModal = document.getElementById('dispatch-modal');
  const btnCloseDispatch = document.getElementById('btn-close-dispatch');

  if (btnStartVideocallCheckout) {
    btnStartVideocallCheckout.addEventListener('click', () => {
      state.pendingPaymentType = 'videocall';
      const amountEl = document.getElementById('apple-pay-modal-amount');
      const titleEl = document.getElementById('apple-pay-service-title');
      if (amountEl) amountEl.textContent = money(state.assignedLawyer ? state.assignedLawyer.priceCOP : 60000);
      if (titleEl) titleEl.textContent = "Consulta Inmediata por Llamada/Video";
      if (applePayModal) applePayModal.classList.remove('hidden');
    });
  }

  if (btnOpenDispatchModal) {
    btnOpenDispatchModal.addEventListener('click', () => {
      state.pendingPaymentType = 'dispatch';
      if (dispatchModal) dispatchModal.classList.remove('hidden');
    });
  }

  if (btnCloseApplePayModal) {
    btnCloseApplePayModal.addEventListener('click', () => {
      if (applePayModal) applePayModal.classList.add('hidden');
    });
  }

  if (btnCloseDispatch) {
    btnCloseDispatch.addEventListener('click', () => {
      if (dispatchModal) dispatchModal.classList.add('hidden');
    });
  }

  const btnProceedDispatchApplepay = document.getElementById('btn-proceed-dispatch-applepay');
  if (btnProceedDispatchApplepay) {
    btnProceedDispatchApplepay.addEventListener('click', () => {
      if (dispatchModal) dispatchModal.classList.add('hidden');
      const amountEl = document.getElementById('apple-pay-modal-amount');
      const titleEl = document.getElementById('apple-pay-service-title');
      if (amountEl) amountEl.textContent = money(state.assignedLawyer ? state.assignedLawyer.travelPriceCOP : 150000);
      if (titleEl) titleEl.textContent = "Desplazamiento Presencial de Abogado";
      if (applePayModal) applePayModal.classList.remove('hidden');
    });
  }

  // Disparar Pago Biométrico Simulador
  const btnTriggerApplepayBiometric = document.getElementById('btn-trigger-applepay-biometric');
  const applepayModalStatusMsg = document.getElementById('applepay-modal-status-msg');

  if (btnTriggerApplepayBiometric) {
    btnTriggerApplepayBiometric.addEventListener('click', () => {
      if (applepayModalStatusMsg) applepayModalStatusMsg.classList.remove('hidden');

      setTimeout(() => {
        if (applepayModalStatusMsg) applepayModalStatusMsg.classList.add('hidden');
        if (applePayModal) applePayModal.classList.add('hidden');
        if (lawyerMatchModal) lawyerMatchModal.classList.add('hidden');

        // Registrar orden activa
        const newOrder = {
          id: 'ORD-' + Math.floor(Math.random() * 90000 + 10000),
          lawyer: state.assignedLawyer,
          type: state.pendingPaymentType,
          date: new Date().toLocaleDateString('es-CO')
        };
        state.activeOrders.push(newOrder);

        const ordersBadge = document.getElementById('orders-badge');
        if (ordersBadge) {
          ordersBadge.textContent = state.activeOrders.length;
          ordersBadge.classList.remove('hidden');
        }

        if (state.pendingPaymentType === 'videocall') {
          if (typeof VideoCall !== 'undefined') {
            const roomName = "Abogao_Cali_" + Math.random().toString(36).substring(2, 9);
            VideoCall.startCall(roomName, state.assignedLawyer ? state.assignedLawyer.name : 'Dra. Laura Restrepo');
          }
        } else {
          alert(`¡Orden confirmada! ${state.assignedLawyer ? state.assignedLawyer.name : 'El abogado'} se desplaza a la dirección indicada. ETA estimado: 15-20 minutos.`);
        }
      }, 1500);
    });
  }

  // 6. Buscador del Catálogo y Modal de Áreas (v6.1 - 247 Procesos)
  const btnOpenCatalogModal = document.getElementById('btn-open-catalog-modal');
  const catalogModal = document.getElementById('catalog-modal');
  const btnCloseCatalogModal = document.getElementById('btn-close-catalog-modal');
  const inputCatalogSearch = document.getElementById('input-catalog-search');
  const catalogModalContent = document.getElementById('catalog-modal-content');
  const btnQuickCatalog = document.getElementById('btn-quick-catalog');
  const btnFilterYa = document.getElementById('btn-filter-ya');
  const btnFilterAll = document.getElementById('btn-filter-all');

  function renderCatalogView(filterText = '', onlyYa = false) {
    if (!catalogModalContent) return;
    catalogModalContent.innerHTML = '';

    if (filterText.trim().length >= 2 && typeof searchProcesos === 'function') {
      const results = searchProcesos(filterText, 15);
      if (results.length === 0) {
        catalogModalContent.innerHTML = `<div class="text-xs text-slate-400 text-center py-6">No encontramos procesos exactos para "${filterText}". Intenta con palabras como "embargo", "desalojo" o "captura".</div>`;
        return;
      }

      results.forEach(res => {
        const div = document.createElement('div');
        div.className = "p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl space-y-1 transition cursor-pointer";
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white">${res.e} ${res.t}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${res.u === 2 ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-slate-700 text-slate-300'}">
              ${res.u === 2 ? '🚨 YA' : (res.u === 1 ? '⏰ Pronto' : '📅 Con cita')}
            </span>
          </div>
          <p class="text-[11px] text-emerald-400 font-medium">${res.tn || res.areaObj.n}</p>
          <p class="text-[10px] text-slate-400">Ante: ${res.ante} • Requiere: ${ABOGAO_NEED[res.need] || 'Abogado'}</p>
        `;
        div.addEventListener('click', () => {
          state.selectedArea = res.area;
          state.selectedProcesoKey = res.key;
          updateLawyersList();
          if (catalogModal) catalogModal.classList.add('hidden');
          showTriageStep(4, `Proceso: ${res.t}`);
        });
        catalogModalContent.appendChild(div);
      });
    } else if (onlyYa && typeof procesosPorNivel === 'function') {
      const yaList = procesosPorNivel(2);
      yaList.forEach(p => {
        const div = document.createElement('div');
        div.className = "p-3 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 rounded-xl space-y-1 transition cursor-pointer";
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white">${p.e} ${p.t}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">🚨 YA</span>
          </div>
          <p class="text-[11px] text-red-300 font-medium">${p.tn || p.areaObj.n}</p>
          <p class="text-[10px] text-slate-300">Ante: ${p.ante}</p>
        `;
        div.addEventListener('click', () => {
          state.selectedArea = p.area;
          state.selectedProcesoKey = p.key;
          updateLawyersList();
          if (catalogModal) catalogModal.classList.add('hidden');
          showTriageStep(4, `Urgencia: ${p.t}`);
        });
        catalogModalContent.appendChild(div);
      });
    } else if (typeof ABOGAO_AREAS !== 'undefined') {
      // Listado por 24 áreas
      ABOGAO_AREAS.forEach(area => {
        const div = document.createElement('div');
        div.className = "p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-2xl space-y-2 transition cursor-pointer";
        const areaProcesos = (typeof ABOGAO_PROCESOS !== 'undefined' && ABOGAO_PROCESOS[area.id]) ? ABOGAO_PROCESOS[area.id] : [];
        div.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold text-white flex items-center gap-2">
              <span>${area.e}</span> <span>${area.n}</span>
            </span>
            <span class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">${areaProcesos.length} procesos</span>
          </div>
          <p class="text-[11px] text-slate-400">${area.d}</p>
        `;
        div.addEventListener('click', () => {
          state.selectedArea = area.id;
          state.selectedProcesoKey = null;
          updateLawyersList();
          if (catalogModal) catalogModal.classList.add('hidden');
          showTriageStep(4, `Área: ${area.n}`);
        });
        catalogModalContent.appendChild(div);
      });
    }
  }

  function openCatalogModal() {
    if (catalogModal) catalogModal.classList.remove('hidden');
    renderCatalogView();
  }

  if (btnOpenCatalogModal) btnOpenCatalogModal.addEventListener('click', openCatalogModal);
  if (btnQuickCatalog) btnQuickCatalog.addEventListener('click', openCatalogModal);
  if (btnCloseCatalogModal) btnCloseCatalogModal.addEventListener('click', () => catalogModal.classList.add('hidden'));

  if (inputCatalogSearch) {
    inputCatalogSearch.addEventListener('input', (e) => {
      renderCatalogView(e.target.value);
    });
  }

  if (btnFilterYa) {
    btnFilterYa.addEventListener('click', () => {
      if (inputCatalogSearch) inputCatalogSearch.value = '';
      renderCatalogView('', true);
    });
  }

  if (btnFilterAll) {
    btnFilterAll.addEventListener('click', () => {
      if (inputCatalogSearch) inputCatalogSearch.value = '';
      renderCatalogView('', false);
    });
  }

  // 7. Modales Adicionales (Rutas, Consultorio, Órdenes, Config API)
  const btnOpenRoutesModal = document.getElementById('btn-open-routes-modal');
  const routesModal = document.getElementById('routes-modal');
  const btnCloseRoutesModal = document.getElementById('btn-close-routes-modal');
  const routesModalContent = document.getElementById('routes-modal-content');

  if (btnOpenRoutesModal) {
    btnOpenRoutesModal.addEventListener('click', () => {
      if (routesModalContent) {
        routesModalContent.innerHTML = '';
        if (typeof ABOGAO_RUTAS !== 'undefined') {
          Object.entries(ABOGAO_RUTAS).forEach(([key, ruta]) => {
            const p = typeof findProceso === 'function' ? findProceso(key) : null;
            const div = document.createElement('div');
            div.className = "p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2 text-xs";
            div.innerHTML = `
              <div class="font-bold text-emerald-400 flex items-center justify-between">
                <span>Ruta: ${p ? p.t : key}</span>
                <span class="text-[10px] text-slate-400">${ruta.rev || ''}</span>
              </div>
              <p class="text-slate-300">${ruta.q || ''}</p>
              <div class="space-y-1">
                <div class="font-semibold text-white">Pasos:</div>
                <ol class="list-decimal list-inside text-slate-400 space-y-0.5">
                  ${(ruta.pasos || []).map(step => `<li>${step}</li>`).join('')}
                </ol>
              </div>
            `;
            routesModalContent.appendChild(div);
          });
        }
      }
      if (routesModal) routesModal.classList.remove('hidden');
    });
  }

  if (btnCloseRoutesModal) btnCloseRoutesModal.addEventListener('click', () => routesModal.classList.add('hidden'));

  // Modal Consultorio
  const btnOpenConsultorioModal = document.getElementById('btn-open-consultorio-modal');
  const consultorioModal = document.getElementById('consultorio-modal');
  const btnCloseConsultorioModal = document.getElementById('btn-close-consultorio-modal');
  const consultorioPackagesContainer = document.getElementById('consultorio-packages-container');

  if (btnOpenConsultorioModal) {
    btnOpenConsultorioModal.addEventListener('click', () => {
      if (consultorioPackagesContainer) {
        consultorioPackagesContainer.innerHTML = `
          <div class="p-4 bg-slate-800/90 border border-emerald-500/40 rounded-2xl space-y-3">
            <div class="flex justify-between items-center">
              <span class="font-extrabold text-white text-sm">Consultorio Express 15 Días</span>
              <span class="text-emerald-400 font-bold text-sm">$180.000 COP</span>
            </div>
            <ul class="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Chat continuo con tu especialista asignado</li>
              <li>2 Videollamadas de 20 min programadas</li>
              <li>Revisión e interpretación de documentos</li>
            </ul>
            <button onclick="alert('Iniciando suscripción al consultorio...')" class="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs rounded-xl transition">
              CONTRATAR CONSULTORIO 15 DÍAS
            </button>
          </div>
        `;
      }
      if (consultorioModal) consultorioModal.classList.remove('hidden');
    });
  }

  if (btnCloseConsultorioModal) btnCloseConsultorioModal.addEventListener('click', () => consultorioModal.classList.add('hidden'));

  // Modal Órdenes
  const btnOpenOrdersModal = document.getElementById('btn-open-orders-modal');
  const ordersModal = document.getElementById('orders-modal');
  const btnCloseOrdersModal = document.getElementById('btn-close-orders-modal');
  const ordersModalContent = document.getElementById('orders-modal-content');

  if (btnOpenOrdersModal) {
    btnOpenOrdersModal.addEventListener('click', () => {
      if (ordersModalContent) {
        if (state.activeOrders.length === 0) {
          ordersModalContent.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No tienes órdenes ni servicios activos actualmente.</p>`;
        } else {
          ordersModalContent.innerHTML = state.activeOrders.map(ord => `
            <div class="p-3 bg-slate-800 border border-slate-700 rounded-xl space-y-1 text-xs">
              <div class="flex justify-between font-bold text-emerald-400">
                <span>${ord.id}</span>
                <span>${ord.type === 'videocall' ? '📹 Videollamada' : '📍 Desplazamiento'}</span>
              </div>
              <div class="text-white font-semibold">${ord.lawyer ? ord.lawyer.name : 'Dra. Laura Restrepo'}</div>
              <div class="text-slate-400 text-[10px]">Fecha: ${ord.date} • Estado: Activo</div>
            </div>
          `).join('');
        }
      }
      if (ordersModal) ordersModal.classList.remove('hidden');
    });
  }

  if (btnCloseOrdersModal) btnCloseOrdersModal.addEventListener('click', () => ordersModal.classList.add('hidden'));

  // Modal API Key Gemini
  const btnOpenApiModal = document.getElementById('btn-open-api-modal');
  const apiModal = document.getElementById('api-modal');
  const btnCloseApiModal = document.getElementById('btn-close-api-modal');
  const inputApiKey = document.getElementById('input-api-key');
  const btnSaveApiKey = document.getElementById('btn-save-api-key');
  const btnTestApi = document.getElementById('btn-test-api');
  const apiTestResult = document.getElementById('api-test-result');

  if (btnOpenApiModal) {
    btnOpenApiModal.addEventListener('click', () => {
      if (inputApiKey && typeof GoogleApiTest !== 'undefined') {
        inputApiKey.value = GoogleApiTest.getApiKey();
      }
      if (apiModal) apiModal.classList.remove('hidden');
    });
  }

  if (btnCloseApiModal) btnCloseApiModal.addEventListener('click', () => apiModal.classList.add('hidden'));

  if (btnSaveApiKey) {
    btnSaveApiKey.addEventListener('click', () => {
      if (inputApiKey && typeof GoogleApiTest !== 'undefined') {
        GoogleApiTest.saveApiKey(inputApiKey.value.trim());
        alert("Clave API guardada exitosamente.");
        if (apiModal) apiModal.classList.add('hidden');
      }
    });
  }

  if (btnTestApi) {
    btnTestApi.addEventListener('click', async () => {
      if (apiTestResult && typeof GoogleApiTest !== 'undefined') {
        apiTestResult.classList.remove('hidden');
        apiTestResult.textContent = "Probando conexión con Google Gemini...";
        const res = await GoogleApiTest.testApiConnection();
        if (res.success) {
          apiTestResult.className = "text-xs p-2.5 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300";
          apiTestResult.textContent = `¡Conexión exitosa! (${res.model})`;
        } else {
          apiTestResult.className = "text-xs p-2.5 rounded-xl bg-red-950 border border-red-500 text-red-300";
          apiTestResult.textContent = `Error: ${res.error}`;
        }
      }
    });
  }
});
