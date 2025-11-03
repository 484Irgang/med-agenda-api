export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export const createSuccess = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const createError = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});
