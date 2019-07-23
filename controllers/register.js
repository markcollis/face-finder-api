const handleRegisterPost = (bcrypt, db) => (req, res) => {
  console.log('Processing /register request');
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    console.log('Error: incorrect form submission.');
    return res.status(400).json('incorrect form submission');
  }
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
      if (err.code === '23505') {
        console.log('Error: an account already exists for this email address.');
        return res.status(403).json('')
      }
      console.log('Error: unable to register.', err);
      return res.status(400).json('unable to register');
    });
};

module.exports = {
  handleRegisterPost
};
