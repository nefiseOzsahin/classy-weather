import { useEffect, useState } from "react";

export default function App() {
  const [city, setCity] = useState("");
  const [location, setLocation] = useState(null);
  const [forecast, setForecast] = useState([]);
  useEffect(
    function () {
      async function fetchWeatherData() {
        if (!city) return;
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
          );
          const data = await res.json();
          if (!data.results || data.results.length === 0) {
            console.log("şehir bulunamadı!");
            return;
          }
          const { latitude, longitude, name, country_code } = data.results[0];
          setLocation({ name, country_code });

          const res2 = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
          );
          const data2 = await res2.json();

          const daily = data2.daily;
          console.log(daily);
          const dailyForecast = daily.time.map((date, index) => {
            const currentDate = new Date(date);
            const dayName =
              index === 0
                ? "TODAY"
                : currentDate
                    .toLocaleDateString("en-US", { weekday: "long" })
                    .toUpperCase();

            return {
              day: dayName,
              date,
              max: daily.temperature_2m_max[index],
              min: daily.temperature_2m_min[index],
              code: daily.weathercode[index],
            };
          });
          setForecast(dailyForecast);
        } catch (err) {
          console.error("Hava durumu alınamadı:", err);
        }
      }

      fetchWeatherData();
    },

    [city]
  );
  return (
    <div className="main">
      <div className="outline">
        <div className="inline">
          <div className="header">CLASSY WEATHER</div>
          <div className="input-container">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              type="text"
              placeholder="SEARCH FROM LOCATION"
              className="input"
            ></input>
          </div>
          {location ? (
            <h1>
              WEATHER {location.name}
              <span className="country"> {location.country_code}</span>
            </h1>
          ) : (
            ""
          )}
          <div className="card-container">
            {forecast &&
              forecast.map((weather) => (
                <WeatherCard key={weather.date} weather={weather} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherCard({ weather }) {
  function getWeatherEmoji(code) {
    switch (code) {
      case 0:
        return "☀️";
      case 1:
        return "🌤️"; // Az bulutlu
      case 2:
        return "⛅"; // Parçalı bulutlu
      case 3:
        return "☁️"; // Kapalı
      case 45:
      case 48:
        return "🌫️"; // Sis
      case 51:
      case 53:
      case 55:
        return "🌦️"; // Çiseleme
      case 61:
      case 63:
      case 65:
        return "🌧️"; // Yağmur
      case 71:
      case 73:
      case 75:
        return "❄️"; // Kar
      case 80:
      case 81:
      case 82:
        return "🌧️"; // Sağanak
      case 95:
      case 96:
      case 99:
        return "⛈️"; // Fırtına
      default:
        return "❓"; // Bilinmeyen
    }
  }
  return (
    <div className="weather-card">
      <div className="emoji">{getWeatherEmoji(weather.code)}</div>
      <div>{weather.day}</div>
      <div className="degree-container">
        <div>{weather.min}°</div> — <div className="max">{weather.max}°</div>
      </div>
    </div>
  );
}
