import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper } from '@mui/material';
import AuthForm from '../components/forms/AuthForm';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'operator';
  operatorCode?: string;
}

const Register: React.FC = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = values;
      await register(registerData);
      navigate('/');
    } catch (error) {
      // 錯誤已經在 AuthContext 中處理
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <AuthForm type="register" onSubmit={handleSubmit} error={error} />
      </Paper>
    </Container>
  );
};

export default Register; 