const dbOperations = require('./service');
const mongoose = require('mongoose');

function initialize(server) {
	// Creating a new socket.io instance by passing the HTTP server object
	const io = require('socket.io')(server);

	io.on('connection', (socket) => { // Listen on the 'connection' event for incoming sockets
		
		socket.on('join', (data) => { // Listen to any join event from connected users
			socket.join(data.userId);
		});

		// Listen to a 'order-request' event from customers
		socket.on('order-request', async (eventData) => {
            /*
            	eventData contains customerId and location
            	1. First save the request details in the collection requestsData
            	2. AFTER saving, fetch nearby restaurant from customer's location
            	3. Fire a order-request event to each of the restaurant
            */

			// 1. First save the request details in the collection requestsData.
			const requestTime = new Date(); // Time of the request
			const requestId = mongoose.Types.ObjectId(); // Generate unique ID for the request

			const location = { // Convert latitude and longitude to [longitude, latitude]
				coordinates: [
					eventData.location.longitude,
					eventData.location.latitude
				],
				address: eventData.location.address
			};

			await dbOperations.saveOrder(requestId, requestTime, location, eventData.customerId, 'waiting');

			// 2. AFTER saving, fetch nearby Restaurants from customer's location
			const nearestRestaurants = await dbOperations.fetchNearestRestaurants(location.coordinates, 5000);
			eventData.requestId = requestId;``

			// 3. After fetching nearest Restaurants, fire a 'order-request' event to each of them
			for (let i = 0; i < nearestRestaurants.length; i++) {
				io.sockets.in(nearestRestaurants[i].restaurantId).emit('order-request', eventData);
			}

		});

		socket.on('request-accepted', async (eventData) => { // Listen to a 'request-accepted' event from restaurants
			console.log('eventData contains: ', eventData);

			// Convert string to MongoDb's ObjectId data-type
			const requestId = mongoose.Types.ObjectId(eventData.requestDetails.requestId);

			// Then update the request in the database with the restaurant details for given requestId
			await dbOperations.updateOrder(requestId, eventData.restaurantDetails.restaurantId, 'engaged');

			// After updating the request, emit a 'order-accepted' event to the customer and send restaurant details
			io.sockets.in(eventData.requestDetails.customerId).emit('order-accepted', eventData.restaurantDetails);
		});

		socket.on('order-completed', async (eventData) => { // Listen to a 'order-completed' event from restaurants
			console.log('order-completed event contains: ', eventData);

			// Convert string to MongoDb's ObjectId data-type
			const requestId = mongoose.Types.ObjectId(eventData.requestDetails.requestId);

			// Then update the request in the database with the restaurant details for given requestId
			await dbOperations.updateOrder(requestId, eventData.restaurantDetails.restaurantId, 'delivered');

			// After updating the request, emit a 'order-delivered' event to the customer
			io.sockets.in(eventData.requestDetails.customerId).emit('order-delivered', eventData.restaurantDetails);
		});

	});
}

exports.initialize = initialize;