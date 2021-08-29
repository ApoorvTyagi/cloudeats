require('dotenv').config();

const http = require('http');
const express = require('express');
const consolidate = require('consolidate');
const mongoose = require('mongoose');

const client = require('prom-client');

const routes = require('./routes');
const socketEvents = require('./socket-events');

const { auth } = require('express-openid-connect'); // For connecting with Auth0

const register = new client.Registry()

register.setDefaultLabels({
  app: 'cloudeats'
})

client.collectDefaultMetrics({ register });

const app = express();

app.set('views', 'views'); // Set the folder-name from where you serve the html page.
app.use(express.static('./public')); // setting the folder name (public) where all the static files like css, images etc are made available

app.set('view engine', 'html');
app.engine('html', consolidate.handlebars); // Use handlebars to parse templates when we do res.render

// connect to Database
const db = 'mongodb://localhost:27017/Cloud_Kitchen_App';
mongoose.connect(db).then(value => {
    // Successful connection
    console.log(value.models);
}).catch(error => {
    // Error in connection
    console.log(error);
});

// connect to Auth0
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.APP_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.get('/', (req, res) => {
    req.oidc.isAuthenticated() ? 
    res.redirect('/customers.html?userId=' + req.oidc.user.nickname) : res.redirect('/home')
});

app.get('/metrics', (_req, res) => {
    res.send(client.register.metrics());
});

app.use('/', routes);

const server = http.Server(app);

server.listen(process.env.NODE_PORT, () => {
    console.log(`Server listening at port ${process.env.NODE_PORT}`);
    socketEvents.initialize(server);
});