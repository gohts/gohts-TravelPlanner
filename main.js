// load libraries
const express = require('express');
const handlebars = require('express-handlebars');
const fs = require('fs');

// configure environment
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

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

    const selectedCtry = req.query['countrySelection'];

    const rawdatacountry = JSON.parse(fs.readFileSync(__dirname + '/public/json/country.list.json'));
    const countryList = rawdatacountry.filter(v => v.Code !== selectedCtry);

    const Ctry = rawdatacountry.filter(v => v.Code === selectedCtry);

    const rawdatacity = JSON.parse(fs.readFileSync(__dirname + '/public/json/city.list.json'));
    const cityList = rawdatacity.filter(v => v.country === selectedCtry);

    cityList.sort(function (a, b) {
        var nameA = a.name.toUpperCase(); // ignore upper and lowercase
        var nameB = b.name.toUpperCase(); // ignore upper and lowercase
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

// load static resources
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/javascripts'));

// initialize the app
app.listen(PORT, () => {
    console.info(`Application started on PORT: ${PORT} at ${new Date()}`);
});