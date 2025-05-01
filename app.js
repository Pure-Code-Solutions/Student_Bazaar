import express from "express";
import multer from 'multer';
import path from "node:path";
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import passport from "passport";
import session from "express-session";


// Load env variables before anything else
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import other modules (after dotenv)
import { pool } from "./data/pool.js";
import "./config/passport.js";

import { shopRouter } from "./routes/shop_router.js";
import { homeRouter } from "./routes/home_router.js";
import { authenticationRouter} from "./routes/authentication_router.js";
import { accountRouter } from "./routes/account_router.js";
import { checkoutRouter } from "./routes/checkout_routes.js";
import { sellingRouter } from "./routes/selling_router.js";
import { S3router } from "./routes/aws_router.js";

const app = express();
const PORT = 5500;
const upload = multer({ dest: 'uploads/' }).single('image');

// Session setup (must be before passport)
app.use(session({
  secret: "studentbazaar-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// Static file serving (must be above routers)
const assetsPath = path.join(__dirname, "views");
app.use(express.static(assetsPath));

// EJS setup
app.set("view engine", "ejs");

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up res.locals for all views
app.use((req, res, next) => {
  res.locals.userSession = req.session.user || null;
  res.locals.cart = {
    cartCount: 10 // Placeholder, replace with real logic later
  };
  next();
});

// Mount routers
app.use("/", shopRouter);
app.use("/", homeRouter);
app.use("/", authenticationRouter);
app.use("/", accountRouter);
app.use("/", checkoutRouter);
app.use("/", sellingRouter);
app.use("/", S3router);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

// Optional: Check DB before starting server
pool.query('SELECT 1')
  .then(() => {
    app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
  })
  .catch(err => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
