import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export function useAqiData() {
  const [cities, setCities]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/aqi/all`);
      setCities(data.data);
      setLastUpdate(new Date());
      setError(null);
    } catch (e) {
      setError('Gagal mengambil data. Periksa koneksi backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5 * 60 * 1000); // tiap 5 menit
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { cities, loading, error, lastUpdate, refresh: fetchAll };
}