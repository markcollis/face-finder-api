const handleSigninPost = (bcrypt, db) => (req, res) => {
  console.log('Processing /signin request');
  const { email, password } = req.body;
  if (!email || !password) {
    console.log('Error: either email or password missing.');
    return res.status(400).json('incorrect form submission');
  }
  db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => {
            console.log('Successful login by', user[0]);
            res.json(user[0]);
          })
          .catch(err => {
            console.log('Error: unable to get user.', err);
            res.status(500).json('unable to get user');
          });
      } else {
        console.log('wrong credentials');
        res.status(401).json('wrong credentials');
      }
    })
    .catch(err => {
      console.log(err);
      res.status(400).json('sign in error');
    });
};

module.exports = {
  handleSigninPost
};
