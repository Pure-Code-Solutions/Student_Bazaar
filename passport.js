import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { pool } from "./data/pool.js";

// ---------- SESSION MANAGEMENT ----------

// Stores userID in session
passport.serializeUser((user, done) => {
  console.log("📦 Serializing user:", user.userID);
  done(null, user.userID);
});

// Retrieves full user object from DB using session ID
passport.deserializeUser(async (id, done) => {
  try {
    console.log("🔍 Deserializing user:", id);
    const [rows] = await pool.query("SELECT * FROM user_v2 WHERE userID = ?", [id]);
    if (rows.length === 0) return done(null, false);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

// ---------- GOOGLE STRATEGY ----------

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const googleID = profile.id;
  const email = profile.emails[0].value;
  const firstName = profile.name.givenName;
  const lastName = profile.name.familyName;

  // Restrict login to CSUN email addresses
  if (!/@(?:my\.)?csun\.edu$/.test(email)) {
    console.log("❌ Rejected non-CSUN email:", email);
    return done(null, false, { message: "Only CSUN emails are allowed" });
  }

  try {
    // First, try to find a user by their Google ID
    let [rows] = await pool.query("SELECT * FROM user_v2 WHERE googleID = ?", [googleID]);

    if (rows.length > 0) {
      const user = rows[0];

      // If user is not verified, send OTP
      if (!user.is_verified) {
        await sendOtpIfNeeded(user.email);
      }

      return done(null, user);
    }

    // Next, try to find a user by email (already exists but hasn't linked Google yet)
    const [emailRows] = await pool.query("SELECT * FROM user_v2 WHERE email = ?", [email]);

    if (emailRows.length > 0) {
      const user = emailRows[0];

      // Link Google ID to existing user
      await pool.query("UPDATE user_v2 SET googleID = ? WHERE email = ?", [googleID, email]);

      if (!user.is_verified) {
        await sendOtpIfNeeded(user.email);
      }

      return done(null, { ...user, googleID });
    }

    // New Google user — insert into database as unverified
    const [result] = await pool.query(
      "INSERT INTO user_v2 (first_name, last_name, email, googleID, is_verified) VALUES (?, ?, ?, ?, false)",
      [firstName, lastName, email, googleID]
    );

    // Send OTP to newly registered user
    await sendOtpIfNeeded(email);

    // Fetch and return new user
    const [newUser] = await pool.query("SELECT * FROM user_v2 WHERE userID = ?", [result.insertId]);

    return done(null, newUser[0]);

  } catch (err) {
    console.error("❌ Error in Google strategy:", err);
    return done(err, null);
  }
}));

// ---------- OTP GENERATION & STORAGE ----------

async function sendOtpIfNeeded(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

  await pool.query(
    "UPDATE user_v2 SET otp_code = ?, otp_expires_at = ? WHERE email = ?",
    [otp, expires, email]
  );

  console.log(`📨 OTP ${otp} sent to ${email}`);
  // TODO: Implement nodemailer here to send the OTP email
}
