import express from "express";
const router = express.Router();
import   getStorageDetailsByClient  from "../controllers/inventoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkedObjectId.js";

router.route("/").get(getStorageDetailsByClient);

export default router;
