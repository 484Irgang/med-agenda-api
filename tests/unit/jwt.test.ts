import { generateToken, verifyToken } from '../../src/utils/jwt';
import { UserType } from '../../src/types/entities';

describe('JWT Utilities', () => {
  const mockPayload = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    type: UserType.PATIENT,
  };

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.name).toBe(mockPayload.name);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.type).toBe(mockPayload.type);
    });

    it('should throw an error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token');
    });

    it('should throw an error for expired token', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IlRlc3QiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ0eXBlIjoiUEFUSUVOVCIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid';

      expect(() => verifyToken(expiredToken)).toThrow();
    });
  });
});
