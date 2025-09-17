// Minimal HKO integration using open Data One 9-day forecast (no API key required)
// Docs: https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=tc

export async function fetchHkoNineDay(lang = 'tc') {
  const url = `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=${encodeURIComponent(lang)}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`HKO HTTP ${res.status}`);
  return res.json();
}

// Given ISO date (YYYY-MM-DD), pick summary and rain probability if available
export function extractDailyForecastNineDay(json, isoDate) {
  try {
    const list = json?.weatherForecast || [];
    const item = list.find((d) => d.forecastDate === isoDate.replace(/-/g, ''));
    if (!item) return null;
    const summary = item.forecastWeather || '';
    const minT = item.forecastMintemp?.value;
    const maxT = item.forecastMaxtemp?.value;
    // 9-day doesn't provide explicit PoP in this endpoint; set null
    return {
      date: isoDate,
      summary,
      min_temp: typeof minT === 'number' ? minT : undefined,
      max_temp: typeof maxT === 'number' ? maxT : undefined,
      precipitation_probability: null,
    };
  } catch {
    return null;
  }
}

export function weatherAdviceFromSummary(summaryText) {
  const text = (summaryText || '').toLowerCase();
  const rainy = /rain|showers|雷雨|陣雨/.test(text);
  const cloudy = /cloud|陰|多雲/.test(text);
  if (rainy) return '可能有雨，建議增加室內活動比例';
  if (cloudy) return '多雲，室外活動可行但留意天氣變化';
  return '天氣良好，適合戶外行程';
}


