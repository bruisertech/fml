/**
 * Integración con la API de Google Gemini (v1beta REST API)
 * Procesa la nota de voz o texto para clasificar la urgencia y sugerir la especialidad legal.
 */

const GoogleApiTest = {
  STORAGE_KEY: 'uberlawyer_gemini_api_key',
  MODEL_KEY: 'uberlawyer_gemini_model',

  getApiKey() {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  },

  setApiKey(key) {
    localStorage.setItem(this.STORAGE_KEY, key.trim());
  },

  getModel() {
    return localStorage.getItem(this.MODEL_KEY) || 'gemini-2.5-flash';
  },

  setModel(model) {
    localStorage.setItem(this.MODEL_KEY, model);
  },

  async analyzeCaseAudioOrText({ audioBase64, textPrompt }) {
    const apiKey = this.getApiKey();
    const selectedModel = this.getModel();

    // MODO TEST / SIMULACIÓN (Si no hay API Key ingresada)
    if (!apiKey) {
      console.log("Generando clasificación simulada en Modo Test...");
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Simulación basada en palabras clave si hay texto, o aleatoria
      let specialty = "Penal";
      let summary = "Caso de posible detención o citación con carácter de urgencia. Se recomienda asesoría penal inmediata.";

      if (textPrompt) {
        const lower = textPrompt.toLowerCase();
        if (lower.includes('tránsito') || lower.includes('choque') || lower.includes('accidente') || lower.includes('carro')) {
          specialty = "Tránsito";
          summary = "Accidente o incidente vial detectado. Se sugiere especialista en Tránsito y Fotomultas.";
        } else if (lower.includes('embargo') || lower.includes('desalojo') || lower.includes('contrato')) {
          specialty = "Civil";
          summary = "Conflicto contractual o de propiedad detectado. Se sugiere especialista en Derecho Civil.";
        } else if (lower.includes('despido') || lower.includes('empresa') || lower.includes('trabajo')) {
          specialty = "Laboral";
          summary = "Asunto laboral detectado. Se sugiere especialista en Derecho Laboral.";
        }
      }

      return {
        success: true,
        isSimulation: true,
        specialty: specialty,
        urgency: "Alta",
        summary: summary
      };
    }

    // MODO REAL CON GOOGLE GEMINI REST API
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

      const systemPrompt = `
Eres un asistente legal experto de UberLawyer Cali Colombia.
Analiza la siguiente nota de voz o descripción de caso legal expresado por el cliente.
Tu tarea es clasificar el caso en UNA de las siguientes especialidades exactas: Penal, Civil, Tránsito, Narcotráfico, Laboral, Familia, Comercial, Administrativo.
Responde estrictamente en formato JSON válido con la siguiente estructura (sin Markdown ni backticks):
{
  "specialty": "Penal",
  "urgency": "Alta|Media|Baja",
  "summary": "Resumen conciso del caso en máximo 20 palabras."
}
      `;

      const contents = [];

      if (audioBase64) {
        contents.push({
          role: "user",
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                mimeType: "audio/webm",
                data: audioBase64
              }
            }
          ]
        });
      } else {
        contents.push({
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `Caso del cliente: ${textPrompt}` }
          ]
        });
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: contents })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Limpiar backticks markdown si Gemini los genera
      const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJsonStr);

      return {
        success: true,
        isSimulation: false,
        specialty: parsed.specialty || 'General',
        urgency: parsed.urgency || 'Media',
        summary: parsed.summary || 'Análisis completado exitosamente.'
      };

    } catch (err) {
      console.error("Error al conectar con la API de Google Gemini:", err);
      return {
        success: false,
        error: err.message,
        fallbackSpecialty: "Penal"
      };
    }
  }
};
