import express from "express";
const router = express.Router();
import {
  getOrdersByClientLastSixMonths,
  getOrdersByDateRange,
  getOrdersLastSixMonths,
  getOrdersByClientByDateRange,
  getTotalOrdersByClientByDateRange,
  getTotalInventoryProcessed,
  getLast12WeekAverage,
  putOrderItems,
  testPutOrderItems,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkedObjectId.js";
import { getOrdersRangeComparison } from "../controllers/rangeComparisonController.js";

router.get("/date-range", getOrdersByDateRange);
router.get("/last-six-months", getOrdersLastSixMonths);
router.get("/last-six-months/:clientId", getOrdersByClientLastSixMonths);
router.get("/date-range/:clientId", getOrdersByClientByDateRange);
router.get(
  "/total-orders/date-range/:clientId",
  getTotalOrdersByClientByDateRange
);
router.get("/total-inventory/date-range", getTotalInventoryProcessed);
router.get("/total-orders/date-range", getLast12WeekAverage);

router.get("/range-comparsion", getOrdersRangeComparison);

router.put("/items/:orderId", putOrderItems);
router.get("/testitems", testPutOrderItems);

export default router;
