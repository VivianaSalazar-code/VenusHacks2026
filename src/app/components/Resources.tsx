import { useState, useEffect } from "react";

type Lang = "en" | "es";

// ── BEAR IMAGE ──────────────────────────────────────────────────────────────
const BEAR_IMAGE_URL = "bear_resource.PNG";
// ─────────────────────────────────────────────────────────────────────────────

const content = {
  en: {
    pageTitle: "Resources and Support",
    leftTitle: "Resources & Support",
    leftSubtitle: "Find healthcare services and support groups near you",
    searchPlaceholder: "Search by name, services, or language...",
    locationPlaceholder: "Enter zip code or city",
    locationBtn: "Find",
    searchBtn: "Search",
    clearBtn: "Clear",
    tabs: ["Nearby Clinics", "Support Groups", "BP Screening"],
    clinicsHeading: "Clinics Near You – Specialized in Maternal & Heart Health",
    clinics: [
      {
        id: "clinic1",
        name: "Community Health Center of Orange County",
        address: "1835 Newport Blvd, Costa Mesa, CA 92627",
        lat: 33.6213,
        lng: -117.9257,
        phone: "(714) 972-3000",
        services: ["Prenatal Care", "Postpartum Care", "Blood Pressure Screening", "Cardiovascular Health"],
        languages: ["English", "Spanish", "Vietnamese"],
      },
      {
        id: "clinic2",
        name: "St. Joseph Hospital Women's Health Center",
        address: "1100 W Stewart Dr, Orange, CA 92868",
        lat: 33.7879,
        lng: -117.8531,
        phone: "(714) 734-6220",
        services: ["Maternity Services", "Heart Health Screening", "Postpartum Support"],
        languages: ["English", "Spanish"],
      },
      {
        id: "clinic3",
        name: "Planned Parenthood – Orange",
        address: "1310 N Main St, Santa Ana, CA 92701",
        lat: 33.7581,
        lng: -117.8673,
        phone: "(800) 576-5544",
        services: ["Women's Health", "Blood Pressure Screening", "Health Education"],
        languages: ["English", "Spanish", "Tagalog"],
      },
    ],
    supportGroups: [
      {
        id: "group1",
        name: "Maternal Mental Health Support Group",
        organization: "Postpartum Support International",
        schedule: "Every Tuesday, 6:00 PM - 7:30 PM",
        location: "Online (Zoom)",
        phone: "(800) 944-4773",
        focus: ["Postpartum Depression", "Anxiety", "Birth Trauma"],
        languages: ["English", "Spanish"],
      },
      {
        id: "group2",
        name: "Heart Health Circle for Moms",
        organization: "American Heart Association",
        schedule: "1st & 3rd Wednesday, 10:00 AM - 11:30 AM",
        location: "St. Joseph Hospital, Orange",
        phone: "(714) 734-6200",
        focus: ["Heart Health Education", "Stress Management", "Nutrition"],
        languages: ["English", "Spanish", "Vietnamese"],
      },
      {
        id: "group3",
        name: "New Parent Connection Group",
        organization: "Orange County Family Resource Center",
        schedule: "Thursdays, 11:00 AM - 12:30 PM",
        location: "1835 Newport Blvd, Costa Mesa",
        phone: "(714) 972-3000",
        focus: ["Parenting Support", "Breastfeeding", "Newborn Care"],
        languages: ["English", "Spanish"],
      },
    ],
    bpScreening: [
      {
        id: "bp1",
        name: "Free BP Screening - Costa Mesa",
        location: "Community Health Center, 1835 Newport Blvd",
        schedule: "Mon-Fri, 9:00 AM - 4:00 PM",
        phone: "(714) 972-3000",
        cost: "Free",
        requirements: "No appointment needed",
      },
      {
        id: "bp2",
        name: "Mobile BP Screening Unit",
        location: "Various locations - Call for schedule",
        schedule: "Weekends, 8:00 AM - 2:00 PM",
        phone: "(800) 555-0182",
        cost: "Free",
        requirements: "Walk-ins welcome",
      },
      {
        id: "bp3",
        name: "St. Joseph Hospital BP Clinic",
        location: "1100 W Stewart Dr, Orange",
        schedule: "By appointment, Wednesdays 1:00 PM - 5:00 PM",
        phone: "(714) 734-6220",
        cost: "Sliding scale available",
        requirements: "Call to schedule",
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
    noResultsLabel: "No results found matching your search.",
    noLocationResultsLabel: "No clinics found near that location.",
    searchResultsLabel: (count: number) => `Found ${count} result${count !== 1 ? 's' : ''}`,
  },
  es: {
    pageTitle: "Recursos y Apoyo",
    leftTitle: "Recursos y Apoyo",
    leftSubtitle: "Encuentra servicios de salud y grupos de apoyo cerca de ti",
    searchPlaceholder: "Buscar clínicas, grupos de apoyo o mediciones de PA...",
    locationPlaceholder: "Ingresa código postal o ciudad",
    locationBtn: "Encontrar Clínicas Cercanas",
    searchBtn: "Buscar",
    clearBtn: "Limpiar",
    tabs: ["Clínicas Cercanas", "Grupos de Apoyo", "Medición de PA"],
    clinicsHeading: "Clínicas Cerca de Ti – Especializadas en Salud Materna y Cardíaca",
    clinics: [
      {
        id: "clinic1",
        name: "Community Health Center of Orange County",
        address: "1835 Newport Blvd, Costa Mesa, CA 92627",
        lat: 33.6213,
        lng: -117.9257,
        phone: "(714) 972-3000",
        services: ["Atención Prenatal", "Atención Postparto", "Medición de Presión", "Salud Cardiovascular"],
        languages: ["Inglés", "Español", "Vietnamita"],
      },
      {
        id: "clinic2",
        name: "St. Joseph Hospital Centro de Salud de la Mujer",
        address: "1100 W Stewart Dr, Orange, CA 92868",
        lat: 33.7879,
        lng: -117.8531,
        phone: "(714) 734-6220",
        services: ["Servicios de Maternidad", "Detección Cardíaca", "Apoyo Postparto"],
        languages: ["Inglés", "Español"],
      },
      {
        id: "clinic3",
        name: "Planned Parenthood – Orange",
        address: "1310 N Main St, Santa Ana, CA 92701",
        lat: 33.7581,
        lng: -117.8673,
        phone: "(800) 576-5544",
        services: ["Salud de la Mujer", "Medición de Presión", "Educación en Salud"],
        languages: ["Inglés", "Español", "Tagalo"],
      },
    ],
    supportGroups: [
      {
        id: "group1",
        name: "Grupo de Apoyo para Salud Mental Materna",
        organization: "Postpartum Support International",
        schedule: "Cada martes, 6:00 PM - 7:30 PM",
        location: "En línea (Zoom)",
        phone: "(800) 944-4773",
        focus: ["Depresión Postparto", "Ansiedad", "Trauma de Parto"],
        languages: ["Inglés", "Español"],
      },
      {
        id: "group2",
        name: "Círculo de Salud Cardíaca para Mamás",
        organization: "American Heart Association",
        schedule: "1er y 3er miércoles, 10:00 AM - 11:30 AM",
        location: "St. Joseph Hospital, Orange",
        phone: "(714) 734-6200",
        focus: ["Educación Cardíaca", "Manejo de Estrés", "Nutrición"],
        languages: ["Inglés", "Español", "Vietnamita"],
      },
      {
        id: "group3",
        name: "Grupo de Conexión para Nuevos Padres",
        organization: "Orange County Family Resource Center",
        schedule: "Jueves, 11:00 AM - 12:30 PM",
        location: "1835 Newport Blvd, Costa Mesa",
        phone: "(714) 972-3000",
        focus: ["Apoyo Parental", "Lactancia", "Cuidado del Recién Nacido"],
        languages: ["Inglés", "Español"],
      },
    ],
    bpScreening: [
      {
        id: "bp1",
        name: "Medición de PA Gratuita - Costa Mesa",
        location: "Community Health Center, 1835 Newport Blvd",
        schedule: "Lun-Vie, 9:00 AM - 4:00 PM",
        phone: "(714) 972-3000",
        cost: "Gratis",
        requirements: "Sin cita necesaria",
      },
      {
        id: "bp2",
        name: "Unidad Móvil de Medición de PA",
        location: "Varios lugares - Llame para horario",
        schedule: "Fines de semana, 8:00 AM - 2:00 PM",
        phone: "(800) 555-0182",
        cost: "Gratis",
        requirements: "Puede llegar sin cita",
      },
      {
        id: "bp3",
        name: "Clínica de PA St. Joseph Hospital",
        location: "1100 W Stewart Dr, Orange",
        schedule: "Con cita, miércoles 1:00 PM - 5:00 PM",
        phone: "(714) 734-6220",
        cost: "Escala móvil disponible",
        requirements: "Llame para agendar",
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
    noResultsLabel: "No se encontraron resultados que coincidan con tu búsqueda.",
    noLocationResultsLabel: "No se encontraron clínicas cerca de esa ubicación.",
    searchResultsLabel: (count: number) => `Se encontraron ${count} resultado${count !== 1 ? 's' : ''}`,
  },
};

interface Clinic {
  id: string;
  name: string;
  address: string;
  distance: string;
  lat: number;
  lng: number;
  phone: string;
  services: string[];
  languages: string[];
}

interface SupportGroup {
  id: string;
  name: string;
  organization: string;
  schedule: string;
  location: string;
  phone: string;
  focus: string[];
  languages: string[];
}

interface BPScreening {
  id: string;
  name: string;
  location: string;
  schedule: string;
  phone: string;
  cost: string;
  requirements: string;
}

// Haversine distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

async function geocode(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}&countrycodes=us`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "HealthResourcesApp/1.0"
      }
    });
    const json = await res.json();
    if (!json.length) return null;
    return {
      lat: parseFloat(json[0].lat),
      lon: parseFloat(json[0].lon)
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

async function searchRealClinics(lat: number, lon: number, radiusMeters: number = 5000): Promise<any[]> {
  const overpassQuery = `
    [out:json];
    (
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="clinic"](around:${radiusMeters},${lat},${lon});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lon});
      node["amenity"="doctors"](around:${radiusMeters},${lat},${lon});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lon});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
    );
    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error("Overpass API error:", error);
    return [];
  }
}

export function Resources() {
  const [lang, setLang] = useState<Lang>("en");
  const [activeTab, setActiveTab] = useState(0);
  const [zipcode, setZipcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [clinics, setClinics] = useState<Clinic[]>(content.en.clinics);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>(content.en.supportGroups);
  const [bpScreenings, setBPScreenings] = useState<BPScreening[]>(content.en.bpScreening);

  const [locationSearching, setLocationSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ type: string; data: any }[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const t = content[lang];

  useEffect(() => {
    const newClinics = lang === "en" ? content.en.clinics : content.es.clinics;
    const newSupportGroups = lang === "en" ? content.en.supportGroups : content.es.supportGroups;
    const newBPScreenings = lang === "en" ? content.en.bpScreening : content.es.bpScreening;

    setClinics(newClinics);
    setSupportGroups(newSupportGroups);
    setBPScreenings(newBPScreenings);
  }, [lang]);

  // Unified search function for text search - returns same format as location search
  const handleTextSearch = () => {
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      setSearchMsg("");
      return;
    }

    setIsSearching(true);
    const searchTerm = searchQuery.toLowerCase().trim();
    const results: { type: string; data: any }[] = [];

    // Search clinics
    clinics.forEach(clinic => {
      const matches =
        clinic.name.toLowerCase().includes(searchTerm) ||
        clinic.services.some(s => s.toLowerCase().includes(searchTerm)) ||
        clinic.address.toLowerCase().includes(searchTerm) ||
        clinic.languages.some(l => l.toLowerCase().includes(searchTerm));

      if (matches) {
        results.push({ type: 'clinic', data: { ...clinic, distance: clinic.distance || 'Distance available with location search' } });
      }
    });

    // Search support groups
    supportGroups.forEach(group => {
      const matches =
        group.name.toLowerCase().includes(searchTerm) ||
        group.focus.some(f => f.toLowerCase().includes(searchTerm)) ||
        group.organization.toLowerCase().includes(searchTerm) ||
        group.languages.some(l => l.toLowerCase().includes(searchTerm));

      if (matches) {
        results.push({ type: 'supportGroup', data: group });
      }
    });

    // Search BP screenings
    bpScreenings.forEach(bp => {
      const matches =
        bp.name.toLowerCase().includes(searchTerm) ||
        bp.location.toLowerCase().includes(searchTerm) ||
        bp.requirements.toLowerCase().includes(searchTerm) ||
        bp.cost.toLowerCase().includes(searchTerm);

      if (matches) {
        results.push({ type: 'bpScreening', data: bp });
      }
    });

    setSearchResults(results);
    setShowSearchResults(true);

    if (results.length === 0) {
      setSearchMsg(t.noResultsLabel);
    } else {
      setSearchMsg(`✅ Found ${results.length} result${results.length !== 1 ? 's' : ''}`);
    }

    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchMsg("");
  };

  // Location search function
  const handleLocationSearch = async () => {
    if (!zipcode.trim()) {
      alert("Please enter a zip code or city");
      return;
    }

    setLocationSearching(true);
    setSearchMsg("🔍 Searching for clinics near " + zipcode + "...");
    setShowSearchResults(false);

    try {
      const coords = await geocode(zipcode.trim());

      if (!coords) {
        setSearchMsg("⚠️ Could not find that location. Please try a different zip code or city name.");
        setLocationSearching(false);
        return;
      }

      const realClinicsData = await searchRealClinics(coords.lat, coords.lon, 8000);

      if (realClinicsData && realClinicsData.length > 0) {
        const processedClinics: Clinic[] = realClinicsData.slice(0, 12).map((element: any, index: number) => {
          const distance = calculateDistance(coords.lat, coords.lon, element.lat, element.lon);
          const tags = element.tags || {};

          let name = tags.name || tags.operator || "";
          if (!name) {
            const type = tags.amenity || tags.healthcare || "Healthcare Facility";
            name = `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`;
          }

          const services = [];
          if (tags.healthcare) services.push(tags.healthcare);
          if (tags["healthcare:speciality"]) services.push(tags["healthcare:speciality"]);
          if (tags.amenity === "clinic") services.push("General Medical Care");
          if (services.length === 0) services.push("Healthcare Services");

          let phone = tags.phone || tags["contact:phone"] || "Contact clinic directly";

          let address = tags["addr:full"] || "";
          if (!address) {
            const street = tags["addr:street"] || "";
            const city = tags["addr:city"] || "";
            address = street ? `${street}, ${city}` : "Address available at clinic";
          }

          const languages = ["English"];
          if (lang === "es") languages.unshift("Español");

          return {
            id: element.id.toString(),
            name: name,
            address: address || "Address available at clinic",
            distance: `${distance} ${lang === "en" ? "miles" : "millas"}`,
            lat: element.lat,
            lng: element.lon,
            phone: phone,
            services: services.slice(0, 4),
            languages: [...new Set(languages)].slice(0, 3),
          };
        });

        const sortedClinics = processedClinics.sort((a, b) =>
          parseFloat(a.distance) - parseFloat(b.distance)
        );

        setClinics(sortedClinics);
        setSearchMsg(`✅ Found ${sortedClinics.length} real healthcare facilities near ${zipcode.toUpperCase()}. Sorted by distance.`);
      } else {
        const baseClinics = lang === "en" ? content.en.clinics : content.es.clinics;
        const clinicsWithDistance = baseClinics.map(clinic => {
          const distance = calculateDistance(coords.lat, coords.lon, clinic.lat, clinic.lng);
          return {
            ...clinic,
            distance: `${distance} ${lang === "en" ? "miles" : "millas"}`
          };
        }).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

        setClinics(clinicsWithDistance);
        setSearchMsg(`📍 Showing ${clinicsWithDistance.length} clinics near ${zipcode.toUpperCase()} (distance calculated)`);
      }

    } catch (error) {
      console.error("Location search error:", error);
      setSearchMsg("⚠️ Error searching for clinics. Please try again.");
    }

    setLocationSearching(false);
  };

  // Render search results in same format as location results
  const renderSearchResults = () => {
    if (!showSearchResults) return null;

    if (searchResults.length === 0 && searchQuery) {
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#9e876e" }}>
          No results found. Try different keywords.
        </div>
      );
    }

    return (
      <div>
        {searchResults.map((result, idx) => (
          <div key={idx} style={{
            background: "white",
            border: "1.5px solid #f0ebe3",
            borderRadius: 16,
            padding: "16px 18px",
            marginBottom: 14,
          }}>
            {/* Clinic Result - Same format as location search */}
            {result.type === 'clinic' && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ background: "#dbeafe", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>🏥 Clinic</span>
                  </div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", margin: "0 0 8px" }}>
                    {result.data.name}
                  </p>
                  <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                    📍 {result.data.address}
                    {result.data.distance && result.data.distance !== 'Distance available with location search' &&
                      <span style={{ color: "#9e876e" }}>({result.data.distance})</span>
                    }
                  </p>
                  <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 5 }}>
                    📞 {result.data.phone}
                  </p>
                  <p style={{ fontSize: 11, color: "#9e876e", margin: "0 0 5px" }}>Services:</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                    {result.data.services.map((s: string, j: number) => (
                      <span key={j} style={{ background: "#caebfe", color: "#172e54", fontSize: 11, borderRadius: 20, padding: "3px 10px", fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#9e876e", margin: "0 0 4px" }}>Languages Spoken:</p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {result.data.languages.map((l: string, j: number) => (
                      <span key={j} style={{ background: "#f3efe7", color: "#9e876e", fontSize: 11, borderRadius: 20, padding: "2px 8px" }}>{l}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(result.data.address)}`, "_blank")}
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
            )}

            {/* Support Group Result */}
            {result.type === 'supportGroup' && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ background: "#dcfce7", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>👥 Support Group</span>
                </div>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", margin: "0 0 8px" }}>
                  {result.data.name}
                </p>
                <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px" }}>🏢 {result.data.organization}</p>
                <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                  📅 {result.data.schedule}
                </p>
                <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                  📍 {result.data.location}
                </p>
                <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 5 }}>
                  📞 {result.data.phone}
                </p>
                <p style={{ fontSize: 11, color: "#9e876e", margin: "0 0 5px" }}>Focus Areas:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                  {result.data.focus.map((f: string, j: number) => (
                    <span key={j} style={{ background: "#caebfe", color: "#172e54", fontSize: 11, borderRadius: 20, padding: "3px 10px", fontWeight: 500 }}>{f}</span>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: "#9e876e", margin: "0 0 4px" }}>Languages:</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {result.data.languages.map((l: string, j: number) => (
                    <span key={j} style={{ background: "#f3efe7", color: "#9e876e", fontSize: 11, borderRadius: 20, padding: "2px 8px" }}>{l}</span>
                  ))}
                </div>
              </div>
            )}

            {/* BP Screening Result */}
            {result.type === 'bpScreening' && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ background: "#fef3c7", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>❤️ BP Screening</span>
                </div>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", margin: "0 0 8px" }}>
                  {result.data.name}
                </p>
                <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                  📍 {result.data.location}
                </p>
                <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                  📅 {result.data.schedule}
                </p>
                <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                  📞 {result.data.phone}
                </p>
                <p style={{ fontSize: 12, color: "#2e7d32", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                  💰 {result.data.cost}
                </p>
                <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
                  📋 {result.data.requirements}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render clinic results (for location search or tab view)
  const renderClinics = () => {
    return clinics.map((clinic, i) => (
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
    ));
  };

  const renderSupportGroups = () => {
    return supportGroups.map((group, i) => (
      <div key={i} style={{
        background: "white",
        border: "1.5px solid #f0ebe3",
        borderRadius: 16,
        padding: "16px 18px",
      }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", margin: "0 0 8px" }}>{group.name}</p>
        <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px" }}>🏢 {group.organization}</p>
        <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
          📅 {group.schedule}
        </p>
        <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
          📍 {group.location}
        </p>
        <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 5 }}>
          📞 {group.phone}
        </p>
        <p style={{ fontSize: 11, color: "#9e876e", margin: "0 0 5px" }}>Focus Areas:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          {group.focus.map((f, j) => (
            <span key={j} style={{ background: "#caebfe", color: "#172e54", fontSize: 11, borderRadius: 20, padding: "3px 10px", fontWeight: 500 }}>{f}</span>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "#9e876e", margin: "0 0 4px" }}>Languages:</p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {group.languages.map((l, j) => (
            <span key={j} style={{ background: "#f3efe7", color: "#9e876e", fontSize: 11, borderRadius: 20, padding: "2px 8px" }}>{l}</span>
          ))}
        </div>
      </div>
    ));
  };

  const renderBPScreenings = () => {
    return bpScreenings.map((bp, i) => (
      <div key={i} style={{
        background: "white",
        border: "1.5px solid #f0ebe3",
        borderRadius: 16,
        padding: "16px 18px",
      }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", margin: "0 0 8px" }}>{bp.name}</p>
        <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
          📍 {bp.location}
        </p>
        <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
          📅 {bp.schedule}
        </p>
        <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
          📞 {bp.phone}
        </p>
        <p style={{ fontSize: 12, color: "#2e7d32", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
          💰 {bp.cost}
        </p>
        <p style={{ fontSize: 12, color: "#bd8e84", margin: "0 0 3px", display: "flex", alignItems: "center", gap: 5 }}>
          📋 {bp.requirements}
        </p>
      </div>
    ));
  };

  return (
    <div style={{
      fontFamily: "'Poppins', sans-serif",
      background: "#faf8f4",
      minHeight: "100vh",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header - Fixed */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #f0ebe3",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        flexShrink: 0,
      }}>
        <h1 style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: 26,
          color: "#172e54",
          margin: 0,
        }}>{t.pageTitle}</h1>
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
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

      {/* Scrollable Content Area */}
      <div style={{
        flex: 1,
        overflow: "auto",
        minHeight: 0,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, maxWidth: 1400, margin: "0 auto" }}>
          {/* LEFT COLUMN */}
          <div style={{ padding: "28px 24px 40px", borderRight: "1px solid #f0ebe3" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 20, color: "#172e54", margin: "0 0 4px" }}>{t.leftTitle}</h2>
            <p style={{ fontSize: 13, color: "#9e876e", margin: "0 0 20px" }}>{t.leftSubtitle}</p>

            {/* Text Search */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", background: "white", border: "1.5px solid #f0ebe3", borderRadius: 12, padding: "0 12px" }}>
                  <span style={{ color: "#bd8e84", marginRight: 8, fontSize: 16 }}>🔍</span>
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleTextSearch()}
                    placeholder={t.searchPlaceholder}
                    style={{ border: "none", outline: "none", fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "#172e54", width: "100%", background: "transparent", padding: "10px 0" }}
                  />
                </div>
                <button
                  onClick={handleTextSearch}
                  disabled={isSearching}
                  style={{
                    background: "#f79891",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "0 20px",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isSearching ? "..." : t.searchBtn}
                </button>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    style={{
                      background: "#e2e8f0",
                      color: "#172e54",
                      border: "none",
                      borderRadius: 12,
                      padding: "0 16px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✕ {t.clearBtn}
                  </button>
                )}
              </div>
            </div>

            {/* Location Search */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "white", border: "1.5px solid #f0ebe3", borderRadius: 12, padding: "0 12px" }}>
                <span style={{ color: "#bd8e84", marginRight: 8, fontSize: 16 }}>📍</span>
                <input
                  value={zipcode}
                  onChange={e => setZipcode(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLocationSearch()}
                  placeholder={t.locationPlaceholder}
                  style={{ border: "none", outline: "none", fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "#172e54", width: "100%", background: "transparent", padding: "10px 0" }}
                />
              </div>
              <button
                onClick={handleLocationSearch}
                disabled={locationSearching}
                style={{
                  background: locationSearching ? "#ccc" : "#172e54",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  padding: "0 20px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: locationSearching ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {locationSearching ? "⏳" : "📍"} {t.locationBtn}
              </button>
            </div>

            {/* Search Result Message */}
            {searchMsg && (
              <p style={{
                fontSize: 12,
                color: searchMsg.includes("✅") || searchMsg.includes("Found") ? "#166534" : "#9a3412",
                background: searchMsg.includes("✅") || searchMsg.includes("Found") ? "#f0fdf4" : "#fff7ed",
                border: `1px solid ${searchMsg.includes("✅") || searchMsg.includes("Found") ? "#86efac" : "#fdba74"}`,
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 14
              }}>
                {searchMsg}
              </p>
            )}

            {/* Tabs - Only show when not in search results mode */}
            {!showSearchResults && (
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
            )}

            {/* Content */}
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 15, color: "#172e54", marginBottom: 16 }}>
              {showSearchResults ? "Search Results" : (activeTab === 0 ? t.clinicsHeading : activeTab === 1 ? "Support Groups Near You" : "Blood Pressure Screening Locations")}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {renderSearchResults()}
              {!showSearchResults && activeTab === 0 && renderClinics()}
              {!showSearchResults && activeTab === 1 && renderSupportGroups()}
              {!showSearchResults && activeTab === 2 && renderBPScreenings()}
            </div>
          </div>

          {/* RIGHT COLUMN - Fixed */}
          <div style={{ padding: "28px 28px 40px" }}>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 20, color: "#172e54", marginBottom: 20 }}>
              {t.rightTitle}
            </h2>

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
    </div>
  );
}

export default Resources;
