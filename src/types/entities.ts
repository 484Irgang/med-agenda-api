export enum UserType {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}

export type User = {
  id: number;
  name: string | null;
  email: string;
  password: string;
  type: UserType;
  patientId: number | null;
  doctorId: number | null;
};

export type Patient = {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
};

export type Specialty = {
  id: number;
  name: string;
};

export type Doctor = {
  id: number;
  name: string;
  crm: string;
  email: string;
  phone: string;
  specialtyId: number | null;
  specialty?: Specialty;
};

export type Appointment = {
  id: number;
  patientId: number | null;
  doctorId: number | null;
  specialtyId: number;
  dateTime: Date;
  status: string;
  patient?: Patient;
  doctor?: Doctor;
  specialty?: Specialty;
  feedback?: Feedback;
};

export type Feedback = {
  id: number;
  appointmentId: number;
  patientId: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  patient?: Patient;
};

export type UserWithoutPassword = Omit<User, 'password'>;

export type NewUser = {
  email: string;
  password: string;
  type: UserType;
  name: string | null;
};
export type NewPatient = Omit<Patient, 'id'>;
export type NewDoctor = Omit<Doctor, 'id' | 'specialty'>;
export type NewSpecialty = Omit<Specialty, 'id'>;
export type NewAppointment = Omit<Appointment, 'id' | 'patient' | 'doctor' | 'specialty' | 'feedback'>;
export type NewFeedback = Omit<Feedback, 'id' | 'createdAt' | 'patient'>;
