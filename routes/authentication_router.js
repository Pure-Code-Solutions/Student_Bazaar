import express from 'express';
import passport from 'passport';
import nodemailer from 'nodemailer';
import {
  renderSignin,
  renderRegister,
  postRegister,
  postSignin,
  logout
} from '../controllers/authentication_controller.js';

import { pool } from '../data/pool.js';

const router = express.Router();

/* ---------- PAGE RENDER ROUTES ---------- */

// Redirects logged-in users away from sign-in and registration
router.get('/signin', (req, res) => {
  if (req.session.user?.email) {
    return res.redirect('/account/dashboard');
  }
  renderSignin(req, res);
});

router.get('/register', (req, res) => {
  if (req.session.user?.email) {
    return res.redirect('/account/dashboard');
  }
  renderRegister(req, res);
});

/* ---------- FORM HANDLERS ---------- */

//router.post('/register', postRegister);
router.post('/signin', postRegister);
router.get('/logout', logout);

/* ---------- GOOGLE OAUTH ---------- */

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    if (!req.user.is_verified) {
      return res.redirect(`/verify?email=${encodeURIComponent(req.user.email)}`);
    }
    res.redirect('/account/dashboard');
  }
);

/* ---------- OTP VERIFICATION ---------- */

// Show OTP input page unless already verified
router.get('/verify', async (req, res) => {
  const email = req.query.email;
  console.log("Email from query:", email);  
  const [rows] = await pool.query(
    "SELECT is_verified FROM user WHERE email = ?",
    [email]
  );

  if (rows.length && rows[0].is_verified) {
    return res.redirect('/account/dashboard');
  }

  const error = req.session.verifyError;
  const message = req.session.verifyMessage;

  delete req.session.verifyError;
  delete req.session.verifyMessage;

  res.render('verify', { email, error, message });
});

// Validate OTP and mark user as verified
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;

  const [rows] = await pool.query(
    "SELECT otp_code, otp_expires_at FROM user WHERE email = ?",
    [email]
  );

  if (!rows.length) {
    req.session.verifyError = "User not found.";
    return res.redirect(`/verify?email=${encodeURIComponent(email)}`);
  }

  const { otp_code, otp_expires_at } = rows[0];

  if (otp !== otp_code) {
    req.session.verifyError = "Invalid OTP.";
    return res.redirect(`/verify?email=${encodeURIComponent(email)}`);
  }

  if (new Date() > new Date(otp_expires_at)) {
    req.session.verifyError = "OTP has expired. Please request a new one.";
    return res.redirect(`/verify?email=${encodeURIComponent(email)}`);
  }

  // Update user status to verified
  await pool.query(
    "UPDATE user SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE email = ?",
    [email]
  );

  // Refresh session with user info
  const [userRows] = await pool.query("SELECT * FROM user WHERE email = ?", [email]);
  if (userRows.length) {
    const user = userRows[0];
    req.session.user = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_verified: true
    };
  }

  res.redirect('/account/dashboard');
});

/* ---------- RESEND OTP ---------- */

// Regenerate OTP and send via email
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await pool.query(
    "UPDATE user SET otp_code = ?, otp_expires_at = ? WHERE email = ?",
    [otp, otpExpiresAt, email]
  );

  console.log("New OTP generated:", otp);
  /*try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP code is: <b>${otp}</b>. It expires in 10 minutes.</p>`
    });

    console.log('✅ Email sent:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send Gmail OTP email:', err);
  }*/

  req.session.verifyMessage = "A new OTP has been sent to your email.";
  res.redirect(`/verify?email=${encodeURIComponent(email)}`);
});

export { router as authenticationRouter };