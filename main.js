const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const cors = require('cors');
const fs = require('fs');

const app = express();
const cache = new NodeCache();

app.use(cors());

  // Read city IDs data from cityIds.json               
  // let cityIdsArray = [];
  // fs.readFile('cities.json', 'utf8', (err, data) => {
  //   if (err) {
  //     console.error('Error reading city IDs JSON file:', err);
  //     return;
  //   }

  //   try {
  //     cityIdsArray = JSON.parse(data);
  //     console.log('City IDs:', cityIdsArray);
  //   } catch (parseError) {
  //     console.error('Error parsing city IDs JSON:', parseError);
  //   }
  // });

  let cityIdsArray = [];
  fs.readFile('cities.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading city IDs JSON file:', err);
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      cityIdsArray = parsedData.List.map(city => city.CityCode);
      console.log('City IDs:', cityIdsArray);
    } catch (parseError) {
      console.error('Error parsing city IDs JSON:', parseError);
    }
  });

  

// Fetch weather data from OpenWeatherMap API
function fetchWeatherData(cityIds) {
  const apiKey = '2ef60acb6686d297de04eab176e0a43a';
  const url = `http://api.openweathermap.org/data/2.5/group?id=${cityIds.join(',')}&units=metric&appid=${apiKey}`;

  return axios
    .get(url)
    .then((response) => response.data.list)
    .catch((error) => {
      console.error('Error fetching weather data:', error);
      return [];
    });
}



// Define the cache duration in seconds (5 minutes).
const cacheDuration = 300;



//Define an API endpoint to fetch weather data for all the given cities                           
  app.get('/api/weather/multiple', (req, res) => {
     //hardcode ids that was used for testing
    //const cityIds = [1248991, 1850147, 2644210, 2988507, 2147714, 4930956, 1796236, 3143244];       
   
    const cityIds= cityIdsArray;
    getWeatherDataFromCacheOrAPI(cityIds)
        .then((weatherData) => {
            res.json(weatherData);
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Failed to fetch weather data' });
        });
});



//Define a function to get weather data either from the cache or the API.              
  function getWeatherDataFromCacheOrAPI(cityIds) {
      const cacheKey = 'weatherData';
      const cachedData = cache.get(cacheKey);
    
      if (cachedData) {
        console.log('Using cached weather data.');
        return Promise.resolve(cachedData);
      } else {
        console.log('Fetching weather data from API.');
        return fetchWeatherData(cityIds).then((data) => {
          cache.set(cacheKey, data, cacheDuration);
          return data;
        });
      }
    }


  
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});