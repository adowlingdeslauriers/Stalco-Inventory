import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISKUINFO extends Document {
  sku: string;
  clientId: string;
  clientName: string;
  isSet: boolean;
  qtyPerPallet: number;
}

const skuInfoSchema: Schema<ISKUINFO> = new Schema<ISKUINFO>({
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  isSet: {
    type: Boolean,
    required: true,
    default: false,
  },
  qtyPerPallet: {
    type: Number,
    required: true,
  },
});

// Add pre-save hook
skuInfoSchema.pre<ISKUINFO>('save', function (next) {
  if (this.qtyPerPallet === 0) {
    this.isSet = false;
  } else {
    this.isSet = true;
  }
  next();
});

const SkuInfo: Model<ISKUINFO> = mongoose.model<ISKUINFO>('SkuInfo', skuInfoSchema);

export default SkuInfo;
