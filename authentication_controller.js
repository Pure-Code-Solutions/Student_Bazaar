import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { pool } from "../data/pool.js";

// ---------- VALIDATION SCHEMA ----------

const validateUser = [
  body("first-name").trim()
    .isLength({ min: 2, max: 20 }).withMessage("First Name must be between 2 and 50 characters long")
    .matches(/^[A-Za-z\s]+$/).withMessage("First Name must be alphabets (A-Z, a-z)"),

  body("last-name").trim()
    .isLength({ min: 1, max: 20 }).withMessage("Last Name must be between 1 and 50 characters long")
    .matches(/^[A-Za-z\s]+$/).withMessage("Last Name must be alphabets (A-Z, a-z)"),

  body("email").trim()
    .isEmail().withMessage("Please enter a valid email address")
    .matches(/@(?:my\.)?csun\.edu$/).withMessage("Email must be a CSUN email (csun.edu or my.csun.edu)"),

  body("password").trim()
    .isLength({ min: 6 }).withMessage("Password must be at least 8 characters long"),

  body("confirm-password").trim()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password does not match"),
];

// ---------- RENDER SIGN-IN PAGE ----------

export const renderSignin = async (req, res) => {
  const flashMessage = req.session.flashMessage;
  delete req.session.flashMessage;

  if (req.session?.user) {
    return res.redirect("/account/dashboard");
  }

  res.render("user-login-page", { error: flashMessage });
};

// ---------- RENDER REGISTER PAGE ----------

export const renderRegister = async (req, res) => {
  res.render("user-registration-page");
};

// ---------- HANDLE REGISTRATION FORM ----------

export const postRegister = [
  validateUser,
  async (req, res) => {
    console.log("🔥 Received POST /register form submission");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("❌ Validation errors:", errors.array());
      return res.status(400).render("user-registration-page", {
        errors: errors.array()
      });
    }

    const firstName = req.body["first-name"];
    const lastName = req.body["last-name"];
    const email = req.body["email"];
    const password = req.body["password"];
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      console.log("✔️ Saving user to DB...");
      await pool.query(
        "INSERT INTO user_v2 (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
        [firstName, lastName, email, hashedPassword]
      );

      // Generate and store OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await pool.query(
        "UPDATE user_v2 SET otp_code = ?, otp_expires_at = ? WHERE email = ?",
        [otp, otpExpiresAt, email]
      );

      // TODO: Send OTP via email using nodemailer

      console.log("➡️ Redirecting to /verify");
      return res.redirect(`/verify?email=${encodeURIComponent(email)}`);

    } catch (err) {
      console.error("❌ DB error:", err);

      // Duplicate email error
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).render("user-registration-page", {
          errors: [{ msg: "This email is already registered." }]
        });
      }

      // General server error
      return res.status(500).render("user-registration-page", {
        errors: [{ msg: "Something went wrong. Please try again." }]
      });
    }
  }
];

// ---------- HANDLE SIGN-IN FORM ----------

export const postSignin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM user_v2 WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).render("user-login-page", {
        error: "Invalid email or password"
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).render("user-login-page", {
        error: "Invalid email or password"
      });
    }

    if (!user.is_verified) {
      return res.redirect(`/verify?email=${encodeURIComponent(user.email)}`);
    }

    req.session.user = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email
    };

    console.log("✅ Logged in:", user.email);
    res.redirect("/account/dashboard");

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).send("Server error during login");
  }
};

// ---------- LOGOUT ----------

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("❌ Error destroying session:", err);
    }
    res.redirect("/signin");
  });
};
