import { Document, Schema, model } from 'mongoose';

export interface IState extends Document {
  name: string;
  code?: string; // State code (e.g., 'MH', 'CA')
  countryId: Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'State name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: [true, 'Country reference is required'],
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
StateSchema.index({ countryId: 1, name: 1 }, { unique: true }); // Unique state name per country
StateSchema.index({ countryId: 1, code: 1 }); // For code-based lookups
StateSchema.index({ isActive: 1 });

const State = model<IState>('State', StateSchema);

export default State;
