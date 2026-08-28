import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  patientName: string;
  review: string;
  rating: number;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    patientName: { type: String, required: true, trim: true },
    review: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    image: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
