// Modern DASH "Cardio-Plate" visualization — a 7-segment donut where each
// wedge's *radial fill* reflects how much of that DASH target the user has
// logged today. Center text shows headline numbers (sodium / potassium /
// calories) against DASH ceilings. Pure SVG, no external chart library.

import { motion } from "motion/react";

import type { DashPlateBucketState, NutritionToday } from "../../lib/types";

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUTER = 120;
const R_INNER = 60;

function polar(angle: number, r: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function wedgePath(startAngle: number, endAngle: number, fillRatio: number) {
  const fill = Math.min(Math.max(fillRatio, 0), 1);
  // Animate outward fill: inner stays at R_INNER, outer is interpolated.
  const rOuter = R_INNER + (R_OUTER - R_INNER) * fill;
  if (rOuter <= R_INNER) return "";

  const p1 = polar(startAngle, R_INNER);
  const p2 = polar(startAngle, rOuter);
  const p3 = polar(endAngle, rOuter);
  const p4 = polar(endAngle, R_INNER);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p3.x} ${p3.y}`,
    `L ${p4.x} ${p4.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${p1.x} ${p1.y}`,
    "Z",
  ].join(" ");
}

function backgroundRingPath(startAngle: number, endAngle: number) {
  const p1 = polar(startAngle, R_INNER);
  const p2 = polar(startAngle, R_OUTER);
  const p3 = polar(endAngle, R_OUTER);
  const p4 = polar(endAngle, R_INNER);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${p3.x} ${p3.y}`,
    `L ${p4.x} ${p4.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${p1.x} ${p1.y}`,
    "Z",
  ].join(" ");
}

interface Props {
  today: NutritionToday | null;
}

export function CardioPlate({ today }: Props) {
  const plate: DashPlateBucketState[] = today?.dash_plate ?? [];
  const sliceCount = plate.length || 7;
  const sliceAngle = 360 / sliceCount;

  const sodium = today?.daily_nutrition.daily_sodium_mg ?? 0;
  const sodiumMax = today?.targets?.sodium_mg_max ?? 2300;
  const potassium = today?.daily_nutrition.daily_potassium_mg ?? 0;
  const potassiumMin = today?.targets?.potassium_mg_min ?? 4700;
  const calories = today?.daily_nutrition.daily_calories ?? 0;
  const calorieTarget = today?.targets?.calories ?? 2000;

  const sodiumPct = Math.round((sodium / sodiumMax) * 100);
  const potassiumPct = Math.round((potassium / potassiumMin) * 100);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Background ring (target outline) */}
          {plate.map((b, i) => {
            const start = i * sliceAngle;
            const end = (i + 1) * sliceAngle - 2; // gap between wedges
            return (
              <path
                key={`bg-${b.bucket}`}
                d={backgroundRingPath(start, end)}
                fill={b.color}
                fillOpacity={0.15}
                stroke={b.color}
                strokeOpacity={0.35}
                strokeWidth={1}
              />
            );
          })}

          {/* Foreground wedges sized to logged servings */}
          {plate.map((b, i) => {
            const start = i * sliceAngle;
            const end = (i + 1) * sliceAngle - 2;
            return (
              <motion.path
                key={`fg-${b.bucket}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                d={wedgePath(start, end, b.fill_ratio)}
                fill={b.color}
              />
            );
          })}

          {/* Center disc */}
          <circle cx={CX} cy={CY} r={R_INNER - 2} fill="#fffdf8" stroke="#f3efe7" strokeWidth={2} />
          <text
            x={CX}
            y={CY - 14}
            textAnchor="middle"
            className="fill-[#172e54]"
            style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 22 }}
          >
            {calories}
          </text>
          <text
            x={CX}
            y={CY + 4}
            textAnchor="middle"
            className="fill-[#9e876e]"
            style={{ fontFamily: "Poppins", fontSize: 10 }}
          >
            / {calorieTarget} kcal
          </text>
          <text
            x={CX}
            y={CY + 22}
            textAnchor="middle"
            className="fill-[#bd8e84]"
            style={{ fontFamily: "Poppins", fontSize: 9, letterSpacing: 0.5 }}
          >
            DASH PLATE
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full max-w-[320px]">
        {plate.map((b) => {
          const pct = Math.round(Math.min(b.fill_ratio, 1) * 100);
          return (
            <div key={b.bucket} className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: b.color }}
              />
              <span className="font-['Poppins'] text-[10.5px] text-[#172e54] flex-1 truncate">
                {b.label}
              </span>
              <span className="font-['Poppins'] text-[10.5px] text-[#9e876e] tabular-nums">
                {b.servings_logged.toFixed(1)}/{b.servings_target.toFixed(0)}
                <span className="ml-1 text-[#bd8e84]">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Sodium / potassium quick-ref */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[320px] pt-2">
        <div className="rounded-[14px] bg-[#f3efe7] px-3 py-2">
          <p className="font-['Poppins'] text-[10px] text-[#bd8e84]">Sodium</p>
          <p className="font-['Montserrat'] font-bold text-[14px] text-[#172e54]">
            {Math.round(sodium)} mg
          </p>
          <p
            className={`font-['Poppins'] text-[10px] ${
              sodiumPct > 100 ? "text-red-600" : "text-green-700"
            }`}
          >
            {sodiumPct}% of {sodiumMax} mg cap
          </p>
        </div>
        <div className="rounded-[14px] bg-[#caebfe]/40 px-3 py-2">
          <p className="font-['Poppins'] text-[10px] text-[#bd8e84]">Potassium</p>
          <p className="font-['Montserrat'] font-bold text-[14px] text-[#172e54]">
            {Math.round(potassium)} mg
          </p>
          <p
            className={`font-['Poppins'] text-[10px] ${
              potassiumPct >= 100 ? "text-green-700" : "text-[#bd8e84]"
            }`}
          >
            {potassiumPct}% of {potassiumMin} mg target
          </p>
        </div>
      </div>
    </div>
  );
}
