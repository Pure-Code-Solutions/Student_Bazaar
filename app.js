import multer from 'multer';
import express from "express";
import path from "node:path";
import * as dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from "node:url";
import { shopRouter } from "./routes/shop_router.js";
import { homeRouter } from "./routes/home_router.js";
import { authenticationRouter } from "./routes/authentication_router.js";
import { accountRouter } from "./routes/account_router.js";
import { checkoutRouter } from "./routes/checkout_routes.js";
import { sellingRouter } from "./routes/selling_router.js";
import {S3router} from './routes/aws_router.js';
import { openSearchRouter } from './routes/open_search_router.js';
import { getCartItemCount } from './controllers/checkout_controller.js';
import { sellerRouter } from './routes/seller_router.js';
import { feedbackRouter } from './routes/feedback_router.js';


const upload = multer({ dest: 'uploads/' }).single('image');
//change "uploads" to whichever file you want to store uploads
const app = express();
const PORT = 5000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

//Mount routers //COMMENT THIS OUT
app.use("/", shopRouter);
app.use("/", homeRouter);
app.use("/", authenticationRouter);
app.use("/account", accountRouter);
app.use("/", checkoutRouter);
app.use("/", sellingRouter);
app.use("/seller", sellerRouter);
app.use("/feedback", feedbackRouter);
app.use('/api', S3router);
app.use("/api", openSearchRouter);



//Setup file path for ejs assets
const assetsPath = path.join(__dirname, "views");
app.use(express.static(assetsPath));
app.set("view engine", "ejs");

//Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
  });



app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));