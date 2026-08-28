import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  slug: string;
  image: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  treatmentProcess: string;
  whoNeeds: string;
  duration: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, default: '' },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    benefits: { type: [String], default: [] },
    treatmentProcess: { type: String, default: '' },
    whoNeeds: { type: String, default: '' },
    duration: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<IService>('Service', ServiceSchema);
