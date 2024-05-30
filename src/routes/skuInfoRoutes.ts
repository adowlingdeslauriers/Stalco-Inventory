// src/routes/skuInfoController.jsRoutes.ts
import express from 'express';
import {
    addSkuInfo,
  deleteSkuInfo,
  getSkuInfoById,
  getSkuInfoWhereFlagIsTrue,
  getSkuInfoByClientWithFlagTrue,
  updateSkuInfo,
  getSkuInfoByClientId} from "../controllers/skuInfoController.js"
import { getAllSkuInfo } from '../controllers/skuInfoController.js';

const router = express.Router();

router.get('/', getAllSkuInfo);
router.get('/by-sku/:sku', getSkuInfoById);
router.post('/', addSkuInfo);
router.delete('/:sku', deleteSkuInfo);
router.put('/:sku', updateSkuInfo);
router.get('/by-client/:clientId', getSkuInfoByClientId);
router.get('/flagged', getSkuInfoWhereFlagIsTrue);
router.get('/by-client-flagged/:clientId', getSkuInfoByClientWithFlagTrue);

export default router;
