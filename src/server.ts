import express, { Request, Response } from "express";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import inventoryRoutes from "./routes/inventoryRoutes.js"
import customerRoutes from "./routes/customerRoutes.js"

import { config } from "dotenv";

config();

const PORT = process.env.PORT || 8000;

const app = express();


app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Stalco Invsdfaentory!");
});

app.use("/api/inventory", inventoryRoutes);
app.use("/api/customer", customerRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`The server is listening at PORT : ${PORT}`);
});
