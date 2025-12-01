//Nigel Nortey
/**
 * Validation utilities for password strength, email validation, and input sanitization
 */

// Common passwords to check against
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
  'football', 'welcome', 'jesus', 'ninja', 'mustang', 'password1'
];

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  notCommon: boolean;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: string;
  requirements: PasswordRequirements;
  isValid: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Check if password meets all requirements
 */
export function checkPasswordRequirements(password: string): PasswordRequirements {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    notCommon: !isCommonPassword(password),
  };
}

/**
 * Check if password is in common passwords list
 */
export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.includes(password.toLowerCase());
}

/**
 * Validate password strength and return detailed feedback
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const requirements = checkPasswordRequirements(password);

  // Calculate score based on requirements met
  const requirementsMet = Object.values(requirements).filter(Boolean).length;
  let score: 0 | 1 | 2 | 3 | 4 = 0;

  if (requirementsMet === 6) score = 4; // Very strong
  else if (requirementsMet === 5) score = 3; // Strong
  else if (requirementsMet === 4) score = 2; // Medium
  else if (requirementsMet >= 2) score = 1; // Weak
  else score = 0; // Very weak

  // Generate feedback
  let feedback = '';
  if (score === 4) {
    feedback = 'Excellent! Your password is very strong.';
  } else if (score === 3) {
    feedback = 'Good! Your password is strong.';
  } else if (score === 2) {
    feedback = 'Your password is okay, but could be stronger.';
  } else if (score === 1) {
    feedback = 'Weak password. Please add more variety.';
  } else {
    feedback = 'Very weak password. Please improve it.';
  }

  // Check if all requirements are met for validity
  const isValid = Object.values(requirements).every(Boolean);

  return {
    score,
    feedback,
    requirements,
    isValid,
  };
}

/**
 * Get specific error message for password validation
 */
export function getPasswordErrorMessage(password: string): string | null {
  const requirements = checkPasswordRequirements(password);

  if (!requirements.minLength) {
    return 'Password must be at least 8 characters long';
  }
  if (!requirements.hasUppercase) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!requirements.hasLowercase) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!requirements.hasNumber) {
    return 'Password must contain at least one number';
  }
  if (!requirements.hasSpecialChar) {
    return 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)';
  }
  if (!requirements.notCommon) {
    return 'This password is too common. Please choose a more unique password';
  }

  return null; // All requirements met
}

/**
 * Validate email format with optional domain restriction
 */
export function validateEmail(email: string, restrictDomain?: string): ValidationResult {
  const trimmedEmail = email.toLowerCase().trim();

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  // Check domain restriction if specified
  if (restrictDomain) {
    const domain = trimmedEmail.split('@')[1];
    if (domain !== restrictDomain) {
      return {
        isValid: false,
        error: `Email must be from ${restrictDomain} domain`,
      };
    }
  }

  return {
    isValid: true,
    sanitized: trimmedEmail,
  };
}

/**
 * Sanitize text input to prevent XSS attacks
 */
export function sanitizeTextInput(input: string, maxLength: number = 500): ValidationResult {
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>\"'`]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Check length
  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      error: `Input exceeds maximum length of ${maxLength} characters`,
    };
  }

  if (sanitized.length === 0) {
    return {
      isValid: false,
      error: 'Input cannot be empty',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}


export function sanitizeName(name: string): ValidationResult {
  const trimmed = name.trim();


  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Name cannot be empty',
    };
  }

  // Check length (reasonable limits)
  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters long',
    };
  }

  if (trimmed.length > 50) {
    return {
      isValid: false,
      error: 'Name cannot exceed 50 characters',
    };
  }

  // Allow only letters, spaces, hyphens, and apostrophes (for names like O'Brien, Mary-Jane)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    };
  }

  // Remove any HTML tags or dangerous characters (extra safety)
  const sanitized = trimmed.replace(/<[^>]*>/g, '').replace(/[<>\"'`]/g, '');

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Validate all signup inputs at once
 */
export function validateSignupInputs(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword?: string
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate first name
  const firstNameResult = sanitizeName(firstName);
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.error!;
  }

  // Validate last name
  const lastNameResult = sanitizeName(lastName);
  if (!lastNameResult.isValid) {
    errors.lastName = lastNameResult.error!;
  }

  // Validate email
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error!;
  }

  // Validate password
  const passwordError = getPasswordErrorMessage(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  // Check password confirmation if provided
  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
