import { useEffect, useRef } from 'react';
import { getColor, getStatus } from '../utils/aqi';

export default function DetailPanel({ city }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!city || !canvasRef.current) return;
    drawChart(canvasRef.current, city.trend ?? [], city.aqi);
  }, [city]);

  if (!city) {
    return (
      <div style={{
        height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#0d1117',
      }}>
        <p style={{ color: '#7d8590' }}>Pilih kota untuk melihat detail.</p>
      </div>
    );
  }

  const color  = getColor(city.aqi);
  const status = getStatus(city.aqi);

  const pollutants = [
    { name: 'PM2.5', value: city.pm25, unit: 'µg/m³', info: 'Partikel halus < 2.5 mikron' },
    { name: 'PM10',  value: city.pm10, unit: 'µg/m³', info: 'Partikel debu < 10 mikron'   },
    { name: 'O₃',    value: city.o3,   unit: 'ppb',    info: 'Ozon permukaan tanah'         },
    { name: 'NO₂',   value: city.no2,  unit: 'ppb',    info: 'Nitrogen dioksida'            },
    { name: 'SO₂',   value: city.so2,  unit: 'ppb',    info: 'Sulfur dioksida'              },
    { name: 'CO',    value: city.co,   unit: 'µg/m³', info: 'Karbon monoksida'             },
  ];

  return (
    <div style={{
      height:        '100%',
      overflowY:     'auto',       
      background:    '#0d1117',
      padding:       '24px 28px',
      display:       'flex',
      flexDirection: 'column',
      gap:           24,
      minHeight:     0,
    }}>

      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
        gap:            24,
        flexWrap:       'wrap',   
      }}>

        <div style={{ minWidth: 200 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700,
            letterSpacing: '-0.5px', color: '#e6edf3', margin: 0,
          }}>
            {city.name}
          </h2>
          <p style={{ fontSize: 12, color: '#7d8590', marginTop: 3, fontFamily: 'monospace' }}>
            {city.prov}
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
            <span style={{
              fontSize: 52, fontWeight: 700,
              fontFamily: 'monospace', lineHeight: 1, color,
            }}>
              {city.aqi}
            </span>
            <div>
              <p style={{ fontSize: 11, color: '#7d8590' }}>AQI</p>
              {city.time && (
                <p style={{ fontSize: 10, color: '#7d8590', marginTop: 2 }}>
                  {new Date(city.time).toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          <span style={{
            display:      'inline-block',
            marginTop:    10,
            padding:      '4px 14px',
            borderRadius: 20,
            fontSize:     12,
            fontWeight:   600,
            background:   color + '22',
            color,
          }}>
            {status.label}
          </span>
        </div>

        {/* Kanan: Grafik tren */}
        <div style={{
          display:       'flex',
          flexDirection: 'column',
          gap:           8,
          flex:          1,
          minWidth:      240, 
        }}>
          <p style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.5px', color: '#7d8590',
          }}>
            Tren 24 jam terakhir
          </p>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: 120, display: 'block' }}
            width={480}
            height={120}
          />
        </div>
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

      <div>
        <p style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.5px', color: '#7d8590', marginBottom: 12,
        }}>
          Komposisi polutan
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10,
        }}>
          {pollutants.map(p => (
            <div key={p.name} style={{
              background:   '#161b22',
              border:       '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding:      '12px 14px',
            }}>
              <p style={{
                fontSize: 10, color: '#7d8590', fontFamily: 'monospace',
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {p.name}
              </p>
              <p style={{
                fontSize: 20, fontWeight: 600, fontFamily: 'monospace',
                color: '#e6edf3', marginTop: 6,
              }}>
                {p.value !== null && p.value !== undefined ? p.value : '—'}
                {p.value !== null && p.value !== undefined && (
                  <span style={{ fontSize: 10, color: '#7d8590', fontWeight: 400 }}>
                    {' '}{p.unit}
                  </span>
                )}
              </p>
              <p style={{ fontSize: 11, color: '#7d8590', marginTop: 4 }}>
                {p.info}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background:   '#161b22',
        border:       '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding:      '14px 16px',
      }}>
        <p style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.5px', color: '#7d8590', marginBottom: 10,
        }}>
          Rekomendasi kesehatan
        </p>
        <p style={{ fontSize: 13, color: '#e6edf3', lineHeight: 1.7 }}>
          {getRecommendation(city.aqi)}
        </p>
      </div>

    </div>
  );
}

/*  Teks rekomendasi berdasarkan AQI  */
function getRecommendation(aqi) {
  if (aqi <= 50)  return '✅ Udara bersih. Aktivitas luar ruangan aman untuk semua orang.';
  if (aqi <= 100) return '🟡 Kelompok sensitif (anak-anak, lansia, penderita asma) sebaiknya kurangi aktivitas berat di luar.';
  if (aqi <= 150) return '🟠 Semua orang sebaiknya kurangi aktivitas luar ruangan yang berkepanjangan. Gunakan masker.';
  if (aqi <= 200) return '🔴 Hindari aktivitas luar ruangan. Tutup jendela. Gunakan air purifier jika tersedia.';
  return '🚨 DARURAT. Tetap di dalam ruangan. Gunakan masker N95 jika harus keluar.';
}

/*  gambar grafik dengan Canvas API  */
function drawChart(canvas, data, currentAqi) {
  const ctx = canvas.getContext('2d');
  const W   = canvas.width;
  const H   = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (!data || data.length < 2) return;

  const pad  = { top: 10, right: 10, bottom: 22, left: 32 };
  const cW   = W - pad.left - pad.right;
  const cH   = H - pad.top  - pad.bottom;
  const max  = Math.max(...data, 200);
  const min  = Math.min(...data, 0);
  const toX  = i => pad.left + (i / (data.length - 1)) * cW;
  const toY  = v => pad.top  + (1 - (v - min) / (max - min)) * cH;
  const color = getColor(currentAqi);

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth   = 0.5;
  [0, 50, 100, 150, 200].forEach(v => {
    if (v < min || v > max) return;
    ctx.beginPath();
    ctx.moveTo(pad.left, toY(v));
    ctx.lineTo(pad.left + cW, toY(v));
    ctx.stroke();
    ctx.fillStyle = 'rgba(125,133,144,0.8)';
    ctx.font      = '9px monospace';
    ctx.fillText(v, 2, toY(v) + 3);
  });

  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  grad.addColorStop(0, color + '55');
  grad.addColorStop(1, color + '05');
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(data[0]));
  data.forEach((v, i) => { if (i > 0) ctx.lineTo(toX(i), toY(v)); });
  ctx.lineTo(toX(data.length - 1), toY(min));
  ctx.lineTo(toX(0), toY(min));
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(toX(0), toY(data[0]));
  data.forEach((v, i) => { if (i > 0) ctx.lineTo(toX(i), toY(v)); });
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.5;
  ctx.lineJoin    = 'round';
  ctx.stroke();

  const now = new Date().getHours();
  ctx.fillStyle = 'rgba(125,133,144,0.8)';
  ctx.font      = '9px monospace';
  [0, 6, 12, 18, 23].forEach(i => {
    const hour = (now - (data.length - 1 - i) + 24) % 24;
    ctx.fillText(hour + 'j', toX(i) - 7, H - 4);
  });
}