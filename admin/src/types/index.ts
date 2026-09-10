export interface Doctor {
  _id: string;
  name: string;
  qualification: string;
  specialization: string;
  experience: number;
  image: string;
  description: string;
  availability: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Service {
  _id: string;
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
  createdAt: string;
}

export interface Appointment {
  _id: string;
  patientName: string;
  phone: string;
  email: string;
  serviceId?: string;
  serviceName?: string;
  doctorId?: string;
  doctorName?: string;
  appointmentDate: string;
  appointmentTime: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  adminNote?: string;
  attachments?: string;
  createdAt: string;
  updatedAt: string;
}

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['rescheduled', 'confirmed', 'cancelled'],
  rescheduled: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: ['pending'],
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  rescheduled: 'Rescheduled',
  confirmed: 'Confirmed',
  completed: 'Completed Care',
  cancelled: 'Cancelled',
};


export interface Testimonial {
  _id: string;
  patientName: string;
  review: string;
  rating: number;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
}
