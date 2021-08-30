const dataModel = require('./db/data-model');

const Restaurant = dataModel.restaurant;
const Order = dataModel.order;

function fetchNearestRestaurants(coordinates, maxDistance) {
    return Restaurant.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: coordinates
                },
                $maxDistance: maxDistance
            }
        },
        isEngaged : false
    })
    .exec()
    .catch(error => {
        console.log(error);
    });
}

function fetchRestaurantDetails(restaurantId) {
    return Restaurant.findOne({
        restaurantId: restaurantId
    }).exec().then(function (doc) {
        console.log(doc); 
        return doc;
    });
}

function saveOrder(OrderId, OrderTime, location, customerId, status){
    const order = new Order({
        "_id": OrderId,
        requestTime: OrderTime,
        location: location,
        customerId: customerId,
        status: status
    });

    return order.save()
        .catch(error => {
            console.log(error)
        });
}

function updateRestaurantStatus(RestaurantId, status) {
    var restaurantStatus = status === 'engaged' ? true : false;

    return Restaurant.findOneAndUpdate({
        "restaurantId": RestaurantId
    }, {
        isEngaged:restaurantStatus
    }).catch(error => {
        console.log(error);
    });
}

function updateOrder(issueId, RestaurantId, status) {
    updateRestaurantStatus(RestaurantId, status);
    return Order.findOneAndUpdate({
        "_id": issueId
    }, {
        status: status,
        RestaurantId: RestaurantId
    }).catch(error => {
        console.log(error);
    });
}

function fetchOrders() {
    return new Promise( (resolve, reject) => {
        try {
            const OrdersData = [];

            const stream = Order.find({}, {
                OrderTime: 1,
                status: 1,
                location: 1,
                _id: 0
            }).stream();

            stream.on("data", function (Order) {
                OrdersData.push(Order);
            });

            stream.on("end", function () {
                resolve(OrdersData);
            });

        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
}

exports.fetchNearestRestaurants = fetchNearestRestaurants;
exports.fetchRestaurantDetails = fetchRestaurantDetails;
exports.saveOrder = saveOrder;
exports.updateOrder = updateOrder;
exports.fetchOrders = fetchOrders;