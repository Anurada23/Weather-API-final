//Reading the cities from cities file
const fs = require('fs');
const axios = require('axios');                               //new
const NodeCache = require('node-cache');                        // new

fs.readFile('cities.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading JSON file:', err);
    return;
  }

  try {
    const weatherData = JSON.parse(data);
    const cityDataArray = weatherData.List.map(city => ({
      CityCode: city.CityCode,
      CityName: city.CityName,
      Temperature: city.Temp,
      Status: city.Status
    }));

    console.log(cityDataArray);
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
  }
});




// identifying the city codes in cities file
const cityIds = [1248991,1850147,2644210,2988507,2147714,4930956,1796236,3143244]; 

//declaring the API ekey
const apiKey = '2ef60acb6686d297de04eab176e0a43a';

// Cache duration in seconds (5 minutes).
const cacheDuration = 300; 



// Create a new instance of NodeCache.
const cache = new NodeCache();

// Define the function to fetch weather data from the API.
function fetchWeatherData(cityIds) {
  // Construct the URL using the provided apiKey and cityIds.
  const url = `http://api.openweathermap.org/data/2.5/group?id=${cityIds.join(',')}&units=metric&appid=${apiKey}`;

  // Make an HTTP GET request using axios and return the data or an empty array on error.
  return axios.get(url)
    .then(response => response.data.list)
    .catch(error => {
      console.error('Error fetching weather data:', error);
      return [];
    });
}

// Define a function to get weather data either from the cache or the API.
function getWeatherDataFromCacheOrAPI(cityIds) {
  // Define the cache key.
  const cacheKey = 'weatherData';

  // Attempt to retrieve data from the cache.
  const cachedData = cache.get(cacheKey);

  // If data is found in the cache, return it. Otherwise, fetch from the API.
  if (cachedData) {
    console.log('Using cached weather data.');
    return Promise.resolve(cachedData);
  } else {
    console.log('Fetching weather data from API.');
    return fetchWeatherData(cityIds).then(data => {
      // Store fetched data in the cache with a defined cache duration.
      cache.set(cacheKey, data, cacheDuration);
      return data;
    });
  }
}

// Call the getWeatherDataFromCacheOrAPI function to retrieve weather data.
getWeatherDataFromCacheOrAPI(cityIds)
  .then(weatherData => {
    // Iterate through the weather data and print relevant information for each city.
    weatherData.forEach(city => {
      console.log('City:', city.name);
      console.log('Temperature:', city.main.temp);
      console.log('Weather:', city.weather[0].main);
      console.log('Description:', city.weather[0].description);
      console.log('------------------------------');
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });

