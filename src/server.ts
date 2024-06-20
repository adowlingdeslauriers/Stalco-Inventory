import "./config/env.js";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import inventoryRoutes from "./routes/inventoryRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import replenishmentRoutes from "./routes/replenishmentRoutes.js"
import skuInfoRoutes from "./routes/skuInfoRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"

import { checkReplenishmentCronJob } from "./cronJobs/checkReplenishmentCronJob.js";
import connectDB from "./config/db.js";
import {connectSQLDB, connectSequelizeDB, getTableDefinition} from "./config/sqlDb.js"
import { RateLimitError } from "./utils/errors/errors.js";
import { syncModels } from "./schema/sequelizeModels/syncModels.js";
import { startOrdersETL } from "./ETL/OrdersETL.js";
import { createTables } from "./schema/init.js";
// import { startOrdersETL } from "./ETL/OrdersETL.js";
// import { exampleRun } from "./cronJobs/dailyOrdersETL.js";
// import { createTables } from "./schema/init.js";
// import {  insertSample } from "./schema/init.js";



const PORT = process.env.PORT || 8000;

const dailyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: 2000, // Limit each IP to 2000 requests per `window` (here, per day)
  message: 'You have exceeded the 2000 requests in 24 hrs limit!',
  headers: true,
  keyGenerator: (req) => {
    return req.ip; // Use the IP address as the key for rate limiting
  },
  handler: (req, res, next, options) => {
    next(new RateLimitError(options.message));
  }
});

const minuteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many requests from this IP, please try again after a minute.',
  handler: (req, res, next, options) => {
    next(new RateLimitError(options.message));

  }
});



const app = express();
checkReplenishmentCronJob();

connectDB();
connectSQLDB();
connectSequelizeDB();

// getTableDefinition();
// syncModels();
// exampleRun();
// startOrdersETL("2024-04-01T00:00:00", "2024-04-030T23:59:59",100);
//  createTables();
// insertSample();

app.use(dailyLimiter);
app.use(minuteLimiter);
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Stalco Invsdfaentory!");
});

app.use("/api/inventory", inventoryRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/replenishment", replenishmentRoutes);
app.use("/api/skuInfo", skuInfoRoutes);
app.use("/api/orders", orderRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`The server is listening at PORT : ${PORT}`);
});
