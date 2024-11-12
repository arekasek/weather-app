import React, { useState } from "react";
import axios from "axios";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeather = async (city) => {
    try {
      const response = await axios.get(`http://api.weatherstack.com/forecast`, {
        params: {
          access_key: process.env.REACT_APP_WEATHERSTACK_API_KEY,
          query: city,
          forecast_days: 5,
        },
      });

      setForecast(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Could not fetch weather data. Please try again.");
      setForecast(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city) {
      fetchWeather(city);
    }
  };

  return (
    <div>
      <h1>Weather Forecast</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
        />
        <button type="submit">Get Weather</button>
      </form>

      {error && <p>{error}</p>}

      {forecast && (
        <div>
          <h2>
            Weather in {forecast.location.name}, {forecast.location.country}
          </h2>
          <p>Current Temperature: {forecast.current.temperature}°C</p>
          <h3>Forecast for next days:</h3>
          <ul>
            {Object.entries(forecast.forecast).map(([date, data]) => (
              <li key={date}>
                {date}: {data.maxtemp}°C / {data.mintemp}°C,{" "}
                {data.condition.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
