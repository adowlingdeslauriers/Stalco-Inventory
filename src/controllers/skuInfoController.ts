import SkuInfo, { ISKUINFO } from '../models/skuInfoModel.js';
import { Request, Response } from 'express';
import { NotFoundError, ConflictError } from "../utils/errors/errors.js"
import asyncHandler from '../middleware/asyncHandler.js';

export const getAllSkuInfo = async (req: Request, res: Response) => {
  const skuInfoData = await SkuInfo.find();
  res.json(skuInfoData);
};

export const getSkuInfoById = asyncHandler(async (req: Request, res: Response) => {
  const skuInfoData = await SkuInfo.findOne({ sku: req.params.sku });
  
  if (!skuInfoData ) {
    throw new NotFoundError('SkuInfo not found');
  }

  res.status(200).json(skuInfoData);
});

export const addSkuInfo = asyncHandler(async (req: Request, res: Response) => {
    const { sku } = req.body; 
  
    const existingSkuInfo = await SkuInfo.findOne({ sku });
    if (existingSkuInfo) {
      throw new ConflictError('Record with the same SKU already exists');
    }
  
    const newSkuInfo = new SkuInfo({ ...req.body }); 
    const savedSkuInfo = await newSkuInfo.save();
    res.status(201).json(savedSkuInfo);
  });
  
  export const deleteSkuInfo = asyncHandler(async (req: Request, res: Response) => {
    const { sku } = req.params;
    const deletedSkuInfo = await SkuInfo.findOneAndDelete({ sku });
   console.log("HERE is the deleted record:", deletedSkuInfo)
    if (!deletedSkuInfo) {
      throw new NotFoundError('SkuInfo not found');
    }
    // If the document was found and deleted, send a 200 response with details
    res.status(200).json({
        message: 'SkuInfo deleted successfully',
        deletedSkuInfo
    });
});


export const updateSkuInfo = asyncHandler(async (req: Request, res: Response) => {
  const { sku } = req.params;
  const updateData = req.body;
  if (updateData.sku) {
    delete updateData.sku;
  }

  const updatedSkuInfo = await SkuInfo.findOneAndUpdate({ sku }, updateData, { new: true });
  if (!updatedSkuInfo) {
    throw new NotFoundError('SkuInfo not found');
  }
  res.status(200).json(updatedSkuInfo);
});

export const getSkuInfoByClientId = asyncHandler(async (req: Request, res: Response) => {
    const { clientId } = req.params;
    const skuInfoData = await SkuInfo.find({ client: clientId });
    if (!skuInfoData || skuInfoData.length === 0) {
      throw new NotFoundError('SkuInfo not found');
    }
  
    res.status(200).json(skuInfoData);
  });
  
export const getSkuInfoWhereFlagIsTrue = asyncHandler(async (req: Request, res: Response) => {
  const skuInfoData = await SkuInfo.find({ isSet: true });
    if (!skuInfoData || skuInfoData.length === 0) {

    throw new NotFoundError('SkuInfo not found');
  }
  res.status(200).json(skuInfoData);
});

export const getSkuInfoByClientWithFlagTrue = asyncHandler(async (req: Request, res: Response) => {
  const { clientId } = req.params;
  const skuInfoData = await SkuInfo.find({ clientId: clientId, isSet: true });
  res.status(200).json(skuInfoData);
});


export const addMultipleRecords = asyncHandler(async (req: Request, res: Response) => {
    
      const records: ISKUINFO[] = req.body;
  
      // Validate the records
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).send({ message: 'Invalid input data' });
      }
  
      // Insert multiple records into the database
      const result = await SkuInfo.insertMany(records);
      res.status(201).send(result);

  });