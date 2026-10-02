/**
 * Lógica del Panel Administrativo e Inyector de Casos para Abogao
 * Controla la activación de casos simulados, creación de casos personalizados
 * y mantenimiento de la plataforma.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  function renderDashboardStats() {
    const lawyersCountEl = document.getElementById('stat-lawyers-count');
    const activeCasesEl = document.getElementById('stat-active-cases');
    const totalCasesEl = document.getElementById('stat-total-cases');
    const apiStatusEl = document.getElementById('stat-api-status');
    const apiModelEl = document.getElementById('stat-api-model');

    if (lawyersCountEl) {
      lawyersCountEl.textContent = (typeof PROFESIONALES !== 'undefined') ? PROFESIONALES.length : 26;
    }

    const cases = LawyerDriver.getSimulatedCases();
    const activeCount = cases.filter(c => c.active !== false).length;

    if (activeCasesEl) activeCasesEl.textContent = activeCount;
    if (totalCasesEl) totalCasesEl.textContent = `de ${cases.length} totales`;

    const apiKey = localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY);
    const model = localStorage.getItem(CONFIG.STORAGE_KEYS.MODEL) || CONFIG.DEFAULT_MODEL;

    if (apiStatusEl) {
      if (apiKey) {
        apiStatusEl.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>API Key Configurada</span>
        `;
      } else {
        apiStatusEl.innerHTML = `
          <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Modo Test / Simulación</span>
        `;
      }
    }

    if (apiModelEl) apiModelEl.textContent = model;
  }

  function renderCasesList() {
    const container = document.getElementById('admin-cases-list-container');
    if (!container) return;

    const cases = LawyerDriver.getSimulatedCases();
    container.innerHTML = '';

    if (cases.length === 0) {
      container.innerHTML = `
        <div class="p-4 bg-slate-950 rounded-2xl text-center text-xs text-slate-400 border border-slate-800">
          No hay casos simulados configurados. Utiliza el formulario para inyectar uno.
        </div>
      `;
      return;
    }

    cases.forEach((c, idx) => {
      const card = document.createElement('div');
      const isActive = c.active !== false;

      card.className = `p-3.5 rounded-2xl border transition space-y-2 ${isActive ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'}`;

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-bold text-slate-400">${c.id} • ${c.neighborhood}</span>
          <div class="flex items-center space-x-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}">
              ${isActive ? 'ACTIVO EN RADAR' : 'DESACTIVADO'}
            </span>
            <button class="btn-toggle-case p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition" data-index="${idx}">
              <i data-lucide="${isActive ? 'eye' : 'eye-off'}" class="w-4 h-4"></i>
            </button>
            <button class="btn-delete-case p-1 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg transition" data-index="${idx}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="text-xs font-extrabold text-white leading-snug">${c.title}</div>

        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span>Tarifa: <strong class="text-emerald-400">$${c.rateCOP.toLocaleString('es-CO')} COP</strong></span>
          <span>Modalidad: <strong class="text-white">${c.mode}</strong></span>
        </div>
      `;

      container.appendChild(card);
    });

    container.querySelectorAll('.btn-toggle-case').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        cases[idx].active = cases[idx].active === false ? true : false;
        LawyerDriver.saveSimulatedCases(cases);
        renderDashboardStats();
        renderCasesList();
      });
    });

    container.querySelectorAll('.btn-delete-case').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        cases.splice(idx, 1);
        LawyerDriver.saveSimulatedCases(cases);
        renderDashboardStats();
        renderCasesList();
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  // Formulario Inyectar Caso
  const formInject = document.getElementById('form-inject-case');

  if (formInject) {
    formInject.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('input-case-title').value.trim();
      const situation = document.getElementById('select-case-situation').value;
      const neighborhood = document.getElementById('input-case-neighborhood').value.trim();
      const rateCOP = parseInt(document.getElementById('input-case-rate').value) || 130000;
      const mode = document.getElementById('select-case-mode').value;
      const clientName = document.getElementById('input-client-name').value.trim();
      const clientPhone = document.getElementById('input-client-phone').value.trim();
      const clientPrompt = document.getElementById('input-client-prompt').value.trim();

      const cases = LawyerDriver.getSimulatedCases();
      const newCase = {
        id: `CASE-${Math.floor(100 + Math.random() * 900)}`,
        active: true,
        title: title,
        situation: situation,
        neighborhood: neighborhood,
        rateCOP: rateCOP,
        mode: mode,
        timeAgo: 'Hace instantes',
        clientName: clientName,
        clientPhone: clientPhone,
        clientPrompt: clientPrompt,
        aiSummary: `Caso inyectado en vivo desde Admin. Clasificación: ${situation}.`,
        resources: [
          { norm: 'Código Penal / Normativa', art: 'Artículos aplicables', action: 'Revisión prioritaria' },
          { norm: 'Constitución Política', art: 'Art. 29', action: 'Garantía del debido proceso' }
        ],
        resourceAdvice: 'Tomar contacto telefónico inmediato para brindar representación.'
      };

      cases.unshift(newCase);
      LawyerDriver.saveSimulatedCases(cases);

      formInject.reset();
      renderDashboardStats();
      renderCasesList();

      alert(`¡Caso #${newCase.id} inyectado con éxito! Ahora aparecerá en el radar de los abogados en tiempo real.`);
    });
  }

  // Botón Restablecer Datos
  const btnResetData = document.getElementById('btn-reset-data');
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (confirm("¿Estás seguro de restablecer todos los casos y datos de simulación en localStorage?")) {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.SIMULATED_CASES);
        LawyerDriver.getSimulatedCases(); // Vuelve a guardar defaults
        renderDashboardStats();
        renderCasesList();
        alert("Estado restablecido con éxito.");
      }
    });
  }

  renderDashboardStats();
  renderCasesList();
});
