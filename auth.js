const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const GOOGLE_CLIENT_ID = '891980437516-70nuopfrd3l5263lhj178m9a1gav71ms.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const db = require('./db');

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:5500/auth/google/callback',
            passReqToCallback: true,
        },
        async function (request, accessToken, refreshToken, profile, done) {
            try {
                // Log the complete profile to debug
                console.log("Full Google Profile:", JSON.stringify(profile, null, 2));

                // Extract required data
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value || null;
                const firstName = profile.name?.givenName || null;
                const lastName = profile.name?.familyName || null;
                const profilePicture = profile.photos?.[0]?.value || null;

                if (!googleId) {
                    console.error("ERROR: Missing Google ID in profile");
                    return done(new Error("Missing Google ID"), null);
                }

                // Instead of calling another function, handle the database operations here
                // This ensures we have proper control over the user creation process
                const userExists = await checkUserExists(googleId);

                if (!userExists) {
                    await createUser(googleId, email, firstName, lastName);
                }

                // Add the important fields to the profile object
                const userData = {
                    ...profile,
                    googleId: googleId, // Make sure googleId is explicitly set
                    email: email,
                    profilePicture: profilePicture // Explicitly add profile picture URL
                };

                return done(null, userData);
            } catch (error) {
                console.error("Authentication error:", error);
                return done(error, null);
            }
        }
    )
);

// Helper function to check if user exists (returns a Promise)
function checkUserExists(googleId) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM USER_CREDENTIALS WHERE GOOGLE_ID = ?', [googleId], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                reject(err);
                return;
            }

            if (results && results.length > 0) {
                console.log('User found in database:', results[0].GOOGLE_ID);
                resolve(true);
            } else {
                console.log('User not found in database');
                resolve(false);
            }
        });
    });
}

// Helper function to create a new user (returns a Promise)
function createUser(googleId, email, firstName, lastName) {
    return new Promise((resolve, reject) => {
        // Double-check values before insertion
        console.log('Creating new user with:');
        console.log('googleId:', googleId, 'type:', typeof googleId);
        console.log('email:', email);
        console.log('firstName:', firstName);
        console.log('lastName:', lastName);

        // Ensure googleId is not null before insertion
        if (!googleId) {
            const error = new Error('Cannot create user: Google ID is null');
            console.error(error.message);
            reject(error);
            return;
        }

        db.query(
            'INSERT INTO USER_CREDENTIALS (GOOGLE_ID, EMAIL, FIRST_NAME, LAST_NAME) VALUES (?, ?, ?, ?)',
            [googleId, email, firstName, lastName],
            (err, results) => {
                if (err) {
                    console.error('Error inserting new user:', err);
                    reject(err);
                    return;
                }
                console.log('New user created with Google ID:', googleId);
                resolve(results);
            }
        );
    });
}

passport.serializeUser(function (user, done) {
    // Make sure we include the googleId and profilePicture in the serialized user
    done(null, {
        id: user.id,
        googleId: user.googleId || user.id, // Store googleId explicitly
        displayName: user.displayName,
        photos: user.photos,
        profilePicture: user.profilePicture || (user.photos && user.photos[0] ? user.photos[0].value : null),
        email: user.email,
        firstName: user.name?.givenName || null,
        lastName: user.name?.familyName || null
    });
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

module.exports = { passport }; // Export passport