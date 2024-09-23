"use client";
import React, { useState } from "react";
import axios from "axios";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);

  const weatherIcons = {
    "clear sky": "/clear-sky.svg",
    "few clouds": "/few-clouds.svg",
    "scattered clouds": "/scattered-clouds.svg",
    "broken clouds": "/broken-clouds.svg",
    "shower rain": "/shower-rain.svg",
    rain: "/rain.svg",
    thunderstorm: "/thunderstorm.svg",
    snow: "/snow.svg",
    mist: "/mist.svg",
  };

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
    <div className="flex flex-row">
      <div className="min-h-screen  w-[35vw] bg-[#2161af86] flex flex-col items-center p-8 gap-8">
        <form
          onSubmit={handleSubmit}
          className="flex flex-row gap-4 w-full justify-center"
        >
          <input
            type="text"
            value={city}
            onChange={handleCityChange}
            placeholder="Enter city"
            className="p-2 border rounded"
          />
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Get Forecast
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {forecast.length > 0 && (
          <div className="col-span-2 row-span-2 bg-[#31619c1f] p-6 rounded-lg flex flex-col">
            <div className="grid grid-cols-1">
              <div className="flex flex-col items-center">
                <img
                  src={
                    weatherIcons[forecast[0].weather[0].description] ||
                    "/icons/weather/default.png"
                  }
                  alt={forecast[0].weather[0].description}
                  className="w-64"
                />
                <p className="font-bold text-2xl">{city}</p>
                <p className="font-bold text-3xl">
                  {Math.ceil(forecast[0].main.temp_max)}°C
                </p>
                <p>{forecast[0].weather[0].description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center w-full bg-mdBlue p-6">
        <div className="w-fit  p-8  rounded-lg">
          {forecast.length > 0 && (
            <div className="bg-[#31619c1f] p-6 rounded-lg">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center"
                  >
                    <img
                      src={
                        weatherIcons[day.weather[0].description] ||
                        "/icons/weather/default.png"
                      }
                      alt={day.weather[0].description}
                      className="w-12 h-12"
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
    </div>
  );
};

export default WeatherApp;
