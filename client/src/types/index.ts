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
  createdAt: string;
  updatedAt: string;
}

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
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}
