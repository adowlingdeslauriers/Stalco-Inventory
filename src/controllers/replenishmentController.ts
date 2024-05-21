// src/controllers/replenishmentController.ts
import Replenishment from '../models/replensihmentModel.js';
import { Request, Response } from 'express';
import { NotFoundError, ConflictError } from "../utils/errors/errors.js"
import asyncHandler from '../middleware/asyncHandler.js';
import { fetchAndUpdateFlagsByClient } from '../3plApi/fetchingAPI.js';

export const getAllReplenishments = async (req: Request, res: Response) => {
  const replenishments = await Replenishment.find();
  res.json(replenishments);
};

export const getReplenishmentById = asyncHandler(async (req: Request, res: Response) => {
  const replenishment = await Replenishment.findOne({ sku: req.params.sku });
  
  if (!replenishment ) {
    throw new NotFoundError('Replenishment not found');
  }

  res.status(200).json(replenishment);
});

export const addReplenishment = asyncHandler(async (req: Request, res: Response) => {
    const { sku, qtyToReplenish = 0 } = req.body; 
  
    const existingReplenishment = await Replenishment.findOne({ sku });
    if (existingReplenishment) {
      throw new ConflictError('Record with the same SKU already exists');
    }
  
    const newReplenishment = new Replenishment({ ...req.body, qtyToReplenish }); 
    const savedReplenishment = await newReplenishment.save();
    res.status(201).json(savedReplenishment);
  });
  
  export const deleteReplenishment = asyncHandler(async (req: Request, res: Response) => {
    const { sku } = req.params;
    const deletedReplenishment = await Replenishment.findOneAndDelete({ sku });
   console.log("HERE is the deleted record:", deletedReplenishment)
    if (!deletedReplenishment) {
      throw new NotFoundError('Replenishment not found');
    }

    // If the document was found and deleted, send a 200 response with details
    res.status(200).json({
        message: 'Replenishment deleted successfully',
        deletedReplenishment
    });
});

  

export const updateReplenishment = asyncHandler(async (req: Request, res: Response) => {
  const { sku } = req.params;
  const updateData = req.body;
  if (updateData.sku) {
    delete updateData.sku;
  }

  const updatedReplenishment = await Replenishment.findOneAndUpdate({ sku }, updateData, { new: true });
  if (!updatedReplenishment) {
    throw new NotFoundError('Replenishment not found');
  }
  res.status(200).json(updatedReplenishment);
});

export const getReplenishmentsByClientId = asyncHandler(async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const replenishments = await Replenishment.find({ client: clientId });
    if (!replenishments || replenishments.length === 0) {
      throw new NotFoundError('Replenishments not found');
    }
  
    res.status(200).json(replenishments);
  });
  
export const getReplenishmentsWhereFlagIsTrue = asyncHandler(async (req: Request, res: Response) => {
  const replenishments = await Replenishment.find({ flag: true });
    if (!replenishments || replenishments.length === 0) {

    throw new NotFoundError('Replenishment not found');
  }
  res.status(200).json(replenishments);
});

export const getReplenishmentsByClientWithFlagTrue = asyncHandler(async (req: Request, res: Response) => {
  const { clientId } = req.params;
  console.log(clientId)
  await fetchAndUpdateFlagsByClient(clientId)
  const replenishments = await Replenishment.find({ clientId: clientId, flag: true });
  res.status(200).json(replenishments);
});




// export const updateReplenishment = asyncHandler(async (req, res, next) => {
//     try {
//         const clientId = req.body.clientId;
//         const apiData = req.body.apiData;  // Assuming this is passed in the request
//         await replenishmentService.updateReplenishmentFlags(apiData, clientId);
//         res.status(200).json({ message: 'Replenishment flags updated successfully.' });
//     } catch (error) {
//         next(error);
//     }
// })