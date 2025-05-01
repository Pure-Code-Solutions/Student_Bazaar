import multer from 'multer';
import express from "express";
import session from 'express-session';
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


import passport from './data/auth.js';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
dotenv.config();
import { fileURLToPath } from "node:url";
import { shopRouter } from "./routes/shop_router.js";
import { homeRouter } from "./routes/home_router.js";
import { authenticationRouter} from "./routes/authentication_router.js";
import { accountRouter } from "./routes/account_router.js";
import { checkoutRouter } from "./routes/checkout_routes.js";
import { sellingRouter } from "./routes/selling_router.js";
import {S3router} from './routes/aws_router.js';
import { openSearchRouter } from './routes/open_search_router.js';
import { getCartItemCount } from './controllers/checkout_controller.js';
import { sellerRouter } from './routes/seller_router.js';


import searchTestRouter from './routes/search_test.js';
import searchRouter from './routes/search.js';
import indexItemsRouter from './routes/indexItems.js';
import { inboxRouter } from './routes/inbox_router.js';



const upload = multer({ dest: 'uploads/' }).single('image');
//change "uploads" to whichever file you want to store uploads
const app = express();

const server = createServer(app);
const io = new Server(server);
const PORT = 5000;


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
app.use('/api', searchTestRouter);
app.use('/search', searchRouter);
app.use('/index', indexItemsRouter);

// Set up res.locals for all views
app.use((req, res, next) => {
  res.locals.userSession = req.session.user || null;
  res.locals.cart = {
    cartCount: 10 // Placeholder, replace with real logic later
  };
  next();
});


// Mount routers

app.use(async (req, res, next) => {
  const userID = 777; // Replace with logic to get the logged-in user's ID
  try {
    const cartCount = await getCartItemCount(userID);
    res.locals.user = {
      cartCount: cartCount || 0,
    };
  } catch (error) {
    console.error('Error fetching cart count:', error);
    res.locals.user = { cartCount: 0 };
  }
  next();
});
app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


//Mount routers //COMMENT THIS OUT

app.use("/", shopRouter);
app.use("/", homeRouter);
app.use("/", authenticationRouter);
app.use("/account", accountRouter);
app.use("/", checkoutRouter);
app.use("/", sellingRouter);
app.use("/", S3router);
app.use("/seller", sellerRouter);
app.use("/inbox", inboxRouter);
//app.use('/api', S3router);
app.use("/api", openSearchRouter);
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




io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for incoming messages
  socket.on('chat message', (msg) => {
      console.log('Message received:', msg);

      // Emit the message to all connected clients
      io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
      console.log('A user disconnected');
  });
});

//Setup file path for ejs assets
const assetsPath = path.join(__dirname, "views");
app.use(express.static(assetsPath));
app.set("view engine", "ejs");

//Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
  });



server.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));

