import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoneSettings extends Document {
  userId: mongoose.Types.ObjectId;
  selectedVoice: string;
  twilioPhoneNumber: string;
  livekitSipTrunkId: string;
  humanOperatorPhone: string;
  isConfigured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PhoneSettingsSchema = new Schema<IPhoneSettings>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  selectedVoice: {
    type: String,
    default: 'adam'
  },
  twilioPhoneNumber: {
    type: String,
    default: ''
  },
  livekitSipTrunkId: {
    type: String,
    default: ''
  },
  humanOperatorPhone: {
    type: String,
    default: ''
  },
  isConfigured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model<IPhoneSettings>('PhoneSettings', PhoneSettingsSchema);

