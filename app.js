import multer from 'multer';
import express from "express";
import path from "node:path";
import * as dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { shopRouter } from "./routes/shop_router.js";
import { homeRouter } from "./routes/home_router.js";
import { authenticationRouter } from "./routes/authentication_router.js";
import { accountRouter } from "./routes/account_router.js";
import { checkoutRouter } from "./routes/checkout_routes.js";
import { sellingRouter } from "./routes/selling_router.js";
import { S3router } from "./routes/aws_router.js";


const upload = multer({ dest: 'uploads/' }).single('image');
//change "uploads" to whichever file you want to store uploads
const app = express();
const PORT = 5000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.locals.user = {
    cartCount: 10,
  };
  next();
});



//Mount routers //COMMENT THIS OUT
app.use("/", shopRouter);
app.use("/", homeRouter);
app.use("/", authenticationRouter);
app.use("/", accountRouter);
app.use("/", checkoutRouter);
app.use("/", sellingRouter);
app.use("/", S3router);


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