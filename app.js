import express from "express";
import path from "node:path";
import * as dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from "node:url";
import { shopRouter } from "./routes/shop_router.js";

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Mount routers
app.use("/", shopRouter);

//Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
  });

app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));