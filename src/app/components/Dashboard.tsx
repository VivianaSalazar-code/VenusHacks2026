import { useState, useRef, useEffect, useCallback } from "react";
import { Heart, Scan, AlertCircle, ChevronRight, MoreHorizontal, X, Droplets, Moon, Activity, Dumbbell, TrendingUp } from "lucide-react";

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

// ─── Area Chart ───────────────────────────────────────────────────────────────
function AreaChart({ trendKey }: { trendKey: string }) {
	const t = TRENDS[trendKey];
	const W = 620,
		H = 175,
		pL = 36,
		pR = 20,
		pT = 10,
		pB = 28;
	const cw = W - pL - pR,
		ch = H - pT - pB,
		range = t.yMax - t.yMin || 1;

	const pts = t.data.map((v, i) => ({
		x: pL + (i / (t.data.length - 1)) * cw,
		y: pT + ch - ((v - t.yMin) / range) * ch,
	}));
	const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
	const areaD = `${lineD} L${pts[pts.length - 1].x.toFixed(1)},${(pT + ch).toFixed(1)} L${pts[0].x.toFixed(1)},${(pT + ch).toFixed(1)} Z`;
	const curr = t.data[t.data.length - 1],
		prev = t.data[t.data.length - 2];
	const statusLabel = Math.abs(curr - prev) < 2 ? "Stable" : curr < prev ? "Down" : "Up";

	return (
		<div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
				<div>
					<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 15, color: "#1a2f4e", margin: 0 }}>{t.label}</p>
					<p style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "#9e876e", margin: 0 }}>Last 7 days analytics</p>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<span
						style={{
							padding: "3px 12px",
							borderRadius: 20,
							background: "#e8f5e8",
							color: "#3a8a3a",
							fontFamily: "Poppins,sans-serif",
							fontSize: 11,
							fontWeight: 600,
						}}
					>
						Good
					</span>
					<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 11, color: "#9e876e" }}>— {statusLabel}</span>
				</div>
			</div>
			<svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 185 }}>
				{t.yTicks.map((tick) => {
					const yy = pT + ch - ((tick - t.yMin) / range) * ch;
					return (
						<g key={tick}>
							<line x1={pL} y1={yy} x2={W - pR} y2={yy} stroke="#e8e0d4" strokeWidth="1" strokeDasharray="3 3" />
							<text x={pL - 4} y={yy + 3.5} textAnchor="end" fontSize="9" fill="#b0a090" fontFamily="Poppins,sans-serif">
								{tick}
							</text>
						</g>
					);
				})}
				<path d={areaD} fill={t.fill} opacity="0.45" />
				<path d={lineD} fill="none" stroke={t.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
				{pts.map((p, i) => (
					<circle key={i} cx={p.x} cy={p.y} r="3.5" fill={t.color} stroke="white" strokeWidth="1.5" />
				))}
				{DATES.map((d, i) => (
					<text
						key={i}
						x={pL + (i / (DATES.length - 1)) * cw}
						y={H - 4}
						textAnchor="middle"
						fontSize="9"
						fill="#b0a090"
						fontFamily="Poppins,sans-serif"
					>
						{d}
					</text>
				))}
				<text x={W / 2} y={H + 8} textAnchor="middle" fontSize="9" fill="#b0a090" fontFamily="Poppins,sans-serif">
					...
				</text>
			</svg>
		</div>
	);
}

// ─── rPPG Processor ───────────────────────────────────────────────────────────
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

// ─── Camera Modal ─────────────────────────────────────────────────────────────
function CameraModal({ onResult, onClose }: { onResult: (hr: number, bp: { sys: number; dia: number } | null) => void; onClose: () => void }) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const proc = useRef(new RPPGProcessor());
	const animRef = useRef<number>();
	const streamRef = useRef<MediaStream>();
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
				const TOTAL = 180;
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
						if (fHR) {
							onResult(fHR, proc.current.getBP(fHR));
							setStatus("done");
						}
						stop();
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
		};
	}, [stop, onResult]);

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
							{status === "done" ? "Complete" : `${progress}%`}
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
	status: "green" | "orange";
	alert?: string;
	alertGreen?: boolean;
	selected: boolean;
	onClick: () => void;
}

function MetricCard({ icon, label, value, unit, source, ago, trendDir, status, alert, alertGreen, selected, onClick }: CardProps) {
	const dot = status === "green" ? "#4caf50" : "#ff9800";
	const arrow = trendDir === "up" ? "↑ Up" : trendDir === "down" ? "↓ Down" : "→ Stable";
	return (
		<div
			onClick={onClick}
			style={{
				background: "white",
				borderRadius: 14,
				padding: 14,
				cursor: "pointer",
				border: `2px solid ${selected ? "#7ab8d4" : "transparent"}`,
				boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
				transition: "border-color 0.2s",
			}}
		>
			<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<div
						style={{
							width: 28,
							height: 28,
							borderRadius: "50%",
							background: "#f5f0e8",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "#c07060",
						}}
					>
						{icon}
					</div>
					<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 10.5, color: "#9e876e", fontWeight: 500 }}>{label}</span>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<div style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
					<MoreHorizontal size={12} style={{ color: "#c0b0a0" }} />
				</div>
			</div>
			<div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
				<span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 22, color: "#1a2f4e", lineHeight: 1 }}>{value}</span>
				<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 10, color: "#9e876e" }}>{unit}</span>
			</div>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
				<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 9, color: "#b0a090" }}>Source: {source}</span>
				<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 9, color: "#b0a090" }}>{ago}</span>
			</div>
			<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 9, color: "#9e876e" }}>{arrow}</span>
			{alert && (
				<div
					style={{
						marginTop: 8,
						padding: "6px 10px",
						borderRadius: 8,
						background: alertGreen ? "#e8f5e8" : "#fff3e0",
						color: alertGreen ? "#2e7d32" : "#b35a00",
						fontFamily: "Poppins,sans-serif",
						fontSize: 9,
						lineHeight: 1.4,
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
	const [lang, setLang] = useState<"en" | "es">("en");
	const [vitals, setVitals] = useState({ hr: null as number | null, bpSys: null as number | null, bpDia: null as number | null });

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
			ago: "2 hours ago",
			trendDir: "stable",
			status: "green",
			selected: selectedCard === "bloodSugar",
			onClick: () => setSelectedCard("bloodSugar"),
		},
		{
			id: "sleep",
			icon: <Moon size={14} />,
			label: "Sleep Time",
			value: "6.5",
			unit: "hours",
			source: "Luqis Watch",
			ago: "8 hours ago",
			trendDir: "down",
			status: "orange",
			alert: "Try to get 7-9 hours of sleep",
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
			status: "orange",
			alert: "Schedule a check-up with your healthcare provider",
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
			ago: "7 days ago",
			trendDir: "stable",
			status: "green",
			alert: "Update your levels soon",
			alertGreen: true,
			selected: selectedCard === "cholesterol",
			onClick: () => setSelectedCard("cholesterol"),
		},
	];

	return (
		<div style={{ display: "flex", flex: 1, overflow: "hidden", background: "#f5f0e8" }}>
			{scanning && <CameraModal onResult={handleScan} onClose={() => setScanning(false)} />}

			{/* ── Main content ── */}
			<div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", minWidth: 0 }}>
				{/* Header */}
				<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
					<div>
						<h1
							style={{
								fontFamily: "Montserrat,sans-serif",
								fontWeight: 700,
								fontSize: 26,
								color: "#1a2f4e",
								display: "flex",
								alignItems: "center",
								gap: 8,
								margin: 0,
							}}
						>
							Hello, Daisy <span>🐻</span>
						</h1>
						<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: 13, color: "#e8796a", margin: "3px 0 0" }}>
							24 Weeks | Second Trimester
						</p>
					</div>
					<div style={{ display: "flex", borderRadius: 40, overflow: "hidden", border: "1.5px solid rgba(232,121,106,0.35)", background: "white" }}>
						{(["en", "es"] as const).map((l) => (
							<button
								key={l}
								onClick={() => setLang(l)}
								style={{
									padding: "6px 18px",
									fontFamily: "Montserrat,sans-serif",
									fontWeight: 700,
									fontSize: 12,
									border: "none",
									cursor: "pointer",
									transition: "all 0.15s",
									background: lang === l ? (l === "en" ? "#f5f0e8" : "#e8796a") : "transparent",
									color: lang === l ? (l === "en" ? "#1a2f4e" : "white") : "#9e876e",
								}}
							>
								{l === "en" ? "English" : "Español"}
							</button>
						))}
					</div>
				</div>

				{/* 2×3 card grid */}
				<div style={{ border: "1.5px solid #b8d4e8", borderRadius: 16, padding: 12, marginBottom: 4, background: "rgba(255,255,255,0.2)" }}>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
						{cards.map((c) => (
							<MetricCard key={c.id} {...c} />
						))}
					</div>
				</div>

				<div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
					<button
						style={{
							fontFamily: "Poppins,sans-serif",
							fontSize: 10,
							color: "#9e876e",
							background: "none",
							border: "none",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: 2,
						}}
					>
						... <ChevronRight size={11} />
					</button>
				</div>

				{/* Trend chart */}
				<div style={{ background: "white", borderRadius: 18, padding: "18px 20px", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
					<AreaChart trendKey={selectedCard} />
				</div>

				{/* Bottom row */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
					{/* rPPG */}
					<button
						onClick={() => setScanning(true)}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							background: "white",
							borderRadius: 18,
							padding: "18px 20px",
							border: "none",
							cursor: "pointer",
							textAlign: "left",
							boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
						}}
					>
						<div>
							<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 16, color: "#1a2f4e", margin: 0 }}>Begin rPPG</p>
							<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 16, color: "#1a2f4e", margin: 0 }}>Scan</p>
						</div>
						<div
							style={{
								width: 56,
								height: 56,
								borderRadius: 12,
								border: "2px solid #e8796a",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#e8796a",
							}}
						>
							<Scan size={26} />
						</div>
					</button>

					{/* Alert */}
					<div
						style={{
							background: "white",
							borderRadius: 18,
							padding: "14px 16px",
							border: "2px solid #e8796a",
							boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
						}}
					>
						<div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 8 }}>
							<AlertCircle size={13} style={{ color: "#e8796a", flexShrink: 0, marginTop: 1 }} />
							<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 11, color: "#1a2f4e", margin: 0, lineHeight: 1.4 }}>
								IMPORTANT: Are you experiencing the following?
							</p>
						</div>
						{["headaches", "blurry vision", "changes to your blood pressure", "overall do not feel well"].map((s) => (
							<div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
								<div
									style={{
										width: 14,
										height: 14,
										borderRadius: 3,
										border: "1.5px solid #e8796a",
										flexShrink: 0,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<div style={{ width: 8, height: 8, borderRadius: 2, background: "#e8796a" }} />
								</div>
								<span style={{ fontFamily: "Poppins,sans-serif", fontSize: 10.5, color: "#1a2f4e", fontWeight: 500 }}>{s}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ── Right panel ── */}
			<div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", padding: "22px 16px", borderLeft: "1px solid #e2dbd0" }}>
				{/* Watch */}
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
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
					<p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 700, fontSize: 13, color: "#1a2f4e", margin: 0 }}>Connected</p>
				</div>

				{/* Health tips */}
				<div style={{ background: "white", borderRadius: 18, padding: 14, flex: 1, overflowY: "auto", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
					<p
						style={{
							fontFamily: "Montserrat,sans-serif",
							fontWeight: 700,
							fontSize: 12,
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
								fontSize: 9,
								color: "#4a5568",
								lineHeight: 1.6,
								marginBottom: 8,
								marginTop: 0,
								whiteSpace: "pre-line",
							}}
						>
							{tip}
						</p>
					))}
				</div>

				{/* Bear */}
				<div style={{ display: "flex", justifyContent: "center", marginTop: 10, userSelect: "none" }}>
					<span style={{ fontSize: 60 }}>🐻</span>
				</div>
			</div>
		</div>
	);
}
