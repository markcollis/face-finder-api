// external modules to handle HTTP and connect to database
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const knex = require('knex');
const corsProxy = require('cors-anywhere');
const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'mark',
    password: 'highlodge',
    database: 'face-finder'
  }
});

// internal modules for each component of API
// each function within them returns a *function* of (req, res)
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// start CORS proxy running to be available when needed (manually in URL).
// Automatic use would require changes to front end.
const corsProxyHost = '127.0.0.1';
const corsProxyPort = 8080;
corsProxy.createServer({
  originWhitelist: [] // allow all
}).listen(corsProxyPort, corsProxyHost, function () {
  console.log('Running CORS Anywhere on ' + corsProxyHost + ':' + corsProxyPort);
  console.log('Use in case of CORS error by prefixing image URL.');
});

const app = express();
app.use(express.json());
app.use(cors());
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// no longer required by current version of express (bundled as express.json())

// API specification
// 1. /                 --> res = this is working
app.get('/', (req, res) => res.send('this is working'));
// 2. /signin           --> POST = success/failure
app.post('/signin', signin.handleSigninPost(bcrypt, db));
// 3. /register         --> POST = user
app.post('/register', register.handleRegisterPost(bcrypt, db));
// 4. /profile/:userId  --> GET = user
app.get('/profile/:id', profile.handleProfileGet(db));
// 5. /image            --> PUT --> user
app.put('/image', image.handleImagePut(db));

app.listen(3001, () => {
  console.log('app is running on port 3001');
});
