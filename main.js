// load libraries
const express = require('express');
const handlebars = require('express-handlebars');
const fs = require('fs');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;
require('dotenv').config();

// configure environment
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

// configure openweather API
const weather_baseUrl = 'https://api.openweathermap.org/data/2.5/onecall';
const weather_APIKEY = process.env.WEATHER_APIKEY
// GET https://api.openweathermap.org/data/2.5/weather?q=&appid=


// create express instance
const app = express();

// configure handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}));
app.set('view engine', 'hbs');

// configure routes
app.get('/', (req, res) => {

    const rawdatacountry = fs.readFileSync(__dirname + '/public/json/country.list.json');
    const countryList = JSON.parse(rawdatacountry);

    res.status(200);
    res.type('text/html');
    res.render('index',{
        countryList,
        hasCtry: false
    });
});

// when a country is selected, render the page with list of cities
app.get('/listCity', (req, res) => {

    const selectedCtry = req.query['country'];

    const rawdatacountry = JSON.parse(fs.readFileSync(__dirname + '/public/json/country.list.json'));
    const countryList = rawdatacountry.filter(v => v.Code !== selectedCtry);

    const Ctry = rawdatacountry.filter(v => v.Code === selectedCtry);

    const rawdatacity = JSON.parse(fs.readFileSync(__dirname + '/public/json/city.list.json'));
    const cityList = rawdatacity.filter(v => v.country === selectedCtry);

    cityList.sort(function (a, b) {
        var nameA = a.state.toUpperCase()||a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.state.toUpperCase()||b.name.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
      
        // names must be equal
        return 0;
      });

    res.status(200);
    res.type('text/html');
    res.render('index',{
        countryList, cityList, Ctry: Ctry[0], hasCtry: true
    });
});

app.get('/retrieve', (req, res) => {
  const city = req.query['city'];
  console.log(`>>> city input: ${city}`);

  const weatherUrl = withQuery(weather_baseUrl ,{
    lon : 135.753845,
    lat : 35.021069, 
    exclude: 'current,minutely,hourly,alerts',
    appid: weather_APIKEY
  });

  fetch(weatherUrl)
    .then(res => res.json())
    .then(json => {
      const recs = json.daily;
      const reduce = recs.map( d => {
        return { 
          dt: d.dt, max: d.temp.max, min: d.temp.min, weather: d.weather[0].description, icon: d.weather[0].icon 
        }
      });
      console.log(reduce);
      res.json(reduce);
    })
    .catch(e => console.log(e))
  
})

// load static resources
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/javascripts'));

// initialize the app
app.listen(PORT, () => {
    console.info(`Application started on PORT: ${PORT} at ${new Date()}`);
});