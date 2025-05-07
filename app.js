import * as dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import express from "express";
import session from 'express-session';
import path from "node:path";
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { fileURLToPath } from "node:url";

import { shopRouter } from "./routes/shop_router.js";
import { homeRouter } from "./routes/home_router.js";
import { authenticationRouter } from "./routes/authentication_router.js";
import { accountRouter } from "./routes/account_router.js";
import { checkoutRouter } from "./routes/checkout_routes.js";
import { sellingRouter } from "./routes/selling_router.js";
import { S3router } from './routes/aws_router.js';
import openSearchRouter from './routes/open_search_router.js';
import { sellerRouter } from './routes/seller_router.js';
//import { feedbackRouter } from './routes/feedback_router.js';
//import searchRouter from './routes/search.js';
import indexItemsRouter from './routes/indexItems.js';
import uploadRoute from './routes/upload.js';
import devCleanupRoute from './routes/dev_cleanup.js';
import reindexRoute from './routes/reindex.js';
import uploadPfpRoute from './routes/upload_pfp.js';
import { inboxRouter } from './routes/inbox_router.js';
import { pool } from "./data/pool.js";

import {passport} from './controllers/auth.js';

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 5500;
const upload = multer({ dest: 'uploads/' }).single('image');

// Static setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsPath = path.join(__dirname, "views");
app.use(express.static(assetsPath));
app.set("view engine", "ejs");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "studentbazaar-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// res.locals setup
app.use(async (req, res, next) => {
  const userID = 777;
  try {
    const cartCount = await getCartItemCount(userID);
    res.locals.user = { cartCount: cartCount || 0 };
  } catch {
    res.locals.user = { cartCount: 0 };
  }
  res.locals.userSession = req.session.user || null;
  next();
});

// Mock user (for dev/testing)
app.use((req, res, next) => {
  if (!req.user) {
    req.user = {
      userID: 2,
      email: 'test@example.com',
      displayName: 'Test User'
    };
  }
  next();
});

// Routes
app.use("/", shopRouter);
app.use("/", homeRouter);
app.use("/", authenticationRouter);
app.use("/account", accountRouter);
app.use("/", checkoutRouter);
app.use("/", sellingRouter);
app.use("/seller", sellerRouter);
app.use("/inbox", inboxRouter);
app.use("/api", S3router);
app.use("/search", openSearchRouter);
app.use("/api", uploadPfpRoute);
//app.use("/api", searchTestRouter);
//app.use("/search", searchRouter);
app.use("/index", indexItemsRouter);
app.use("/upload", uploadRoute);
app.use("/dev", devCleanupRoute);
app.use("/dev", reindexRoute);

app.post('/search-debug', (req, res) => {
  console.log('HIT /search-debug');
  res.send('OK');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
app._router.stack
  .filter(r => r.route)
  .forEach(r => console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`));

// Dummy function placeholder
async function getCartItemCount(userID) {
  const [[row]] = await pool.query(
    'SELECT COUNT(*) as count FROM cart WHERE userID = ?', [userID]
  );
  return row?.count || 0;
}