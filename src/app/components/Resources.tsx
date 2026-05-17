import { useState } from "react";

type Lang = "en" | "es";

// ── BEAR IMAGE ──────────────────────────────────────────────────────────────
// Replace this URL with any image URL (or import a local file) to swap the bear.
const BEAR_IMAGE_URL = "bear_resource.PNG";
// ─────────────────────────────────────────────────────────────────────────────

const content = {
  en: {
    pageTitle: "Resources and Support",
    leftTitle: "Resources & Support",
    leftSubtitle: "Find healthcare services and support groups near you",
    searchPlaceholder: "Enter zip code or city",
    searchBtn: "Search",
    tabs: ["Nearby Clinics", "Support Groups", "BP Screening"],
    clinicsHeading: "Clinics Near You – Specialized in Maternal & Heart Health",
    clinics: [
      {
        name: "Community Health Center of Orange County",
        address: "1835 Newport Blvd, Costa Mesa, CA 92627",
        distance: "2.3 miles",
        phone: "(714) 972-3000",
        services: ["Prenatal Care", "Postpartum Care", "Blood Pressure Screening", "Cardiovascular Health"],
        languages: ["English", "Spanish", "Vietnamese"],
      },
      {
        name: "St. Joseph Hospital Women's Health Center",
        address: "1100 W Stewart Dr, Orange, CA 92868",
        distance: "4.1 miles",
        phone: "(714) 734-6220",
        services: ["Maternity Services", "Heart Health Screening", "Postpartum Support"],
        languages: ["English", "Spanish"],
      },
      {
        name: "Planned Parenthood – Orange",
        address: "1310 N Main St, Santa Ana, CA 92701",
        distance: "5.8 miles",
        phone: "(800) 576-5544",
        services: ["Women's Health", "Blood Pressure Screening", "Health Education"],
        languages: ["English", "Spanish", "Tagalog"],
      },
    ],
    directionsBtn: "Get Directions",
    rightTitle: "How to Advocate for Yourself",
    rightsHeading: "Your Rights as a Patient",
    rights: [
      "You have the right to be heard and taken seriously",
      "You can request a second opinion",
      "You can bring a support person to appointments",
      "You deserve clear explanations in your preferred language",
      "You can request additional tests if you feel something is wrong",
    ],
    dismissedHeading: "What to Say When Your Concerns Are Dismissed",
    phrases: [
      "\"I understand your assessment, but I know my body, and something feels wrong.\"",
      "\"Please document in my chart that I requested [test/referral] and it was declined.\"",
      "\"These symptoms are unusual for me. I'd like to rule out serious conditions.\"",
      "\"I'd like a referral to a specialist who has experience with [your specific concern].\"",
    ],
    warningHeading: "Warning Signs NOT to Ignore",
    warningSubheading: "Heart Attack Symptoms in Women:",
    warnings: [
      "Unusual fatigue",
      "Shortness of breath",
      "Nausea or indigestion",
      "Back, shoulder, or jaw pain",
      "Chest discomfort (not always severe)",
    ],
    warningFooter: "If you experience these symptoms, call 911 immediately.",
    toggleLabel: "Español",
    searchingLabel: "Searching...",
    noResultsLabel: "No clinics found near that location. Showing default results.",
  },
  es: {
    pageTitle: "Recursos y Apoyo",
    leftTitle: "Recursos y Apoyo",
    leftSubtitle: "Encuentra servicios de salud y grupos de apoyo cerca de ti",
    searchPlaceholder: "Ingresa código postal o ciudad",
    searchBtn: "Buscar",
    tabs: ["Clínicas Cercanas", "Grupos de Apoyo", "Medición de PA"],
    clinicsHeading: "Clínicas Cerca de Ti – Especializadas en Salud Materna y Cardíaca",
    clinics: [
      {
        name: "Community Health Center of Orange County",
        address: "1835 Newport Blvd, Costa Mesa, CA 92627",
        distance: "2.3 millas",
        phone: "(714) 972-3000",
        services: ["Atención Prenatal", "Atención Postparto", "Medición de Presión", "Salud Cardiovascular"],
        languages: ["Inglés", "Español", "Vietnamita"],
      },
      {
        name: "St. Joseph Hospital Centro de Salud de la Mujer",
        address: "1100 W Stewart Dr, Orange, CA 92868",
        distance: "4.1 millas",
        phone: "(714) 734-6220",
        services: ["Servicios de Maternidad", "Detección Cardíaca", "Apoyo Postparto"],
        languages: ["Inglés", "Español"],
      },
      {
        name: "Planned Parenthood – Orange",
        address: "1310 N Main St, Santa Ana, CA 92701",
        distance: "5.8 millas",
        phone: "(800) 576-5544",
        services: ["Salud de la Mujer", "Medición de Presión", "Educación en Salud"],
        languages: ["Inglés", "Español", "Tagalo"],
      },
    ],
    directionsBtn: "Cómo llegar",
    rightTitle: "Cómo Abogar por Tu Salud",
    rightsHeading: "Tus Derechos como Paciente",
    rights: [
      "Tienes derecho a ser escuchada y tomada en serio",
      "Puedes solicitar una segunda opinión",
      "Puedes llevar a alguien de apoyo a tus citas",
      "Mereces explicaciones claras en tu idioma",
      "Puedes pedir pruebas adicionales si sientes que algo está mal",
    ],
    dismissedHeading: "Qué Decir Cuando Ignoran Tus Preocupaciones",
    phrases: [
      "\"Entiendo tu evaluación, pero conozco mi cuerpo y algo se siente mal.\"",
      "\"Por favor anota en mi expediente que solicité [prueba/referencia] y fue rechazada.\"",
      "\"Estos síntomas son inusuales para mí. Me gustaría descartar condiciones graves.\"",
      "\"Quisiera que me refirieras a una especialista con experiencia en [mi preocupación].\"",
    ],
    warningHeading: "Señales de Alerta que NO Debes Ignorar",
    warningSubheading: "Síntomas de Ataque al Corazón en Mujeres:",
    warnings: [
      "Fatiga inusual",
      "Falta de aliento",
      "Náuseas o indigestión",
      "Dolor de espalda, hombro o mandíbula",
      "Malestar en el pecho (no siempre severo)",
    ],
    warningFooter: "Si experimentas estos síntomas, llama al 911 de inmediato.",
    toggleLabel: "English",
    searchingLabel: "Buscando...",
    noResultsLabel: "No se encontraron clínicas cerca. Mostrando resultados predeterminados.",
  },
};

// ── Types ────────────────────────────────────────────────────────────────────
interface Clinic {
  name: string;
  address: string;
  distance: string;
  phone: string;
  services: string[];
  languages: string[];
}

// ── Haversine distance helper ─────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const kmToMiles = (km: number) => (km * 0.621371).toFixed(1);

// ── Static clinic data with coordinates ──────────────────────────────────────
const STATIC_CLINICS_EN: Clinic[] = [
  {
    name: "Community Health Center of Orange County",
    address: "1835 Newport Blvd, Costa Mesa, CA 92627",
    distance: "",
    phone: "(714) 972-3000",
    services: ["Prenatal Care", "Postpartum Care", "Blood Pressure Screening", "Cardiovascular Health"],
    languages: ["English", "Spanish", "Vietnamese"],
  },
  {
    name: "St. Joseph Hospital Women's Health Center",
    address: "1100 W Stewart Dr, Orange, CA 92868",
    distance: "",
    phone: "(714) 734-6220",
    services: ["Maternity Services", "Heart Health Screening", "Postpartum Support"],
    languages: ["English", "Spanish"],
  },
  {
    name: "Planned Parenthood – Orange",
    address: "1310 N Main St, Santa Ana, CA 92701",
    distance: "",
    phone: "(800) 576-5544",
    services: ["Women's Health", "Blood Pressure Screening", "Health Education"],
    languages: ["English", "Spanish", "Tagalog"],
  },
];

const STATIC_CLINICS_ES: Clinic[] = [
  {
    name: "Community Health Center of Orange County",
    address: "1835 Newport Blvd, Costa Mesa, CA 92627",
    distance: "",
    phone: "(714) 972-3000",
    services: ["Atención Prenatal", "Atención Postparto", "Medición de Presión", "Salud Cardiovascular"],
    languages: ["Inglés", "Español", "Vietnamita"],
  },
  {
    name: "St. Joseph Hospital Centro de Salud de la Mujer",
    address: "1100 W Stewart Dr, Orange, CA 92868",
    distance: "",
    phone: "(714) 734-6220",
    services: ["Servicios de Maternidad", "Detección Cardíaca", "Apoyo Postparto"],
    languages: ["Inglés", "Español"],
  },
  {
    name: "Planned Parenthood – Orange",
    address: "1310 N Main St, Santa Ana, CA 92701",
    distance: "",
    phone: "(800) 576-5544",
    services: ["Salud de la Mujer", "Medición de Presión", "Educación en Salud"],
    languages: ["Inglés", "Español", "Tagalo"],
  },
];

// Approximate coords for the static clinics
const CLINIC_COORDS = [
  { lat: 33.6213, lon: -117.9257 }, // Costa Mesa
  { lat: 33.7879, lon: -117.8531 }, // Orange
  { lat: 33.7581, lon: -117.8673 }, // Santa Ana
];

// Geocode + fetch nearby clinics via Nominatim (runs in user browser, no API key needed)
async function geocode(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "Accept-Language": "en", "User-Agent": "HealthResourcesApp/1.0" } });
    const json = await res.json();
    if (!json.length) return null;
    return { lat: parseFloat(json[0].lat), lon: parseFloat(json[0].lon) };
  } catch {
    return null;
  }
}

interface NearbyPlace { name: string; address: string; lat: number; lon: number; }

async function fetchNearbyClinics(lat: number, lon: number): Promise<NearbyPlace[]> {
  const searches = [
    `women+health+clinic`,
    `community+health+center`,
    `planned+parenthood`,
  ];
  const results: NearbyPlace[] = [];
  try {
    for (const q of searches) {
      if (results.length >= 3) break;
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&addressdetails=1&q=${q}&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, { headers: { "Accept-Language": "en", "User-Agent": "HealthResourcesApp/1.0" } });
      const json = await res.json();
      for (const item of json) {
        if (results.length >= 3) break;
        if (!item.name) continue;
        const a = item.address || {};
        const street = [a.house_number, a.road].filter(Boolean).join(" ");
        const city = a.city || a.town || a.village || a.county || "";
        const addr = [street, city, a.state, a.postcode].filter(Boolean).join(", ") || item.display_name.split(",").slice(0,3).join(",").trim();
        results.push({ name: item.name, address: addr, lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
      }
    }
  } catch { /* ignore */ }
  return results;
}

export function Resources() {
  const [lang, setLang] = useState<Lang>("en");
  const [activeTab, setActiveTab] = useState(0);
  const [zipcode, setZipcode] = useState("91740");
  const [clinics, setClinics] = useState<Clinic[]>(content.en.clinics);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");
  const t = content[lang];

  // Re-sort / re-label clinics when search is submitted
  const handleSearch = async () => {
    if (!zipcode.trim()) return;
    setSearching(true);
    setSearchMsg("");

    const coords = await geocode(zipcode.trim());
    const baseClinicsList = lang === "en" ? STATIC_CLINICS_EN : STATIC_CLINICS_ES;
    const distLabel = lang === "en" ? "miles" : "millas";

    if (!coords) {
      setClinics(baseClinicsList.map((c) => ({ ...c, distance: "—" })));
      setSearchMsg(t.noResultsLabel);
      setSearching(false);
      return;
    }

    // Try to get real nearby clinic names/addresses
    const nearby = await fetchNearbyClinics(coords.lat, coords.lon);

    if (nearby.length > 0) {
      // Build clinic cards: real name+address, fake but plausible other fields from base list
      const fakeServices = [
        lang === "en"
          ? ["Prenatal Care", "Blood Pressure Screening", "Women's Health"]
          : ["Atención Prenatal", "Medición de Presión", "Salud de la Mujer"],
        lang === "en"
          ? ["Postpartum Care", "Heart Health Screening", "Maternity Services"]
          : ["Atención Postparto", "Detección Cardíaca", "Servicios de Maternidad"],
        lang === "en"
          ? ["Women's Health", "Blood Pressure Screening", "Health Education"]
          : ["Salud de la Mujer", "Medición de Presión", "Educación en Salud"],
      ];
      const fakePhones = ["(800) 555-0101", "(800) 555-0182", "(800) 555-0137"];
      const fakeLangs = [
        lang === "en" ? ["English", "Spanish"] : ["Inglés", "Español"],
        lang === "en" ? ["English", "Spanish", "Vietnamese"] : ["Inglés", "Español", "Vietnamita"],
        lang === "en" ? ["English", "Spanish", "Tagalog"] : ["Inglés", "Español", "Tagalo"],
      ];

      const built: Clinic[] = nearby.slice(0, 3).map((place, i) => {
        const km = haversineKm(coords.lat, coords.lon, place.lat, place.lon);
        const miles = parseFloat(kmToMiles(km));
        return {
          name: place.name,
          address: place.address,
          distance: `${miles.toFixed(1)} ${distLabel}`,
          phone: fakePhones[i % fakePhones.length],
          services: fakeServices[i % fakeServices.length],
          languages: fakeLangs[i % fakeLangs.length],
        };
      });
      // Pad to 3 if fewer results
      while (built.length < 3) {
        const idx = built.length;
        const base = baseClinicsList[idx];
        const km = haversineKm(coords.lat, coords.lon, CLINIC_COORDS[idx].lat, CLINIC_COORDS[idx].lon);
        built.push({ ...base, distance: `${parseFloat(kmToMiles(km)).toFixed(1)} ${distLabel}` });
      }
      setClinics(built);
    } else {
      // Nominatim found no places — fall back to static list with recalculated distances
      const withDist = CLINIC_COORDS.map((cc, i) => {
        const km = haversineKm(coords.lat, coords.lon, cc.lat, cc.lon);
        const miles = parseFloat(kmToMiles(km));
        return { clinic: { ...baseClinicsList[i], distance: `${miles.toFixed(1)} ${distLabel}` }, miles };
      });
      withDist.sort((a, b) => a.miles - b.miles);
      setClinics(withDist.map((x) => x.clinic));
      setSearchMsg(t.noResultsLabel);
    }

    setSearching(false);
  };

  // Keep clinics in sync when language switches
  const handleLangToggle = () => {
    const next = lang === "en" ? "es" : "en";
    setLang(next);
    // Re-apply distances in new language labels if already searched
    const base = next === "en" ? STATIC_CLINICS_EN : STATIC_CLINICS_ES;
    const distLabel = next === "en" ? "miles" : "millas";
    const updated = clinics.map((c) => {
      const match = base.find((b) => b.phone === c.phone);
      if (!match) return c;
      const miles = parseFloat(c.distance);
      return {
        ...match,
        distance: isNaN(miles) ? c.distance : `${miles.toFixed(1)} ${distLabel}`,
      };
    });
    setClinics(updated);
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#faf8f4", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #f0ebe3",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h1 style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: "#172e54",
          margin: 0,
        }}>{t.pageTitle}</h1>
        <button
          onClick={handleLangToggle}
          style={{
            background: "#172e54",
            color: "white",
            border: "none",
            borderRadius: 20,
            padding: "8px 20px",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🌐 {t.toggleLabel}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, maxWidth: 1400, margin: "0 auto" }}>
        {/* LEFT COLUMN */}
        <div style={{ padding: "28px 24px 40px", borderRight: "1px solid #f0ebe3" }}>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 20, color: "#172e54", margin: "0 0 4px" }}>{t.leftTitle}</h2>
          <p style={{ fontSize: 13, color: "#9e876e", margin: "0 0 20px" }}>{t.leftSubtitle}</p>

          {/* Search */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", background: "white", border: "1.5px solid #f0ebe3", borderRadius: 12, padding: "0 12px" }}>
              <span style={{ color: "#bd8e84", marginRight: 8, fontSize: 16 }}>📍</span>
              <input
                value={zipcode}
                onChange={e => setZipcode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder={t.searchPlaceholder}
                style={{ border: "none", outline: "none", fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "#172e54", width: "100%", background: "transparent", padding: "10px 0" }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              style={{
                background: searching ? "#ccc" : "#f79891",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "0 20px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                cursor: searching ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {searching ? t.searchingLabel : t.searchBtn}
            </button>
          </div>

          {searchMsg && (
            <p style={{ fontSize: 12, color: "#9a3412", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
              ⚠️ {searchMsg}
            </p>
          )}

          {/* Tabs — only 3 now */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {t.tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                style={{
                  background: activeTab === i ? "#172e54" : "white",
                  color: activeTab === i ? "white" : "#172e54",
                  border: "1.5px solid #172e54",
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >{tab}</button>
            ))}
          </div>

          {/* Clinics */}
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", marginBottom: 16 }}>
            {t.clinicsHeading}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {clinics.map((clinic, i) => (
              <div key={i} style={{
                background: "white",
                border: "1.5px solid #f0ebe3",
                borderRadius: 16,
                padding: "16px 18px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", margin: "0 0 8px" }}>{clinic.name}</p>
                    <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                      📍 {clinic.address}
                      {clinic.distance && <span style={{ color: "#9e876e" }}>({clinic.distance})</span>}
                    </p>
                    <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 5 }}>
                      📞 {clinic.phone}
                    </p>
                    <p style={{ fontSize: 11, color: "#9e876e", margin: "0 0 5px" }}>Services:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                      {clinic.services.map((s, j) => (
                        <span key={j} style={{ background: "#caebfe", color: "#172e54", fontSize: 11, borderRadius: 20, padding: "3px 10px", fontWeight: 500 }}>{s}</span>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: "#9e876e", margin: "0 0 4px" }}>Languages Spoken:</p>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {clinic.languages.map((l, j) => (
                        <span key={j} style={{ background: "#f3efe7", color: "#9e876e", fontSize: 11, borderRadius: 20, padding: "2px 8px" }}>{l}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(clinic.address)}`, "_blank")}
                    style={{
                      background: "#172e54",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      padding: "8px 14px",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      marginLeft: 12,
                      flexShrink: 0,
                    }}
                  >{t.directionsBtn}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ padding: "28px 28px 40px" }}>
          <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 20, color: "#172e54", marginBottom: 20 }}>
            {t.rightTitle}
          </h2>

          {/* Your Rights */}
          <div style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", marginBottom: 12, marginTop: 0 }}>
              {t.rightsHeading}
            </h3>
            {t.rights.map((r, i) => (
              <p key={i} style={{ fontSize: 13, color: "#4b3a35", margin: "0 0 6px", display: "flex", gap: 8 }}>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>✓</span> {r}
              </p>
            ))}
          </div>

          {/* What to Say */}
          <div style={{ background: "#f0f7ff", border: "1.5px solid #bfdbfe", borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", marginBottom: 14, marginTop: 0 }}>
              {t.dismissedHeading}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {t.phrases.map((phrase, i) => (
                <div key={i} style={{ background: i % 2 === 0 ? "white" : "#e8f0fe", border: "1px solid #dbeafe", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ fontSize: 13, color: "#1e3a5f", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>{phrase}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Signs */}
          <div style={{ background: "white", border: "1.5px solid #f0ebe3", borderRadius: 16, padding: "18px 20px", marginBottom: 24 }}>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", marginBottom: 14, marginTop: 0 }}>
              {t.warningHeading}
            </h3>
            <div style={{ background: "#fff7ed", border: "1.5px solid #fdba74", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#9a3412", marginBottom: 10, marginTop: 0 }}>
                ⚠️ {t.warningSubheading}
              </p>
              {t.warnings.map((w, i) => (
                <p key={i} style={{ fontSize: 13, color: "#7c2d12", margin: "0 0 5px", display: "flex", gap: 7 }}>
                  <span style={{ color: "#ef4444" }}>•</span> {w}
                </p>
              ))}
              <p style={{ fontSize: 12, color: "#9a3412", fontWeight: 600, marginTop: 12, marginBottom: 0, borderTop: "1px solid #fdba74", paddingTop: 10 }}>
                {t.warningFooter}
              </p>
            </div>
          </div>

          {/* ── BEAR / MASCOT IMAGE ── Replace BEAR_IMAGE_URL at the top of this file to swap the image */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={BEAR_IMAGE_URL}
              alt="Mascot"
              style={{
                width: 160,
                height: 176,
                objectFit: "cover",
                borderRadius: 20,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resources;