import { Document, Schema, model } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  code: string; // ISO country code (e.g., 'IN', 'US')
  phoneCode?: string; // International dialing code (e.g., '+91', '+1')
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Country name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Country code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      match: [/^[A-Z]{2}$/, 'Country code must be a 2-letter ISO code'],
    },
    phoneCode: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
CountrySchema.index({ code: 1 });
CountrySchema.index({ name: 1 });
CountrySchema.index({ isActive: 1 });

const Country = model<ICountry>('Country', CountrySchema);

export default Country;
