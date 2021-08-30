const express = require('express');
const router = express.Router();

const dbOperations = require('./service');
 
router.get('/home', (_req, res) => {
    res.render('home.html');
});


router.get('/customers.html', (req, res) => {
    res.render('customer.html', {
        userId: req.query.userId
    });
});


router.get('/restaurants.html', (req, res) => {
    res.render('restaurants.html', {
        userId: req.query.userId
    });
});


router.get('/restaurants', async (req, res) => {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);
    const nearestRestaurants = await dbOperations.fetchNearestRestaurants([longitude, latitude], 2000);

    res.json({
        restaurants: nearestRestaurants
    });
});


router.get('/restaurants/info', async (req, res) => {
    const userId = req.query.userId // extract userId from query params
    const restaurantDetails = await dbOperations.fetchRestaurantDetails(userId);

    res.json({
        restaurantDetails: restaurantDetails
    });
});


router.get('/requests/info', async (req, res) => {
    const results = await dbOperations.fetchOrders();
    const features = [];

    for (let i = 0; i < results.length; i++) {
        features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: results[i].location.coordinates
            },
            properties: {
                status: results[i].status,
                requestTime: results[i].requestTime,
                address: results[i].location.address
            }
        });
    }

    const geoJsonData = {
        type: 'FeatureCollection',
        features: features
    }

    res.json(geoJsonData);
});


module.exports = router;