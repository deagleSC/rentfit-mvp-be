import { Document, Schema, model } from 'mongoose';

export interface IUnit extends Document {
  ownerId: Schema.Types.ObjectId;
  title: string;
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  geo?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  photos?: string[]; // Cloudinary URLs
  beds?: number;
  areaSqFt?: number;
  status?: 'vacant' | 'occupied' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema: Schema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], index: '2dsphere' },
    },
    photos: [{ type: String }],
    beds: { type: Number },
    areaSqFt: { type: Number },
    status: { type: String, enum: ['vacant', 'occupied', 'maintenance'], default: 'vacant' },
  },
  { timestamps: true }
);

const Unit = model<IUnit>('Unit', UnitSchema);

export default Unit;
