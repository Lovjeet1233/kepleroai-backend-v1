import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  passwordHash?: string; // Optional for OAuth users
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  status: 'active' | 'inactive' | 'invited';
  organizationId: mongoose.Types.ObjectId; // Multi-tenant support
  lastActiveAt?: Date;
  // OAuth fields
  provider?: 'local' | 'google';
  providerId?: string;
  googleId?: string;
  // Profile/Package fields
  selectedProfile?: 'mileva' | 'nobel' | 'aistein';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: false // Not required for OAuth users
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  avatar: String,
  role: {
    type: String,
    enum: ['admin', 'operator', 'viewer'],
    default: 'operator'
  },
  permissions: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'invited'],
    default: 'active'
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  lastActiveAt: Date,
  // OAuth fields
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  providerId: String,
  googleId: String,
  // Profile/Package fields
  selectedProfile: {
    type: String,
    enum: ['mileva', 'nobel', 'aistein'],
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash password if it exists and has been modified
  if (!this.passwordHash || !this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  // Return false if no password hash (OAuth users)
  if (!this.passwordHash) return false;
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);

