import { Schema, model, Document } from 'mongoose';

export interface IVerification extends Document {
  userId: Schema.Types.ObjectId;
  provider: string;
  type: 'aadhaar' | 'pan' | 'bank' | string;
  status: 'pending' | 'success' | 'failed';
  providerResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    providerResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

VerificationSchema.index({ userId: 1, type: 1 });

export default model<IVerification>('Verification', VerificationSchema);
