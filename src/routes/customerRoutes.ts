import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkedObjectId.js";
import getAllCustomers from "../controllers/customerContrller.js";

router.route("/").get(getAllCustomers);


export default router;
