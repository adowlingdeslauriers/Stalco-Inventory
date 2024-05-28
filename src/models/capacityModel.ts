import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICapacity extends Document {
  clientId: string;
  clientName: string;
  claysonQty: number;
  whlQty: number;
  totalQty: number;
}

 const capacitySchema: Schema<ICapacity> = new Schema<ICapacity>({
  clientId: {
    type: String,
    required: true,
    unique: true,
  },
  clientName: {
    type: String,
    required: true,
    unique: true,
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

});

const Capacity: Model<ICapacity> = mongoose.model<ICapacity>('Capacity', capacitySchema);

export default Capacity;
