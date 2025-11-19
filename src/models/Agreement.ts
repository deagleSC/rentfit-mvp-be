import { Schema, model, Document } from 'mongoose';

export type AgreementStatus = 'draft' | 'pending_signature' | 'signed' | 'cancelled';

export interface IClause {
  key?: string;
  text: string;
}

export interface ISignature {
  userId: Schema.Types.ObjectId;
  name?: string;
  method?: 'esign' | 'otp' | 'manual';
  signedAt?: Date;
  meta?: Record<string, any>;
}

export interface IAgreement extends Document {
  templateName?: string;
  stateCode?: string;
  clauses?: IClause[];
  pdfUrl?: string;
  version?: number;
  createdBy?: Schema.Types.ObjectId;
  tenancyId?: Schema.Types.ObjectId;
  status?: AgreementStatus;
  signers?: ISignature[];
  lastSignedAt?: Date;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ClauseSchema = new Schema<IClause>({ key: String, text: String }, { _id: false });

const SignatureSchema = new Schema<ISignature>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    method: String,
    signedAt: Date,
    meta: Schema.Types.Mixed,
  },
  { _id: false }
);

const AgreementSchema = new Schema<IAgreement>(
  {
    templateName: { type: String },
    stateCode: { type: String },
    clauses: [ClauseSchema],
    pdfUrl: { type: String },
    version: { type: Number, default: 1 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },

    tenancyId: { type: Schema.Types.ObjectId, ref: 'Tenancy', index: true },
    status: {
      type: String,
      enum: ['draft', 'pending_signature', 'signed', 'cancelled'],
      default: 'draft',
    },
    signers: [SignatureSchema],
    lastSignedAt: Date,
    meta: Schema.Types.Mixed,
  },
  { timestamps: true }
);

AgreementSchema.index({ tenancyId: 1 });
AgreementSchema.index({ 'signers.userId': 1 });

export default model<IAgreement>('Agreement', AgreementSchema);
