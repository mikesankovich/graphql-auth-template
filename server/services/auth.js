const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = mongoose.model('user');

// SerializeUser is used to provide some identifying token that can be saved
// in the users session.  We traditionally use the 'ID' for this.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// The counterpart of 'serializeUser'.  Given only a user's ID, we must return
// the user object.  This object is placed on 'req.user'.
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Instructs Passport how to authenticate a user using a locally saved email
// and password combination.  This strategy is called whenever a user attempts to
// log in.  We first find the user model in MongoDB that matches the submitted email,
// then check to see if the provided password matches the saved password. There
// are two obvious failure points here: the email might not exist in our DB or
// the password might not match the saved one.  In either case, we call the 'done'
// callback, including a string that messages why the authentication process failed.
// This string is provided back to the GraphQL client.
passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
  let user;
  try {
    user = await User.findOneAsync({
      $or: [
        {username: username.toLowerCase() },
        {email: username.toLowerCase() },
      ]
    });
    if (!user) {
      return done(null, false, 'Invalid Credentials');
    }
  } catch (err) {
    return done(err);
  }
  user.comparePassword(password, (err, isMatch) => {
    if (err) { return done(err); }
    if (isMatch) {
      return done(null, user);
    }
    return done(null, false, 'Invalid credentials.');
  });
}));

// Creates a new user account.  We first check to see if a user already exists
// with this email address to avoid making multiple accounts with identical addresses
// If it does not, we save the existing user.  After the user is created, it is
// provided to the 'req.logIn' function.  This is apart of Passport JS.
// Notice the Promise created in the second 'then' statement.  This is done
// because Passport only supports callbacks, while GraphQL only supports promises
// for async code!  Awkward!
async function signup({ username, email, password, req }) {
  const user = new User({ username, email, password });
  if (!email || !password || !username) { throw new Error('You must provide a username, email, and password.'); }

  let existingUser;
  try {
    existingUser = await User.findOneAsync({ $or: [{email}, {username}] });

    if (existingUser) {
      throw new Error('Email or Username in use');
    } else {
      user.save();
    }
  } catch (err) {
    throw new Error(err);
  }
  return new Promise((resolve, reject) => {
    req.logIn(user, (err) => {
      if (err) { reject(err); }
      resolve(user);
    })
  });
}

// Logs in a user.  This will invoke the 'local-strategy' defined above in this
// file. Notice the strange method signature here: the 'passport.authenticate'
// function returns a function, as its indended to be used as a middleware with
// Express.  We have another compatibility layer here to make it work nicely with
// GraphQL, as GraphQL always expects to see a promise for handling async code.
function login({ username, password, req }) {
  return new Promise((resolve, reject) => {
    passport.authenticate('local', (err, user) => {
      if (!user) { reject('Invalid credentials.') }

      req.login(user, () => resolve(user));
    })({ body: { username, password } });
  });
}

module.exports = { signup, login };
