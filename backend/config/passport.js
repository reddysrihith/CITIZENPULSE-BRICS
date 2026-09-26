const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_secret',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with the same email but no googleId
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          user.isVerified = true; // Auto-verify email
          await user.save();
          return done(null, user);
        }

        // If not, create a new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          password: Date.now().toString() + Math.random().toString(), // Random password
          isVerified: true, // Google accounts are implicitly verified
          role: 'freelancer', // Default role, user can change later in profile
        });

        done(null, user);
      } catch (error) {
        console.error(error);
        done(error, false);
      }
    }
  )
);

// Serialize / Deserialize User
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
