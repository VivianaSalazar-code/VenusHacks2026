import { useState, useEffect, useRef } from "react";

// ── All patientData, exportPDF logic, Sparkline, TrendBadge unchanged ─────────

const patientData = {
	name: "Josephine B",
	dob: "1994-03-12",
	pregnancy: "24 weeks (Second Trimester)",
	location: "Irvine, CA",
	summary:
		"Patient has been continuously monitored via a connected wearable since W12. Cardiovascular vitals trend stable with one episode of nocturnal tachycardia (W22) and intermittent BP elevation in the past 14 days. No medication changes since enrollment.",
	metrics: [
		{
			name: "Heart Rate",
			unit: "BPM",
			current: "72",
			day7: "68 – 88",
			day30: "62 – 104",
			day90: "58 – 118",
			trend: "Stable",
			sparkline: [74, 72, 76, 70, 68, 73, 72],
		},
		{
			name: "Blood Pressure",
			unit: "mmHg",
			current: "118/76",
			day7: "112–124 / 72–80",
			day30: "108–132 / 70–86",
			day90: "104–138 / 68–90",
			trend: "Concerning",
			sparkline: [112, 116, 118, 122, 120, 124, 118],
		},
		{
			name: "Blood Sugar",
			unit: "mg/dL",
			current: "94",
			day7: "85 – 102",
			day30: "82 – 118",
			day90: "80 – 124",
			trend: "Stable",
			sparkline: [88, 94, 90, 85, 96, 92, 94],
		},
		{
			name: "Cholesterol",
			unit: "mg/dL",
			current: "182",
			day7: "—",
			day30: "178 – 192",
			day90: "170 – 198",
			trend: "Improving",
			sparkline: [198, 194, 190, 188, 185, 183, 182],
		},
		{
			name: "Steps / day",
			unit: "",
			current: "8,456",
			day7: "6,200 – 10,400",
			day30: "4,800 – 11,300",
			day90: "3,100 – 12,400",
			trend: "Improving",
			sparkline: [5200, 6100, 6800, 7200, 7800, 8100, 8456],
		},
		{
			name: "SpO₂",
			unit: "%",
			current: "98",
			day7: "96 – 99",
			day30: "95 – 99",
			day90: "94 – 99",
			trend: "Stable",
			sparkline: [97, 98, 97, 99, 98, 98, 98],
		},
	],
	medications: ["Prenatal multivitamin (daily)", "Folic acid 800 mcg", "Low-dose aspirin 81 mg (per OB)"],
	careTeam: [
		{ role: "OB/GYN", name: "Dr. L. Tran, Hoag" },
		{ role: "Primary Care", name: "Dr. R. Patel" },
		{ role: "Cardiology consult", name: "pending" },
	],
};

const trendConfig = {
	Stable: { color: "#1e3a5f", bg: "#e8f0fa", label: "Stable" },
	Concerning: { color: "#c0392b", bg: "#fdecea", label: "Concerning" },
	Improving: { color: "#1a7a4a", bg: "#e6f4ed", label: "Improving" },
};

function Sparkline({ data, trend }) {
	const w = 72,
		h = 28,
		pad = 3;
	const min = Math.min(...data),
		max = Math.max(...data),
		range = max - min || 1;
	const pts = data.map((v, i) => {
		const x = pad + (i / (data.length - 1)) * (w - pad * 2);
		const y = h - pad - ((v - min) / range) * (h - pad * 2);
		return `${x},${y}`;
	});
	const color = trendConfig[trend]?.color || "#9e876e";
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
			<polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
			<circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="2.8" fill={color} />
		</svg>
	);
}

function TrendBadge({ trend }) {
	const cfg = trendConfig[trend] || { color: "#9e876e", bg: "#f5f0e8", label: trend };
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 5,
				background: cfg.bg,
				color: cfg.color,
				fontFamily: "Montserrat, sans-serif",
				fontSize: 11,
				fontWeight: 600,
				letterSpacing: "0.04em",
				padding: "3px 10px",
				borderRadius: 20,
				border: `1px solid ${cfg.color}22`,
			}}
		>
			<span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
			{cfg.label}
		</span>
	);
}

export default function LongitudinalHealthReport() {
	const [exporting, setExporting] = useState(false);
	const [jsPDFReady, setJsPDFReady] = useState(false);
	const reportRef = useRef(null);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
		script.onload = () => setJsPDFReady(true);
		document.head.appendChild(script);
		const font = document.createElement("link");
		font.rel = "stylesheet";
		font.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Poppins:wght@400;500;600&display=swap";
		document.head.appendChild(font);
	}, []);

	// ── exportPDF: completely unchanged ───────────────────────────────────────
	const exportPDF = async () => {
		if (!jsPDFReady) return;
		setExporting(true);
		try {
			const { jsPDF } = window.jspdf;
			const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
			const W = 210,
				marginX = 18,
				contentW = W - marginX * 2;
			let y = 0;

			doc.setFillColor(18, 38, 74);
			doc.rect(0, 0, W, 22, "F");
			doc.setFillColor(240, 100, 90);
			doc.roundedRect(W - 58, 5, 48, 12, 3, 3, "F");
			doc.setFont("helvetica", "bold");
			doc.setFontSize(13);
			doc.setTextColor(255, 255, 255);
			doc.text("Longitudinal Health Report", marginX, 13.5);
			doc.setFontSize(7.5);
			doc.setFont("helvetica", "normal");
			doc.text("EXPORT — PDF", W - 34, 12.5, { align: "center" });
			y = 30;

			doc.setFontSize(8.5);
			doc.setTextColor(120, 130, 150);
			doc.text("A continuity-of-care summary for any provider.", marginX, y);
			y += 8;

			doc.setFillColor(247, 249, 252);
			doc.roundedRect(marginX, y, contentW, 36, 3, 3, "F");
			doc.setDrawColor(210, 218, 230);
			doc.roundedRect(marginX, y, contentW, 36, 3, 3, "S");
			doc.setFont("helvetica", "bold");
			doc.setFontSize(13);
			doc.setTextColor(18, 38, 74);
			doc.text(patientData.name, marginX + 6, y + 10);
			doc.setFont("helvetica", "normal");
			doc.setFontSize(8.5);
			doc.setTextColor(100, 120, 150);
			doc.text(`DOB ${patientData.dob}  ·  ${patientData.pregnancy}  ·  ${patientData.location}`, marginX + 6, y + 17);
			doc.setTextColor(60, 75, 95);
			doc.setFontSize(8.2);
			const summaryLines = doc.splitTextToSize(patientData.summary, contentW - 12);
			doc.text(summaryLines, marginX + 6, y + 24);
			y += 44;

			doc.setFillColor(18, 38, 74);
			doc.roundedRect(marginX, y, contentW, 10, 2, 2, "F");
			const cols = [
				{ label: "Metric", x: marginX + 4, w: 42 },
				{ label: "Current", x: marginX + 50, w: 22 },
				{ label: "7-day", x: marginX + 78, w: 28 },
				{ label: "30-day", x: marginX + 108, w: 30 },
				{ label: "90-day", x: marginX + 140, w: 30 },
				{ label: "Trend", x: marginX + 164, w: 20 },
			];
			doc.setFont("helvetica", "bold");
			doc.setFontSize(7.5);
			doc.setTextColor(255, 255, 255);
			cols.forEach((c) => doc.text(c.label, c.x, y + 6.5));
			y += 10;

			patientData.metrics.forEach((m, i) => {
				const rowH = 11;
				if (i % 2 === 0) {
					doc.setFillColor(250, 251, 253);
					doc.rect(marginX, y, contentW, rowH, "F");
				}
				doc.setDrawColor(228, 234, 242);
				doc.line(marginX, y + rowH, marginX + contentW, y + rowH);
				doc.setFont("helvetica", "bold");
				doc.setFontSize(8);
				doc.setTextColor(18, 38, 74);
				doc.text(`${m.name}${m.unit ? " (" + m.unit + ")" : ""}`, cols[0].x, y + 7);
				doc.setFont("helvetica", "normal");
				doc.setTextColor(40, 55, 75);
				doc.text(m.current, cols[1].x, y + 7);
				doc.setFontSize(7.5);
				doc.setTextColor(80, 95, 115);
				doc.text(m.day7, cols[2].x, y + 7);
				doc.text(m.day30, cols[3].x, y + 7);
				doc.text(m.day90, cols[4].x, y + 7);
				const rgb = m.trend === "Concerning" ? [192, 57, 43] : m.trend === "Improving" ? [26, 122, 74] : [30, 58, 95];
				doc.setFont("helvetica", "bold");
				doc.setFontSize(7.5);
				doc.setTextColor(...rgb);
				doc.text(m.trend, cols[5].x, y + 7);
				y += rowH;
			});
			y += 8;

			const panelW = (contentW - 5) / 2;
			doc.setFillColor(245, 243, 238);
			doc.roundedRect(marginX, y, panelW, 38, 3, 3, "F");
			doc.setDrawColor(210, 205, 195);
			doc.roundedRect(marginX, y, panelW, 38, 3, 3, "S");
			doc.setFont("helvetica", "bold");
			doc.setFontSize(9);
			doc.setTextColor(18, 38, 74);
			doc.text("Medications", marginX + 5, y + 9);
			doc.setFont("helvetica", "normal");
			doc.setFontSize(8);
			doc.setTextColor(60, 75, 95);
			patientData.medications.forEach((med, i) => doc.text(`• ${med}`, marginX + 5, y + 17 + i * 8));

			const cx2 = marginX + panelW + 5;
			doc.setFillColor(232, 242, 252);
			doc.roundedRect(cx2, y, panelW, 38, 3, 3, "F");
			doc.setDrawColor(190, 215, 240);
			doc.roundedRect(cx2, y, panelW, 38, 3, 3, "S");
			doc.setFont("helvetica", "bold");
			doc.setFontSize(9);
			doc.setTextColor(18, 38, 74);
			doc.text("Care Team", cx2 + 5, y + 9);
			doc.setFont("helvetica", "normal");
			doc.setFontSize(8);
			doc.setTextColor(60, 75, 95);
			patientData.careTeam.forEach((ct, i) => doc.text(`• ${ct.role} — ${ct.name}`, cx2 + 5, y + 17 + i * 8));
			y += 48;

			doc.setFontSize(7);
			doc.setTextColor(160, 170, 185);
			const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
			doc.text(`Generated ${now}  ·  For clinical use only  ·  Confidential`, W / 2, 287, { align: "center" });
			doc.setDrawColor(200, 210, 225);
			doc.line(marginX, 283, W - marginX, 283);
			doc.save(`HealthReport_${patientData.name.replace(" ", "_")}.pdf`);
		} catch (err) {
			console.error("PDF export failed:", err);
		}
		setExporting(false);
	};

	return (
		<div style={{ display: "flex", flex: 1, height: "100%", overflow: "hidden", background: "#f5f0e8" }}>
			<div ref={reportRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px", minWidth: 0 }}>
				{/* ── Header ── */}
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
					<div>
						<h1
							style={{
								fontFamily: "Montserrat, sans-serif",
								fontWeight: 700,
								fontSize: 26,
								color: "#1a2f4e",
								margin: 0,
								letterSpacing: "-0.02em",
							}}
						>
							Longitudinal Health Report
						</h1>
						<p style={{ fontFamily: "Poppins, sans-serif", fontSize: 13, color: "#9e876e", margin: "4px 0 0", fontWeight: 400 }}>
							A continuity-of-care summary for any provider.
						</p>
					</div>
					<button
						onClick={exportPDF}
						disabled={exporting || !jsPDFReady}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 7,
							background: exporting ? "#bd8e84" : "#e8796a",
							color: "white",
							border: "none",
							borderRadius: 10,
							padding: "10px 20px",
							fontFamily: "Montserrat, sans-serif",
							fontWeight: 700,
							fontSize: 13.5,
							cursor: exporting ? "default" : "pointer",
							boxShadow: "0 4px 16px rgba(232,121,106,0.35)",
							transition: "all 0.18s",
							letterSpacing: "0.01em",
							whiteSpace: "nowrap",
						}}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						{exporting ? "Exporting…" : "Export PDF Report"}
					</button>
				</div>

				{/* ── Patient Card ── */}
				<div
					style={{
						background: "white",
						borderRadius: 16,
						padding: "20px 24px",
						marginBottom: 16,
						boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
						border: "1px solid #ece8e0",
					}}
				>
					<div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "#1a2f4e", marginBottom: 4 }}>
						{patientData.name}
					</div>
					<div style={{ fontFamily: "Poppins, sans-serif", fontSize: 12, color: "#9e876e", marginBottom: 12 }}>
						DOB {patientData.dob} · {patientData.pregnancy} · {patientData.location}
					</div>
					<p style={{ fontFamily: "Poppins, sans-serif", margin: 0, fontSize: 13, color: "#3c4f65", lineHeight: 1.7 }}>{patientData.summary}</p>
				</div>

				{/* ── Metrics Table ── */}
				<div
					style={{
						background: "white",
						borderRadius: 16,
						overflow: "hidden",
						marginBottom: 16,
						boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
						border: "1px solid #ece8e0",
					}}
				>
					<table style={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr style={{ background: "#1a2f4e" }}>
								{["Metric", "Current", "7-day", "30-day", "90-day", "Sparkline", "Trend"].map((h) => (
									<th
										key={h}
										style={{
											padding: "12px 14px",
											textAlign: "left",
											fontFamily: "Montserrat, sans-serif",
											fontWeight: 600,
											fontSize: 11,
											color: "#afc3dc",
											letterSpacing: "0.05em",
										}}
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{patientData.metrics.map((m, i) => (
								<tr key={m.name} style={{ background: i % 2 === 0 ? "#faf9f7" : "white", transition: "background 0.15s" }}>
									<td
										style={{
											padding: "13px 14px",
											fontFamily: "Montserrat, sans-serif",
											fontWeight: 600,
											fontSize: 13.5,
											color: "#1a2f4e",
											borderBottom: "1px solid #f0ece4",
										}}
									>
										{m.name}
										{m.unit && <span style={{ color: "#9e876e", fontWeight: 400, fontSize: 11.5, marginLeft: 4 }}>({m.unit})</span>}
									</td>
									<td
										style={{
											padding: "13px 14px",
											fontFamily: "Montserrat, sans-serif",
											fontWeight: 600,
											fontSize: 13.5,
											color: "#1a2f4e",
											borderBottom: "1px solid #f0ece4",
										}}
									>
										{m.current}
									</td>
									{[m.day7, m.day30, m.day90].map((v, vi) => (
										<td
											key={vi}
											style={{
												padding: "13px 14px",
												fontFamily: "Poppins, sans-serif",
												fontSize: 12,
												color: "#5a6e88",
												borderBottom: "1px solid #f0ece4",
											}}
										>
											{v}
										</td>
									))}
									<td style={{ padding: "13px 14px", borderBottom: "1px solid #f0ece4" }}>
										<Sparkline data={m.sparkline} trend={m.trend} />
									</td>
									<td style={{ padding: "13px 14px", borderBottom: "1px solid #f0ece4" }}>
										<TrendBadge trend={m.trend} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* ── Bottom Panels ── */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
					{/* Medications */}
					<div
						style={{
							background: "white",
							borderRadius: 16,
							padding: "18px 20px",
							border: "1px solid #ece8e0",
							boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
						}}
					>
						<div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: "#1a2f4e", marginBottom: 12 }}>
							Medications
						</div>
						<ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
							{patientData.medications.map((med, i) => (
								<li
									key={i}
									style={{
										fontFamily: "Poppins, sans-serif",
										fontSize: 13,
										color: "#3c4f65",
										padding: "4px 0",
										display: "flex",
										alignItems: "flex-start",
										gap: 8,
									}}
								>
									<span style={{ color: "#bd8e84", fontSize: 16, lineHeight: 1.2, flexShrink: 0 }}>·</span>
									{med}
								</li>
							))}
						</ul>
					</div>

					{/* Care Team */}
					<div
						style={{
							background: "#eaf4fb",
							borderRadius: 16,
							padding: "18px 20px",
							border: "1px solid #cce4f5",
							boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
						}}
					>
						<div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 14, color: "#1a2f4e", marginBottom: 12 }}>Care Team</div>
						<ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
							{patientData.careTeam.map((ct, i) => (
								<li
									key={i}
									style={{
										fontFamily: "Poppins, sans-serif",
										fontSize: 13,
										color: "#3c4f65",
										padding: "4px 0",
										display: "flex",
										alignItems: "flex-start",
										gap: 8,
									}}
								>
									<span style={{ color: "#bd8e84", fontSize: 16, lineHeight: 1.2, flexShrink: 0 }}>·</span>
									<span>
										<span style={{ fontWeight: 600 }}>{ct.role}</span>
										{" — "}
										<span
											style={{
												color: ct.name === "pending" ? "#e8796a" : "#3c4f65",
												fontStyle: ct.name === "pending" ? "italic" : "normal",
											}}
										>
											{ct.name}
										</span>
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Footer */}
				<div
					style={{
						textAlign: "center",
						marginTop: 20,
						marginBottom: 8,
						fontFamily: "Poppins, sans-serif",
						fontSize: 11,
						color: "#bd8e84",
						letterSpacing: "0.05em",
					}}
				>
					FOR CLINICAL USE ONLY · CONFIDENTIAL
				</div>
			</div>
		</div>
	);
}
