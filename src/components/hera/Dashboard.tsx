import { useMemo, useState } from "react";
import { Heart, Activity, Droplets, Wind, Footprints, FlaskConical, AlertTriangle, Wifi, WifiOff, X, Video, CalendarDays, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import { useI18n } from "./i18n";
import maternalMap from "@/assets/hera/maternal-care-deserts.svg";

type MetricId = "heartRate" | "bloodPressure" | "bloodSugar" | "cholesterol" | "steps" | "oxygen";

interface Metric {
  id: MetricId;
  labelKey: "heartRate" | "bloodPressure" | "bloodSugar" | "cholesterol" | "steps" | "oxygen";
  value: string;
  unit: string;
  status: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: "rose" | "sky" | "cream";
  /** days since last manual reading (null = continuous) */
  daysSince: number | null;
  series: { d: string; v: number }[];
}

function genSeries(base: number, spread: number, n = 30) {
  return Array.from({ length: n }, (_, i) => ({
    d: `D${i + 1}`,
    v: Math.round((base + Math.sin(i / 3) * spread + (Math.random() - 0.5) * spread) * 10) / 10,
  }));
}

const TONE = {
  rose: { bg: "bg-[#fbe2dd]", icon: "text-[#f06a5f]", chart: "#f06a5f" },
  sky: { bg: "bg-[#cfeafe]", icon: "text-[#1f5f8a]", chart: "#1f5f8a" },
  cream: { bg: "bg-[#f3efe7]", icon: "text-[#9e6b4a]", chart: "#9e6b4a" },
} as const;

export function Dashboard() {
  const { t, lang, setLang } = useI18n();
  const [selected, setSelected] = useState<MetricId>("heartRate");
  const [watchConnected, setWatchConnected] = useState(true);
  const [dangerAck, setDangerAck] = useState(false);

  // Boolean flag — would be driven by backend in production
  const dangerousActivity = true;
  const showDanger = dangerousActivity && !dangerAck;

  const metrics: Metric[] = useMemo(
    () => [
      { id: "heartRate", labelKey: "heartRate", value: "72", unit: "BPM", status: t("normal"), icon: Heart, tone: "rose", daysSince: null, series: genSeries(74, 6) },
      { id: "bloodPressure", labelKey: "bloodPressure", value: "118/76", unit: "mmHg", status: t("optimal"), icon: Activity, tone: "sky", daysSince: null, series: genSeries(118, 4) },
      { id: "bloodSugar", labelKey: "bloodSugar", value: "94", unit: "mg/dL", status: t("normal"), icon: Droplets, tone: "cream", daysSince: 12, series: genSeries(96, 8) },
      { id: "cholesterol", labelKey: "cholesterol", value: "182", unit: "mg/dL", status: t("normal"), icon: FlaskConical, tone: "cream", daysSince: 47, series: genSeries(180, 10) },
      { id: "steps", labelKey: "steps", value: "8,456", unit: "steps", status: "Goal 10,000", icon: Footprints, tone: "sky", daysSince: null, series: genSeries(7800, 1200) },
      { id: "oxygen", labelKey: "oxygen", value: "98", unit: "%", status: t("optimal"), icon: Wind, tone: "rose", daysSince: null, series: genSeries(98, 1.2) },
    ],
    [t],
  );

  const active = metrics.find((m) => m.id === selected)!;
  const ToneIcon = active.icon;

  return (
    <div className="p-6 pb-40 min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-['Montserrat'] font-bold text-[28px] text-[#172e54] mb-1">
            {t("dashboardTitle")}
          </h1>
          <p className="font-['Montserrat'] font-semibold text-[14px] text-[#9e876e] tracking-[0.42px]">
            {t("trimester")}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-[#f79891]/40 rounded-full p-1">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-1.5 rounded-full font-['Montserrat'] font-bold text-[13px] tracking-[0.39px] transition-colors ${
                lang === l ? "bg-[#f79891] text-[#172e54]" : "text-[#bd8e84]"
              }`}
            >
              {l === "en" ? "English" : "Español"}
            </button>
          ))}
        </div>
      </div>

      {/* 2x3 Metric Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {metrics.map((m) => {
          const tone = TONE[m.tone];
          const Icon = m.icon;
          const isActive = m.id === selected;
          const overdue = m.daysSince !== null && m.daysSince > 30;
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`text-left transition-all ${isActive ? "scale-[1.02]" : "hover:scale-[1.01]"}`}
            >
              <Card
                className={`${tone.bg} p-5 rounded-[28px] border-2 transition-colors ${
                  isActive ? "border-[#172e54]" : "border-transparent"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-['Poppins'] font-medium text-[14px] text-[#172e54]/80">
                    {t(m.labelKey)}
                  </p>
                  <Icon className={tone.icon} size={26} />
                </div>
                <p className="font-['Montserrat'] font-bold text-[30px] text-[#172e54] leading-tight">
                  {m.value} <span className="text-[15px] font-semibold text-[#172e54]/60">{m.unit}</span>
                </p>
                <p className="font-['Poppins'] text-[13px] text-[#172e54]/70 mt-1">{m.status}</p>
                {m.daysSince !== null && (
                  <div className="mt-3 h-1.5 w-full rounded-full bg-white/70 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${overdue ? "bg-[#f06a5f]" : "bg-[#172e54]/60"}`}
                      style={{ width: `${Math.min(100, (m.daysSince / 60) * 100)}%` }}
                    />
                  </div>
                )}
                {m.daysSince !== null && (
                  <p
                    className={`font-['Poppins'] text-[12px] mt-1.5 ${
                      overdue ? "text-[#c63b30] font-semibold" : "text-[#172e54]/60"
                    }`}
                  >
                    {m.daysSince} {t("daysSince")}
                  </p>
                )}
              </Card>
            </button>
          );
        })}
      </div>

      {/* Trend Panel */}
      <Card className="bg-white p-5 rounded-[28px] border-2 border-[#f3efe7] mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ToneIcon className={TONE[active.tone].icon} size={20} />
          <h3 className="font-['Montserrat'] font-bold text-[18px] text-[#172e54]">
            {t("trendsFor")} {t(active.labelKey)}
          </h3>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={active.series} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={TONE[active.tone].chart} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={TONE[active.tone].chart} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f3efe7" strokeDasharray="4 4" />
              <XAxis dataKey="d" stroke="#bd8e84" tick={{ fontSize: 11 }} />
              <YAxis stroke="#bd8e84" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#fffdf8",
                  border: "1px solid #f3efe7",
                  borderRadius: 12,
                  fontFamily: "Poppins",
                }}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={TONE[active.tone].chart}
                strokeWidth={2.5}
                fill="url(#g)"
              />
              <Line type="monotone" dataKey="v" stroke={TONE[active.tone].chart} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="font-['Poppins'] text-[12px] text-[#9e876e] mt-2">{t("selectMetric")}</p>
      </Card>

      {/* Map + Blog */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-[#f3efe7] p-5 rounded-[28px] border-0 overflow-hidden">
          <h3 className="font-['Montserrat'] font-bold text-[17px] text-[#172e54] mb-2">
            {t("maternalDesert")}
          </h3>
          <img
            src={maternalMap}
            alt="U.S. maternal care deserts map"
            className="w-full h-[220px] object-contain"
          />
          <p className="font-['Poppins'] text-[12px] text-[#9e876e] mt-2">{t("mapNote")}</p>
        </Card>
        <Card className="bg-white p-5 rounded-[28px] border-2 border-[#f3efe7]">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="text-[#172e54]" size={20} />
            <h3 className="font-['Montserrat'] font-bold text-[17px] text-[#172e54]">
              {t("blog")}
            </h3>
          </div>
          <ul className="space-y-3">
            {[
              {
                t: "One Small Thing: Healing Hidden Wounds",
                src: "osg.ca.gov/one-small-thing",
                href: "https://osg.ca.gov/one-small-thing/",
              },
              {
                t: "Roadmap for Resilience: Toxic Stress & Health",
                src: "osg.ca.gov",
                href: "https://osg.ca.gov/",
              },
              {
                t: "Strategic Priorities for a Healthier CA",
                src: "osg.ca.gov/strategic-priorities",
                href: "https://osg.ca.gov/strategic-priorities/",
              },
            ].map((b) => (
              <li key={b.t}>
                <a
                  href={b.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded-2xl bg-[#f3efe7]/60 hover:bg-[#f3efe7] transition-colors"
                >
                  <p className="font-['Montserrat'] font-semibold text-[14px] text-[#172e54] leading-snug">
                    {b.t}
                  </p>
                  <p className="font-['Poppins'] text-[11px] text-[#9e876e] mt-0.5">{b.src}</p>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Fixed Warning Footer */}
      <div className="fixed bottom-0 left-[260px] right-0 z-30 border-t border-[#f79891]/40 bg-gradient-to-r from-[#fbe2dd] via-[#fff5f3] to-[#fbe2dd] backdrop-blur px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f06a5f]/15 flex items-center justify-center">
              <AlertTriangle className="text-[#c63b30]" size={18} />
            </div>
            <div>
              <p className="font-['Montserrat'] font-bold text-[13px] text-[#172e54]">
                {t("warning")}
              </p>
              <p className="font-['Poppins'] text-[12px] text-[#172e54]/75">
                {dangerousActivity
                  ? t("dangerDetected")
                  : lang === "en"
                  ? "All vitals within range."
                  : "Todos los signos vitales en rango."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setWatchConnected((s) => !s)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#bd8e84]/30"
            aria-label="toggle watch connection"
          >
            {watchConnected ? (
              <Wifi className="text-green-600" size={14} />
            ) : (
              <WifiOff className="text-[#c63b30]" size={14} />
            )}
            <span className="font-['Poppins'] text-[12px] text-[#172e54]">
              {watchConnected ? t("watchConnected") : t("watchDisconnected")}
            </span>
            <span className="font-['Poppins'] text-[10px] text-[#9e876e]">· {t("lastSync")} 2m</span>
          </button>
        </div>
      </div>

      {/* Dangerous-activity Modal */}
      <Dialog open={showDanger} onOpenChange={(o) => !o && setDangerAck(true)}>
        <DialogContent className="rounded-3xl border-2 border-[#f06a5f]/40">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-[#f06a5f]/15 flex items-center justify-center mb-2">
              <AlertTriangle className="text-[#c63b30]" size={24} />
            </div>
            <DialogTitle className="font-['Montserrat'] text-[#172e54]">
              {t("dangerDetected")}
            </DialogTitle>
            <DialogDescription className="font-['Poppins'] text-[#172e54]/80">
              {t("dangerBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDangerAck(true)}
              className="rounded-full"
            >
              <X size={16} /> {t("dismiss")}
            </Button>
            <Button
              onClick={() => setDangerAck(true)}
              className="rounded-full bg-[#cfeafe] text-[#172e54] hover:bg-[#b9def8]"
            >
              <Video size={16} /> {t("bookVirtual")}
            </Button>
            <Button
              onClick={() => setDangerAck(true)}
              className="rounded-full bg-[#f79891] text-[#172e54] hover:bg-[#f5867e]"
            >
              <CalendarDays size={16} /> {t("bookInPerson")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
