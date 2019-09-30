require('dotenv').config(); // import environment variables from .env file
// external modules to handle HTTP and connect to database
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const knex = require('knex');
const corsProxy = require('cors-anywhere');

/* eslint no-console: 0 */
const {
  API_PORT = 3001,
  DBHOST,
  DBUSER,
  DBPW,
  DBNAME,
} = process.env;

const db = knex({
  client: 'pg',
  connection: {
    host: DBHOST,
    user: DBUSER,
    password: DBPW,
    database: DBNAME,
  },
});

// internal modules for each component of API
// each function within them returns a function of (req, res)
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// start CORS proxy running to be available when needed
// (i.e. if loading without the proxy fails).
const CORSPROXYHOST = process.env.CORSPROXYHOST || '127.0.0.1';
const CORSPROXYPORT = process.env.CORSPROXYPORT || 8080;
corsProxy.createServer({
  originWhitelist: [], // allow all
}).listen(CORSPROXYPORT, CORSPROXYHOST, () => {
  console.log(`Running CORS Anywhere on ${CORSPROXYHOST}:${CORSPROXYPORT}`);
});

const app = express();
app.use(express.json());
app.use(cors());

// API specification
// 1. /                 --> res = confirm that API is working
app.get('/', (req, res) => res.send('this is working'));
// 2. /signin           --> POST = success/failure
app.post('/signin', signin.handleSigninPost(bcrypt, db));
// 3. /register         --> POST = user
app.post('/register', register.handleRegisterPost(bcrypt, db));
// 4. /profile/:userId  --> GET = user
app.get('/profile/:id', profile.handleProfileGet(db));
// 5. /image            --> PUT --> user
app.put('/image', image.handleImagePut(db));

app.listen(API_PORT, () => {
  console.log(`Running face-finder API on port ${API_PORT}`);
});
