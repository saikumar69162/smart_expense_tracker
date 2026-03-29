export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  const minLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
    criteria: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num < 1000000;
};

export const validateDate = (date) => {
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
};

export const validatePhoneNumber = (phone) => {
  const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return regex.test(phone);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateNotEmpty = (value) => {
  return value && value.trim().length > 0;
};

export const validateLength = (value, min, max) => {
  const length = value.trim().length;
  return length >= min && length <= max;
};

export const validateNumberRange = (value, min, max) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateExpenseForm = (formData) => {
  const errors = {};
  
  if (!validateAmount(formData.amount)) {
    errors.amount = 'Please enter a valid amount (positive number)';
  }
  
  if (!validateNotEmpty(formData.category)) {
    errors.category = 'Please select a category';
  }
  
  if (!validateDate(formData.date)) {
    errors.date = 'Please enter a valid date';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  if (!validateNotEmpty(formData.name)) {
    errors.name = 'Name is required';
  } else if (!validateLength(formData.name, 2, 50)) {
    errors.name = 'Name must be between 2 and 50 characters';
  }
  
  if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = 'Password must be at least 6 characters with one uppercase letter and one number';
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};