// src/routes/replenishmentRoutes.ts
import express from 'express';
import {
  getAllReplenishments,
  addReplenishment,
  deleteReplenishment,
  updateReplenishment,
  getReplenishmentsByClientId,
  getReplenishmentsWhereFlagIsTrue,
  getReplenishmentsByClientWithFlagTrue, 
  getReplenishmentById} from "../controllers/replenishmentController.js"

const router = express.Router();

router.get('/', getAllReplenishments);
router.get('/by-sku/:sku', getReplenishmentById);
router.post('/', addReplenishment);
router.delete('/:sku', deleteReplenishment);
router.put('/:sku', updateReplenishment);
router.get('/by-client/:clientId', getReplenishmentsByClientId);
router.get('/flagged', getReplenishmentsWhereFlagIsTrue);
router.get('/by-client-flagged/:clientId', getReplenishmentsByClientWithFlagTrue);

export default router;
