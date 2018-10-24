const express = require('express');
const cors = require('cors');
// const bodyParser = require('body-parser');
// no longer required by current version of express (bundled as express.json())
const app = express();

// pseudo database in advance of creating one...
let database = {
  users: [
    {
      id: '123',
      name: 'John',
      email: 'john@gmail.com',
      password: 'cookies',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      name: 'Sally',
      email: 'sally@gmail.com',
      password: 'bananas',
      entries: 0,
      joined: new Date()
    }
  ]
};

// app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// API specification
// 1. /                 --> res = this is working
// 2. /signin           --> POST = success/failure
// 3. /register         --> POST = user
// 4. /profile/:userId  --> GET = user
// 5. /image            --> PUT --> user

// 1. /                 --> res = this is working
app.get('/', (req, res) => {
  res.send(database.users);
});

// 2. /signin           --> POST = success/failure
app.post('/signin', (req, res) => {
  // res.send('signing in');
  if (req.body.email === database.users[0].email &&
      req.body.password === database.users[0].password) {
    res.json(database.users[0]);
  } else {
    res.status(400).json('error logging in');
  }
});

// 3. /register         --> POST = user
app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  database.users.push({
    id: '125',
    name: name,
    email: email,
    password: password,
    entries: 0,
    joined: new Date()
  });
  res.json(database.users[database.users.length - 1]);
});

// 4. /profile/:userId  --> GET = user
app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  });
  if (!found) {
    res.status(400).json('no such user');
  }
});

// 5. /image            --> PUT --> user
app.put('/image', (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach(user => {
    if (user.id === id) {
      found = true;
      user.entries++;
      return res.json(user.entries);
    }
  });
  if (!found) {
    res.status(400).json('no such user');
  }
});

app.listen(3001, () => {
  console.log('app is running on port 3001');
});
