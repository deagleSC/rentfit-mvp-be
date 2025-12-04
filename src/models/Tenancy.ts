import { Schema, model, Document } from 'mongoose';

export type TenancyStatus = 'upcoming' | 'active' | 'terminated' | 'pendingRenewal';

export interface IPayment {
  paymentId?: string;
  amount: number;
  date: Date;
  method?: string;
  reference?: string;
  receiptUrl?: string;
}

export interface IEvidence {
  type: 'photo' | 'video' | 'document' | string;
  url: string;
  timestamp: Date;
  uploaderId: Schema.Types.ObjectId;
  meta?: Record<string, any>;
}

export interface ITenancy extends Document {
  unitId: Schema.Types.ObjectId;
  ownerId: Schema.Types.ObjectId;
  tenantId: Schema.Types.ObjectId;
  agreement?: {
    agreementId?: Schema.Types.ObjectId;
    pdfUrl?: string;
    version?: number;
    signedAt?: Date;
  };
  rent: {
    amount: number;
    cycle: 'monthly' | 'quarterly' | 'yearly' | string;
    dueDateDay?: number;
    utilitiesIncluded?: boolean;
  };
  deposit?: {
    amount?: number;
    status?: 'upcoming' | 'held' | 'returned' | 'disputed';
  };
  payments: IPayment[];
  evidence: IEvidence[];
  status: TenancyStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: String,
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    method: String,
    reference: String,
    receiptUrl: String,
  },
  { _id: false }
);

const EvidenceSchema = new Schema<IEvidence>(
  {
    type: { type: String, default: 'photo' },
    url: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User' },
    meta: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const TenancySchema = new Schema<ITenancy>(
  {
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    agreement: {
      agreementId: { type: Schema.Types.ObjectId, ref: 'Agreement' },
      pdfUrl: String,
      version: Number,
      signedAt: Date,
    },

    rent: {
      amount: { type: Number, required: true },
      cycle: { type: String, default: 'monthly' },
      dueDateDay: { type: Number },
      utilitiesIncluded: { type: Boolean, default: false },
    },

    deposit: {
      amount: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['upcoming', 'held', 'returned', 'disputed'],
        default: 'upcoming',
      },
    },

    payments: { type: [PaymentSchema], default: [] },
    evidence: { type: [EvidenceSchema], default: [] },

    status: {
      type: String,
      enum: ['upcoming', 'active', 'terminated', 'pendingRenewal'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

TenancySchema.index({ ownerId: 1, status: 1 });

export default model<ITenancy>('Tenancy', TenancySchema);
