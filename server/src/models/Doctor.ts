import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  qualification: string;
  specialization: string;
  experience: number;
  image: string;
  description: string;
  availability: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    availability: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
