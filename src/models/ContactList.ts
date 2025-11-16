import mongoose, { Schema, Document } from 'mongoose';

export interface IKanbanStatus {
  name: string;
  color: string;
  order: number;
}

export interface IContactList extends Document {
  name: string;
  isSystem: boolean;
  kanbanEnabled: boolean;
  kanbanStatuses: IKanbanStatus[];
  createdAt: Date;
  updatedAt: Date;
}

const ContactListSchema = new Schema<IContactList>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  kanbanEnabled: {
    type: Boolean,
    default: false
  },
  kanbanStatuses: [{
    name: { type: String, required: true },
    color: { type: String, default: '#6366f1' },
    order: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.model<IContactList>('ContactList', ContactListSchema);

