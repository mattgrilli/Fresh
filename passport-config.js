const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');

module.exports = function(passport) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      // Convert the entered email to lowercase
      email = email.toLowerCase();
      
      const user = await User.findOne({ email });
      
      // Add console logs
      console.log('User found in database:', user);
      
      if (!user) {
        return done(null, false, { message: 'No user found' });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      // Add console logs
      console.log('Password comparison result:', isMatch);
      
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
