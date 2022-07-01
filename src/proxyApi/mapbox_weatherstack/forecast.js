// WeatherStack API

const request   = require('postman-request');  // TODO: replace with axios

const weatherstackAccessKey = process.env.WEATHERSTACK_ACCESS_KEY;

const forecast = (latitude, longitude, callback) => {
    const url = 'http://api.weatherstack.com/current?access_key=' + weatherstackAccessKey + '&query=' + latitude + ',' + longitude + '&units=m';  // 37.8267,-122.4233

    request({ url: url, json: true }, (error, response) => {
        if (error) {
            callback('Unable to connect to weather service!', undefined);
        }
        else if (response.body.error) {
            callback('Unable to find location', undefined);
        }
        else {
            callback(undefined, 
                    response.body.current.weather_descriptions[0] + '. It is currently ' + response.body.current.temperature 
                    + ' degrees out. It feels like ' + response.body.current.feelslike + ' degrees out'
            );
        }
    });
};


module.exports = forecast;