import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReplenishment extends Document {
  sku: string;
  client: string;
  flag: boolean;
  threshold: number;
  qtyToReplenish: number;
}

 const replenishmentSchema: Schema<IReplenishment> = new Schema<IReplenishment>({
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  client: {
    type: String,
    required: true,
  },
  flag: {
    type: Boolean,
    required: true,
    default: false,
  },
  threshold: {
    type: Number,
    required: true,
  },
  qtyToReplenish: {
    type: Number,
    required: true,
  },
});

const Replenishment: Model<IReplenishment> = mongoose.model<IReplenishment>('Replenishment', replenishmentSchema);

export default Replenishment;
