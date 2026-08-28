import mongoose, { Document, Schema } from 'mongoose';

export type AppointmentStatus = 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';

export interface IAppointment extends Document {
  patientName: string;
  phone: string;
  email: string;
  serviceId?: mongoose.Types.ObjectId;
  serviceName?: string;
  doctorId?: mongoose.Types.ObjectId;
  doctorName?: string;
  appointmentDate: Date;
  appointmentTime: string;
  message?: string;
  status: AppointmentStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    serviceName: { type: String },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    doctorName: { type: String },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    adminNote: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
