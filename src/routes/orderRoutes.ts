import express from "express";
const router = express.Router();
import { getOrdersByDateRange, getOrdersLastSixMonths } from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkedObjectId.js";

router.get('/date-range', getOrdersByDateRange);
router.get('/last-six-months', getOrdersLastSixMonths);

export default router;
