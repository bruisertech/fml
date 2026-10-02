/**
 * Lógica del Panel Administrativo e Inyector de Casos para Abogao
 * Controla la activación de casos simulados, creación de casos personalizados,
 * directorio de abogados registrados con verificación CSJ y mantenimiento.
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

  // RENDER DIRECTORIO DE ABOGADOS REGISTRADOS
  function renderLawyersDirectory() {
    const tableBody = document.getElementById('admin-lawyers-table-body');
    if (!tableBody) return;

    const currentProfile = LawyerDriver.getProfile();
    const expYearsCurrent = LawyerDriver.calculateExpYears(currentProfile.tpIssueDate);

    const baseList = (typeof PROFESIONALES !== 'undefined') ? PROFESIONALES : [];

    // Formatear lista combinada
    const lawyersList = [
      {
        id: 'user-active-lawyer',
        isMainProfile: true,
        name: currentProfile.name || 'Dr. Carlos Osorio',
        tpNumber: currentProfile.tpNumber || '213959',
        ccNumber: currentProfile.ccNumber || '1.144.123.456',
        tpIssueDate: currentProfile.tpIssueDate || '2015-06-15',
        expYears: expYearsCurrent || 11,
        university: currentProfile.university || 'Pontificia Universidad Javeriana',
        specialties: currentProfile.activeSpecialties || ['penal', 'transito'],
        verifiedCSJ: currentProfile.verifiedCSJ !== false
      },
      ...baseList.slice(0, 5).map(p => ({
        id: p.id,
        isMainProfile: false,
        name: p.name,
        tpNumber: (p.doc || 'DEMO-159137').replace(/[^0-9]/g, '') || '159137',
        ccNumber: '1.144.987.654',
        expYears: p.experienceYears || 12,
        university: p.university || 'Universidad del Valle',
        specialties: p.areas || ['penal'],
        verifiedCSJ: p.verificacion ? p.verificacion.tarjeta : true
      }))
    ];

    tableBody.innerHTML = '';

    lawyersList.forEach((lawyer) => {
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-950/60 transition";

      const specsBadges = lawyer.specialties.map(s => `
        <span class="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold text-[10px] border border-slate-700 capitalize">
          ${s}
        </span>
      `).join(' ');

      tr.innerHTML = `
        <td class="p-3">
          <div class="font-extrabold text-white flex items-center gap-1.5">
            <span>${lawyer.name}</span>
            ${lawyer.isMainProfile ? '<span class="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">Perfil Activo</span>' : ''}
          </div>
          <div class="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">${lawyer.university}</div>
        </td>

        <td class="p-3">
          <div class="font-mono text-emerald-400 font-bold">T.P. No. ${lawyer.tpNumber}</div>
          <div class="text-[10px] text-slate-400">C.C. ${lawyer.ccNumber}</div>
        </td>

        <td class="p-3">
          <span class="font-bold text-white">${lawyer.expYears} Años</span>
          <div class="text-[10px] text-slate-400">Ejercicio legal</div>
        </td>

        <td class="p-3">
          <div class="flex flex-wrap gap-1">
            ${specsBadges}
          </div>
        </td>

        <td class="p-3">
          <button class="btn-toggle-csj-status px-2.5 py-1 rounded-full text-[10px] font-extrabold border transition active:scale-95 flex items-center gap-1 ${lawyer.verifiedCSJ ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'}" data-id="${lawyer.id}">
            <i data-lucide="${lawyer.verifiedCSJ ? 'badge-check' : 'alert-circle'}" class="w-3.5 h-3.5"></i>
            <span>${lawyer.verifiedCSJ ? 'Verificado CSJ' : 'En Revisión'}</span>
          </button>
        </td>

        <td class="p-3 text-right">
          <a href="https://sirna.ramajudicial.gov.co/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl border border-slate-700 text-[10px] font-bold transition inline-flex items-center gap-1">
            <i data-lucide="external-link" class="w-3 h-3"></i>
            <span>Audit CSJ</span>
          </a>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll('.btn-toggle-csj-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id === 'user-active-lawyer') {
          currentProfile.verifiedCSJ = !currentProfile.verifiedCSJ;
          LawyerDriver.saveProfile(currentProfile);
          renderLawyersDirectory();
        } else {
          const target = baseList.find(p => p.id === id);
          if (target && target.verificacion) {
            target.verificacion.tarjeta = !target.verificacion.tarjeta;
            renderLawyersDirectory();
          }
        }
      });
    });

    if (window.lucide) lucide.createIcons();
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
        specKey: situation.includes('transito') ? 'transito' : (situation.includes('Familia') ? 'familia' : (situation.includes('Allanamiento') ? 'policivo' : 'penal')),
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
        renderLawyersDirectory();
        alert("Estado restablecido con éxito.");
      }
    });
  }

  renderDashboardStats();
  renderLawyersDirectory();
  renderCasesList();
});
