import { Heart, Activity, TrendingUp, Apple } from "lucide-react";
import { Card } from "./ui/card";
import { useBackend } from "../providers/BackendProvider";
import imgUntitled from "../../imports/Heart/f8e5ef285b2d64c2c20ac445853acd3b679749e8.png";

function bpStatus(sys: number, dia: number): { label: string; tone: string } {
  // ACOG postpartum thresholds: >=140/90 severe, >=130/80 elevated.
  if (sys >= 140 || dia >= 90) return { label: "Severe — Call OB", tone: "text-red-700" };
  if (sys >= 130 || dia >= 80) return { label: "Elevated — Monitor", tone: "text-amber-700" };
  return { label: "Optimal Range", tone: "text-green-600" };
}

function hrStatus(hr: number): string {
  if (hr < 50) return "Low";
  if (hr > 100) return "Elevated";
  return "Normal";
}

export function Dashboard() {
  const { state, today, language, setLanguage } = useBackend();

  const sys = state?.biometrics.sys_bp ?? 0;
  const dia = state?.biometrics.dia_bp ?? 0;
  const hr = state?.biometrics.current_hr ?? 0;
  const calories = today?.daily_nutrition.daily_calories ?? state?.daily_nutrition.daily_calories ?? 0;
  const calorieTarget = today?.targets?.calories ?? 2000;
  const bp = bpStatus(sys, dia);

  const lifeStage = state?.life_stage_state.life_stage ?? "adult";
  const weeksPostpartum = state?.life_stage_state.weeks_postpartum ?? 0;
  const headerSubtitle =
    lifeStage === "postpartum"
      ? `${weeksPostpartum} weeks postpartum`
      : lifeStage === "expecting"
      ? "Pregnancy — adapted DASH"
      : lifeStage === "menopause"
      ? "Menopause — cardio focus"
      : lifeStage === "teen"
      ? "Teen — heart-healthy foundations"
      : "Adult — DASH baseline";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-['Montserrat'] font-bold text-[28px] text-[#172e54] mb-1">
              Heart Health Dashboard
            </h1>
            <p className="font-['Montserrat'] font-semibold text-[14px] text-[#9e876e] tracking-[0.42px]">
              {headerSubtitle}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 rounded-[40px] font-['Montserrat'] font-bold text-[13px] text-[#172e54] tracking-[0.39px] ${
                language === "en"
                  ? "bg-gradient-to-r from-[#f79891] to-[#f79891] shadow-lg"
                  : "bg-white border-2 border-[#f79891]"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={`px-4 py-2 rounded-[40px] font-['Montserrat'] font-bold text-[13px] text-[#172e54] tracking-[0.39px] ${
                language === "es"
                  ? "bg-gradient-to-r from-[#f79891] to-[#f79891] shadow-lg"
                  : "bg-white border-2 border-[#f79891]"
              }`}
            >
              Español
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#f3efe7] p-4 rounded-[30px] border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-['Poppins'] text-[12px] text-[#bd8e84] mb-1">Heart Rate</p>
              <p className="font-['Montserrat'] font-bold text-[24px] text-[#172e54]">{hr} BPM</p>
              <p className="font-['Poppins'] text-[11px] text-[#9e876e]">{hrStatus(hr)}</p>
            </div>
            <Heart className="text-[#f79891]" size={28} />
          </div>
        </Card>

        <Card className="bg-[#caebfe] p-4 rounded-[30px] border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-['Poppins'] text-[12px] text-[#172e54] mb-1">Calories Today</p>
              <p className="font-['Montserrat'] font-bold text-[24px] text-[#172e54]">
                {calories.toLocaleString()}
              </p>
              <p className="font-['Poppins'] text-[11px] text-[#9e876e]">Goal: {calorieTarget}</p>
            </div>
            <Activity className="text-[#172e54]" size={28} />
          </div>
        </Card>

        <Card className="bg-white p-4 rounded-[30px] border-2 border-[#f3efe7]">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-['Poppins'] text-[12px] text-[#bd8e84] mb-1">Watch Status</p>
              <p className="font-['Montserrat'] font-bold text-[16px] text-[#172e54]">Connected</p>
              <img src={imgUntitled} alt="Watch" className="w-[40px] h-[40px] mt-1" />
            </div>
          </div>
        </Card>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-[#f3efe7] p-5 rounded-[30px] border-0">
          <h3 className="font-['Montserrat'] font-bold text-[18px] text-[#172e54] mb-3">
            Blood Pressure
          </h3>
          <div className="space-y-3">
            <div>
              <p className="font-['Poppins'] text-[11px] text-[#bd8e84] mb-0.5">Systolic</p>
              <p className="font-['Montserrat'] font-bold text-[22px] text-[#172e54]">{sys} mmHg</p>
            </div>
            <div>
              <p className="font-['Poppins'] text-[11px] text-[#bd8e84] mb-0.5">Diastolic</p>
              <p className="font-['Montserrat'] font-bold text-[22px] text-[#172e54]">{dia} mmHg</p>
            </div>
            <p className={`font-['Poppins'] text-[11px] ${bp.tone}`}>{bp.label}</p>
          </div>
        </Card>

        <Card className="bg-[#caebfe] p-5 rounded-[30px] border-0">
          <h3 className="font-['Montserrat'] font-bold text-[18px] text-[#172e54] mb-3">
            Weekly Activity
          </h3>
          <div className="space-y-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
              <div key={day} className="flex items-center gap-2">
                <span className="font-['Poppins'] text-[11px] text-[#172e54] w-10">{day}</span>
                <div className="flex-1 h-4 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#172e54] rounded-full"
                    style={{ width: `${Math.random() * 60 + 40}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white p-4 rounded-[30px] border-2 border-[#f3efe7] hover:border-[#bd8e84] transition-colors cursor-pointer">
          <div className="flex flex-col items-center text-center">
            <Apple className="text-[#f79891] mb-3" size={36} />
            <h4 className="font-['Montserrat'] font-semibold text-[14px] text-[#172e54] mb-1">
              Track Meal
            </h4>
            <p className="font-['Poppins'] text-[11px] text-[#9e876e]">
              Log your meals and calories
            </p>
          </div>
        </Card>

        <Card className="bg-white p-4 rounded-[30px] border-2 border-[#f3efe7] hover:border-[#bd8e84] transition-colors cursor-pointer">
          <div className="flex flex-col items-center text-center">
            <TrendingUp className="text-[#caebfe] mb-3" size={36} />
            <h4 className="font-['Montserrat'] font-semibold text-[14px] text-[#172e54] mb-1">
              View Trends
            </h4>
            <p className="font-['Poppins'] text-[11px] text-[#9e876e]">
              Analyze your health data
            </p>
          </div>
        </Card>

        <Card className="bg-white p-4 rounded-[30px] border-2 border-[#f3efe7] hover:border-[#bd8e84] transition-colors cursor-pointer">
          <div className="flex flex-col items-center text-center">
            <Heart className="text-[#f79891] mb-3" size={36} />
            <h4 className="font-['Montserrat'] font-semibold text-[14px] text-[#172e54] mb-1">
              Health Tips
            </h4>
            <p className="font-['Poppins'] text-[11px] text-[#9e876e]">
              Get personalized advice
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
