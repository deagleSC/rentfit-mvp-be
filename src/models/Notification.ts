import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  type: string;
  userId?: Schema.Types.ObjectId;
  tenancyId?: Schema.Types.ObjectId;
  payload?: any;
  delivered?: boolean;
  nextRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    type: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    tenancyId: { type: Schema.Types.ObjectId, ref: 'Tenancy' },
    payload: { type: Schema.Types.Mixed },
    delivered: { type: Boolean, default: false },
    nextRunAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ nextRunAt: 1 });

export default model<INotification>('Notification', NotificationSchema);
