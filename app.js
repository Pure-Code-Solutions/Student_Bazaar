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

const app = express();
const PORT = 5000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.locals.user = {
    cartCount: 10,
  };
  next();
});



//Mount routers
app.use("/", shopRouter);
app.use("/", homeRouter);
app.use("/", authenticationRouter);
app.use("/", accountRouter);
app.use("/", checkoutRouter);


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