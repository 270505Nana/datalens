// helper fungsi AQI

export function getColor(aqi) {
  if (aqi <= 50)  return '#3fb950';
  if (aqi <= 100) return '#d29922';
  if (aqi <= 150) return '#db6d28';
  if (aqi <= 200) return '#f85149';
  if (aqi <= 300) return '#bc8cff';
  return '#ff7b72';
}

export function getStatus(aqi) {
  if (aqi <= 50)  return { label: 'Baik',                  color: '#3fb950' };
  if (aqi <= 100) return { label: 'Sedang',                 color: '#d29922' };
  if (aqi <= 150) return { label: 'Tidak Sehat (Sensitif)', color: '#db6d28' };
  if (aqi <= 200) return { label: 'Tidak Sehat',            color: '#f85149' };
  if (aqi <= 300) return { label: 'Sangat Tidak Sehat',     color: '#bc8cff' };
  return           { label: 'BERBAHAYA',                    color: '#ff7b72' };
}