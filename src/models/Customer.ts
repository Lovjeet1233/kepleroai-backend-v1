import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  color: string;
  tags: string[];
  lists: mongoose.Types.ObjectId[];
  customProperties: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  phone: String,
  avatar: String,
  color: {
    type: String,
    default: () => {
      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  },
  tags: [String],
  lists: [{ type: Schema.Types.ObjectId, ref: 'ContactList' }],
  customProperties: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ name: 'text' });

// Virtual field for list memberships
CustomerSchema.virtual('listMemberships', {
  ref: 'ContactListMember',
  localField: '_id',
  foreignField: 'contactId'
});

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
