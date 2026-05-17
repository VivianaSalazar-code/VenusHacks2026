// Holistic Nutrition Hub — Meal Tracker page.
//
// Wired to the FastAPI backend via the BackendProvider context:
//   - Today's meals + DASH plate fill come from /api/nutrition/today
//   - "Scan Barcode" opens a webcam scanner that calls /api/nutrition/barcode/{code}
//   - "Add Meal" opens the same component in Manual Entry mode
//   - The chat panel sends to /api/chat with the full user state attached
//
// The outdated food-pyramid pie charts have been replaced by the DASH
// Cardio-Plate (a 7-bucket donut). The "Cardio-Plate" tab gives it a full
// breakdown view; the "Today" tab keeps it as a compact widget.

import { useState } from "react";
import { AlertTriangle, Loader2, Plus, QrCode, RotateCcw, Send, Sparkles } from "lucide-react";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BarcodeScanner } from "./BarcodeScanner";
import { CardioPlate } from "./CardioPlate";
import { useBackend } from "../providers/BackendProvider";
import type { Meal } from "../../lib/types";

const TIPS = [
	"DASH prioritizes potassium-rich foods: a medium banana + ½ cup of white beans nets ~1100 mg.",
	"Aim for sodium under 1500 mg/day if your BP has been running high — most of it hides in bread, deli meat, and sauces.",
	"Hydration first: dehydration spikes resting heart rate. Water > electrolyte drinks unless you're sweating heavily.",
];

function formatTime(iso: string): string {
	try {
		const d = new Date(iso);
		return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
	} catch {
		return iso;
	}
}

export function MealTracker() {
	const { today, loading, error, chat, chatBusy, sendChat, resetChat, logMeal } = useBackend();

	const [scannerOpen, setScannerOpen] = useState(false);
	const [scannerMode, setScannerMode] = useState<"scan" | "manual">("scan");
	const [chatInput, setChatInput] = useState("");

	const meals: Meal[] = today?.meals ?? [];
	const totalCalories = today?.daily_nutrition.daily_calories ?? 0;
	const calorieTarget = today?.targets?.calories ?? 2000;
	const sodium = today?.daily_nutrition.daily_sodium_mg ?? 0;
	const sodiumCap = today?.targets?.sodium_mg_max ?? 2300;
	const potassium = today?.daily_nutrition.daily_potassium_mg ?? 0;

	const handleSendMessage = async () => {
		const text = chatInput.trim();
		if (!text || chatBusy) return;
		setChatInput("");
		await sendChat(text);
	};

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="font-['Montserrat'] font-bold text-[28px] text-[#172e54] mb-1">Holistic Nutrition Hub</h1>
				<p className="font-['Montserrat'] font-semibold text-[14px] text-[#9e876e] tracking-[0.42px]">
					DASH-aligned meal tracking for your cardiovascular life stage
				</p>
			</div>

			<Tabs defaultValue="today" className="mb-6">
				<TabsList className="bg-[#f3efe7] rounded-[30px] p-1.5">
					<TabsTrigger value="today" className="rounded-[20px] data-[state=active]:bg-white text-sm">
						Today
					</TabsTrigger>
					<TabsTrigger value="plate" className="rounded-[20px] data-[state=active]:bg-white text-sm">
						Cardio-Plate
					</TabsTrigger>
					<TabsTrigger value="week" className="rounded-[20px] data-[state=active]:bg-white text-sm">
						This Week
					</TabsTrigger>
				</TabsList>

				<TabsContent value="today" className="mt-4">
					<Card className="bg-gradient-to-r from-[#f79891]/20 to-[#caebfe]/20 p-4 rounded-[20px] border-2 border-[#f79891]">
						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<p className="font-['Poppins'] text-[11px] text-[#bd8e84]">Calories</p>
								<p className="font-['Montserrat'] font-bold text-[22px] text-[#172e54]">
									{totalCalories}
									<span className="text-[13px] text-[#9e876e]"> / {calorieTarget}</span>
								</p>
							</div>
							<div>
								<p className="font-['Poppins'] text-[11px] text-[#bd8e84]">Sodium</p>
								<p className={`font-['Montserrat'] font-bold text-[22px] ${sodium > sodiumCap ? "text-red-600" : "text-[#172e54]"}`}>
									{Math.round(sodium)}
									<span className="text-[13px] text-[#9e876e]"> / {sodiumCap} mg</span>
								</p>
							</div>
							<div>
								<p className="font-['Poppins'] text-[11px] text-[#bd8e84]">Potassium</p>
								<p className="font-['Montserrat'] font-bold text-[22px] text-[#172e54]">
									{Math.round(potassium)}
									<span className="text-[13px] text-[#9e876e]"> / 4700 mg</span>
								</p>
							</div>
						</div>
					</Card>
				</TabsContent>

				<TabsContent value="plate" className="mt-4">
					<Card className="bg-white p-6 rounded-[24px] border-2 border-[#f3efe7]">
						<div className="text-center mb-4">
							<h3 className="font-['Montserrat'] font-bold text-[18px] text-[#172e54]">Your DASH Plate Today</h3>
							<p className="font-['Poppins'] text-[11px] text-[#9e876e]">Each wedge fills as you log servings from that DASH category.</p>
						</div>
						<CardioPlate today={today} />
					</Card>
				</TabsContent>

				<TabsContent value="week" className="mt-4">
					<Card className="bg-white p-6 rounded-[24px] border-2 border-[#f3efe7] text-center">
						<p className="font-['Poppins'] text-sm text-[#9e876e]">Weekly trends coming soon — every meal you log today seeds this view.</p>
					</Card>
				</TabsContent>
			</Tabs>

			{error && (
				<div className="mb-4 flex items-center gap-2 p-3 rounded-[12px] bg-red-50 border border-red-200">
					<AlertTriangle size={16} className="text-red-600" />
					<p className="font-['Poppins'] text-[12px] text-red-700">
						Backend not reachable: {error}. Start it with <code className="font-mono">uvicorn main:app --reload --port 8000</code> from the
						<code className="font-mono"> backend/</code> folder.
					</p>
				</div>
			)}

			<div className="grid grid-cols-2 gap-4 items-stretch">
				<div className="space-y-4">
					<div>
						<div className="flex items-center justify-between mb-3">
							<h2 className="font-['Montserrat'] font-bold text-[20px] text-[#172e54]">Today's Meals</h2>
							<div className="flex gap-2">
								<Button
									onClick={() => {
										setScannerMode("manual");
										setScannerOpen(true);
									}}
									className="rounded-[30px] bg-[#f79891] hover:bg-[#f79891]/90 font-['Montserrat'] font-semibold text-sm px-4 py-2"
								>
									<Plus size={16} className="mr-1.5" />
									Add Meal
								</Button>
								<Button
									onClick={() => {
										setScannerMode("scan");
										setScannerOpen(true);
									}}
									variant="outline"
									className="rounded-[30px] border-2 border-[#172e54] font-['Montserrat'] font-semibold text-sm px-4 py-2"
								>
									<QrCode size={16} className="mr-1.5" />
									Scan Barcode
								</Button>
							</div>
						</div>

						<div className="space-y-3">
							{loading && (
								<Card className="bg-white p-4 rounded-[20px] border-2 border-[#f3efe7] text-center">
									<Loader2 size={20} className="animate-spin inline text-[#bd8e84]" />
								</Card>
							)}
							{!loading && meals.length === 0 && (
								<Card className="bg-white p-6 rounded-[20px] border-2 border-dashed border-[#f3efe7] text-center">
									<p className="font-['Poppins'] text-[12px] text-[#9e876e]">
										Nothing logged yet today. Scan a barcode or add a meal manually.
									</p>
								</Card>
							)}
							{meals.map((meal) => (
								<Card key={meal.id} className="bg-white p-4 rounded-[20px] border-2 border-[#f3efe7]">
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-0.5">
												<h4 className="font-['Montserrat'] font-semibold text-[15px] text-[#172e54]">{meal.name}</h4>
												<span
													className={`text-[9px] px-1.5 py-0.5 rounded-full font-['Poppins'] ${
														meal.source === "barcode"
															? "bg-green-100 text-green-700"
															: meal.source === "llm_estimate"
																? "bg-yellow-100 text-yellow-800"
																: "bg-[#f3efe7] text-[#bd8e84]"
													}`}
												>
													{meal.source === "barcode" ? "OFF" : meal.source === "llm_estimate" ? "AI est." : "manual"}
												</span>
											</div>
											<p className="font-['Poppins'] text-[10px] text-[#bd8e84] mb-2">
												{formatTime(meal.time)} · DASH: {meal.dash_bucket.replace(/_/g, " ")}
											</p>
											<div className="grid grid-cols-4 gap-3">
												<Metric label="kcal" value={Math.round(meal.nutrients.calories)} />
												<Metric label="Protein" value={`${meal.nutrients.protein_g.toFixed(0)}g`} />
												<Metric label="Na" value={`${Math.round(meal.nutrients.sodium_mg)}mg`} />
												<Metric label="K" value={`${Math.round(meal.nutrients.potassium_mg)}mg`} />
											</div>
										</div>
									</div>
								</Card>
							))}
						</div>
					</div>

					<Card className="bg-[#fffdf8] p-4 rounded-[24px] border-2 border-[#f3efe7]">
						<h3 className="font-['Montserrat'] font-bold text-[14px] text-[#172e54] mb-2 text-center">DASH Plate (live)</h3>
						<CardioPlate today={today} />
					</Card>
				</div>

				<div className="flex flex-col gap-4">
					<Card className="bg-[#f3efe7] p-4 rounded-[20px] border-0">
						<div className="flex items-center gap-2 mb-3">
							<Sparkles className="text-[#f79891]" size={18} />
							<h3 className="font-['Montserrat'] font-bold text-[16px] text-[#172e54]">DASH Quick Tips</h3>
						</div>
						<div className="space-y-2">
							{TIPS.map((tip, i) => (
								<div key={i} className="bg-white p-3 rounded-[15px]">
									<p className="font-['Poppins'] text-[11px] text-[#172e54]">{tip}</p>
								</div>
							))}
						</div>
					</Card>

					<Card className="bg-white p-4 rounded-[20px] border-2 border-[#f3efe7] flex flex-col flex-1 min-h-0">
						<div className="flex items-center justify-between mb-3">
							<h3 className="font-['Montserrat'] font-bold text-[16px] text-[#172e54]">Ask Your Advisor</h3>
							<button
								onClick={() => void resetChat()}
								className="text-[#bd8e84] hover:text-[#172e54] transition-colors"
								title="Reset conversation"
							>
								<RotateCcw size={14} />
							</button>
						</div>
						<div className="flex-1 min-h-0 overflow-y-auto mb-3 space-y-2 pr-1">
							{chat.map((msg, idx) => (
								<div
									key={idx}
									className={`p-2.5 rounded-[12px] ${
										msg.role === "assistant" ? "bg-[#f3efe7] text-[#172e54]" : "bg-[#caebfe] text-[#172e54] ml-6"
									}`}
								>
									<p className="font-['Poppins'] text-[11px] whitespace-pre-wrap leading-relaxed">{msg.text}</p>
								</div>
							))}
							{chatBusy && (
								<div className="p-2.5 rounded-[12px] bg-[#f3efe7] flex items-center gap-2">
									<Loader2 size={12} className="animate-spin text-[#bd8e84]" />
									<p className="font-['Poppins'] text-[11px] text-[#bd8e84]">Thinking…</p>
								</div>
							)}
						</div>
						<div className="flex gap-2">
							<Input
								value={chatInput}
								onChange={(e) => setChatInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										void handleSendMessage();
									}
								}}
								placeholder="e.g. What should I eat with high blood pressure?"
								className="rounded-[15px] border-2 border-[#f3efe7] font-['Poppins'] text-sm"
								disabled={chatBusy}
							/>
							<Button
								onClick={() => void handleSendMessage()}
								disabled={!chatInput.trim() || chatBusy}
								className="rounded-[15px] bg-[#172e54] hover:bg-[#172e54]/90 px-3"
							>
								<Send size={16} />
							</Button>
						</div>
					</Card>
				</div>
			</div>

			<BarcodeScanner
				key={`${scannerMode}-${scannerOpen}`}
				open={scannerOpen}
				onClose={() => setScannerOpen(false)}
				onLog={async (meal) => {
					await logMeal(meal);
				}}
			/>
		</div>
	);
}

function Metric({ label, value }: { label: string; value: number | string }) {
	return (
		<div>
			<p className="font-['Poppins'] text-[9px] text-[#9e876e]">{label}</p>
			<p className="font-['Montserrat'] font-semibold text-[12px] text-[#172e54]">{value}</p>
		</div>
	);
}
