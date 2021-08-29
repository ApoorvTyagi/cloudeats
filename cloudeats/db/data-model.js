const mongoose = require('mongoose');

/**
 * Represents a restaurant's Schema.
 * @constructor
 */
const restaurantSchema = mongoose.Schema({
	restaurantId: { type: String, unique: true, required: true, trim: true },
	displayName: { type: String, trim: true },
	phone: { type: String },
	email: { type: String, unique: true },
	isEngaged: { type: Boolean, default: false},
	location: {
		type: {
			type: String,
			required: true,
			default: "Point"
		},
		address: { type: String },
		coordinates: [ Number ],
	}
});

restaurantSchema.index({"location": "2dsphere", restaurantId: 1});

/**
 * Represents a restaurant.
 * @constructor
 */
const restaurant = mongoose.model('restaurant', restaurantSchema);

/**
 * Represents a order Schema.
 * @constructor
 */
const orderSchema = mongoose.Schema({
	requestTime: { type: Date },
	location: {
		coordinates: [ Number ],
		adress: { type: String }
	},
	customerId: { type: String },
	restaurantId: { type: String },
	status: { type: String }
});

/**
 * Represents a Order.
 * @constructor
 */
const order = mongoose.model('order', orderSchema);

exports.restaurant = restaurant;
exports.order = order;