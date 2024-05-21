import "./config/env.js";
import express, { Request, Response } from "express";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import inventoryRoutes from "./routes/inventoryRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"
import replenishmentRoutes from "./routes/replenishmentRoutes.js"

import { checkReplenishmentCronJob } from "./cronJobs/checkReplenishmentCronJob.js";
import connectDB from "./config/db.js";



const PORT = process.env.PORT || 8000;

const app = express();
checkReplenishmentCronJob();

connectDB();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Stalco Invsdfaentory!");
});

app.use("/api/inventory", inventoryRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/replenishment", replenishmentRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`The server is listening at PORT : ${PORT}`);
});
