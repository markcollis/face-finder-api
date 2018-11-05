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
// 2. /signin           --> POST = success/failure
// 3. /register         --> POST = user
// 4. /profile/:userId  --> GET = user
// 5. /image            --> PUT --> user

// 1. /                 --> res = this is working
app.get('/', (req, res) => {
  res.send('this is working');
});

// 2. /signin           --> POST = success/failure
app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => {
            console.log(err);
            res.status(400).json('unable to get user');
          });
      } else {
        res.status(400).json('wrong credentials');
      }
    })
    .catch(err => {
      console.log(err);
      res.status(400).json('wrong credentials');
    });
});

// 3. /register         --> POST = user
app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  })
    .catch(err => {
      console.log(err);
      return res.status(400).json('unable to register');
    });
});

// 4. /profile/:userId  --> GET = user
app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({id})
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('no such user');
      }
    });
});

// 5. /image            --> PUT --> user
app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => {
      console.log(err);
      return res.status(400).json('unable to get entries');
    });
});

app.listen(3001, () => {
  console.log('app is running on port 3001');
});
