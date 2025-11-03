import { UserRepository } from '../database/repositories/user.repository';
import { NewUser } from '../types/entities';
import { LoginCredentials, LoginResponse } from '../types/auth';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { Result, createSuccess, createError } from '../types/http';

export const createAuthService = (userRepository: UserRepository) => ({
  register: async (userData: NewUser): Promise<Result<LoginResponse, string>> => {
    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
      return createError('Email already registered');
    }

    const hashedPassword = await hashPassword(userData.password);
    const userId = await userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const user = await userRepository.findById(userId);

    if (!user) {
      return createError('Failed to create user');
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
    });

    return createSuccess({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        patientId: user.patientId,
        doctorId: user.doctorId,
      },
    });
  },

  login: async (credentials: LoginCredentials): Promise<Result<LoginResponse, string>> => {
    const user = await userRepository.findByEmail(credentials.email);

    if (!user) {
      return createError('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(credentials.password, user.password);

    if (!isPasswordValid) {
      return createError('Invalid credentials');
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
    });

    return createSuccess({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
        patientId: user.patientId,
        doctorId: user.doctorId,
      },
    });
  },

  getUserById: async (id: number): Promise<Result<Omit<typeof user, 'password'>, string>> => {
    const user = await userRepository.findById(id);

    if (!user) {
      return createError('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return createSuccess(userWithoutPassword);
  },
});

export type AuthService = ReturnType<typeof createAuthService>;
