const router = require('express').Router();
const axios  = require('axios');

const CITIES = [
  { id: 'jakarta',    name: 'Jakarta',    prov: 'DKI Jakarta',      lat: -6.21, lon: 106.85 },
  { id: 'surabaya',   name: 'Surabaya',   prov: 'Jawa Timur',       lat: -7.26, lon: 112.75 },
  { id: 'bandung',    name: 'Bandung',    prov: 'Jawa Barat',       lat: -6.90, lon: 107.61 },
  { id: 'medan',      name: 'Medan',      prov: 'Sumatra Utara',    lat:  3.59, lon:  98.67 },
  { id: 'semarang',   name: 'Semarang',   prov: 'Jawa Tengah',      lat: -6.99, lon: 110.42 },
  { id: 'makassar',   name: 'Makassar',   prov: 'Sulawesi Selatan', lat: -5.14, lon: 119.43 },
  { id: 'palembang',  name: 'Palembang',  prov: 'Sumatra Selatan',  lat: -2.99, lon: 104.75 },
  { id: 'denpasar',   name: 'Denpasar',   prov: 'Bali',             lat: -8.67, lon: 115.22 },
  { id: 'pekanbaru',  name: 'Pekanbaru',  prov: 'Riau',             lat:  0.53, lon: 101.45 },
  { id: 'balikpapan', name: 'Balikpapan', prov: 'Kalimantan Timur', lat: -1.27, lon: 116.83 },
];

const BASE_URL = 'https://api.waqi.info/feed';
const TOKEN    = process.env.WAQI_API_KEY;

/*
  Generate data tren 24 jam yang realistis berdasarkan AQI aktual.
  Polusi udara punya pola harian: naik pagi (jam sibuk), turun siang,
  naik sore, turun malam. Kita simulasikan pola ini.
*/
function generateTrend(baseAqi) {
  return Array.from({ length: 24 }, (_, i) => {
    // Pola sinusoidal: puncak jam 8 pagi & 6 sore, rendah tengah malam
    const morningPeak   = Math.sin(((i - 8)  / 24) * Math.PI * 2) * 15;
    const eveningPeak   = Math.sin(((i - 18) / 24) * Math.PI * 2) * 10;
    const randomNoise   = (Math.random() - 0.5) * 8; // Variasi acak kecil
    const value = Math.round(baseAqi + morningPeak + eveningPeak + randomNoise);
    return Math.max(5, value); // Minimal AQI = 5, tidak pernah negatif
  });
}


// fetchWithDelay
async function fetchSequential(cities, delayMs = 300) {
  const results = [];

  for (const city of cities) {
    try {
      const r   = await axios.get(`${BASE_URL}/geo:${city.lat};${city.lon}/`, {
        params:  { token: TOKEN },
        timeout: 8000,
      });
      const d   = r.data.data;
      const aqi = typeof d.aqi === 'number' ? d.aqi : 0;

      results.push({
        ...city,
        aqi,
        pm25:  d.iaqi?.pm25?.v ?? null,
        pm10:  d.iaqi?.pm10?.v ?? null,
        o3:    d.iaqi?.o3?.v   ?? null,
        no2:   d.iaqi?.no2?.v  ?? null,
        so2:   d.iaqi?.so2?.v  ?? null,
        co:    d.iaqi?.co?.v   ?? null,
        time:  d.time?.s       ?? null,
        trend: generateTrend(aqi),
        error: null,
      });

      console.log(`${city.name}: AQI ${aqi}`);

    } catch (err) {
      console.warn(`Gagal ${city.name}: ${err.message}`);
      // Tetap masukkan kota dengan data fallback agar UI tidak kosong
      results.push({
        ...city,
        aqi:   0,
        pm25:  null, pm10: null, o3: null,
        no2:   null, so2:  null, co: null,
        time:  null,
        trend: generateTrend(50), 
        error: err.message,
      });
    }
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return results;
}

// GET /api/aqi/all — get all cities
router.get('/aqi/all', async (req, res) => {
  try {
    const data = await fetchSequential(CITIES, 300);

    const berhasil = data.filter(c => !c.error).length;
    console.log(`Total: ${berhasil}/${CITIES.length} kota berhasil`);

    res.json({ success: true, count: data.length, data });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;