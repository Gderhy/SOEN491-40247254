import type { LoginFormData, RegisterFormData, FormErrors } from '@/types/auth';

/**
 * Validates email format using regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validates login form data
 */
export function validateLoginForm(data: LoginFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return errors;
}

/**
 * Validates registration form data
 */
export function validateRegisterForm(data: RegisterFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}
