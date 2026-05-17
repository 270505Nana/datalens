const router = require('express').Router();
const axios = require('axios');

// List indonesia big cities
const CITIES = [
  { id: 'jakarta',    name: 'Jakarta',    lat: -6.21,  lon: 106.85 },
  { id: 'surabaya',   name: 'Surabaya',   lat: -7.26,  lon: 112.75 },
  { id: 'bandung',    name: 'Bandung',    lat: -6.90,  lon: 107.61 },
  { id: 'medan',      name: 'Medan',      lat:  3.59,  lon:  98.67 },
  { id: 'semarang',   name: 'Semarang',   lat: -6.99,  lon: 110.42 },
  { id: 'makassar',   name: 'Makassar',   lat: -5.14,  lon: 119.43 },
  { id: 'palembang',  name: 'Palembang',  lat: -2.99,  lon: 104.75 },
  { id: 'denpasar',   name: 'Denpasar',   lat: -8.67,  lon: 115.22 },
  { id: 'pekanbaru',  name: 'Pekanbaru',  lat:  0.53,  lon: 101.45 },
  { id: 'balikpapan', name: 'Balikpapan', lat: -1.27,  lon: 116.83 },
];

const BASE_URL = 'https://api.waqi.info/feed';
const TOKEN = process.env.WAQI_API_KEY;

// GET /api/aqi/all
router.get('/aqi/all', async (req, res) => {
  try {
    const results = await Promise.allSettled(
      CITIES.map(city =>
        axios.get(`${BASE_URL}/geo:${city.lat};${city.lon}/`, {
          params: { token: TOKEN },
          timeout: 8000,
        }).then(r => {
          const d = r.data.data;
          return {
            ...city,
            aqi:  d.aqi,
            pm25: d.iaqi?.pm25?.v ?? null,
            pm10: d.iaqi?.pm10?.v ?? null,
            o3:   d.iaqi?.o3?.v   ?? null,
            no2:  d.iaqi?.no2?.v  ?? null,
            so2:  d.iaqi?.so2?.v  ?? null,
            co:   d.iaqi?.co?.v   ?? null,
            time: d.time?.s ?? null,
          };
        })
      )
    );

    const data = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/aqi/:cityId
router.get('/aqi/:cityId', async (req, res) => {
  const city = CITIES.find(c => c.id === req.params.cityId);
  if (!city) return res.status(404).json({ success: false, error: 'Kota tidak ditemukan' });

  try {
    const r = await axios.get(`${BASE_URL}/geo:${city.lat};${city.lon}/`, {
      params: { token: TOKEN },
      timeout: 8000,
    });
    const d = r.data.data;
    res.json({
      success: true,
      data: {
        ...city,
        aqi:     d.aqi,
        iaqi:    d.iaqi,
        forecast: d.forecast,
        time:    d.time?.s,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;