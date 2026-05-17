import { useState } from "react";
import { Card } from "./ui/card";
import { Calendar, Footprints, Activity, Droplets, Baby } from "lucide-react";

export function PrenatalHub() {
    // Premium Interactive states for the user to log items directly on the UI
    const [kicks, setKicks] = useState(6);
    const [waterIntake, setWaterIntake] = useState(1.8);

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fadeIn">
            {/* ─── Page Header ─── */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="font-['Montserrat'] font-bold text-[28px] text-[#172e54] mb-1">Prenatal Health Hub</h1>
                    <p className="font-['Montserrat'] font-semibold text-[14px] text-[#9e876e] tracking-[0.42px]">24 Weeks | Second Trimester</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-[40px] bg-gradient-to-r from-[#f79891] to-[#f79891] shadow-md font-['Montserrat'] font-bold text-[13px] text-[#172e54]">
                        English
                    </button>
                    <button className="px-4 py-2 rounded-[40px] bg-white border-2 border-[#f79891] font-['Montserrat'] font-bold text-[13px] text-[#172e54]">
                        Español
                    </button>
                </div>
            </div>

            {/* ─── Premium Prenatal Trackers Grid ─── */}
            <div>
                <h2 className="font-['Montserrat'] font-bold text-[16px] text-[#172e54] mb-3">Pregnancy Vitals & Trackers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Gestational Clock */}
                    <Card className="bg-[#caebfe] p-5 rounded-[30px] border-0 shadow-none">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-['Poppins'] text-[12px] text-[#bd8e84] font-medium">Gestational Age</p>
                            <Calendar className="text-[#bd8e84]" size={20} />
                        </div>
                        <p className="font-['Montserrat'] font-bold text-[26px] text-[#172e54]">Wk 24</p>
                        <p className="font-['Poppins'] text-[11px] text-[#9e876e] mt-1">112 Days to delivery countdown</p>
                    </Card>

                    {/* Active Fetal Kick Counter */}
                    <Card className="bg-white p-5 rounded-[30px] border-0 shadow-none">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-['Poppins'] text-[12px] text-[#172e54] font-medium">Fetal Movements</p>
                            <Footprints className="text-[#172e54]" size={20} />
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                            <p className="font-['Montserrat'] font-bold text-[26px] text-[#172e54]">
                                {kicks} <span className="text-[12px] font-semibold text-[#172e54]/70">kicks</span>
                            </p>
                            <button
                                onClick={() => setKicks(kicks + 1)}
                                className="bg-[#172e54] text-white text-[11px] font-['Montserrat'] font-bold px-3 py-1 rounded-full hover:bg-[#1e3d6e] transition-colors shadow-sm"
                            >
                                + Log Kick
                            </button>
                        </div>
                        <p className="font-['Poppins'] text-[11px] text-[#172e54]/60 mt-1">Daily target: 10 movements</p>
                    </Card>

                    {/* Symphysis-Fundal Height Tracking */}
                    <Card className="bg-[#caebfe] p-5 rounded-[30px] border-2 border-[#f3efe7] shadow-none">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-['Poppins'] text-[12px] text-[#bd8e84] font-medium">Fundal Height</p>
                            <Activity className="text-[#f79891]" size={20} />
                        </div>
                        <p className="font-['Montserrat'] font-bold text-[26px] text-[#172e54]">
                            24 <span className="text-[12px] font-semibold text-[#bd8e84]">cm</span>
                        </p>
                        <p className="font-['Poppins'] text-[11px] text-green-600 mt-1">Normal growth percentile range</p>
                    </Card>

                    {/* Pregnancy Hydration Tracking Module */}
                    <Card className="bg-white p-5 rounded-[30px] border-0 shadow-none">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-['Poppins'] text-[12px] text-[#172e54] font-medium">Maternal Hydration</p>
                            <Droplets className="text-blue-500" size={20} />
                        </div>
                        <div className="flex items-baseline justify-between mt-1">
                            <p className="font-['Montserrat'] font-bold text-[26px] text-[#172e54]">
                                {waterIntake.toFixed(1)} <span className="text-[12px] font-semibold text-[#172e54]/70">L</span>
                            </p>
                            <button
                                onClick={() => setWaterIntake(Math.min(waterIntake + 0.25, 5))}
                                className="bg-blue-500 text-white text-[11px] font-['Montserrat'] font-bold px-3 py-1 rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                + 250ml
                            </button>
                        </div>
                        <p className="font-['Poppins'] text-[11px] text-[#172e54]/60 mt-1">Daily Target: 3.0 Liters</p>
                    </Card>
                </div>
            </div>

            {/* ─── California Surgeon General PreMA Framework ─── */}
            <Card className="bg-white p-6 rounded-[30px] border-2 border-[#f3efe7] overflow-hidden shadow-sm">
                <div className="mb-4 flex items-start gap-3">
                    <div className="p-2 bg-[#f3efe7] rounded-full text-[#172e54]">
                        <Baby size={22} />
                    </div>
                    <div>
                        <h3 className="font-['Montserrat'] font-bold text-[18px] text-[#172e54] mb-0.5">Preconception Health Assessment</h3>
                        <p className="font-['Poppins'] text-[12px] text-[#9e876e]">
                            Bilingual questionnaire engine engineered by the Office of the California Surgeon General. Please respond thoroughly to update your
                            clinical risk indexes.
                        </p>
                    </div>
                </div>

                {/* Micro-frontend Embedded Survey Shell */}
                <div className="w-full h-[650px] rounded-2xl overflow-hidden border border-[#f3efe7] bg-[#fdfbf7] shadow-inner">
                    <iframe
                        src="https://delfinacare.github.io/preconception-medical-assessment/embed.html"
                        style={{ border: "none" }}
                        width="100%"
                        height="100%"
                        title="Preconception Medical Assessment Framework"
                    />
                </div>

                <p className="font-['Poppins'] text-[10px] text-[#9e876e]/60 mt-4 italic text-center leading-relaxed">
                    Disclaimer: Open-source diagnostics client hosted in collaboration with Delfina Care Inc. Utilizing this structural configuration does not
                    establish an alternative doctor-patient relationship or serve as a medical emergency framework.
                </p>
            </Card>
        </div>
    );
}
