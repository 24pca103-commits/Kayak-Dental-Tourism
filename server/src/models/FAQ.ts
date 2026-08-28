import mongoose, { Document, Schema } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IFAQ>('FAQ', FAQSchema);
