/**
 * Configuración Global de la Aplicación Abogao
 * Constantes para Cali, Colombia y configuración del sistema
 */

const CONFIG = {
  CITY: 'Cali, Colombia',
  CALI_COORDS: {
    lat: 3.4516,
    lng: -76.5320
  },
  DEFAULT_ZOOM: 14,
  EMERGENCY_PHONE: '123',
  STORAGE_KEYS: {
    API_KEY: 'abogao_gemini_api_key',
    MODEL: 'abogao_gemini_model',
    ORDERS: 'abogao_user_orders'
  },
  DEFAULT_MODEL: 'gemini-2.5-flash',
  BASE_RATES: {
    EXPRESS_VIDEO: 95000,
    PHYSICAL_DISPATCH: 180000
  }
};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
