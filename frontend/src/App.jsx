import { useState, useEffect, useCallback } from "react";

//  Data kota 
const CITIES_META = [
  { id: "jakarta",    name: "Jakarta",    prov: "DKI Jakarta",      lat: -6.21, lon: 106.85 },
  { id: "surabaya",   name: "Surabaya",   prov: "Jawa Timur",       lat: -7.26, lon: 112.75 },
  { id: "bandung",    name: "Bandung",    prov: "Jawa Barat",       lat: -6.90, lon: 107.61 },
  { id: "medan",      name: "Medan",      prov: "Sumatra Utara",    lat:  3.59, lon:  98.67 },
  { id: "makassar",   name: "Makassar",   prov: "Sulawesi Selatan", lat: -5.14, lon: 119.43 },
  { id: "semarang",   name: "Semarang",   prov: "Jawa Tengah",      lat: -6.99, lon: 110.42 },
  { id: "palembang",  name: "Palembang",  prov: "Sumatra Selatan",  lat: -2.99, lon: 104.75 },
  { id: "denpasar",   name: "Denpasar",   prov: "Bali",             lat: -8.67, lon: 115.22 },
  { id: "pekanbaru",  name: "Pekanbaru",  prov: "Riau",             lat:  0.53, lon: 101.45 },
  { id: "balikpapan", name: "Balikpapan", prov: "Kalimantan Timur", lat: -1.27, lon: 116.83 },
];

//  Helper AQI 
function getAqiInfo(aqi) {
  if (aqi <= 50)  return { label: "Baik",        dot: "#22c55e" };
  if (aqi <= 100) return { label: "Sedang",       dot: "#f97316" };
  if (aqi <= 150) return { label: "Tidak Sehat",  dot: "#f97316" };
  if (aqi <= 200) return { label: "Tidak Sehat",  dot: "#ef4444" };
  if (aqi <= 300) return { label: "Sangat Buruk", dot: "#a855f7" };
  return           { label: "Berbahaya",          dot: "#991b1b" };
}

function getRecommendation(aqi) {
  if (aqi <= 50)  return "Kualitas udara sangat baik. Aman untuk beraktivitas di luar ruangan.";
  if (aqi <= 100) return "Kualitas udara dapat diterima. Kelompok sensitif sebaiknya membatasi aktivitas luar ruangan yang lama.";
  if (aqi <= 150) return "Udara cukup bersih. Nikmati waktu Anda di luar dengan bijak.";
  if (aqi <= 200) return "Hindari aktivitas luar ruangan yang berat. Gunakan masker jika harus keluar.";
  return "Tetap di dalam ruangan. Gunakan masker N95 jika harus keluar.";
}

function generateTrend(base) {
  return Array.from({ length: 24 }, (_, i) => {
    const peak  = Math.sin(((i - 8) / 24) * Math.PI * 2) * 15;
    const noise = (Math.random() - 0.5) * 8;
    return Math.max(5, Math.round(base + peak + noise));
  });
}

//  Hook data 
function useAqiData() {
  const [cities,     setCities]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const res  = await fetch("http://localhost:3001/api/aqi/all");
      const json = await res.json();
      setCities(json.data || []);
      setLastUpdate(new Date());
    } catch {
      // fallback simulasi
      const bases = { jakarta:156, surabaya:82, bandung:45, medan:68, makassar:124, semarang:95, palembang:140, denpasar:32, pekanbaru:175, balikpapan:78 };
      const fallback = CITIES_META.map(c => {
        const aqi = bases[c.id] ?? 80;
        return {
          ...c, aqi,
          pm25: +(aqi * 0.07).toFixed(1),
          pm10: +(aqi * 0.14).toFixed(1),
          o3:   +(14 + Math.random() * 20).toFixed(1),
          no2:  +(3  + Math.random() * 8).toFixed(1),
          time: new Date().toISOString(),
          trend: generateTrend(aqi),
        };
      });
      setCities(fallback);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [fetchAll]);

  return { cities, loading, lastUpdate, refresh: fetchAll };
}

//  Modal Detail
function DetailModal({ city, onClose }) {
  if (!city) return null;
  const info = getAqiInfo(city.aqi);
  const rec  = getRecommendation(city.aqi);
  const timeStr = city.time
    ? new Date(city.time).toLocaleString("id-ID", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })
    : new Date().toLocaleString("id-ID", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 420,
          background: "#fff",
          borderRadius: 24,
          padding: "36px 32px 28px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.15)",
          animation: "slideUp 0.25s ease",
          position: "relative",
        }}
      >
        {/* Arrow close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 28, right: 28,
            background: "none", border: "none",
            fontSize: 20, color: "#9ca3af", cursor: "pointer", lineHeight: 1,
          }}
        >→</button>

        {/* Nama */}
        <h2 style={{
          fontSize: 38, fontWeight: 400, color: "#111",
          letterSpacing: "-1px", lineHeight: 1,
          fontFamily: "'DM Serif Display', Georgia, serif",
          paddingRight: 32,
        }}>
          {city.name}
        </h2>
        <p style={{
          fontSize: 11, fontWeight: 700, color: "#9ca3af",
          letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8,
        }}>
          {city.prov}
        </p>

        <div style={{ height: 1, background: "#f3f4f6", margin: "24px 0" }} />

        {/* AQI  */}
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        
          <div style={{ minWidth: 110 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              color: "#9ca3af", textTransform: "uppercase", marginBottom: 10,
            }}>
              Current AQI
            </div>
            <div style={{
              fontSize: 54, fontWeight: 700, color: "#111", lineHeight: 1,
              fontFamily: "'DM Serif Display', Georgia, serif",
            }}>
              {city.aqi}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#ec4899", marginTop: 8, fontStyle: "italic" }}>
              {info.label}
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
            {[
              { label: "Partikel Halus",    val: city.pm25 },
              { label: "Partikel Debu",     val: city.pm10 },
              { label: "Ozon",              val: city.o3   },
              { label: "Nitrogen Dioksida", val: city.no2  },
            ].map(p => (
              <div key={p.label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#9ca3af" }}>{p.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>
                  {p.val != null ? p.val : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 24,
          background: "#f9fafb",
          borderRadius: 14,
          padding: "18px 20px",
        }}>
          <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.75, fontStyle: "italic" }}>
            "{rec}"
          </p>
        </div>

        <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 14, textAlign: "center" }}>
          Terakhir diperbarui: {timeStr}
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 16,
            padding: "16px",
            background: "#ec4899", color: "#fff",
            border: "none", borderRadius: 50,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Go back
        </button>
      </div>
    </div>
  );
}

function CityCard({ city, onClick, index }) {
  const info = getAqiInfo(city.aqi);
  const [hov, setHov] = useState(false);
  const timeStr = city.time
    ? "Updated " + new Date(city.time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "Updated —";

  return (
    <div
      onClick={() => onClick(city)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   "#fff",
        border:       "1px solid #e5e7eb",
        borderRadius: 16,
        padding:      "24px 24px 22px",
        cursor:       "pointer",
        position:     "relative",
        transition:   "box-shadow 0.2s, transform 0.2s",
        boxShadow:    hov ? "0 8px 24px rgba(0,0,0,0.09)" : "0 1px 3px rgba(0,0,0,0.05)",
        transform:    hov ? "translateY(-2px)" : "none",
        animation:    "cardIn 0.4s ease both",
        animationDelay: `${index * 0.04}s`,
      }}
    >
      <div style={{
        position: "absolute", top: 20, right: 20,
        width: 10, height: 10, borderRadius: "50%",
        background: info.dot,
      }} />

      <div style={{
        fontSize: 22, fontWeight: 400, color: "#111",
        letterSpacing: "-0.3px", paddingRight: 20,
        fontFamily: "'DM Serif Display', Georgia, serif",
      }}>
        {city.name}
      </div>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "#9ca3af",
        letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 5,
      }}>
        {city.prov}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 22 }}>
        <div>
          <div style={{
            fontSize: 38, fontWeight: 700, color: "#111", lineHeight: 1,
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}>
            {city.aqi}
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: "#9ca3af",
            letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 5,
          }}>
            AQI Index
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#ec4899", fontStyle: "italic" }}>
            {info.label}
          </div>
          <div style={{
            fontSize: 9, fontWeight: 700, color: "#d1d5db",
            letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4,
          }}>
            {timeStr}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { cities, loading, lastUpdate, refresh } = useAqiData();
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = cities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.prov.toLowerCase().includes(search.toLowerCase())
  );

  const updateTime = lastUpdate
    ? lastUpdate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes cardIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#fff; }
        input:focus { outline:none; }
        ::placeholder { color:#c4c9d4; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:2px; }
      `}</style>

      <nav style={{
        padding: "28px 64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#ec4899", letterSpacing: "0.01em" }}>
          datalens
        </span>
        <button
          onClick={refresh}
          style={{
            background: "none", border: "1px solid #e5e7eb",
            color: "#9ca3af", borderRadius: 8,
            padding: "6px 14px", fontSize: 11, cursor: "pointer",
            fontFamily: "inherit", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <span style={{ animation: "blink 2s infinite", display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }}/>
          {updateTime}
        </button>
      </nav>

      {/*  HERO  */}
      <section style={{ padding: "16px 64px 64px" }}>
        <h1 style={{
          fontSize: "clamp(44px, 6vw, 80px)",
          fontWeight: 400, lineHeight: 1.05,
          letterSpacing: "-2px", color: "#111",
          fontFamily: "'DM Serif Display', Georgia, serif",
        }}>
          Fresh air for the
        </h1>
        <h1 style={{
          fontSize: "clamp(44px, 6vw, 80px)",
          fontWeight: 400, lineHeight: 1.05,
          letterSpacing: "-2px", color: "#ec4899",
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontStyle: "italic", marginBottom: 28,
        }}>
          people you love.
        </h1>

        <p style={{
          fontSize: 15, color: "#6b7280", lineHeight: 1.75,
          maxWidth: 380, marginBottom: 40,
        }}>
          A minimalist tracker helping you find the cleanest air in Indonesia's major cities, in real-time.
        </p>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "#f3f4f6", borderRadius: 12,
          padding: "14px 20px", maxWidth: 520,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search your city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: "none", border: "none",
              fontSize: 15, color: "#111",
              fontFamily: "inherit", fontWeight: 500, width: "100%",
            }}
          />
        </div>
      </section>

      <section style={{ padding: "0 64px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
            color: "#9ca3af", textTransform: "uppercase",
          }}>
            Live Readings
          </span>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#ec4899", display: "inline-block",
            animation: "blink 2s infinite",
          }}/>
        </div>

        {loading ? (
          <div style={{ padding: "80px 0", color: "#9ca3af", fontSize: 14 }}>
            Memuat data dari {CITIES_META.length} kota...
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {filtered.map((city, i) => (
              <CityCard key={city.id} city={city} onClick={setSelected} index={i} />
            ))}
            {filtered.length === 0 && (
              <p style={{ color: "#9ca3af", fontSize: 14, padding: "20px 0" }}>
                Tidak ada kota "{search}".
              </p>
            )}
          </div>
        )}
      </section>

      {/*  MODAL  */}
      {selected && <DetailModal city={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}