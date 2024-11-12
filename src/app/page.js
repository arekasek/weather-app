"use client";
import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [forecast, setForecast] = useState([]);
  const [cityInfo, setCityInfo] = useState(null);
  const [error, setError] = useState(null);

  const weatherIcons = {
    "clear sky": "/clear-sky.svg",
    "few clouds": "/few-clouds.svg",
    "scattered clouds": "/scattered-clouds.svg",
    "overcast clouds": "/cloudy.svg",
    "broken clouds": "/broken-clouds.svg",
    "light rain": "/shower-rain.svg",
    rain: "/rain.svg",
    thunderstorm: "/thunderstorm.svg",
    snow: "/snow.svg",
    mist: "/mist.svg",
    "moderate rain": "/rain.svg",
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
            lat,
            lon,
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
        setCityInfo(response.data.city);
        setError(null);
      } else {
        setError("No forecast data available for this city.");
        setForecast([]);
        setCityInfo(null);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Could not fetch weather data. Please try again.");
      setForecast([]);
      setCityInfo(null);
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
    setCityInfo(null);
    setError(null);
  };

  const getMinimalistChartData = () => {
    const labels = forecast.map((day) =>
      new Date(day.dt_txt).toLocaleDateString()
    );
    const tempData = forecast.map((day) => day.main.temp);
    const tempMaxData = forecast.map((day) => day.main.temp_max);
    const tempMinData = forecast.map((day) => day.main.temp_min);
    const feelsLikeData = forecast.map((day) => day.main.feels_like);

    return {
      labels,
      datasets: [
        {
          label: "Temp",
          data: tempData,
          borderColor: "#42A5F5",
          backgroundColor: "rgba(66, 165, 245, 0.2)",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        },
        {
          label: "Temp Max",
          data: tempMaxData,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        },
        {
          label: "Temp Min",
          data: tempMinData,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        },
        {
          label: "Feels Like",
          data: feelsLikeData,
          borderColor: "rgb(153, 102, 255)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderWidth: 2,
          fill: false,
          tension: 0.3,
        },
      ],
    };
  };
  const minimalistChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    elements: {
      line: {
        tension: 0.3,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Temperature (°C)",
        },
        grid: {
          display: false,
        },
        ticks: {
          stepSize: 2,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8 bg-[#7c7c7c98]">
      <div className="bg-white w-[90vw] h-[90vh] flex flex-row shadow-2xl rounded-3xl">
        {/* Left side with search bar */}
        <div className="left-side-weather w-[20vw] bg-[#e2e2e28e] rounded-l-3xl flex flex-col items-center p-8 gap-8 h-full">
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
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded"
            >
              Get Forecast
            </button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* Right side with forecast details and chart */}
        <div className="right-side-weather flex-grow flex flex-col justify-center items-center p-6 rounded-r-3xl bg-[#9e9e9e42] h-full">
          <div className="grid grid-cols-3 gap-4 w-full h-full">
            {/* Today's Weather */}
            {forecast.length > 0 && (
              <div className="bg-[#EFEFEF] rounded-lg  p-4 flex flex-col items-center">
                <img
                  src={
                    weatherIcons[forecast[0].weather[0].description] ||
                    "/icons/weather/default.png"
                  }
                  alt={forecast[0].weather[0].description}
                  className="w-[80px] h-[80px] mb-4"
                />
                <p className="text-3xl font-bold">
                  {Math.ceil(forecast[0].main.temp_max)}°C
                </p>
                <p className="text-lg">{forecast[0].weather[0].description}</p>
                <p>Feels like: {forecast[0].main.feels_like}°C</p>
                <p>Humidity: {forecast[0].main.humidity}%</p>
                <p>Wind: {forecast[0].wind.speed} m/s</p>
              </div>
            )}
            <div className="bg-[#EFEFEF] rounded-lg  flex items-center justify-center col-span-2">
              {forecast.length > 0 && (
                <div className="mb-6 w-[80%]">
                  <h3 className="text-xl font-bold mb-4">
                    Temperature Over 5 Days
                  </h3>
                  <Line
                    data={getMinimalistChartData()}
                    options={minimalistChartOptions}
                  />
                </div>
              )}
            </div>

            {/* City Info */}
            {cityInfo && (
              <div className="bg-[#EFEFEF] p-6 rounded-lg ">
                <h2 className="text-2xl font-bold">
                  {cityInfo.name}, {cityInfo.country}
                </h2>
                <p className="text-sm">Population: {cityInfo.population}</p>
                <p className="text-sm">
                  Timezone: UTC {cityInfo.timezone / 3600}
                </p>
                <p className="text-sm">
                  Sunrise:{" "}
                  {new Date(cityInfo.sunrise * 1000).toLocaleTimeString()}
                </p>
                <p className="text-sm">
                  Sunset:{" "}
                  {new Date(cityInfo.sunset * 1000).toLocaleTimeString()}
                </p>
              </div>
            )}

            {forecast.length > 0 && (
              <div className="bg-[#EFEFEF] p-6 rounded-lg w-full col-span-2">
                <h3 className="text-xl font-bold mb-4">5-Day Forecast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {forecast.slice(1).map((day, index) => (
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
      </div>
    </div>
  );
};

export default WeatherApp;
