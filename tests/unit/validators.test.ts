import { validate, userSchema, patientSchema, doctorSchema, specialtySchema, appointmentSchema, loginSchema } from '../../src/domain/validators';
import { UserType } from '../../src/types/entities';

describe('Validators', () => {
  describe('userSchema', () => {
    it('should validate a valid user', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'password123',
        type: UserType.PATIENT,
        name: 'Test User',
      };

      const result = validate(userSchema)(validUser);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(validUser.email);
      }
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
        type: UserType.PATIENT,
      };

      const result = validate(userSchema)(invalidUser);

      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: '123',
        type: UserType.PATIENT,
      };

      const result = validate(userSchema)(invalidUser);

      expect(result.success).toBe(false);
    });
  });

  describe('patientSchema', () => {
    it('should validate a valid patient', () => {
      const validPatient = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        birthDate: new Date('1990-01-01'),
      };

      const result = validate(patientSchema)(validPatient);

      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidPatient = {
        name: '',
        email: 'john@example.com',
        phone: '123456789',
        birthDate: new Date('1990-01-01'),
      };

      const result = validate(patientSchema)(invalidPatient);

      expect(result.success).toBe(false);
    });
  });

  describe('doctorSchema', () => {
    it('should validate a valid doctor', () => {
      const validDoctor = {
        name: 'Dr. Smith',
        crm: 'CRM12345',
        email: 'doctor@example.com',
        phone: '987654321',
        specialtyId: 1,
      };

      const result = validate(doctorSchema)(validDoctor);

      expect(result.success).toBe(true);
    });
  });

  describe('specialtySchema', () => {
    it('should validate a valid specialty', () => {
      const validSpecialty = {
        name: 'Cardiology',
      };

      const result = validate(specialtySchema)(validSpecialty);

      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidSpecialty = {
        name: '',
      };

      const result = validate(specialtySchema)(invalidSpecialty);

      expect(result.success).toBe(false);
    });
  });

  describe('appointmentSchema', () => {
    it('should validate a valid appointment', () => {
      const validAppointment = {
        patientId: 1,
        doctorId: 1,
        specialtyId: 1,
        dateTime: new Date(),
        status: 'scheduled',
      };

      const result = validate(appointmentSchema)(validAppointment);

      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid credentials', () => {
      const validCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = validate(loginSchema)(validCredentials);

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidCredentials = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = validate(loginSchema)(invalidCredentials);

      expect(result.success).toBe(false);
    });
  });
});
