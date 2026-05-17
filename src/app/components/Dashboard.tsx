import { useState, useRef, useEffect, useCallback } from "react";
import { Heart, Scan, AlertCircle, ChevronRight, MoreHorizontal, X, Droplets, Moon, Activity, Dumbbell, TrendingUp } from "lucide-react";
import imgBearHead from "../../assets/hera/bear_head.PNG";
import imgBearHeart from "../../assets/hera/bear_heart.PNG";

// ─── Trend data ───────────────────────────────────────────────────────────────
const DATES = ["5/10", "5/11", "5/12", "5/13", "5/14", "5/15"];

const TRENDS: Record<
	string,
	{
		label: string;
		color: string;
		fill: string;
		data: number[];
		yMin: number;
		yMax: number;
		yTicks: number[];
	}
> = {
	bloodSugar: {
		label: "Blood Sugar Level Trend",
		color: "#e8796a",
		fill: "#f7b5ad",
		data: [96, 94, 93, 92, 94, 95],
		yMin: 0,
		yMax: 120,
		yTicks: [0, 30, 60, 90, 120],
	},
	sleep: {
		label: "Sleep Time Trend",
		color: "#e8796a",
		fill: "#f7b5ad",
		data: [7.2, 6.8, 7.5, 6.5, 6.9, 6.5],
		yMin: 0,
		yMax: 10,
		yTicks: [0, 2, 4, 6, 8, 10],
	},
	heartRate: {
		label: "Heart Rate Trend",
		color: "#e8796a",
		fill: "#f7b5ad",
		data: [74, 71, 73, 70, 72, 72],
		yMin: 40,
		yMax: 120,
		yTicks: [40, 60, 80, 100, 120],
	},
	exercise: { label: "Exercise Trend", color: "#7ab87a", fill: "#b5d9b5", data: [30, 38, 42, 50, 44, 45], yMin: 0, yMax: 80, yTicks: [0, 20, 40, 60, 80] },
	bloodPressure: {
		label: "Blood Pressure Trend (Systolic)",
		color: "#e8796a",
		fill: "#f7b5ad",
		data: [122, 126, 130, 128, 132, 128],
		yMin: 80,
		yMax: 160,
		yTicks: [80, 100, 120, 140, 160],
	},
	cholesterol: {
		label: "Cholesterol Levels Trend",
		color: "#7ab87a",
		fill: "#b5d9b5",
		data: [210, 205, 202, 198, 196, 195],
		yMin: 100,
		yMax: 250,
		yTicks: [100, 150, 200, 250],
	},
};

// card bg colors by id — used in both MetricCard and AreaChart
const CARD_COLORS: Record<string, { bg: string; chartColor: string; chartFill: string }> = {
	bloodSugar: { bg: "#fff8e8", chartColor: "#d4a017", chartFill: "#f5dfa0" }, // yellow
	sleep: { bg: "#fef0ee", chartColor: "#e8796a", chartFill: "#f7b5ad" }, // red
	heartRate: { bg: "#edf7ed", chartColor: "#3a8a3a", chartFill: "#b5d9b5" }, // green
	exercise: { bg: "#edf7ed", chartColor: "#3a8a3a", chartFill: "#b5d9b5" }, // green
	bloodPressure: { bg: "#fef0ee", chartColor: "#e8796a", chartFill: "#f7b5ad" }, // red
	cholesterol: { bg: "#fff8e8", chartColor: "#d4a017", chartFill: "#f5dfa0" }, // yellow
};

// ─── Area Chart — color follows selected card ─────────────────────────────────
function AreaChart({ trendKey }: { trendKey: string }) {
	const t = TRENDS[trendKey];
	const cc = CARD_COLORS[trendKey] || { chartColor: "#e8796a", chartFill: "#f7b5ad" };
	const W = 620,
		H = 175,
		pL = 36,
		pR = 20,
		pT = 10,
		pB = 28;
	const cw = W - pL - pR,
		ch = H - pT - pB,
		range = t.yMax - t.yMin || 1;
	const pts = t.data.map((v, i) => ({ x: pL + (i / (t.data.length - 1)) * cw, y: pT + ch - ((v - t.yMin) / range) * ch }));
	const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
	const areaD = `${lineD} L${pts[pts.length - 1].x.toFixed(1)},${(pT + ch).toFixed(1)} L${pts[0].x.toFixed(1)},${(pT + ch).toFixed(1)} Z`;
	const curr = t.data[t.data.length - 1],
		prev = t.data[t.data.length - 2];
	const statusLabel = Math.abs(curr - prev) < 2 ? "Stable" : curr < prev ? "Down" : "Up";
	return (
		<div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
				<div>
					<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 16, color: "#1a2f4e", margin: 0 }}>{t.label}</p>
					<p style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, color: "#9e876e", margin: 0 }}>Last 7 days analytics</p>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<span
						style={{
							padding: "4px 14px",
							borderRadius: 20,
							background: "#e8f5e8",
							color: "#3a8a3a",
							fontFamily: "Poppins,sans-serif",
							fontSize: 12,
							fontWeight: 600,
						}}
					>
						Good
					</span>
					<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, color: "#9e876e" }}>— {statusLabel}</span>
				</div>
			</div>
			<svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 185 }}>
				{t.yTicks.map((tick) => {
					const yy = pT + ch - ((tick - t.yMin) / range) * ch;
					return (
						<g key={tick}>
							<line x1={pL} y1={yy} x2={W - pR} y2={yy} stroke="#e8e0d4" strokeWidth="1" strokeDasharray="3 3" />
							<text x={pL - 4} y={yy + 3.5} textAnchor="end" fontSize="10" fill="#b0a090" fontFamily="Poppins,sans-serif">
								{tick}
							</text>
						</g>
					);
				})}
				<path d={areaD} fill={cc.chartFill} opacity="0.45" />
				<path d={lineD} fill="none" stroke={cc.chartColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
				{pts.map((p, i) => (
					<circle key={i} cx={p.x} cy={p.y} r="3.5" fill={cc.chartColor} stroke="white" strokeWidth="1.5" />
				))}
				{DATES.map((d, i) => (
					<text
						key={i}
						x={pL + (i / (DATES.length - 1)) * cw}
						y={H - 4}
						textAnchor="middle"
						fontSize="10"
						fill="#b0a090"
						fontFamily="Poppins,sans-serif"
					>
						{d}
					</text>
				))}
				<text x={W / 2} y={H + 8} textAnchor="middle" fontSize="10" fill="#b0a090" fontFamily="Poppins,sans-serif">
					...
				</text>
			</svg>
		</div>
	);
}

// ─── rPPG Processor (unchanged) ──────────────────────────────────────────────
class RPPGProcessor {
	private g: number[] = [];
	private r: number[] = [];
	private b: number[] = [];
	private readonly BUF = 180;
	addFrame(rv: number, gv: number, bv: number) {
		this.r.push(rv);
		this.g.push(gv);
		this.b.push(bv);
		if (this.g.length > this.BUF) {
			this.r.shift();
			this.g.shift();
			this.b.shift();
		}
	}
	private norm(buf: number[]) {
		const m = buf.reduce((a, b) => a + b, 0) / buf.length || 1;
		return buf.map((v) => v / m - 1);
	}
	private mav(sig: number[], w: number) {
		return sig.map((_, i) => {
			const s = sig.slice(Math.max(0, i - w + 1), i + 1);
			return s.reduce((a, b) => a + b, 0) / s.length;
		});
	}
	private bpf(sig: number[]) {
		return this.mav(sig, 5).map((v, i) => v - this.mav(sig, 25)[i]);
	}
	private peaks(sig: number[]) {
		const th = Math.max(...sig) * 0.35;
		const out: number[] = [];
		for (let i = 2; i < sig.length - 2; i++)
			if (sig[i] > th && sig[i] > sig[i - 1] && sig[i] > sig[i + 1] && (!out.length || i - out[out.length - 1] > 12)) out.push(i);
		return out;
	}
	getHR(): number | null {
		if (this.g.length < 90) return null;
		const rn = this.norm(this.r),
			gn = this.norm(this.g),
			bn = this.norm(this.b);
		const s = gn.map((g, i) => g - (rn[i] + bn[i]) / 2);
		const pk = this.peaks(this.bpf(s));
		if (pk.length < 2) return null;
		const avg =
			pk
				.slice(1)
				.map((p, i) => p - pk[i])
				.reduce((a, b) => a + b, 0) /
			(pk.length - 1);
		const bpm = Math.round((30 / avg) * 60);
		return bpm >= 45 && bpm <= 160 ? bpm : null;
	}
	getBP(hr: number): { sys: number; dia: number } | null {
		if (this.g.length < 90) return null;
		const rn = this.norm(this.r),
			gn = this.norm(this.g),
			bn = this.norm(this.b);
		const s = gn.map((g, i) => g - (rn[i] + bn[i]) / 2);
		const pk = this.peaks(this.bpf(s));
		if (pk.length < 2) return null;
		const intervals = pk.slice(1).map((p, i) => p - pk[i]);
		const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
		const hrv = Math.sqrt(intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length);
		return {
			sys: Math.min(Math.max(Math.round(110 + (hr - 70) * 0.5 - hrv * 0.8), 90), 160),
			dia: Math.min(Math.max(Math.round(70 + (hr - 70) * 0.3 - hrv * 0.4), 55), 100),
		};
	}
	reset() {
		this.g = [];
		this.r = [];
		this.b = [];
	}
}

// ─── Camera Modal (unchanged) ─────────────────────────────────────────────────
function CameraModal({ onResult, onClose }: { onResult: (hr: number, bp: { sys: number; dia: number } | null) => void; onClose: () => void }) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const proc = useRef(new RPPGProcessor());
	const animRef = useRef<number>();
	const streamRef = useRef<MediaStream>();
	const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();
	const [status, setStatus] = useState<"init" | "scanning" | "done" | "error">("init");
	const [progress, setProgress] = useState(0);
	const [liveHR, setLiveHR] = useState<number | null>(null);
	const [faceOk, setFaceOk] = useState(false);
	const [sig, setSig] = useState<number[]>([]);

	const stop = useCallback(() => {
		if (animRef.current) cancelAnimationFrame(animRef.current);
		streamRef.current?.getTracks().forEach((t) => t.stop());
	}, []);
	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 320, height: 240, frameRate: 30 } });
				streamRef.current = stream;
				if (!alive) {
					stream.getTracks().forEach((t) => t.stop());
					return;
				}
				videoRef.current!.srcObject = stream;
				await videoRef.current!.play();
				setStatus("scanning");
				const ctx = canvasRef.current!.getContext("2d")!;
				proc.current.reset();
				let frames = 0;
				const TOTAL = 600;
				const gh: number[] = [];
				const tick = () => {
					if (!alive) return;
					ctx.drawImage(videoRef.current!, 0, 0, 320, 240);
					const px = ctx.getImageData(140, 100, 40, 40).data;
					let rv = 0,
						gv = 0,
						bv = 0,
						n = 0;
					for (let i = 0; i < px.length; i += 4) {
						rv += px[i];
						gv += px[i + 1];
						bv += px[i + 2];
						n++;
					}
					rv /= n;
					gv /= n;
					bv /= n;
					setFaceOk(rv > 60 && gv > 40 && rv > bv);
					proc.current.addFrame(rv, gv, bv);
					gh.push(gv);
					if (gh.length > 80) gh.shift();
					setSig([...gh]);
					frames++;
					setProgress(Math.min(Math.round((frames / TOTAL) * 100), 100));
					const hr = proc.current.getHR();
					if (hr) setLiveHR(hr);
					if (frames >= TOTAL) {
						const fHR = proc.current.getHR();
						if (fHR) onResult(fHR, proc.current.getBP(fHR));
						stop();
						setStatus("done");
						closeTimerRef.current = setTimeout(() => onClose(), 1500);
						return;
					}
					animRef.current = requestAnimationFrame(tick);
				};
				animRef.current = requestAnimationFrame(tick);
			} catch {
				if (alive) setStatus("error");
			}
		})();
		return () => {
			alive = false;
			stop();
			if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		};
	}, [stop, onResult, onClose]);

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 50,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "rgba(0,0,0,0.6)",
				backdropFilter: "blur(4px)",
			}}
		>
			<div
				style={{
					width: 320,
					background: "#1a2030",
					borderRadius: 24,
					overflow: "hidden",
					border: "1px solid rgba(255,255,255,0.1)",
					boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
					<div>
						<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 14, color: "white", margin: 0 }}>rPPG Live Scan</p>
						<p style={{ fontFamily: "Poppins,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>
							Camera-based vitals detection
						</p>
					</div>
					<button
						onClick={() => {
							stop();
							if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
							onClose();
						}}
						style={{
							padding: 6,
							borderRadius: "50%",
							background: "rgba(255,255,255,0.1)",
							border: "none",
							cursor: "pointer",
							color: "white",
							display: "flex",
							alignItems: "center",
						}}
					>
						<X size={14} />
					</button>
				</div>
				<div style={{ position: "relative", margin: "0 16px", borderRadius: 14, overflow: "hidden", background: "black", aspectRatio: "4/3" }}>
					<video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
					<canvas ref={canvasRef} width={320} height={240} style={{ display: "none" }} />
					<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
						<div
							style={{
								width: 112,
								height: 144,
								borderRadius: "50%",
								border: `2px solid ${faceOk ? "#e8796a" : "rgba(255,255,255,0.2)"}`,
								boxShadow: faceOk ? "0 0 0 4px rgba(232,121,106,0.2)" : "none",
								transition: "all 0.3s",
							}}
						/>
					</div>
					<div
						style={{
							position: "absolute",
							top: 8,
							left: "50%",
							transform: "translateX(-50%)",
							padding: "2px 10px",
							borderRadius: 20,
							background: faceOk ? "rgba(232,121,106,0.9)" : "rgba(255,255,255,0.2)",
							fontFamily: "Poppins,sans-serif",
							fontSize: 9,
							fontWeight: 600,
							color: faceOk ? "white" : "rgba(255,255,255,0.6)",
							whiteSpace: "nowrap",
						}}
					>
						{faceOk ? "Face detected" : "Center your face"}
					</div>
				</div>
				<div style={{ margin: "8px 16px", borderRadius: 12, overflow: "hidden", background: "#12192a", height: 44 }}>
					<svg viewBox="0 0 280 44" style={{ width: "100%", height: "100%" }}>
						{sig.length > 1 &&
							(() => {
								const mn = Math.min(...sig),
									mx = Math.max(...sig),
									r = mx - mn || 1;
								const pts = sig.map((v, i) => `${(i / (sig.length - 1)) * 280},${44 - 4 - ((v - mn) / r) * 36}`).join(" ");
								return (
									<polyline
										points={pts}
										fill="none"
										stroke="#e8796a"
										strokeWidth="1.8"
										strokeLinecap="round"
										strokeLinejoin="round"
										opacity="0.8"
									/>
								);
							})()}
					</svg>
				</div>
				<div style={{ padding: "8px 20px 16px" }}>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
						<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
							{status === "done" ? "Complete ✓" : `${progress}%`}
						</span>
						{liveHR && (
							<span
								style={{
									display: "flex",
									alignItems: "center",
									gap: 4,
									fontFamily: "Montserrat,sans-serif",
									fontWeight: 700,
									fontSize: 14,
									color: "#e8796a",
								}}
							>
								<Heart size={11} className="animate-pulse" />
								{liveHR} BPM
							</span>
						)}
					</div>
					<div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
						<div
							style={{
								height: "100%",
								borderRadius: 3,
								transition: "width 0.3s",
								width: `${progress}%`,
								background: "linear-gradient(to right,#e8796a,#bd8e84)",
							}}
						/>
					</div>
					{status === "error" && (
						<p style={{ margin: "8px 0 0", fontFamily: "Poppins,sans-serif", fontSize: 10, color: "#f87171", textAlign: "center" }}>
							Camera access denied.
						</p>
					)}
					{status === "done" && (
						<p style={{ margin: "8px 0 0", fontFamily: "Poppins,sans-serif", fontSize: 10, color: "#6dbb7a", textAlign: "center" }}>
							Scan complete — closing…
						</p>
					)}
					<p style={{ margin: "8px 0 0", fontFamily: "Poppins,sans-serif", fontSize: 9, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
						Keep still · Good lighting · BP is experimental
					</p>
				</div>
			</div>
		</div>
	);
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
interface CardProps {
	id: string;
	icon: React.ReactNode;
	label: string;
	value: string;
	unit: string;
	source: string;
	ago: string;
	trendDir: "stable" | "up" | "down";
	status: "green" | "orange" | "red";
	alert?: string;
	alertGreen?: boolean;
	selected: boolean;
	onClick: () => void;
}

function MetricCard({ id, icon, label, value, unit, source, ago, trendDir, status, alert, alertGreen, selected, onClick }: CardProps) {
	const dot = status === "green" ? "#4caf50" : status === "red" ? "#e8796a" : "#ff9800";
	const arrow = trendDir === "up" ? "↑ Up" : trendDir === "down" ? "↓ Down" : "→ Stable";
	const cc = CARD_COLORS[id] || { bg: "white" };
	// text colors adapt to the card bg
	const textPrimary = "#1a2f4e";
	const textMuted = "#6b5a4e";

	return (
		<div
			onClick={onClick}
			style={{
				background: cc.bg,
				borderRadius: 14,
				padding: 16,
				cursor: "pointer",
				border: `2px solid ${selected ? "#7ab8d4" : "transparent"}`,
				boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
				transition: "border-color 0.2s",
			}}
		>
			<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<div
						style={{
							width: 32,
							height: 32,
							borderRadius: "50%",
							background: "rgba(255,255,255,0.6)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#c07060",
						}}
					>
						{icon}
					</div>
					<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 13, color: textMuted, fontWeight: 600 }}>{label}</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<div style={{ width: 9, height: 9, borderRadius: "50%", background: dot }} />
					<MoreHorizontal size={14} style={{ color: "#b0a090" }} />
				</div>
			</div>
			<div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 6 }}>
				<span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 28, color: textPrimary, lineHeight: 1 }}>{value}</span>
				<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 13, color: textMuted, fontWeight: 500 }}>{unit}</span>
			</div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
				<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: textMuted }}>Source: {source}</span>
				<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: textMuted }}>{ago}</span>
			</div>
			<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: textMuted, fontWeight: 500 }}>{arrow}</span>
			{alert && (
				<div
					style={{
						marginTop: 10,
						padding: "8px 12px",
						borderRadius: 8,
						background: "rgba(255,255,255,0.7)",
						color: alertGreen ? "#2e7d32" : "#b35a00",
						fontFamily: "Poppins,sans-serif",
						fontSize: 12,
						lineHeight: 1.5,
						fontWeight: 600,
					}}
				>
					{alert}
				</div>
			)}
		</div>
	);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
	const [selectedCard, setSelectedCard] = useState("bloodSugar");
	const [scanning, setScanning] = useState(false);
	const [vitals, setVitals] = useState({ hr: null as number | null, bpSys: null as number | null, bpDia: null as number | null });
	const [userState, setUserState] = useState<{
		user_profile: { age: number; user_name: string };
		life_stage_state: { life_stage: string };
	}>({ user_profile: { age: 34, user_name: "Josephine" }, life_stage_state: { life_stage: "expecting" } });

	useEffect(() => {
		try {
			const saved = localStorage.getItem("heartHealthUserState");
			if (saved) {
				const p = JSON.parse(saved);
				setUserState({
					user_profile: { age: p.user_profile?.age || 34, user_name: p.user_profile?.user_name || "Josephine" },
					life_stage_state: { life_stage: p.life_stage_state?.life_stage || "expecting" },
				});
			}
		} catch {}
	}, []);

	const handleScan = useCallback((hr: number, bp: { sys: number; dia: number } | null) => {
		setVitals({ hr, bpSys: bp?.sys ?? null, bpDia: bp?.dia ?? null });
		setScanning(false);
	}, []);

	const cards: CardProps[] = [
		{
			id: "bloodSugar",
			icon: <Droplets size={14} />,
			label: "Blood Sugar Level",
			value: "95",
			unit: "mg/dl",
			source: "Self Report",
			ago: "1.5 years ago",
			trendDir: "stable",
			status: "orange",
			alert: "Last checked 1.5 years ago — update your glucose screening",
			alertGreen: false,
			selected: selectedCard === "bloodSugar",
			onClick: () => setSelectedCard("bloodSugar"),
		},
		{
			id: "sleep",
			icon: <Moon size={14} />,
			label: "Sleep Time",
			value: "3",
			unit: "hours",
			source: "Luqis Watch",
			ago: "8 hours ago",
			trendDir: "down",
			status: "red",
			alert: "Sleep is significantly below the recommended pregnancy range",
			alertGreen: false,
			selected: selectedCard === "sleep",
			onClick: () => setSelectedCard("sleep"),
		},
		{
			id: "heartRate",
			icon: <Heart size={14} />,
			label: "Heart Rate",
			value: vitals.hr ? String(vitals.hr) : "72",
			unit: "bpm",
			source: "Luqis Watch",
			ago: "5 minutes ago",
			trendDir: "stable",
			status: "green",
			alertGreen: true,
			selected: selectedCard === "heartRate",
			onClick: () => setSelectedCard("heartRate"),
		},
		{
			id: "exercise",
			icon: <Dumbbell size={14} />,
			label: "Exercise",
			value: "45",
			unit: "min/day",
			source: "Luqis Watch",
			ago: "3 hours ago",
			trendDir: "up",
			status: "green",
			alertGreen: true,
			selected: selectedCard === "exercise",
			onClick: () => setSelectedCard("exercise"),
		},
		{
			id: "bloodPressure",
			icon: <Activity size={14} />,
			label: "Blood Pressure",
			value: vitals.bpSys && vitals.bpDia ? `${vitals.bpSys}/${vitals.bpDia}` : "128/85",
			unit: "mmHg",
			source: "Self Report",
			ago: "1 day ago",
			trendDir: "stable",
			status: "red",
			alert: "Blood pressure is slightly higher today — monitor closely",
			alertGreen: false,
			selected: selectedCard === "bloodPressure",
			onClick: () => setSelectedCard("bloodPressure"),
		},
		{
			id: "cholesterol",
			icon: <TrendingUp size={14} />,
			label: "Cholesterol Levels",
			value: "195",
			unit: "mg/dl",
			source: "Self Report",
			ago: "1.5 years ago",
			trendDir: "stable",
			status: "orange",
			alert: "Last checked 1.5 years ago — update your cholesterol screening",
			alertGreen: false,
			selected: selectedCard === "cholesterol",
			onClick: () => setSelectedCard("cholesterol"),
		},
	];

	const isMother = true;
	const age = userState.user_profile?.age || 34;
	let progressPercent = 35;
	if (!isMother) {
		if (age <= 25) progressPercent = 15;
		else if (age <= 50) progressPercent = 50;
		else progressPercent = 85;
	}
	const [showClinicianModal, setShowClinicianModal] = useState(false);
	const [clinicianMsg, setClinicianMsg] = useState("");
	const [msgSent, setMsgSent] = useState(false);
	return (
		<div style={{ display: "flex", flexDirection: "column", flex: 1, height: "100%", overflowY: "auto", background: "#f5f0e8" }}>
			{scanning && <CameraModal onResult={handleScan} onClose={() => setScanning(false)} />}
			{showClinicianModal && (
				<div
					onClick={() => {
						setShowClinicianModal(false);
						setMsgSent(false);
						setClinicianMsg("");
					}}
					style={{
						position: "fixed",
						inset: 0,
						zIndex: 50,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "rgba(26,47,78,0.5)",
						backdropFilter: "blur(4px)",
					}}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							width: 440,
							background: "white",
							borderRadius: 22,
							padding: "28px 26px 24px",
							boxShadow: "0 20px 60px rgba(26,47,78,0.25)",
							position: "relative",
						}}
					>
						{/* Close X */}
						<button
							onClick={() => {
								setShowClinicianModal(false);
								setMsgSent(false);
								setClinicianMsg("");
							}}
							style={{
								position: "absolute",
								top: 16,
								right: 18,
								background: "none",
								border: "none",
								cursor: "pointer",
								color: "#b0a090",
								fontSize: 20,
								lineHeight: 1,
								padding: 0,
							}}
						>
							✕
						</button>

						{/* Title */}
						<h2 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 20, color: "#1a2f4e", margin: "0 0 4px" }}>
							Contact Clinician
						</h2>
						<p style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, color: "#9e876e", margin: "0 0 20px" }}>
							Your message goes directly and securely to your care team.
						</p>

						{/* Doctor chip */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 12,
								background: "#f5f0e8",
								borderRadius: 14,
								padding: "12px 14px",
								marginBottom: 20,
							}}
						>
							<div
								style={{
									width: 40,
									height: 40,
									borderRadius: "50%",
									background: "#e8796a",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontFamily: "Montserrat,sans-serif",
									fontWeight: 700,
									fontSize: 14,
									color: "white",
									flexShrink: 0,
								}}
							>
								LT
							</div>
							<div>
								<div style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 14, color: "#1a2f4e" }}>Dr. L. Tran</div>
								<div style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "#9e876e" }}>Hoag Hospital · OB/GYN</div>
							</div>
							<div style={{ marginLeft: "auto", width: 10, height: 10, borderRadius: "50%", background: "#4caf50", border: "2px solid white" }} />
						</div>

						{/* Message field */}
						<label style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, color: "#6b5a4e", fontWeight: 600, display: "block", marginBottom: 8 }}>
							Your message
						</label>
						<textarea
							value={clinicianMsg}
							onChange={(e) => setClinicianMsg(e.target.value)}
							rows={5}
							placeholder="Hi! Can you tell us a bit more about what you’re experiencing? No concern is too small — sharing changes helps us better support your care. Feel free to describe when it started, how it feels, and anything else on your mind."
							style={{
								width: "100%",
								boxSizing: "border-box",
								border: "1.5px solid #e2c8c4",
								borderRadius: 12,
								padding: "12px 14px",
								fontFamily: "Poppins,sans-serif",
								fontSize: 13,
								color: "#1a2f4e",
								resize: "vertical",
								outline: "none",
								background: "#fdfaf8",
								lineHeight: 1.7,
							}}
							onFocus={(e) => (e.target.style.borderColor = "#e8796a")}
							onBlur={(e) => (e.target.style.borderColor = "#e2c8c4")}
						/>

						{/* Sent confirmation */}
						{msgSent && (
							<div
								style={{
									marginTop: 12,
									padding: "10px 14px",
									background: "#edf7ed",
									borderRadius: 10,
									display: "flex",
									alignItems: "center",
									gap: 8,
								}}
							>
								<span style={{ fontSize: 16 }}>✓</span>
								<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 13, color: "#2e7d32", fontWeight: 600 }}>
									Message sent — Dr. Tran's team will follow up with you shortly.
								</span>
							</div>
						)}

						{/* Buttons */}
						<div style={{ display: "flex", gap: 10, marginTop: 16 }}>
							<button
								onClick={() => {
									if (!clinicianMsg.trim()) return;
									setMsgSent(true);
									setTimeout(() => {
										setShowClinicianModal(false);
										setMsgSent(false);
										setClinicianMsg("");
									}, 2500);
								}}
								style={{
									flex: 1,
									padding: "12px 0",
									border: "none",
									borderRadius: 14,
									background: clinicianMsg.trim() ? "#c94f3d" : "#e2c8c4",
									color: "white",
									fontFamily: "Montserrat,sans-serif",
									fontWeight: 700,
									fontSize: 13,
									cursor: clinicianMsg.trim() ? "pointer" : "default",
									transition: "background 0.2s",
								}}
							>
								Send message
							</button>
							<button
								onClick={() => {
									setShowClinicianModal(false);
									setMsgSent(false);
									setClinicianMsg("");
								}}
								style={{
									padding: "12px 22px",
									border: "1.5px solid #e2c8c4",
									borderRadius: 14,
									background: "white",
									color: "#9e876e",
									fontFamily: "Montserrat,sans-serif",
									fontWeight: 600,
									fontSize: 13,
									cursor: "pointer",
								}}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
			{/* ── Top row ── */}
			<div style={{ display: "flex", flex: 1, minHeight: "106vh" }}>
				{/* ── Main content ── */}
				<div style={{ flex: 1, overflowY: "auto", padding: "20px 22px 0", minWidth: 0, background: "#f5f0e8" }}>
					{/* Header */}
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
						<div>
							<h1
								style={{
									fontFamily: "Montserrat,sans-serif",
									fontWeight: 700,
									fontSize: 28,
									color: "#1a2f4e",
									display: "flex",
									alignItems: "center",
									gap: 8,
									margin: 0,
								}}
							>
								Hello, Josephine
								<img src={imgBearHead} alt="bear" style={{ width: 36, height: 36, objectFit: "contain", mixBlendMode: "multiply" }} />
							</h1>
							<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: 14, color: "#e8796a", margin: "3px 0 0" }}>
								24 Weeks | Second Trimester
							</p>
						</div>
						<div className="flex gap-3">
							<button className="px-4 py-2 rounded-[40px] bg-gradient-to-r from-[#f79891] to-[#f79891] shadow-md font-['Montserrat'] font-bold text-[14px] text-[#172e54]">
								English
							</button>
							<button className="px-4 py-2 rounded-[40px] bg-white border-2 border-[#f79891] font-['Montserrat'] font-bold text-[14px] text-[#172e54]">
								Español
							</button>
						</div>
					</div>

					{/* 2×3 card grid */}
					<div style={{ borderRadius: 16, padding: 12, marginBottom: 4, background: "rgba(255,255,255,0.2)" }}>
						<div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
							{cards.map((c) => (
								<MetricCard key={c.id} {...c} />
							))}
						</div>
					</div>

					<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
						<button
							style={{
								fontFamily: "Poppins,sans-serif",
								fontSize: 11,
								color: "#9e876e",
								background: "none",
								border: "none",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: 2,
							}}
						>
							... <ChevronRight size={12} />
						</button>
					</div>

					{/* Trend chart */}
					<div style={{ background: "white", borderRadius: 18, padding: "18px 20px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
						<AreaChart trendKey={selectedCard} />
					</div>

					{/* Bottom row */}
					<div style={{ margin: "0 -22px", padding: "20px 22px 24px", background: "rgba(232,121,106,0.1)", borderTop: "2px solid #e8796a" }}>
						<div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: 14 }}>
							{/* rPPG — light blush */}
							<button
								onClick={() => setScanning(true)}
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									background: "#fce8e5",
									borderRadius: 18,
									padding: "18px 16px",
									border: "none",
									cursor: "pointer",
									textAlign: "left",
									boxShadow: "0 4px 16px rgba(232,121,106,0.35)",
								}}
							>
								<div>
									<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 17, color: "#b84d3a", margin: 0 }}>
										Begin rPPG
									</p>
									<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 17, color: "#b84d3a", margin: 0 }}>Scan</p>
								</div>
								<div
									style={{
										width: 52,
										height: 52,
										borderRadius: 12,
										border: "2px solid rgba(232,121,106,0.4)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "#b84d3a",
										flexShrink: 0,
									}}
								>
									<Scan size={26} />
								</div>
							</button>

							{/* Warning — deeper salmon, white text, clickable */}
							<div
								onClick={() => setShowClinicianModal(true)}
								role="button"
								style={{
									background: "rgb(201 60 64)",
									borderRadius: 18,
									padding: "16px 18px",
									border: "none",
									cursor: "pointer",
									boxShadow: "0 4px 20px rgba(180,60,40,0.4)",
								}}
							>
								<div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 10 }}>
									<AlertCircle size={15} style={{ color: "rgba(255,255,255,0.85)", flexShrink: 0, marginTop: 1 }} />
									<p
										style={{
											fontFamily: "Montserrat,sans-serif",
											fontWeight: 700,
											fontSize: 13,
											color: "white",
											margin: 0,
											lineHeight: 1.4,
										}}
									>
										IMPORTANT: If you experience any of these symptoms, seek immediate care. Don't wait for these to go away!
									</p>
								</div>
								{["headaches", "blurry vision", "changes to your blood pressure", "overall do not feel well"].map((s) => (
									<div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
										<div
											style={{
												width: 16,
												height: 16,
												borderRadius: 4,
												border: "1.5px solid rgba(255,255,255,0.5)",
												flexShrink: 0,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												background: "rgba(255,255,255,0.15)",
											}}
										>
											<div style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.85)" }} />
										</div>
										<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
											{s}
										</span>
									</div>
								))}
								<div
									style={{
										marginTop: 10,
										paddingTop: 8,
										borderTop: "1px solid rgba(255,255,255,0.2)",
										display: "flex",
										alignItems: "center",
										justifyContent: "flex-end",
										gap: 4,
									}}
								>
									<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
										Tap to contact clinician
									</span>
									<span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>→</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* ── Right panel ── */}
				<div
					style={{
						width: 275,
						flexShrink: 0,
						display: "flex",
						flexDirection: "column",
						padding: "22px 16px 12px",
						borderLeft: "1px solid #e2dbd0",
						background: "#f5f0e8",
					}}
				>
					{/* Watch */}
					<div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 12 }}>
						<div
							style={{
								width: 64,
								height: 64,
								borderRadius: 18,
								background: "#1a2f4e",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								position: "relative",
								boxShadow: "0 4px 12px rgba(26,47,78,0.3)",
								marginBottom: 6,
							}}
						>
							<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
								<rect x="8" y="2" width="12" height="24" rx="3" stroke="white" strokeWidth="1.8" />
								<circle cx="14" cy="14" r="4.5" stroke="white" strokeWidth="1.5" />
								<line x1="14" y1="11" x2="14" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
								<line x1="14" y1="14" x2="16" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
							<div
								style={{
									position: "absolute",
									top: 6,
									right: 6,
									width: 10,
									height: 10,
									borderRadius: "50%",
									background: "#4caf50",
									border: "2px solid white",
								}}
							/>
						</div>
						<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 14, color: "#1a2f4e", margin: 0 }}>Connected</p>
					</div>

					{/* Health tips */}
					<div
						style={{
							background: "white",
							borderRadius: 18,
							padding: 16,
							overflowY: "auto",
							boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
							marginBottom: 12,
						}}
					>
						<p
							style={{
								fontFamily: "Montserrat,sans-serif",
								fontWeight: 700,
								fontSize: 14,
								color: "#1a2f4e",
								lineHeight: 1.5,
								marginBottom: 10,
								marginTop: 0,
							}}
						>
							Ways to Lower Your Risk of Heart Disease: <span style={{ color: "#e8796a" }}>During Pregnancy</span>
						</p>
						{[
							"Go to your prenatal care visits. Your healthcare provider should monitor:\n· Your blood pressure\n· Symptoms you may be experiencing\n· Your baby's growth and heartbeat",
							"Bring a support person to your healthcare provider appointments.",
							"Keep a healthy weight, exercise regularly, eat healthy foods and take prenatal vitamins.",
							"If your doctor asks that you monitor your blood pressure at home, do it regularly and keep a record of your blood pressures to bring to your medical appointments.",
							"Call your healthcare provider immediately if you have headaches, blurry vision, changes to your blood pressure or overall do not feel well.",
							"Consider breastfeeding. Consult with your healthcare provider first.",
						].map((tip, i) => (
							<p
								key={i}
								style={{
									fontFamily: "Poppins,sans-serif",
									fontSize: 12,
									color: "#4a5568",
									lineHeight: 1.6,
									marginBottom: 6,
									marginTop: 0,
									whiteSpace: "pre-line",
								}}
							>
								{tip}
							</p>
						))}
					</div>

					{/* Bear */}
					<div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, userSelect: "none" }}>
						<img src={imgBearHeart} alt="bear with heart" style={{ width: 160, height: 160, objectFit: "contain", mixBlendMode: "multiply" }} />
					</div>
				</div>
			</div>

			{/* ── Timeline — navy background ── */}
			<div style={{ padding: "28px 28px 36px", background: "#1a2f4e", flexShrink: 0 }}>
				<h2
					style={{
						fontFamily: "Montserrat,sans-serif",
						fontWeight: 700,
						fontSize: 20,
						color: "white",
						marginBottom: 6,
						display: "flex",
						alignItems: "center",
						gap: 8,
					}}
				>
					<Heart size={20} style={{ color: "#e8796a" }} />
					Your Heart Health Journey by Life Stage
					<span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,0.5)", marginLeft: 8 }}>
						(age: {userState.user_profile?.age || 34} |{" "}
						{userState.life_stage_state?.life_stage === "expecting"
							? "Expecting mother"
							: userState.life_stage_state?.life_stage === "postpartum"
								? "New mother"
								: "Adult"}
						)
					</span>
				</h2>
				<p style={{ fontFamily: "Poppins,sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 32, marginTop: 0 }}>
					Scroll to explore your heart health journey across life stages
				</p>

				<div style={{ position: "relative", paddingTop: 20 }}>
					{/* Timeline base line */}
					<div
						style={{
							position: "absolute",
							top: 10,
							left: 0,
							right: 0,
							height: 4,
							background: "rgba(255,255,255,0.15)",
							borderRadius: 2,
							zIndex: 0,
						}}
					/>
					{/* Progress */}
					<div
						style={{
							position: "absolute",
							top: 10,
							left: 0,
							width: `${progressPercent}%`,
							height: 4,
							background: "linear-gradient(90deg, #e8796a, #7ab8d4)",
							borderRadius: 2,
							zIndex: 0,
							transition: "width 0.5s ease",
						}}
					/>

					<div style={{ display: "flex", gap: 16, position: "relative", zIndex: 1, alignItems: "flex-start", paddingTop: 24 }}>
						{/* Stage 1: Teens */}
						<div
							style={{
								flex: 1,
								background: "rgba(255,255,255,0.08)",
								borderRadius: 20,
								padding: 18,
								position: "relative",
								cursor: "pointer",
								border: "2px solid rgba(255,255,255,0.12)",
								opacity: 0.75,
							}}
						>
							<div
								style={{
									position: "absolute",
									top: -40,
									left: 20,
									width: 20,
									height: 20,
									borderRadius: "50%",
									background: "rgba(255,255,255,0.3)",
									border: "4px solid #1a2f4e",
									boxShadow: "0 0 0 2px rgba(255,255,255,0.2)",
									zIndex: 2,
								}}
							/>
							<div
								style={{
									width: 48,
									height: 48,
									borderRadius: 18,
									background: "rgba(255,255,255,0.12)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									marginBottom: 14,
									color: "rgba(255,255,255,0.6)",
								}}
							>
								<Activity size={22} />
							</div>
							<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>PAST STAGE</span>
							<h3
								style={{
									fontFamily: "Montserrat,sans-serif",
									fontWeight: 700,
									fontSize: 16,
									color: "rgba(255,255,255,0.7)",
									margin: "8px 0 4px 0",
								}}
							>
								Teens & Young Adults
							</h3>
							<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Ages 13-25</span>
							<p
								style={{
									fontFamily: "Poppins,sans-serif",
									fontSize: 11,
									color: "rgba(255,255,255,0.5)",
									lineHeight: 1.5,
									marginBottom: 14,
									marginTop: 8,
								}}
							>
								Building healthy habits early is key to lifelong heart health.
							</p>
							<button
								style={{
									width: "100%",
									padding: "8px 12px",
									background: "rgba(255,255,255,0.1)",
									border: "1px solid rgba(255,255,255,0.2)",
									borderRadius: 14,
									fontFamily: "Montserrat,sans-serif",
									fontSize: 11,
									fontWeight: 600,
									color: "rgba(255,255,255,0.7)",
									cursor: "pointer",
								}}
							>
								View Teen Resources →
							</button>
						</div>

						{/* Stage 2: Expecting — CURRENT */}
						<div
							style={{
								flex: 1.3,
								background: "white",
								borderRadius: 20,
								padding: 22,
								position: "relative",
								cursor: "pointer",
								border: "3px solid #e8796a",
								boxShadow: "0 8px 32px rgba(232,121,106,0.4)",
								zIndex: 2,
							}}
						>
							<div
								style={{
									position: "absolute",
									top: -44,
									left: 20,
									width: 32,
									height: 32,
									borderRadius: "50%",
									background: "#e8796a",
									border: "4px solid #1a2f4e",
									boxShadow: "0 0 0 3px #e8796a",
									zIndex: 2,
								}}
							>
								<div
									style={{
										position: "absolute",
										top: "50%",
										left: "50%",
										transform: "translate(-50%,-50%)",
										width: 10,
										height: 10,
										borderRadius: "50%",
										background: "white",
									}}
								/>
							</div>
							<div
								style={{
									position: "absolute",
									top: -44,
									left: 20,
									width: 32,
									height: 32,
									borderRadius: "50%",
									background: "transparent",
									border: "2px solid #e8796a",
									animation: "pulse 1.5s infinite",
									pointerEvents: "none",
								}}
							/>
							<div
								style={{
									width: 64,
									height: 64,
									borderRadius: 20,
									background: "#e8796a",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									marginBottom: 14,
									color: "white",
								}}
							>
								<Heart size={30} fill="white" />
							</div>
							<span
								style={{
									fontFamily: "Poppins,sans-serif",
									fontSize: 10,
									color: "#e8796a",
									fontWeight: 600,
									background: "#fef2f0",
									padding: "2px 8px",
									borderRadius: 20,
									display: "inline-block",
								}}
							>
								CURRENT STAGE
							</span>
							<h3 style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 800, fontSize: 20, color: "#1a2f4e", margin: "8px 0 4px 0" }}>
								Expecting & New Mothers
							</h3>
							<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "#e8796a" }}>Pregnancy & Postpartum</span>
							<p style={{ fontFamily: "Poppins,sans-serif", fontSize: 12, color: "#334155", lineHeight: 1.5, marginBottom: 12, marginTop: 8 }}>
								Pregnancy and postpartum periods are critical times for heart health.
							</p>
							<ul style={{ margin: "0 0 14px 0", paddingLeft: 18 }}>
								{[
									"Preeclampsia & gestational hypertension",
									"Postpartum cardiomyopathy warning signs",
									"Managing BP after delivery",
									"Nutrition while breastfeeding",
									"When to seek emergency care",
									"Long-term cardiovascular risks",
								].map((item) => (
									<li
										key={item}
										style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "#475569", marginBottom: 5, lineHeight: 1.4 }}
									>
										{item}
									</li>
								))}
							</ul>
							<button
								onClick={() => window.open("https://osg.ca.gov/maternal-health/", "_blank", "noopener,noreferrer")}
								style={{
									width: "100%",
									padding: "12px",
									background: "#e8796a",
									border: "none",
									borderRadius: 14,
									fontFamily: "Montserrat,sans-serif",
									fontSize: 13,
									fontWeight: 700,
									color: "white",
									cursor: "pointer",
								}}
							>
								View Maternal Health Guide →
							</button>
						</div>

						{/* Stage 3: Adults */}
						<div
							style={{
								flex: 1,
								background: "rgba(255,255,255,0.08)",
								borderRadius: 20,
								padding: 18,
								position: "relative",
								cursor: "pointer",
								border: "2px solid rgba(255,255,255,0.12)",
								opacity: 0.75,
							}}
						>
							<div
								style={{
									position: "absolute",
									top: -40,
									left: 20,
									width: 20,
									height: 20,
									borderRadius: "50%",
									background: "rgba(255,255,255,0.3)",
									border: "4px solid #1a2f4e",
									boxShadow: "0 0 0 2px rgba(255,255,255,0.2)",
									zIndex: 2,
								}}
							/>
							<div
								style={{
									width: 48,
									height: 48,
									borderRadius: 18,
									background: "rgba(255,255,255,0.12)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									marginBottom: 14,
									color: "rgba(255,255,255,0.6)",
								}}
							>
								<TrendingUp size={22} />
							</div>
							<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
								FUTURE STAGE
							</span>
							<h3
								style={{
									fontFamily: "Montserrat,sans-serif",
									fontWeight: 700,
									fontSize: 16,
									color: "rgba(255,255,255,0.7)",
									margin: "8px 0 4px 0",
								}}
							>
								Adults
							</h3>
							<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Ages 26-50</span>
							<p
								style={{
									fontFamily: "Poppins,sans-serif",
									fontSize: 11,
									color: "rgba(255,255,255,0.5)",
									lineHeight: 1.5,
									marginBottom: 14,
									marginTop: 8,
								}}
							>
								Prevention and early detection are crucial. Know your numbers and risk factors.
							</p>
							<button
								style={{
									width: "100%",
									padding: "8px 12px",
									background: "rgba(255,255,255,0.1)",
									border: "1px solid rgba(255,255,255,0.2)",
									borderRadius: 14,
									fontFamily: "Montserrat,sans-serif",
									fontSize: 11,
									fontWeight: 600,
									color: "rgba(255,255,255,0.7)",
									cursor: "pointer",
								}}
							>
								View Prevention Resources →
							</button>
						</div>

						{/* Stage 4: Menopause */}
						<div
							style={{
								flex: 1,
								background: "rgba(255,255,255,0.08)",
								borderRadius: 20,
								padding: 18,
								position: "relative",
								cursor: "pointer",
								border: "2px solid rgba(255,255,255,0.12)",
								opacity: 0.75,
							}}
						>
							<div
								style={{
									position: "absolute",
									top: -40,
									left: 20,
									width: 20,
									height: 20,
									borderRadius: "50%",
									background: "rgba(255,255,255,0.3)",
									border: "4px solid #1a2f4e",
									boxShadow: "0 0 0 2px rgba(255,255,255,0.2)",
									zIndex: 2,
								}}
							/>
							<div
								style={{
									width: 48,
									height: 48,
									borderRadius: 18,
									background: "rgba(255,255,255,0.12)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									marginBottom: 14,
									color: "rgba(255,255,255,0.6)",
								}}
							>
								<Moon size={22} />
							</div>
							<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
								FUTURE STAGE
							</span>
							<h3
								style={{
									fontFamily: "Montserrat,sans-serif",
									fontWeight: 700,
									fontSize: 16,
									color: "rgba(255,255,255,0.7)",
									margin: "8px 0 4px 0",
								}}
							>
								Menopause & Beyond
							</h3>
							<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Ages 50+</span>
							<p
								style={{
									fontFamily: "Poppins,sans-serif",
									fontSize: 11,
									color: "rgba(255,255,255,0.5)",
									lineHeight: 1.5,
									marginBottom: 14,
									marginTop: 8,
								}}
							>
								Heart disease risk increases after menopause. Stay informed and proactive.
							</p>
							<button
								style={{
									width: "100%",
									padding: "8px 12px",
									background: "rgba(255,255,255,0.1)",
									border: "1px solid rgba(255,255,255,0.2)",
									borderRadius: 14,
									fontFamily: "Montserrat,sans-serif",
									fontSize: 11,
									fontWeight: 600,
									color: "rgba(255,255,255,0.7)",
									cursor: "pointer",
								}}
							>
								View Menopause Guide →
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
