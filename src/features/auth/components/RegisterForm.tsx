import React from 'react';
import { GoogleAuthButton } from './GoogleAuthButton';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => (
  <GoogleAuthButton onSuccess={onSuccess} />
);

export default RegisterForm;
