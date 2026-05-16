import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "es";

type Dict = Record<string, { en: string; es: string }>;

export const dict: Dict = {
  appName: { en: "HeraHealth", es: "HeraHealth" },
  dashboard: { en: "Dashboard", es: "Panel" },
  mealTracker: { en: "Meal Tracker", es: "Comidas" },
  resources: { en: "Resources", es: "Recursos" },
  report: { en: "Export Report", es: "Exportar Informe" },
  settings: { en: "Settings", es: "Configuración" },
  dashboardTitle: { en: "Heart Health Dashboard", es: "Panel de Salud Cardíaca" },
  trimester: { en: "24 Weeks | Second Trimester", es: "24 Semanas | Segundo Trimestre" },
  heartRate: { en: "Heart Rate", es: "Ritmo Cardíaco" },
  bloodPressure: { en: "Blood Pressure", es: "Presión Arterial" },
  bloodSugar: { en: "Blood Sugar", es: "Azúcar en Sangre" },
  cholesterol: { en: "Cholesterol", es: "Colesterol" },
  steps: { en: "Steps Today", es: "Pasos Hoy" },
  oxygen: { en: "Oxygen Sat.", es: "Saturación O₂" },
  normal: { en: "Normal", es: "Normal" },
  optimal: { en: "Optimal", es: "Óptimo" },
  watchConnected: { en: "Watch connected", es: "Reloj conectado" },
  watchDisconnected: { en: "Watch disconnected", es: "Reloj desconectado" },
  lastSync: { en: "Last sync", es: "Última sinc." },
  trendsFor: { en: "Trends for", es: "Tendencias de" },
  selectMetric: { en: "Click a card above to see its long-term trend.", es: "Toca una tarjeta arriba para ver su tendencia." },
  warning: { en: "Health Alert", es: "Alerta de Salud" },
  dangerDetected: { en: "Dangerous activity detected", es: "Actividad peligrosa detectada" },
  dangerBody: {
    en: "We've detected symptoms that may require urgent attention: elevated blood pressure, chest tightness, and unusual heart rhythm. Please connect with a provider right away.",
    es: "Detectamos síntomas que pueden requerir atención urgente: presión alta, opresión en el pecho y ritmo cardíaco inusual. Conéctate con un proveedor de inmediato.",
  },
  bookInPerson: { en: "Book In-Person Visit", es: "Cita Presencial" },
  bookVirtual: { en: "Book Video Visit", es: "Cita por Video" },
  dismiss: { en: "Dismiss", es: "Descartar" },
  daysSince: { en: "days since last check", es: "días desde la última medición" },
  maternalDesert: { en: "U.S. Maternal Care Deserts", es: "Desiertos de Atención Maternal en EE.UU." },
  mapNote: {
    en: "Counties shaded red have limited or no maternity care access.",
    es: "Los condados en rojo tienen acceso limitado o nulo a atención materna.",
  },
  blog: { en: "From the CA Surgeon General", es: "De la Cirujana General de CA" },
  exportPdf: { en: "Export PDF Report", es: "Exportar PDF" },
  reportTitle: { en: "Longitudinal Health Report", es: "Informe Longitudinal de Salud" },
  reportSubtitle: {
    en: "A continuity-of-care summary for any provider.",
    es: "Resumen de continuidad de cuidados para cualquier proveedor.",
  },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof typeof dict) => string;
}

const I18nCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => dict[k]?.en ?? String(k) });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (k: keyof typeof dict) => dict[k]?.[lang] ?? String(k);
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
