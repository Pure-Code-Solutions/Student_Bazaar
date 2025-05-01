const express = require('express');
const session = require("express-session");
const { passport } = require('./auth'); // Import passport
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const db = require('./db'); // Import your database connection

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname)));

app.use(session({
    secret: "cats",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "home.html"));
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/",
        failureMessage: true
    }),
    (req, res) => {
        console.log("Authentication successful. User data:", req.user?.id);
        res.redirect("/welcome");
    }
);

app.get("/welcome", (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, "welcome.html"));
    } else {
        res.redirect("/");
    }
});

app.get('/api/profile-picture', (req, res) => {
    console.log("Profile Picture API - req.user:", req.user);
    if (req.isAuthenticated()) {
        const profilePictureUrl = req.user.photos && req.user.photos.length > 0 ? req.user.photos[0].value : null;
        res.json({ profilePictureUrl });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

app.get('/api/user', (req, res) => {
    console.log("User API - req.user:", req.user);
    if (req.isAuthenticated()) {
        res.json({ name: req.user.displayName });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        req.session.destroy(() => {
            res.redirect("/");
        });
    });
});

app.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        // Input validation (example)
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).send('Missing required fields.');
        }

        if (password.length < 8) {
            return res.status(400).send('Password must be at least 8 characters.');
        }

        // Check if email already exists
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            return res.status(409).send('Email already registered.'); // 409 Conflict
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store user data in the database
        await insertUser(firstName, lastName, email, phoneNumber, hashedPassword);

        res.send('User created successfully!');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).send('Signup failed.');
    }
});

async function checkEmailExists(email) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM USER_CREDENTIALS WHERE EMAIL = ?', [email], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                reject(err);
                return;
            }
            resolve(results.length > 0);
        });
    });
}

async function insertUser(firstName, lastName, email, phoneNumber, hashedPassword) {
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO USER_CREDENTIALS (FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, PASSWORD) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, email, phoneNumber, hashedPassword],
            (err, results) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    reject(err);
                    return;
                }
                resolve(results);
            }
        );
    });
}

app.listen(5500, () => console.log("Listening on: 5500"));