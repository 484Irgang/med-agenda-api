import { UserType } from './entities';

export type JwtPayload = {
  id: number;
  name: string | null;
  email: string;
  type: UserType;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string | null;
    email: string;
    type: UserType;
    patientId: number | null;
    doctorId: number | null;
  };
};

export type AuthRequest = {
  user?: JwtPayload;
};
