import { Document, Schema, model } from 'mongoose';

export interface ICity extends Document {
  name: string;
  stateId: Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    stateId: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      required: [true, 'State reference is required'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
CitySchema.index({ stateId: 1, name: 1 }, { unique: true }); // Unique city name per state
CitySchema.index({ stateId: 1 });
CitySchema.index({ isActive: 1 });

const City = model<ICity>('City', CitySchema);

export default City;
