// src/components/hera/PrenatalHub.tsx
import { useState } from "react";
import { Card } from "@/components/ui/card"; // Adjusted path to match your alias syntax
import { Calendar, Footprints, Activity, Droplets, Baby } from "lucide-react";

export function PrenatalHub() {
    const [kicks, setKicks] = useState(6);
    const [waterIntake, setWaterIntake] = useState(1.8);

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="font-['Montserrat'] font-bold text-[28px] text-[#172e54] mb-1">Prenatal Health Hub</h1>
                <p className="font-['Montserrat'] font-semibold text-[14px] text-[#9e876e] tracking-[0.42px]">24 Weeks | Second Trimester</p>
            </div>

            {/* Pregnancy Health Trackers */}
            <div>
                <h2 className="font-['Montserrat'] font-bold text-[16px] text-[#172e54] mb-3">Pregnancy Health Trackers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Gestational Age Card */}
                    <Card className="bg-[#f3efe7] p-4 rounded-[24px] border-0 shadow-none">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-['Poppins'] text-[11px] text-[#9e876e]">Gestational Age</p>
                            <Calendar className="text-[#bd8e84]" size={16} />
                        </div>
                        <p className="font-['Montserrat'] font-bold text-[22px] text-[#172e54]">Wk 24</p>
                        <p className="font-['Poppins'] text-[10px] text-[#9e876e] mt-1">112 Days to delivery</p>
                    </Card>

                    {/* Kick Counter Card */}
                    <Card className="bg-[#caebfe] p-4 rounded-[24px] border-0 shadow-none">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-['Poppins'] text-[11px] text-[#172e54]">Fetal Movement</p>
                            <Footprints className="text-[#172e54]" size={16} />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <p className="font-['Montserrat'] font-bold text-[22px] text-[#172e54]">{kicks} <span className="text-[11px] font-normal">kicks</span></p>
                            <button onClick={() => setKicks(kicks + 1)} className="bg-[#172e54] text-white text-[10px] px-2 py-0.5 rounded-full hover:bg-[#1e3d6e] transition-colors">+ Log</button>
                        </div>
                        <p className="font-['Poppins'] text-[10px] text-[#172e54]/70 mt-1">Target: 10 movements/2hr</p>
                    </Card>

                    {/* Fundal Height Metric */}
                    <Card className="bg-white p-4 rounded-[24px] border-2 border-[#f3efe7] shadow-none">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-['Poppins'] text-[11px] text-[#9e876e]">Fundal Height</p>
                            <Activity className="text-[#f79891]" size={16} />
                        </div>
                        <p className="font-['Montserrat'] font-bold text-[22px] text-[#172e54]">24 <span className="text-[11px] font-normal">cm</span></p>
                        <p className="font-['Poppins'] text-[10px] text-green-600 mt-1">Perfect size alignment</p>
                    </Card>

                    {/* Hydration Tracker */}
                    <Card className="bg-[#caebfe]/40 p-4 rounded-[24px] border-0 shadow-none">
                        <div className="flex justify-between items-start mb-2">
                            <p className="font-['Poppins'] text-[11px] text-[#172e54]">Prenatal Hydration</p>
                            <Droplets className="text-blue-500" size={16} />
                        </div>
                        <div className="flex items-baseline justify-between">
                            <p className="font-['Montserrat'] font-bold text-[22px] text-[#172e54]">{waterIntake.toFixed(1)} <span className="text-[11px] font-normal">L</span></p>
                            <button onClick={() => setWaterIntake(Math.min(waterIntake + 0.2, 4))} className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full hover:bg-blue-600 transition-colors">+200ml</button>
                        </div>
                        <p className="font-['Poppins'] text-[10px] text-[#172e54]/70 mt-1">Target: 3.0 Liters daily</p>
                    </Card>
                </div>
            </div>

            {/* Delfina Clinical Survey Card */}
            <Card className="bg-white p-6 rounded-[30px] border-2 border-[#f3efe7] overflow-hidden shadow-sm">
                <div className="mb-4 flex items-start gap-2.5">
                    <Baby className="text-[#f79891] mt-0.5" size={20} />
                    <div>
                        <h3 className="font-['Montserrat'] font-bold text-[18px] text-[#172e54] mb-1">Preconception & Prenatal Clinical Screening</h3>
                        <p className="font-['Poppins'] text-[12px] text-[#9e876e]">Interactive clinical assessment engine developed by the Office of the California Surgeon General.</p>
                    </div>
                </div>
                <div className="w-full h-[650px] rounded-2xl overflow-hidden border border-[#f3efe7] bg-[#fdfbf7]">
                    <iframe src="https://delfinacare.github.io/preconception-medical-assessment/embed.html" style={{ border: 'none' }} width="100%" height="100%" title="Preconception Medical Assessment Quiz" />
                </div>
            </Card>
        </div>
    );
}