// Webcam barcode scanner powered by html5-qrcode. Renders inside a modal
// (Radix Dialog) and resolves with a successful scan -> backend lookup chain:
//
//   1. html5-qrcode reads the EAN/UPC.
//   2. We call /api/nutrition/barcode/{code}; if Open Food Facts has it we get
//      real nutrients back. Otherwise the backend invokes the LLM fallback,
//      which estimates a nutrient profile from a `name_hint` we collect.
//   3. We hand the parent a confirmed result; the parent calls logMeal().
//
// We also expose a Manual Entry tab so the demo never falls dead if the camera
// or barcode lookup fails.

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2, Plus, X } from "lucide-react";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { api } from "../../lib/api";
import type {
  BarcodeLookupResult,
  DashBucket,
  MealLogRequest,
  MealNutrients,
} from "../../lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onLog: (meal: MealLogRequest) => Promise<void>;
}

const BUCKET_LABELS: Record<DashBucket, string> = {
  vegetables: "Vegetables",
  fruits: "Fruits",
  whole_grains: "Whole Grains",
  lean_protein: "Lean Protein",
  low_fat_dairy: "Low-Fat Dairy",
  nuts_seeds_legumes: "Nuts / Seeds / Legumes",
  fats_sweets: "Fats & Sweets",
};

type Mode = "scan" | "manual";

const SCANNER_ELEMENT_ID = "hh-barcode-scanner";

export function BarcodeScanner({ open, onClose, onLog }: Props) {
  const [mode, setMode] = useState<Mode>("scan");
  const [scannerActive, setScannerActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [pending, setPending] = useState<BarcodeLookupResult | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [needsHint, setNeedsHint] = useState<string | null>(null);
  const [hintInput, setHintInput] = useState("");

  // html5-qrcode instance lives outside React render lifecycle
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);

  const teardown = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScannerActive(false);
  }, []);

  const handleLookup = useCallback(
    async (barcode: string, nameHint?: string) => {
      setLookupBusy(true);
      setScanError(null);
      try {
        const result = await api.lookupBarcode(barcode, nameHint);
        if (!result.found || result.source === "not_found") {
          // Ask for a name hint and retry through the LLM path.
          setNeedsHint(barcode);
        } else {
          setPending(result);
          setNeedsHint(null);
        }
      } catch (e) {
        setScanError((e as Error).message);
      } finally {
        setLookupBusy(false);
      }
    },
    [],
  );

  const startScanner = useCallback(async () => {
    setScanError(null);
    try {
      // Dynamic import so the bundle doesn't pay for it on initial load.
      const mod = await import("html5-qrcode");
      const Html5Qrcode = mod.Html5Qrcode;
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner as unknown as typeof scannerRef.current;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 140 } },
        async (decodedText: string) => {
          await teardown();
          await handleLookup(decodedText);
        },
        () => {
          /* swallow per-frame decode failures */
        },
      );
      setScannerActive(true);
    } catch (e) {
      setScanError(
        `Couldn't start the camera (${(e as Error).message}). Try Manual Entry or check camera permissions.`,
      );
    }
  }, [handleLookup, teardown]);

  // Auto-start scanner when modal opens in scan mode
  useEffect(() => {
    if (!open) {
      void teardown();
      setPending(null);
      setNeedsHint(null);
      setScanError(null);
      return;
    }
    if (mode === "scan" && !scannerActive && !pending && !needsHint) {
      void startScanner();
    }
    if (mode !== "scan") {
      void teardown();
    }
    return () => {
      void teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  const confirmAndLog = useCallback(async () => {
    if (!pending) return;
    const meal: MealLogRequest = {
      name: pending.name,
      dash_bucket: pending.dash_bucket,
      serving_qty: 1.0,
      nutrients: pending.nutrients,
      source: pending.source === "openfoodfacts" ? "barcode" : "llm_estimate",
      barcode: pending.barcode,
    };
    await onLog(meal);
    setPending(null);
    onClose();
  }, [pending, onLog, onClose]);

  const submitHint = useCallback(async () => {
    if (!needsHint || !hintInput.trim()) return;
    await handleLookup(needsHint, hintInput.trim());
    setHintInput("");
  }, [needsHint, hintInput, handleLookup]);

  const submitManual = useCallback(async () => {
    const name = manualName.trim();
    if (!name) return;
    setLookupBusy(true);
    try {
      // If a barcode is supplied, route through the lookup endpoint (real
      // nutrients beat LLM-estimated ones). Otherwise ask the LLM directly.
      const result = manualBarcode.trim()
        ? await api.lookupBarcode(manualBarcode.trim(), name)
        : await api.lookupBarcode("0000000000000", name); // sentinel -> OFF miss -> LLM
      setPending({ ...result, name: result.name || name });
    } catch (e) {
      setScanError((e as Error).message);
    } finally {
      setLookupBusy(false);
    }
  }, [manualName, manualBarcode]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="bg-white rounded-[24px] border-2 border-[#f3efe7] w-full max-w-lg p-5 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-['Montserrat'] font-bold text-[20px] text-[#172e54]">Log a Meal</h2>
          <button
            onClick={onClose}
            className="text-[#bd8e84] hover:text-[#172e54] transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-4 bg-[#f3efe7] rounded-[24px] p-1">
          <button
            onClick={() => setMode("scan")}
            className={`flex-1 py-2 rounded-[20px] font-['Montserrat'] font-semibold text-sm transition-colors ${
              mode === "scan" ? "bg-white text-[#172e54]" : "text-[#bd8e84]"
            }`}
          >
            <Camera size={14} className="inline mr-1.5" /> Scan Barcode
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 py-2 rounded-[20px] font-['Montserrat'] font-semibold text-sm transition-colors ${
              mode === "manual" ? "bg-white text-[#172e54]" : "text-[#bd8e84]"
            }`}
          >
            <Plus size={14} className="inline mr-1.5" /> Manual Entry
          </button>
        </div>

        {/* Scanner viewport */}
        {mode === "scan" && !pending && !needsHint && (
          <div className="space-y-3">
            <div
              id={SCANNER_ELEMENT_ID}
              className="w-full bg-black rounded-[16px] overflow-hidden"
              style={{ minHeight: 240 }}
            />
            <p className="font-['Poppins'] text-[11px] text-center text-[#9e876e]">
              Point the camera at a food barcode. Decoding happens automatically.
            </p>
            {!scannerActive && !lookupBusy && (
              <Button
                onClick={startScanner}
                className="w-full rounded-[24px] bg-[#172e54] font-['Montserrat'] font-semibold text-sm"
              >
                <Camera size={16} className="mr-1.5" /> Start Camera
              </Button>
            )}
          </div>
        )}

        {/* Manual entry */}
        {mode === "manual" && !pending && (
          <div className="space-y-3">
            <div>
              <label className="font-['Poppins'] text-[11px] text-[#9e876e] block mb-1">
                Product name *
              </label>
              <Input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Chobani Greek Yogurt 0% Plain"
                className="rounded-[12px] border-2 border-[#f3efe7] font-['Poppins'] text-sm"
              />
            </div>
            <div>
              <label className="font-['Poppins'] text-[11px] text-[#9e876e] block mb-1">
                Barcode (optional)
              </label>
              <Input
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="e.g. 818290011503"
                className="rounded-[12px] border-2 border-[#f3efe7] font-['Poppins'] text-sm"
              />
            </div>
            <Button
              onClick={submitManual}
              disabled={!manualName.trim() || lookupBusy}
              className="w-full rounded-[24px] bg-[#172e54] font-['Montserrat'] font-semibold text-sm"
            >
              {lookupBusy ? <Loader2 size={16} className="animate-spin" /> : "Look Up Nutrition"}
            </Button>
          </div>
        )}

        {/* LLM hint flow when OFF misses */}
        {needsHint && !pending && (
          <div className="space-y-3 mt-3 p-3 rounded-[16px] bg-[#fff7ec] border border-[#f4d8a0]">
            <p className="font-['Poppins'] text-[12px] text-[#172e54]">
              Open Food Facts didn't know this barcode ({needsHint}). Tell me what it is and I'll
              estimate the nutrition from the product name.
            </p>
            <Input
              value={hintInput}
              onChange={(e) => setHintInput(e.target.value)}
              placeholder="e.g. Honest Tea Just Green Tea, 16oz"
              className="rounded-[12px] border-2 border-[#f3efe7] font-['Poppins'] text-sm"
            />
            <Button
              onClick={submitHint}
              disabled={!hintInput.trim() || lookupBusy}
              className="w-full rounded-[24px] bg-[#172e54] font-['Montserrat'] font-semibold text-sm"
            >
              {lookupBusy ? <Loader2 size={16} className="animate-spin" /> : "Estimate"}
            </Button>
          </div>
        )}

        {/* Lookup result -> confirm to log */}
        {pending && (
          <div className="space-y-3 mt-2">
            <div className="rounded-[16px] bg-[#f3efe7] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-['Montserrat'] font-bold text-[16px] text-[#172e54]">
                  {pending.name}
                </h3>
                <span
                  className={`text-[10px] font-['Poppins'] px-2 py-0.5 rounded-full ${
                    pending.source === "openfoodfacts"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {pending.source === "openfoodfacts" ? "Open Food Facts" : "LLM estimate"}
                </span>
              </div>
              <p className="font-['Poppins'] text-[11px] text-[#9e876e] mb-3">
                DASH bucket: <strong className="text-[#172e54]">{BUCKET_LABELS[pending.dash_bucket]}</strong>
              </p>
              <NutrientGrid n={pending.nutrients} />
              {pending.notes ? (
                <p className="font-['Poppins'] text-[10px] text-[#bd8e84] mt-2 italic">
                  {pending.notes}
                </p>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPending(null);
                  setNeedsHint(null);
                  if (mode === "scan") void startScanner();
                }}
                variant="outline"
                className="flex-1 rounded-[24px] border-2 border-[#f3efe7] font-['Montserrat'] font-semibold text-sm"
              >
                Re-scan
              </Button>
              <Button
                onClick={confirmAndLog}
                className="flex-1 rounded-[24px] bg-[#f79891] hover:bg-[#f79891]/90 font-['Montserrat'] font-semibold text-sm"
              >
                <Plus size={16} className="mr-1.5" /> Log Meal
              </Button>
            </div>
          </div>
        )}

        {scanError && (
          <p className="font-['Poppins'] text-[11px] text-red-600 mt-3">{scanError}</p>
        )}
      </Card>
    </div>
  );
}

function NutrientGrid({ n }: { n: MealNutrients }) {
  const cells: Array<[string, string]> = [
    ["Calories", `${Math.round(n.calories)} kcal`],
    ["Protein", `${n.protein_g.toFixed(1)} g`],
    ["Carbs", `${n.carbs_g.toFixed(1)} g`],
    ["Fat", `${n.fat_g.toFixed(1)} g`],
    ["Fiber", `${n.fiber_g.toFixed(1)} g`],
    ["Sodium", `${Math.round(n.sodium_mg)} mg`],
    ["Potassium", `${Math.round(n.potassium_mg)} mg`],
    ["Cholesterol", `${Math.round(n.cholesterol_mg)} mg`],
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {cells.map(([k, v]) => (
        <div key={k} className="bg-white rounded-[10px] px-2 py-1.5">
          <p className="font-['Poppins'] text-[9px] text-[#9e876e]">{k}</p>
          <p className="font-['Montserrat'] font-semibold text-[11px] text-[#172e54]">{v}</p>
        </div>
      ))}
    </div>
  );
}
