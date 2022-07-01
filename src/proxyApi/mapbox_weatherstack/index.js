/* Weather Route - using Weatherstack for forecast and Mapbox for Geocoding */

// Dependencies
const express   = require('express');
const router    = express.Router();

const geocode = require('./geocode');
const forecast = require('./forecast');

// routes

// Get geocoded weather 
// Method: 'GET', url = '/proxy/weatherstack/weather?address={address}', Access: 'Public'
router.get('/weather', (req, res) => {

    // makes sure address is available
    if (!req.query.address) {
        return res.send({
            error: 'You must provide an address term'
        });
    }

    geocode(req.query.address, (error, { latitude, longitude, location } = {}) => {
        if (error) {
            return res.send({ error });
        }
    
        forecast(latitude, longitude, (error, forecastData) => {
            if (error) {
                return res.send({ error });
            }

            res.send({
                forecast: forecastData,
                location,
                address: req.query.address
            });
        });
    });    
});


// Exports
module.exports = router;
