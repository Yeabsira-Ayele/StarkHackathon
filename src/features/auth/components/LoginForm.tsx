import React from 'react';
import { GoogleAuthButton } from './GoogleAuthButton';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => (
  <GoogleAuthButton onSuccess={onSuccess} />
);

export default LoginForm;
