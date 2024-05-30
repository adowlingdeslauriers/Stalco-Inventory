import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICapacityUtilization extends Document {
    clientId: string;
    clientName: string;
    week: Date;
    claysonQty: number;
    whlQty: number;
    totalQty: number;
    utilizationPercentage: number;
  }

const capacityUtilizationSchema: Schema<ICapacityUtilization> = new Schema<ICapacityUtilization>({
  clientId: {
    type: String,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  week: {
    type: Date,
    required: true,
  },
  claysonQty: {
    type: Number,
    required: true,
  },
  whlQty: {
    type: Number,
    required: true,
  },
  totalQty: {
    type: Number,
    required: true,
  },
  utilizationPercentage: {
    type: Number,
    required: true,
  },
});

// Add a compound index to ensure unique clientId and week combination
capacityUtilizationSchema.index({ clientId: 1, week: 1 }, { unique: true });

const CapacityUtilization: Model<ICapacityUtilization> = mongoose.model<ICapacityUtilization>('CapacityUtilization', capacityUtilizationSchema);

export default CapacityUtilization;
