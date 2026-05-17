import { useState } from 'react';
import { getColor, getStatus } from '../utils/aqi';

export default function CityList({ cities, selectedId, onSelect }) {
  const [search, setSearch] = useState('');

  const sorted = [...cities]
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.prov.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.aqi - a.aqi);

  return (
    <aside style={{
      height:        '100%',
      display:       'flex',
      flexDirection: 'column',
      background:    '#161b22',
      borderRight:   '1px solid rgba(255,255,255,0.08)',
      overflow:      'hidden',   
      minHeight:     0,
    }}>

      <div style={{
        flexShrink:   0,
        padding:      '14px 16px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <p style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.8px', color: '#7d8590', marginBottom: 10,
        }}>
          Kota — AQI
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#1c2333', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 6, padding: '6px 10px',
        }}>
          <span style={{ color: '#7d8590', fontSize: 13 }}>🔍</span>
          <input
            type="text"
            placeholder="Cari kota atau provinsi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'none', border: 'none', color: '#e6edf3',
              fontSize: 12, width: '100%', outline: 'none',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none', border: 'none', color: '#7d8590',
                cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0,
              }}
            >×</button>
          )}
        </div>

        <p style={{ fontSize: 10, color: '#7d8590', marginTop: 8 }}>
          {sorted.length} dari {cities.length} kota
        </p>
      </div>

      {/* Daftar kota*/}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {sorted.length === 0 ? (
          <p style={{ padding: '20px 16px', color: '#7d8590', fontSize: 12 }}>
            Kota "{search}" tidak ditemukan.
          </p>
        ) : (
          sorted.map(city => {
            const color    = getColor(city.aqi);
            const status   = getStatus(city.aqi);
            const isActive = city.id === selectedId;

            return (
              <div
                key={city.id}
                onClick={() => onSelect(city.id)}
                style={{
                  display:     'flex',
                  alignItems:  'center',
                  padding:     '10px 16px',
                  cursor:      'pointer',
                  gap:         10,
                  background:  isActive ? 'rgba(88,166,255,0.08)' : 'transparent',
                  borderLeft:  `2px solid ${isActive ? '#58a6ff' : 'transparent'}`,
                  transition:  'background 0.15s',
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: color, flexShrink: 0,
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: 13, color: '#e6edf3' }}>
                    {city.name}
                  </p>
                  <p style={{ fontSize: 10, color: '#7d8590', marginTop: 1 }}>
                    {city.prov}
                  </p>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color }}>
                    {city.aqi}
                  </p>
                  <p style={{ fontSize: 9, color: status.color, marginTop: 2 }}>
                    {status.label}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}