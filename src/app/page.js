"use client";
import React, { useState } from "react";
import axios from "axios";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);

  const fetchCoordinates = async (city) => {
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/geo/1.0/direct`,
        {
          params: {
            q: city,
            limit: 1,
            appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
          },
        }
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { lat, lon };
      } else {
        throw new Error("City not found");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      setError("Could not find city. Please try again.");
      return null;
    }
  };

  const fetchWeather = async (city) => {
    const coordinates = await fetchCoordinates(city);

    if (!coordinates) return;

    const { lat, lon } = coordinates;

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat: lat,
            lon: lon,
            units: "metric",
            appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
          },
        }
      );

      if (response.data && response.data.list) {
        const dailyForecast = [];
        response.data.list.forEach((item) => {
          const date = new Date(item.dt_txt).getDate();
          if (
            !dailyForecast.some(
              (forecast) => new Date(forecast.dt_txt).getDate() === date
            )
          ) {
            dailyForecast.push(item);
          }
        });

        setForecast(dailyForecast);
        setError(null);
      } else {
        setError("No forecast data available for this city.");
        setForecast([]);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Could not fetch weather data. Please try again.");
      setForecast([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city) {
      fetchWeather(city);
    }
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    setForecast([]);
    setError(null);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center w-full bg-mdBlue p-6">
        <div className="w-full max-w-5xl p-8 bg-[#82a5cf3b] rounded-lg shadow-lg">
          <h1 className="text-3xl mb-8">5 Day Weather Forecast</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Lewa część z formularzem */}
            <div className="col-span-1 md:col-span-1 bg-[#31619c1f] p-6 rounded-lg">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={city}
                  onChange={handleCityChange}
                  placeholder="Enter city"
                  className="p-2 border rounded"
                />
                <button
                  type="submit"
                  className="p-2 bg-blue-500 text-white rounded"
                >
                  Get Forecast
                </button>
              </form>
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            {forecast.length > 0 && (
              <div className="col-span-2 bg-[#31619c1f] p-6 rounded-lg flex flex-col">
                <h2 className="text-xl mb-4 font-semibold">Current Weather:</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col items-center">
                    <img
                      src={`http://openweathermap.org/img/w/${forecast[0].weather[0].icon}.png`}
                      alt={forecast[0].weather[0].description}
                      className="w-16 h-16"
                    />
                    <p className="font-bold text-2xl">{city}</p>
                    <p className="font-bold text-3xl">
                      {Math.ceil(forecast[0].main.temp_max)}°C
                    </p>
                    <p>{forecast[0].weather[0].description}</p>
                  </div>
                  <div className="flex flex-col justify-center">
                    <p>Humidity: {forecast[0].main.humidity}%</p>
                    <p>Wind Speed: {forecast[0].wind.speed} km/h</p>
                    <p>Pressure: {forecast[0].main.pressure} hPa</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prognoza na kolejne dni */}
          {forecast.length > 0 && (
            <div className="bg-[#31619c1f] p-6 rounded-lg mt-6">
              <h2 className="text-xl font-semibold mb-4">5-Day Forecast:</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center"
                  >
                    <img
                      src={`http://openweathermap.org/img/w/${day.weather[0].icon}.png`}
                      alt={day.weather[0].description}
                      className="w-12 h-12 mb-2"
                    />
                    <p className="font-bold">
                      {new Date(day.dt_txt).toLocaleDateString()}
                    </p>
                    <p>{day.weather[0].description}</p>
                    <p className="text-lg font-bold">
                      {Math.ceil(day.main.temp_max)}°C
                    </p>
                    <p className="text-sm">
                      Low: {Math.floor(day.main.temp_min)}°C
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WeatherApp;
