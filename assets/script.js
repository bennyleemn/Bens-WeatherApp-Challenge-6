
// Constants Variables
const apiKey = '2d8476c43a188e8be664cef0404b96a2';
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');
const historyList = document.getElementById('history-list');

// Search for a city and display the weather data
async function searchCity(cityName) {
  const coordinates = await getCoordinates(cityName);
  if (coordinates) {
    const weatherData = await getWeatherData(coordinates.lat, coordinates.lon);
    if (weatherData) {
      displayCurrentWeather(weatherData.list[0]);
      displayForecast(weatherData);
      saveToSearchHistory(cityName);
    }
  }
}

// Retrieve geographical coordinates for a given city name using the OpenWeatherMap API
async function getCoordinates(cityName) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod === '404') {
      throw new Error('City not found');
    }

    const { coord } = data;
    return coord;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Retrieve weather data for a given set of coordinates using the 5 Day Weather Forecast API
async function getWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === '404') {
      throw new Error('Weather data not found');
    }

    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Save the city name to search history in localStorage
function saveToSearchHistory(cityName) {
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  if (!history.includes(cityName)) {
    history.push(cityName);
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }
}

// Load the search history from localStorage
function loadSearchHistory() {
  const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
  historyList.innerHTML = '';
  history.forEach((cityName) => {
    const li = document.createElement('li');
    li.textContent = cityName;
    li.addEventListener('click', () => {
      searchCity(cityName);
    });
    historyList.appendChild(li);
  });
}

// Display the current weather data
function displayCurrentWeather(data) {
  cityName.textContent = data.name;
  currentDate.textContent = moment().format('MMMM D, YYYY');
  weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather Icon">`;
  temperature.textContent = `Temperature: ${convertKelvinToFahrenheit(data.main.temp)}°C`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
}

// Display the 5-day forecast
function displayForecast(data) {
  forecastContainer.innerHTML = '';

  for (let i = 0; i < data.list.length; i += 8) {
    const forecastData = data.list[i];
    const date = moment(forecastData.dt_txt).format('MMMM D, YYYY');
    const icon = forecastData.weather[0].icon;
    const temperature = convertKelvinToFahrenheit(forecastData.main.temp);
    const windSpeed = forecastData.wind.speed;
    const humidity = forecastData.main.humidity;

    const forecast = document.createElement('div');
    forecast.classList.add('forecast-item');
    forecast.innerHTML = `
      <p class="forecast-date">${date}</p>
      <div class="forecast-icon"><img src="https://openweathermap.org/img/w/${icon}.png" alt="Weather Icon"></div>
      <p class="forecast-temperature">Temperature: ${temperature}°F</p>
      <p class="forecast-wind">Wind Speed: ${windSpeed} m/s</p>
      <p class="forecast-humidity">Humidity: ${humidity}%</p>
    `;

    forecastContainer.appendChild(forecast);
  }
}

// Convert temperature from Kelvin to Celsius
function convertKelvinToFahrenheit(kelvin) {
  return Math.round((kelvin - 273.15) * 1.8 +32);
}

// Event listener for the search form submission
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    searchCity(city);
    cityInput.value = '';
  }
});

// Load search history on page load
loadSearchHistory();