import express from "express";
const router = express.Router();
import   getStorageDataByClient  from "../controllers/inventoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkedObjectId.js";

router.route("/").get(getStorageDataByClient);
// router.route("/:id/reviews").post(protect, checkObjectId, createProductReview);
// router.get("/top", getTopProducts);
// router
//   .route("/:id")
//   .get(checkObjectId, getProductById)
//   .put(protect, admin, checkObjectId, updateProduct)
//   .delete(protect, admin, checkObjectId, deleteProduct);

export default router;
