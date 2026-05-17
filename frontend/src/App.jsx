import { useState } from 'react';
import { useAqiData } from './hooks/useAqiData';
import CityList    from './components/CityList';
import DetailPanel from './components/DetailPanel';
const CITIES_COUNT = 10; //banyaknya kota yang di definisikan di aqi.js

export default function App() {
  const { cities, loading, error, lastUpdate, refresh } = useAqiData();
  const [selectedId, setSelectedId] = useState('jakarta');

  const selected  = cities.find(c => c.id === selectedId) ?? null;
  const dangerous = cities.filter(c => c.aqi > 200);

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100vh',      
      width:         '100vw',      
      background:    '#0d1117',
      color:         '#e6edf3',
      fontFamily:    'system-ui, sans-serif',
      overflow:      'hidden',
    }}>

      <header style={{
        flexShrink:   0,           
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
        padding:      '0 20px',
        height:       52,
        background:   '#161b22',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'linear-gradient(135deg,#58a6ff,#bc8cff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}>🌫️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>DataLens</div>
            <div style={{ fontSize: 10, color: '#7d8590', fontFamily: 'monospace' }}>
              Kualitas Udara Indonesia
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#7d8590', fontFamily: 'monospace' }}>
            {lastUpdate
              ? `Update: ${lastUpdate.toLocaleTimeString('id-ID')}`
              : 'Memuat...'}
          </span>
          <button
            onClick={refresh}
            style={{
              background:   'none',
              border:       '1px solid rgba(255,255,255,0.1)',
              color:        '#7d8590',
              borderRadius: 6,
              padding:      '4px 10px',
              cursor:       'pointer',
              fontSize:     11,
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {dangerous.length > 0 && (
        <div style={{
          flexShrink:  0,
          background:  'rgba(248,81,73,0.1)',
          borderBottom:'1px solid rgba(248,81,73,0.3)',
          padding:     '8px 20px',
          fontSize:    12,
          color:       '#f85149',
        }}>
          ⚠️ PERINGATAN: {dangerous.map(c => c.name).join(', ')} — kualitas udara BERBAHAYA!
        </div>
      )}

      {loading && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 24 }}>🌫️</div>
          <p style={{ color: '#e6edf3', fontWeight: 600 }}>Memuat data kualitas udara...</p>
          <p style={{ color: '#7d8590', fontSize: 12 }}>
            Mengambil data dari {CITIES_COUNT} kota di Indonesia
          </p>
        </div>
      )}

      {error && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#f85149' }}>❌ {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div style={{
          flex:     1,             
          display:  'grid',
          gridTemplateColumns: '280px 1fr',
          overflow: 'hidden',     
          minHeight: 0,            
        }}>
          <CityList
            cities={cities}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <DetailPanel city={selected} />
        </div>
      )}
    </div>
  );
}