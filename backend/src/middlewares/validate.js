// Form Validations based on PDF challenge specifications:
// - Name: Min 20 characters, Max 60 characters.
// - Address: Max 400 characters.
// - Password: 8-16 characters, must include at least one uppercase letter and one special character.
// - Email: Must follow standard email validation rules.

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 16) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasUpperCase && hasSpecialChar;
};

const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  return name.trim().length >= 20 && name.trim().length <= 60;
};

const validateAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  return address.trim().length > 0 && address.trim().length <= 400;
};

const validateSignup = (req, res, next) => {
  const { name, email, password, address } = req.body;

  if (!validateName(name)) {
    return res.status(400).json({
      message: 'Name must be between 20 and 60 characters long.'
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({
      message: 'Please provide a valid email address.'
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message: 'Password must be 8-16 characters and contain at least one uppercase letter and one special character.'
    });
  }

  if (!validateAddress(address)) {
    return res.status(400).json({
      message: 'Address is required and must not exceed 400 characters.'
    });
  }

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword) {
    return res.status(400).json({ message: 'Current password is required.' });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      message: 'New password must be 8-16 characters and contain at least one uppercase letter and one special character.'
    });
  }

  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateAddress,
  validateSignup,
  validatePasswordChange
};
