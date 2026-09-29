/**
 * VideoCall Module
 * Integración de salas de videollamadas cifradas P2P en vivo mediante Jitsi Meet External API.
 */

const VideoCall = {
  apiInstance: null,
  timerInterval: null,
  callSeconds: 0,

  startCall(lawyer, onEndCallback) {
    const modalEl = document.getElementById('videocall-modal');
    const containerEl = document.getElementById('jitsi-container');
    const titleEl = document.getElementById('videocall-lawyer-title');
    const timerEl = document.getElementById('call-timer');

    if (!modalEl || !containerEl) return;

    modalEl.classList.remove('hidden');
    titleEl.textContent = `Atendido por: ${lawyer.name} (${lawyer.specialty})`;

    containerEl.innerHTML = '';

    const roomName = `FindMyLawyer_Cali_${lawyer.id}_${Date.now().toString(36)}`;

    const domain = "meet.jit.si";
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: containerEl,
      userInfo: {
        displayName: 'Cliente Find My Lawyer (Cali)'
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'tileview', 'fullscreen',
          'chat', 'raisehand', 'hangup'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#000000'
      }
    };

    try {
      this.apiInstance = new JitsiMeetExternalAPI(domain, options);

      this.apiInstance.addEventListener('readyToClose', () => {
        this.endCall(onEndCallback);
      });
    } catch (err) {
      console.error("Error al inicializar Jitsi Meet:", err);
      containerEl.innerHTML = `
        <div class="flex items-center justify-center h-full text-zinc-400 text-sm">
          No se pudo cargar la llamada. Verifica tu conexión a internet.
        </div>
      `;
    }

    this.callSeconds = 0;
    if (timerEl) timerEl.textContent = '00:00';

    this.timerInterval = setInterval(() => {
      this.callSeconds++;
      const mins = String(Math.floor(this.callSeconds / 60)).padStart(2, '0');
      const secs = String(this.callSeconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  },

  endCall(onEndCallback) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (this.apiInstance) {
      this.apiInstance.dispose();
      this.apiInstance = null;
    }

    const modalEl = document.getElementById('videocall-modal');
    if (modalEl) modalEl.classList.add('hidden');

    if (onEndCallback) onEndCallback();
  }
};
