import React from 'react';
import { GoogleAuthButton } from './GoogleAuthButton';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  return (
    <div className="space-y-5">
      <GoogleAuthButton onSuccess={onSuccess} />
    </div>
  );
};

export default LoginForm;
