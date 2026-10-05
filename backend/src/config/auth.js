// Reads the login-related settings from your .env file.
// "get" means the value is read at the moment it is needed.
const need = (name) => {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is missing. Add it to your .env file.`);
    process.exit(1);
  }
  return value;
};

module.exports = {
  get jwtSecret() {
    return need('JWT_SECRET');
  },
  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || '7d';
  },
  get otpExpiresMinutes() {
    return Number(process.env.OTP_EXPIRES_MINUTES) || 5;
  },
  // When "true", the one-time code is also returned in the API response.
  // Only for testing on your own computer. Never turn this on in production.
  get otpDevEcho() {
    return process.env.OTP_DEV_ECHO === 'true';
  },
};
