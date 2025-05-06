import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { pool } from "../data/pool.js";

const GOOGLE_CLIENT_ID = '891980437516-70nuopfrd3l5263lhj178m9a1gav71ms.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

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

                // Check if user exists in the database
                const userExists = await checkUserExists(googleId);

                if (!userExists) {
                    await createUser(googleId, email, firstName, lastName);
                }

                // Add the important fields to the profile object
                const userData = {
                    ...profile,
                    googleId: googleId,
                    email: email,
                    profilePicture: profilePicture,
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
async function checkUserExists(googleId) {
    try {
        const [results] = await pool.query('SELECT * FROM user WHERE googleID = ?', [googleId]);
        if (results && results.length > 0) {
            console.log('User found in database:', results[0].GOOGLE_ID);
            return true;
        } else {
            console.log('User not found in database');
            return false;
        }
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    }
}

// Helper function to create a new user (returns a Promise)
async function createUser(googleId, email, firstName, lastName) {
    try {
        console.log('Creating new user with:');
        console.log('googleId:', googleId, 'type:', typeof googleId);
        console.log('email:', email);
        console.log('firstName:', firstName);
        console.log('lastName:', lastName);

        if (!googleId) {
            throw new Error('Cannot create user: Google ID is null');
        }

        const [results] = await pool.query(
            'INSERT INTO user (googleID, email, first_name, last_name) VALUES (?, ?, ?, ?)',
            [googleId, email, firstName, lastName]
        );
        console.log('New user created with Google ID:', googleId);
        return results;
    } catch (err) {
        console.error('Error inserting new user:', err);
        throw err;
    }
}

passport.serializeUser(function (user, done) {
    done(null, {
        id: user.id,
        googleId: user.googleId || user.id,
        displayName: user.displayName,
        photos: user.photos,
        profilePicture: user.profilePicture || (user.photos && user.photos[0] ? user.photos[0].value : null),
        email: user.email,
        firstName: user.name?.givenName || null,
        lastName: user.name?.familyName || null,
    });
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

export { passport }; // Export passport for use in other modules