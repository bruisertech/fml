/**
 * Dependencias: config.js (ABOGAO_CONFIG.voice), API del navegador speechSynthesis y SpeechRecognition
 * Expone:       VoiceGuide
 *
 * Abogao – Guía por voz para personas que no leen o leen con dificultad.
 *  - speak(texto): lee en voz alta.
 *  - auto: si está activo, cada pantalla se anuncia sola al abrirse ("Estás en...").
 *  - listen(): dictado por voz (si el navegador lo permite) para contar el problema hablando.
 */
const VoiceGuide = {
  auto: false,
  voice: null,
  supported: typeof window !== 'undefined' && 'speechSynthesis' in window,

  init(auto) {
    this.auto = !!auto;
    if (!this.supported) return;
    const pick = () => {
      const lang = (window.ABOGAO_CONFIG && ABOGAO_CONFIG.voice.lang) || 'es-CO';
      const voices = speechSynthesis.getVoices();
      this.voice = voices.find(v => v.lang === lang) || voices.find(v => v.lang && v.lang.startsWith('es')) || null;
    };
    pick();
    speechSynthesis.onvoiceschanged = pick;
  },

  speak(text, onEnd) {
    if (!this.supported || !text) { if (onEnd) onEnd(); return false; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\s+/g, ' '));
    u.lang = (window.ABOGAO_CONFIG && ABOGAO_CONFIG.voice.lang) || 'es-CO';
    u.rate = (window.ABOGAO_CONFIG && ABOGAO_CONFIG.voice.rate) || 0.95;
    if (this.voice) u.voice = this.voice;
    u.onend = () => { document.body.classList.remove('speaking'); if (onEnd) onEnd(); };
    document.body.classList.add('speaking');
    speechSynthesis.speak(u);
    return true;
  },

  stop() { if (this.supported) speechSynthesis.cancel(); document.body.classList.remove('speaking'); },

  get canListen() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },

  /** Dictado: devuelve el texto reconocido por callback */
  listen({ onText, onEnd, onError }) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (onError) onError('no-support'); return null; }
    const r = new SR();
    r.lang = (window.ABOGAO_CONFIG && ABOGAO_CONFIG.voice.lang) || 'es-CO';
    r.interimResults = true;
    r.onresult = e => onText && onText(Array.from(e.results).map(x => x[0].transcript).join(' '));
    r.onend = () => onEnd && onEnd();
    r.onerror = e => onError && onError(e.error);
    r.start();
    return r;
  }
};
