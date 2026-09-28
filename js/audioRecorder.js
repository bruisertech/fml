/**
 * AudioRecorder Module
 * Maneja la captura de audio con MediaRecorder API para notas de voz del caso.
 */

const AudioRecorder = {
  mediaRecorder: null,
  audioChunks: [],
  recordingTimerInterval: null,
  recordingSeconds: 0,
  recordedBlob: null,
  audioBase64: null,

  async startRecording(onTick, onComplete, onError) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (onError) onError("El navegador no soporta grabación de audio.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        this.recordedBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        // Convertir a base64 para envío a Google Gemini API
        const reader = new FileReader();
        reader.readAsDataURL(this.recordedBlob);
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1];
          this.audioBase64 = base64String;
          if (onComplete) onComplete(this.recordedBlob, this.audioBase64);
        };

        // Detener todos los tracks de micrófono
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.recordingSeconds = 0;

      this.recordingTimerInterval = setInterval(() => {
        this.recordingSeconds++;
        const mins = String(Math.floor(this.recordingSeconds / 60)).padStart(2, '0');
        const secs = String(this.recordingSeconds % 60).padStart(2, '0');
        if (onTick) onTick(`${mins}:${secs}`);

        // Máximo 60 segundos
        if (this.recordingSeconds >= 60) {
          this.stopRecording();
        }
      }, 1000);

    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      if (onError) onError("Permiso de micrófono denegado.");
    }
  },

  stopRecording() {
    if (this.recordingTimerInterval) {
      clearInterval(this.recordingTimerInterval);
      this.recordingTimerInterval = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  },

  playRecording() {
    if (this.recordedBlob) {
      const audioUrl = URL.createObjectURL(this.recordedBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  },

  clearRecording() {
    this.recordedBlob = null;
    this.audioBase64 = null;
    this.audioChunks = [];
    this.recordingSeconds = 0;
  }
};
