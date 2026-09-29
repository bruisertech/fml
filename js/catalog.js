/**
 * Catálogo de Especialidades de Urgencia, Rutas Jurídicas y Consultorio en Colombia
 */

const CATALOG = {
  // 5 Especialidades reales de urgencia en Cali (Sin narcotráfico)
  EMERGENCY_SPECIALTIES: [
    {
      id: 'Penal',
      name: 'Penal y Capturas',
      desc: 'Detenciones, URI, Policía, allanamientos',
      icon: 'shield-alert',
      color: 'red'
    },
    {
      id: 'Tránsito',
      name: 'Tránsito y Accidentes',
      desc: 'Choques graves, patios, alcoholemia, fotomultas',
      icon: 'car',
      color: 'blue'
    },
    {
      id: 'Policía',
      name: 'Policía y Convivencia',
      desc: 'Comparendos Código de Policía, inspecciones, desalojos',
      icon: 'file-badge',
      color: 'amber'
    },
    {
      id: 'Familia',
      name: 'Familia y Violencia Doméstica',
      desc: 'Medidas de protección urgentes, Comisaría de Familia',
      icon: 'heart-handshake',
      color: 'purple'
    },
    {
      id: 'Civil',
      name: 'Civil y Arrendamientos',
      desc: 'Conflictos contractuales, desalojos, retenciones',
      icon: 'file-text',
      color: 'emerald'
    }
  ],

  // Catálogo de Rutas Jurídicas para situaciones comunes en Colombia
  LEGAL_ROUTES: [
    {
      id: 'despido_injusto',
      title: 'Despido Injustificado',
      badge: 'Laboral',
      icon: 'user-x',
      summary: 'Guía paso a paso ante la terminación unilateral del contrato de trabajo sin justa causa.',
      steps: [
        'Solicitar la carta de despido por escrito con las razones exactas expresadas por el empleador.',
        'Verificar el estado de tus aportes a seguridad social (pensiones, salud, cesantías).',
        'Calcular la liquidación de prestaciones sociales e indemnización según el Art. 64 del Código Sustantivo del Trabajo.',
        'Radicar reclamación formal o citación a conciliación ante el Ministerio del Trabajo en Cali.'
      ]
    },
    {
      id: 'accidente_transito',
      title: 'Accidente de Tránsito sin Heridos',
      badge: 'Tránsito',
      icon: 'car',
      summary: 'Protocolo inmediato ante choques simples o de solo daños en vía pública según Ley 2251 de 2022.',
      steps: [
        'Tomar fotografías y videos detallados de la posición de los vehículos y daños antes de orillarse.',
        'Retirar los vehículos de la vía para evitar comparendo por obstrucción.',
        'Diligenciar el informe de accidente o conciliar amigablemente en el sitio o centro de conciliación de tránsito.',
        'Notificar a la aseguradora en un plazo máximo de 3 días hábiles.'
      ]
    },
    {
      id: 'embargo_cuenta',
      title: 'Embargo de Cuenta de Nómina',
      badge: 'Civil / Financiero',
      icon: 'ban',
      summary: 'Inembargabilidad del salario mínimo y procedimiento para levantar embargos bancarios.',
      steps: [
        'Obtener certificación bancaria donde conste que el dinero embargado proviene exclusivamente de nómina/salario.',
        'Verificar la inembargabilidad de los primeros 5 SMMLV según el Código General del Proceso.',
        'Radicar memorial de desembolso y levantamiento de medida cautelar ante el juzgado u ordenante.',
        'Solicitar concepto o acompañamiento de un abogado experto para acelerar la liberación de fondos.'
      ]
    },
    {
      id: 'no_pago_arriendo',
      title: 'Incumplimiento / Desalojo de Arriendo',
      badge: 'Civil / Inmobiliario',
      icon: 'home',
      summary: 'Ruta legal ante la mora en el canon de arrendamiento según Ley 820 de 2003.',
      steps: [
        'Enviar notificación formal de cobro prejurídico requiriendo el pago del canon o restitución.',
        'Convocar a audiencia de conciliación extrajudicial en un centro autorizado en Cali.',
        'Si no hay acuerdo, instaurar demanda de Restitución de Inmueble Arrendado ante juez civil.',
        'Evitar desalojos de hecho o por mano propia, ya que constituyen delito penal.'
      ]
    }
  ],

  // Módulo de Consultorio Legal por periodos
  CONSULTORIO_PACKAGES: [
    {
      id: 'consultorio_7d',
      name: 'Consultorio Acompañamiento 7 Días',
      durationDays: 7,
      priceCOP: 150000,
      desc: 'Ideada para resolver un proceso express, revisión de 2 contratos y chat directo con abogado.',
      features: ['Atención Prioritaria Chat 24/7', 'Revisión de hasta 2 contratos', '1 Videollamada de seguimiento']
    },
    {
      id: 'consultorio_15d',
      name: 'Consultorio Acompañamiento 15 Días',
      durationDays: 15,
      priceCOP: 280000,
      desc: 'Acompañamiento continuo durante el trámite de un proceso administrativo o penal inicial.',
      features: ['Acompañamiento en Audiencias', 'Redacción de Tutelas y Derecho de Petición', '2 Videollamadas de seguimiento']
    },
    {
      id: 'consultorio_30d',
      name: 'Consultorio Premium 30 Días',
      durationDays: 30,
      priceCOP: 490000,
      desc: 'Protección legal integral mensual para personas naturales o pequeñas empresas en Cali.',
      features: ['Blindaje Legal Continuo', 'Representación en Diligencias', 'Videollamadas Ilimitadas previa agenda']
    }
  ]
};

if (typeof window !== 'undefined') {
  window.CATALOG = CATALOG;
}
