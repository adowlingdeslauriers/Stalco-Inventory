import express from "express";
const router = express.Router();
import   getOrdersByDateRange  from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkedObjectId.js";

router.route("/").get(getOrdersByDateRange);

export default router;
